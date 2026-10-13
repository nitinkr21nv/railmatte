import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { searchStations, searchTrains } from '../src/services/railwayData.js';

test('Railway Data: searchStations returns verified Indian Railways stations', () => {
  const ndlsMatches = searchStations('NDLS');
  assert.ok(ndlsMatches.length > 0, 'Should find NDLS');
  assert.equal(ndlsMatches[0].code, 'NDLS');
  assert.equal(ndlsMatches[0].name, 'New Delhi');

  const mumbaiMatches = searchStations('Mumbai');
  assert.ok(mumbaiMatches.length > 0, 'Should find Mumbai stations');
  assert.ok(mumbaiMatches.some((s) => s.code === 'MMCT' || s.code === 'CSMT'));

  const emptyMatches = searchStations('XYZ999');
  assert.equal(emptyMatches.length, 0, 'Should return empty array for non-existent station');
});

test('Railway Data: searchTrains returns verified premier trains', () => {
  const rajdhaniMatches = searchTrains('12952');
  assert.ok(rajdhaniMatches.length > 0, 'Should find Mumbai Rajdhani');
  assert.equal(rajdhaniMatches[0].number, '12952');
  assert.equal(rajdhaniMatches[0].name, 'Mumbai Rajdhani Express');

  const shatabdiMatches = searchTrains('Shatabdi');
  assert.ok(shatabdiMatches.length > 0, 'Should find Shatabdi Expresses');
});

test('API Railway: Endpoints return stations, trains, and reference disclosure metadata', async () => {
  const app = createApp();

  // Test /api/railway/stations
  const resStations = await request(app).get('/api/railway/stations?q=NDLS');
  assert.equal(resStations.status, 200);
  assert.ok(resStations.body.stations.length > 0);
  assert.equal(resStations.body.stations[0].code, 'NDLS');

  // Test /api/railway/trains
  const resTrains = await request(app).get('/api/railway/trains?q=12952');
  assert.equal(resTrains.status, 200);
  assert.ok(resTrains.body.trains.length > 0);
  assert.equal(resTrains.body.trains[0].number, '12952');

  // Test /api/railway/info
  const resInfo = await request(app).get('/api/railway/info');
  assert.equal(resInfo.status, 200);
  assert.equal(resInfo.body.isLiveGpsTracking, false);
  assert.ok(resInfo.body.dataSource.includes('Reference'));
  assert.ok(resInfo.body.totalStations > 0);
  assert.ok(resInfo.body.totalPremierTrains > 0);
});
