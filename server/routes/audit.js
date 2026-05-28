import express from 'express';
import { getPwnedRange } from '../utils/hibp.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/audit/check-breach/:prefix
 * Proxies HaveIBeenPwned range search. Protect with auth middleware.
 */
router.get('/check-breach/:prefix', authMiddleware, async (req, res) => {
  const { prefix } = req.params;

  if (!prefix || prefix.length !== 5) {
    return res.status(400).json({ error: 'Prefix must be exactly 5 hex characters.' });
  }

  // Validate hex format
  const isHex = /^[0-9A-Fa-f]{5}$/.test(prefix);
  if (!isHex) {
    return res.status(400).json({ error: 'Prefix must be a hexadecimal string.' });
  }

  try {
    const data = await getPwnedRange(prefix.toUpperCase());
    
    // Return content-type as plain/text, matching HIBP range API response
    res.setHeader('Content-Type', 'text/plain');
    return res.send(data);
  } catch (error) {
    console.error('Audit route check-breach error:', error);
    return res.status(500).json({ error: 'Failed to fetch password breach data.' });
  }
});

export default router;
