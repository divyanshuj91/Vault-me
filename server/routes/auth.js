import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import db from '../models/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_session_key_for_vaultme';

// Helper to generate a deterministic salt for non-existing users to prevent user enumeration
function getMockSalt(email) {
  const hmac = crypto.createHmac('sha256', JWT_SECRET);
  hmac.update(email);
  return hmac.digest('hex').substring(0, 32); // Return 32-character hex salt
}

/**
 * GET /api/auth/salt
 * Retrieves the salt for the specified email.
 * If user does not exist, returns a mock salt to prevent username enumeration.
 */
router.get('/salt', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const userRes = await db.query('SELECT salt FROM users WHERE email = $1', [normalizedEmail]);
    const user = userRes.rows[0];
    
    if (user) {
      return res.json({ salt: user.salt, exists: true });
    } else {
      // Return deterministic mock salt
      const mockSalt = getMockSalt(normalizedEmail);
      return res.json({ salt: mockSalt, exists: false });
    }
  } catch (error) {
    console.error('Error fetching salt:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * POST /api/auth/register
 * Registers a new user.
 */
router.post('/register', async (req, res) => {
  const { email, authHash, salt } = req.body;

  if (!email || !authHash || !salt) {
    return res.status(400).json({ error: 'Email, authHash, and salt are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if user already exists
    const existingRes = await db.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    const existingUser = existingRes.rows[0];
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    // Bcrypt hash the client-side derived authHash
    const passwordHash = await bcrypt.hash(authHash, 10);

    // Insert user into DB and return the generated ID
    const insertRes = await db.query(
      'INSERT INTO users (email, password_hash, salt) VALUES ($1, $2, $3) RETURNING id',
      [normalizedEmail, passwordHash, salt]
    );

    return res.status(201).json({ 
      message: 'User registered successfully.',
      userId: insertRes.rows[0].id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token.
 */
router.post('/login', async (req, res) => {
  const { email, authHash } = req.body;

  if (!email || !authHash) {
    return res.status(400).json({ error: 'Email and authHash are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
    const user = userRes.rows[0];
    
    if (!user) {
      // Wait a short random time to mitigate timing attacks on invalid users
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      return res.status(400).json({ error: 'Invalid email or master password.' });
    }

    const isMatch = await bcrypt.compare(authHash, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or master password.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * POST /api/auth/change-master-password
 * Changes the user's master password hash and salt.
 */
router.post('/change-master-password', authMiddleware, async (req, res) => {
  const { currentAuthHash, newAuthHash, newSalt } = req.body;
  const userId = req.user.id;

  if (!currentAuthHash || !newAuthHash || !newSalt) {
    return res.status(400).json({ error: 'currentAuthHash, newAuthHash, and newSalt are required.' });
  }

  try {
    const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentAuthHash, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect master password.' });
    }

    const newPasswordHash = await bcrypt.hash(newAuthHash, 10);

    // Update user auth hash and salt
    await db.query(
      'UPDATE users SET password_hash = $1, salt = $2 WHERE id = $3', 
      [newPasswordHash, newSalt, userId]
    );

    return res.json({ message: 'Master password updated successfully.' });
  } catch (error) {
    console.error('Change master password error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * DELETE /api/auth/delete-account
 * Deletes user account and cascade-deletes credentials.
 */
router.delete('/delete-account', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { authHash } = req.body;

  if (!authHash) {
    return res.status(400).json({ error: 'authHash is required to delete account.' });
  }

  try {
    const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(authHash, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect master password.' });
    }

    // Delete user from DB. Cascading foreign keys will delete all credentials
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    return res.json({ message: 'Account and all vault data deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
