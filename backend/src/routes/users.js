import express from 'express';
import { store } from '../services/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Current passenger profile
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: req.user
  });
});

// List available profiles (useful for demo switcher & passenger selection)
router.get('/', async (req, res, next) => {
  try {
    const users = await store.getAllUsers();
    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// Update profile details (e.g. linked wallet address)
router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { display_name, wallet_address } = req.body;
    const updated = await store.createOrUpdateUser({
      id: req.user.id,
      email: req.user.email,
      display_name: display_name || req.user.display_name,
      wallet_address: wallet_address || req.user.wallet_address
    });
    res.json({ user: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
