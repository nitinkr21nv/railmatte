import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCompatibility, findCompatibleRequests } from '../src/services/matching.js';

test('Matching Engine: Identical route, date and reciprocal berths', () => {
  const reqA = {
    id: 'req-1',
    user_id: 'user-1',
    travel_date: '2026-10-20',
    origin_station: 'New Delhi (NDLS)',
    destination_station: 'Mumbai Central (MMCT)',
    train_number: '12952',
    current_coach: 'B3',
    current_seat: '42',
    current_berth_type: 'Upper',
    desired_berth_type: 'Lower',
    coach_class: '3A',
    status: 'OPEN'
  };

  const reqB = {
    id: 'req-2',
    user_id: 'user-2',
    travel_date: '2026-10-20',
    origin_station: 'New Delhi (NDLS)',
    destination_station: 'Mumbai Central (MMCT)',
    train_number: '12952',
    current_coach: 'B3',
    current_seat: '19',
    current_berth_type: 'Lower',
    desired_berth_type: 'Upper',
    coach_class: '3A',
    status: 'OPEN'
  };

  const evalResult = evaluateCompatibility(reqA, reqB);
  assert.equal(evalResult.isCompatible, true);
  assert.equal(evalResult.score, 100); // 35 base + 15 train + 40 reciprocal berth + 10 same coach
  assert.ok(evalResult.reasons.some((r) => r.includes('Perfect reciprocal')));
});

test('Matching Engine: Incompatible travel dates should be rejected', () => {
  const reqA = {
    id: 'req-1',
    user_id: 'user-1',
    travel_date: '2026-10-20',
    origin_station: 'NDLS',
    destination_station: 'MMCT',
    coach_class: '3A',
    status: 'OPEN'
  };

  const reqB = {
    id: 'req-2',
    user_id: 'user-2',
    travel_date: '2026-10-25',
    origin_station: 'NDLS',
    destination_station: 'MMCT',
    coach_class: '3A',
    status: 'OPEN'
  };

  const evalResult = evaluateCompatibility(reqA, reqB);
  assert.equal(evalResult.isCompatible, false);
  assert.equal(evalResult.score, 0);
  assert.ok(evalResult.reasons[0].includes('dates do not match'));
});

test('Matching Engine: Incompatible route stations should be rejected', () => {
  const reqA = {
    id: 'req-1',
    user_id: 'user-1',
    travel_date: '2026-10-20',
    origin_station: 'NDLS',
    destination_station: 'MMCT',
    coach_class: '3A',
    status: 'OPEN'
  };

  const reqB = {
    id: 'req-2',
    user_id: 'user-2',
    travel_date: '2026-10-20',
    origin_station: 'SBC',
    destination_station: 'MAS',
    coach_class: '3A',
    status: 'OPEN'
  };

  const evalResult = evaluateCompatibility(reqA, reqB);
  assert.equal(evalResult.isCompatible, false);
  assert.equal(evalResult.score, 0);
  assert.ok(evalResult.reasons[0].includes('Route mismatch'));
});

test('Matching Engine: Candidate not in OPEN status should be rejected', () => {
  const reqA = {
    id: 'req-1',
    user_id: 'user-1',
    travel_date: '2026-10-20',
    origin_station: 'NDLS',
    destination_station: 'MMCT',
    coach_class: '3A',
    status: 'OPEN'
  };

  const reqB = {
    id: 'req-2',
    user_id: 'user-2',
    travel_date: '2026-10-20',
    origin_station: 'NDLS',
    destination_station: 'MMCT',
    coach_class: '3A',
    status: 'MATCHED'
  };

  const evalResult = evaluateCompatibility(reqA, reqB);
  assert.equal(evalResult.isCompatible, false);
});
