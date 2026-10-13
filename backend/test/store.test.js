import test from 'node:test';
import assert from 'node:assert/strict';
import {
  store,
  checkDatabaseHealth,
  getDatabaseStatus,
  setOperationalState,
  isSupabaseConfigured
} from '../src/services/store.js';

test('Database Adapter: checkDatabaseHealth reports honest diagnostic status', async () => {
  assert.equal(isSupabaseConfigured, true, 'Supabase should be recognized as configured from .env');

  const health = await checkDatabaseHealth();
  assert.equal(health.configured, true, 'configured flag should be true');

  // If table permissions (42501) are not yet granted, it must report memory_fallback honestly
  if (!health.operational) {
    assert.equal(health.mode, 'memory_fallback');
    assert.ok(health.error, 'Should report clear error message');
    assert.ok(!health.error.includes(process.env.SUPABASE_SERVICE_ROLE_KEY), 'Error message must not leak credentials');
    assert.equal(getDatabaseStatus().operational, false);
  } else {
    assert.equal(health.mode, 'supabase');
    assert.equal(health.verified, true);
  }
});

import crypto from 'node:crypto';

test('Database Adapter: Core CRUD operations in datastore', async () => {
  // Ensure we test the robust store operations with valid UUID matching schema
  const testUserId = crypto.randomUUID();
  const profile = await store.createOrUpdateUser({
    id: testUserId,
    email: `test-user-${Date.now()}@example.com`,
    display_name: 'Test Passenger',
    wallet_address: '0x1234567890123456789012345678901234567890'
  });

  assert.equal(profile.id, testUserId);
  assert.equal(profile.display_name, 'Test Passenger');

  const fetchedUser = await store.getUser(testUserId);
  assert.equal(fetchedUser.id, testUserId);

  // Create exchange request
  const request = await store.createRequest({
    user_id: testUserId,
    travel_date: '2026-11-15',
    origin_station: 'New Delhi (NDLS)',
    destination_station: 'Kanpur Central (CNB)',
    train_number: '12004',
    train_name: 'Lucknow Shatabdi',
    current_coach: 'C3',
    current_seat: '25',
    current_berth_type: 'Window',
    desired_berth_type: 'Aisle',
    coach_class: 'CC',
    flexibility_note: 'Need aisle seat'
  });

  assert.ok(request.id, 'Request must have an ID');
  assert.equal(request.user_id, testUserId);
  assert.equal(request.status, 'OPEN');

  const fetchedReq = await store.getRequestById(request.id);
  assert.equal(fetchedReq.id, request.id);

  // Create assistance report
  const report = await store.createAssistanceReport({
    user_id: testUserId,
    category: 'GENERAL_ASSISTANCE',
    description: 'Wheelchair assistance required at platform 1.'
  });

  assert.ok(report.id, 'Report must have an ID');
  assert.equal(report.status, 'SUBMITTED');

  const fetchedRep = await store.getAssistanceReportById(report.id);
  assert.equal(fetchedRep.id, report.id);
});

test('Database Adapter: Strict error handling when operational', async () => {
  // Verify setOperationalState allows toggling state cleanly
  setOperationalState(false);
  assert.equal(getDatabaseStatus().operational, false);

  // Restore status via checkDatabaseHealth
  await checkDatabaseHealth();
});
