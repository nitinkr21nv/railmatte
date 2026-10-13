import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

test('API Health: /api/health returns operational status', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'healthy');
  assert.equal(res.body.tagline, 'Swap seats. Travel better.');
});

test('API Requests: Create new request and validate required fields', async () => {
  // Test validation error when missing fields
  const invalidRes = await request(app)
    .post('/api/requests')
    .set('x-user-id', 'user-priya-001')
    .send({ travel_date: '2026-10-20' });
  assert.equal(invalidRes.status, 400);

  // Test valid creation
  const validRes = await request(app)
    .post('/api/requests')
    .set('x-user-id', 'user-priya-001')
    .send({
      travel_date: '2026-11-05',
      origin_station: 'Delhi (DLI)',
      destination_station: 'Jaipur (JP)',
      train_number: '12015',
      train_name: 'Ajmer Shatabdi',
      current_coach: 'C1',
      current_seat: '12',
      current_berth_type: 'Aisle',
      desired_berth_type: 'Window',
      coach_class: 'CC',
      flexibility_note: 'Looking for window seat'
    });

  assert.equal(validRes.status, 201);
  assert.equal(validRes.body.request.origin_station, 'Delhi (DLI)');
  assert.equal(validRes.body.request.status, 'OPEN');
});

test('API Proposals: Complete bilateral mutual consent flow', async () => {
  // 1. Propose exchange between Priya's request (req-priya-101) and Rahul's request (req-rahul-102)
  const propRes = await request(app)
    .post('/api/proposals')
    .set('x-user-id', 'user-priya-001')
    .send({
      request_a_id: 'req-priya-101',
      request_b_id: 'req-rahul-102'
    });

  assert.equal(propRes.status, 201);
  const proposalId = propRes.body.proposal.id;
  assert.equal(propRes.body.proposal.status, 'PROPOSED');
  assert.equal(propRes.body.proposal.proposer_consent, true);
  assert.equal(propRes.body.proposal.recipient_consent, false);

  // 2. Proposer cannot unilaterally accept the proposal
  const unauthAccept = await request(app)
    .post(`/api/proposals/${proposalId}/accept`)
    .set('x-user-id', 'user-priya-001');
  assert.equal(unauthAccept.status, 403);

  // 3. Recipient (Rahul) explicitly accepts the proposal
  const acceptRes = await request(app)
    .post(`/api/proposals/${proposalId}/accept`)
    .set('x-user-id', 'user-rahul-002');

  assert.equal(acceptRes.status, 200);
  assert.equal(acceptRes.body.proposal.status, 'ACCEPTED');
  assert.equal(acceptRes.body.proposal.recipient_consent, true);
  assert.ok(acceptRes.body.commitment.commitment_hash.startsWith('0x'));

  // 4. Verify commitment status is PREPARED
  const commitRes = await request(app)
    .get(`/api/commitments/${proposalId}`)
    .set('x-user-id', 'user-priya-001');
  assert.equal(commitRes.status, 200);
  assert.equal(commitRes.body.commitment.status, 'PREPARED');

  // 5. Confirm on-chain transaction hash
  const confirmRes = await request(app)
    .post(`/api/commitments/${proposalId}/confirm`)
    .set('x-user-id', 'user-priya-001')
    .send({
      tx_hash: '0x' + 'b'.repeat(64),
      contract_address: '0x' + 'c'.repeat(40),
      recorder_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
    });
  assert.equal(confirmRes.status, 200);
  assert.equal(confirmRes.body.commitment.status, 'CONFIRMED');
});

test('API Assistance: Create and list assistance reports', async () => {
  const createRes = await request(app)
    .post('/api/assistance')
    .set('x-user-id', 'user-priya-001')
    .send({
      category: 'BERTH_DISPUTE',
      description: 'Co-passenger was allocated double booking on berth 42, requested clarification.'
    });

  assert.equal(createRes.status, 201);
  assert.equal(createRes.body.report.category, 'BERTH_DISPUTE');
  assert.equal(createRes.body.report.status, 'SUBMITTED');

  const listRes = await request(app)
    .get('/api/assistance')
    .set('x-user-id', 'user-priya-001');
  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.reports.length >= 1);
});
