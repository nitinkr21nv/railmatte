
import { createHash } from 'node:crypto';
import { store } from '../services/store.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Preserve real UUIDs and map demo persona IDs to stable UUIDs.
 */
function normalizeUserId(id) {
  if (UUID_REGEX.test(id)) return id;

  if (!/^user-[a-z0-9-]+$/i.test(id)) return null;

  const chars = createHash('sha256')
    .update(`railmatte-demo:${id}`)
    .digest('hex')
    .slice(0, 32)
    .split('');

  chars[12] = '5';
  chars[16] = (
    (parseInt(chars[16], 16) & 0x3) | 0x8
  ).toString(16);

  const hex = chars.join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}

function getDisplayName(id) {
  const lower = id.toLowerCase();
  if (lower.includes('priya')) return 'Priya Sharma';
  if (lower.includes('rahul')) return 'Rahul Verma';
  if (lower.includes('ananya')) return 'Ananya Iyer';
  const match = id.match(/^user-([a-z]+)-/i);

  return match
    ? match[1][0].toUpperCase() + match[1].slice(1).toLowerCase()
    : `Passenger ${id.slice(0, 6)}`;
}

export async function requireAuth(req, res, next) {
  try {
    const rawId =
      req.headers['x-user-id'] ||
      req.headers['authorization']?.replace(/^Bearer\s+/i, '');

    if (!rawId) {
      return res.status(401).json({
        error: 'AuthenticationRequired',
        message: 'Missing passenger identification credentials'
      });
    }

    const userId = normalizeUserId(rawId);

    if (!userId) {
      return res.status(400).json({
        error: 'InvalidUserId',
        message: 'Invalid passenger identification'
      });
    }

    let user = await store.getUser(userId);

    if (!user) {
      user = await store.createOrUpdateUser({
        id: userId,
        email: `${userId}@passenger.railmatte.local`,
        display_name: getDisplayName(rawId)
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const rawId =
      req.headers['x-user-id'] ||
      req.headers['authorization']?.replace(/^Bearer\s+/i, '');

    if (rawId) {
      const userId = normalizeUserId(rawId);

      if (userId) {
        req.user = await store.getUser(userId);
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
