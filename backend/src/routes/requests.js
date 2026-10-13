import express from 'express';
import { store } from '../services/store.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { findCompatibleRequests, evaluateCompatibility } from '../services/matching.js';

const router = express.Router();

const VALID_BERTH_TYPES = ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'Window', 'Aisle'];
const VALID_CLASSES = ['1A', '2A', '3A', 'SL', 'CC', 'EC', '2S'];

// List all requests with optional filters
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { status, userId, travel_date, origin, destination } = req.query;
    let list = await store.getAllRequests({ status, userId });

    if (travel_date) {
      list = list.filter((r) => r.travel_date === travel_date);
    }
    if (origin) {
      list = list.filter((r) => r.origin_station.toLowerCase().includes(origin.toLowerCase()));
    }
    if (destination) {
      list = list.filter((r) => r.destination_station.toLowerCase().includes(destination.toLowerCase()));
    }

    res.json({ requests: list });
  } catch (err) {
    next(err);
  }
});

// Create new seat exchange request
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const {
      travel_date,
      origin_station,
      destination_station,
      train_number,
      train_name,
      current_coach,
      current_seat,
      current_berth_type,
      desired_berth_type,
      coach_class,
      flexibility_note
    } = req.body;

    // Validate required fields
    if (!travel_date || !origin_station || !destination_station || !current_coach || !current_seat || !current_berth_type || !desired_berth_type || !coach_class) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Missing mandatory request fields. Please supply travel date, stations, coach, seat, berth types and class.'
      });
    }

    if (origin_station.trim().toLowerCase() === destination_station.trim().toLowerCase()) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Origin station and destination station cannot be identical.'
      });
    }

    if (flexibility_note && flexibility_note.length > 300) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Flexibility note exceeds maximum length of 300 characters.'
      });
    }

    const created = await store.createRequest({
      user_id: req.user.id,
      travel_date,
      origin_station: origin_station.trim(),
      destination_station: destination_station.trim(),
      train_number: train_number ? train_number.trim() : null,
      train_name: train_name ? train_name.trim() : null,
      current_coach: current_coach.trim().toUpperCase(),
      current_seat: current_seat.trim(),
      current_berth_type,
      desired_berth_type,
      coach_class,
      flexibility_note: flexibility_note ? flexibility_note.trim() : ''
    });

    res.status(201).json({ request: created });
  } catch (err) {
    next(err);
  }
});

// Get request details by ID
router.get('/:id', async (req, res, next) => {
  try {
    const request = await store.getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'NotFound', message: 'Exchange request not found' });
    }
    res.json({ request });
  } catch (err) {
    next(err);
  }
});

// Find compatible candidate matches for a request
router.get('/:id/matches', async (req, res, next) => {
  try {
    const baseRequest = await store.getRequestById(req.params.id);
    if (!baseRequest) {
      return res.status(404).json({ error: 'NotFound', message: 'Exchange request not found' });
    }

    const allRequests = await store.getAllRequests({ status: 'OPEN' });
    const matches = findCompatibleRequests(baseRequest, allRequests);

    res.json({
      baseRequest,
      totalMatches: matches.length,
      matches
    });
  } catch (err) {
    next(err);
  }
});

// Cancel own exchange request
router.patch('/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const request = await store.getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'NotFound', message: 'Exchange request not found' });
    }

    // Ownership check
    if (request.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You can only cancel your own exchange requests.' });
    }

    if (request.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Conflict', message: 'Request is already cancelled.' });
    }

    const updated = await store.updateRequest(req.params.id, { status: 'CANCELLED' });
    res.json({ request: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
