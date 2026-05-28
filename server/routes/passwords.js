import express from 'express';
import db from '../models/database.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/passwords
 * Fetch all encrypted credentials for the authenticated user
 */
router.get('/', authMiddleware, (req, res) => {
  const userId = req.user.id;

  try {
    const credentials = db.prepare(`
      SELECT id, site_name, url, username, password, category, notes, last_changed_at, created_at, updated_at
      FROM credentials
      WHERE user_id = ?
      ORDER BY site_name ASC
    `).all(userId);

    return res.json(credentials);
  } catch (error) {
    console.error('Fetch credentials error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * POST /api/passwords
 * Create a new encrypted credential
 */
router.post('/', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { siteName, url, username, password, category, notes, lastChangedAt } = req.body;

  if (!siteName || !username || !password) {
    return res.status(400).json({ error: 'Site name, username, and password are required.' });
  }

  const changeTime = lastChangedAt || new Date().toISOString();

  try {
    const result = db.prepare(`
      INSERT INTO credentials (user_id, site_name, url, username, password, category, notes, last_changed_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(userId, siteName, url || '', username, password, category || '', notes || '', changeTime);

    return res.status(201).json({
      id: result.lastInsertRowid,
      message: 'Credential created successfully.'
    });
  } catch (error) {
    console.error('Create credential error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * PUT /api/passwords/:id
 * Update an existing encrypted credential
 */
router.put('/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { siteName, url, username, password, category, notes, lastChangedAt } = req.body;

  if (!siteName || !username || !password) {
    return res.status(400).json({ error: 'Site name, username, and password are required.' });
  }

  const changeTime = lastChangedAt || new Date().toISOString();

  try {
    // Check ownership first
    const credential = db.prepare('SELECT id FROM credentials WHERE id = ? AND user_id = ?').get(id, userId);
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found or unauthorized.' });
    }

    db.prepare(`
      UPDATE credentials
      SET site_name = ?, url = ?, username = ?, password = ?, category = ?, notes = ?, last_changed_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(siteName, url || '', username, password, category || '', notes || '', changeTime, id, userId);

    return res.json({ message: 'Credential updated successfully.' });
  } catch (error) {
    console.error('Update credential error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * DELETE /api/passwords/:id
 * Delete an encrypted credential
 */
router.delete('/:id', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM credentials WHERE id = ? AND user_id = ?').run(id, userId);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Credential not found or unauthorized.' });
    }

    return res.json({ message: 'Credential deleted successfully.' });
  } catch (error) {
    console.error('Delete credential error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

/**
 * POST /api/passwords/sync
 * Bulk sync credentials (deletes all user's credentials and inserts new list in a transaction)
 * Useful for CSV imports and Master Password updates.
 */
router.post('/sync', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { credentials } = req.body; // Array of credentials

  if (!Array.isArray(credentials)) {
    return res.status(400).json({ error: 'Credentials parameter must be an array.' });
  }

  // Create an SQLite transaction
  const syncTransaction = db.transaction((items) => {
    // 1. Delete all existing credentials
    db.prepare('DELETE FROM credentials WHERE user_id = ?').run(userId);

    // 2. Insert all new items
    const insertStmt = db.prepare(`
      INSERT INTO credentials (user_id, site_name, url, username, password, category, notes, last_changed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const item of items) {
      const siteName = item.site_name || item.siteName;
      const url = item.url;
      const username = item.username;
      const password = item.password;
      const category = item.category;
      const notes = item.notes;
      const lastChangedAt = item.last_changed_at || item.lastChangedAt || new Date().toISOString();

      if (!siteName || !username || !password) {
        throw new Error('Invalid item. site_name, username, and password are required.');
      }

      insertStmt.run(userId, siteName, url || '', username, password, category || '', notes || '', lastChangedAt);
    }

    return items.length;
  });

  try {
    const count = syncTransaction(credentials);
    return res.json({ 
      message: `Successfully synchronized ${count} credentials.`,
      count
    });
  } catch (error) {
    console.error('Bulk sync credentials error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

export default router;
