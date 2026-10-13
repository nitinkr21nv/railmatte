import express from 'express';
import { store } from '../services/store.js';
import { requireAuth } from '../middleware/auth.js';
import { draftAssistanceReport } from '../services/gemini.js';

const router = express.Router();

const VALID_CATEGORIES = [
  'SEAT_CONFLICT',
  'LOST_ITEM',
  'ACCESSIBILITY_NEED',
  'BERTH_DISPUTE',
  'GENERAL_ASSISTANCE'
];

// List user's assistance reports
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const reports = await store.getAssistanceReports({ userId: req.user.id });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
});

// Create new assistance report
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { category, description, exchange_reference_id } = req.body;

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        error: 'ValidationError',
        message: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`
      });
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Description must be at least 5 characters long.'
      });
    }

    if (description.trim().length > 1000) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Description cannot exceed 1000 characters.'
      });
    }

    const report = await store.createAssistanceReport({
      user_id: req.user.id,
      category,
      description: description.trim(),
      exchange_reference_id: exchange_reference_id || null
    });

    res.status(201).json({
      report,
      message: 'Assistance report logged. Note: This report is logged within RailMatte and does not modify official Indian Railways PNR records.'
    });
  } catch (err) {
    next(err);
  }
});

// Get single assistance report
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const report = await store.getAssistanceReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'NotFound', message: 'Assistance report not found' });
    }

    // Ownership check
    if (report.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'You are not authorized to view this report' });
    }

    res.json({ report });
  } catch (err) {
    next(err);
  }
});

// Update status of assistance report (e.g. resolve)
router.patch('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['SUBMITTED', 'REVIEWING', 'RESOLVED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'ValidationError', message: 'Invalid status' });
    }

    const report = await store.getAssistanceReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'NotFound', message: 'Report not found' });
    }

    if (report.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', message: 'Unauthorized' });
    }

    const updated = await store.updateAssistanceReport(req.params.id, { status });
    res.json({ report: updated });
  } catch (err) {
    next(err);
  }
});

// Optional AI Assistance Draft Endpoint
router.post('/ai-draft', requireAuth, async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note || typeof note !== 'string') {
      return res.status(400).json({ error: 'ValidationError', message: 'Passenger note string is required' });
    }

    const draft = await draftAssistanceReport(note);
    res.json({ draft });
  } catch (err) {
    next(err);
  }
});

export default router;
