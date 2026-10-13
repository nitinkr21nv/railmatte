import test from 'node:test';
import assert from 'node:assert/strict';
import { createAgreementCommitment, hashBytes, PROTOCOL_DOMAIN } from '../src/services/crypto.js';

test('Crypto: Deterministic commitment generation with salt nonce', () => {
  const params = {
    exchangeId: 'prop-xyz-101',
    proposerId: 'user-001',
    recipientId: 'user-002',
    terms: {
      travel_date: '2026-10-20',
      origin_station: 'NDLS',
      destination_station: 'MMCT',
      coach_class: '3A',
      train_number: '12952'
    },
    nonce: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  };

  const res1 = createAgreementCommitment(params);
  const res2 = createAgreementCommitment(params);

  assert.equal(res1.commitmentHash, res2.commitmentHash);
  assert.equal(res1.saltNonce, params.nonce);
  assert.equal(res1.domain, PROTOCOL_DOMAIN);
  assert.ok(res1.commitmentHash.startsWith('0x'));
});

test('Crypto: Different nonce yields distinct privacy-preserving commitment hash', () => {
  const terms = {
    travel_date: '2026-10-20',
    origin_station: 'NDLS',
    destination_station: 'MMCT',
    coach_class: '3A'
  };

  const res1 = createAgreementCommitment({
    exchangeId: 'prop-1',
    proposerId: 'u1',
    recipientId: 'u2',
    terms,
    nonce: '0x1111111111111111111111111111111111111111111111111111111111111111'
  });

  const res2 = createAgreementCommitment({
    exchangeId: 'prop-1',
    proposerId: 'u1',
    recipientId: 'u2',
    terms,
    nonce: '0x2222222222222222222222222222222222222222222222222222222222222222'
  });

  assert.notEqual(res1.commitmentHash, res2.commitmentHash);
});
