import express from 'express';
import { 
  STATIONS, 
  TRAINS, 
  searchStations, 
  searchTrains, 
  RAILWAY_REFERENCE_DISCLAIMER 
} from '../services/railwayData.js';

const router = express.Router();

/**
 * GET /api/railway/stations
 * Query param: ?q=
 */
router.get('/stations', (req, res) => {
  const q = req.query.q;
  if (!q) {
    // Return major stations
    return res.json({
      stations: STATIONS.slice(0, 20),
      meta: RAILWAY_REFERENCE_DISCLAIMER
    });
  }
  const results = searchStations(q);
  res.json({
    stations: results,
    meta: RAILWAY_REFERENCE_DISCLAIMER
  });
});

/**
 * GET /api/railway/trains
 * Query param: ?q=
 */
router.get('/trains', (req, res) => {
  const q = req.query.q;
  if (!q) {
    return res.json({
      trains: TRAINS,
      meta: RAILWAY_REFERENCE_DISCLAIMER
    });
  }
  const results = searchTrains(q);
  res.json({
    trains: results,
    meta: RAILWAY_REFERENCE_DISCLAIMER
  });
});

/**
 * GET /api/railway/info
 * Reference metadata
 */
router.get('/info', (req, res) => {
  res.json({
    ...RAILWAY_REFERENCE_DISCLAIMER,
    totalStations: STATIONS.length,
    totalPremierTrains: TRAINS.length
  });
});

export default router;
