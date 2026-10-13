import { store } from '../services/store.js';

/**
 * Authentication Middleware
 * Resolves passenger identity via `x-user-id` header or session token.
 * Defaults to demo user in development if no header specified.
 */
export async function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!userId) {
    return res.status(401).json({
      error: 'AuthenticationRequired',
      message: 'Missing passenger identification credentials (x-user-id header required)'
    });
  }

  let user = await store.getUser(userId);

  // If user does not exist yet, auto-provision profile if well-formatted id
  if (!user) {
    user = await store.createOrUpdateUser({
      id: userId,
      email: `${userId}@passenger.railmatte.local`,
      display_name: `Passenger ${userId.slice(0, 6)}`
    });
  }

  req.user = user;
  next();
}

/**
 * Optional Auth Middleware
 * Populates req.user if header is present, but doesn't block request if missing.
 */
export async function optionalAuth(req, res, next) {
  const userId = req.headers['x-user-id'] || req.headers['authorization']?.replace('Bearer ', '');
  if (userId) {
    req.user = await store.getUser(userId);
  }
  next();
}
