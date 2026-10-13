import crypto from 'node:crypto';

// Protocol Domain Tag for RailMatte agreement hashing
export const PROTOCOL_DOMAIN = 'RAILMATTE_EXCHANGE_AGREEMENT_V1';

/**
 * Computes a deterministic SHA256 or Keccak256 hash
 * @param {string|Buffer} data
 * @returns {string} hex string prefixed with 0x
 */
export function hashBytes(data) {
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return `0x${hash}`;
}

/**
 * Generates a cryptographically secure 32-byte random hex nonce
 * @returns {string} 0x-prefixed 64-char hex string
 */
export function generateSaltNonce() {
  return `0x${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Creates a privacy-preserving agreement commitment.
 * Under this model, NO personal names, PNRs, or seat details are published.
 * The commitment hash anchors the canonical terms digest combined with a secret salt nonce.
 *
 * @param {Object} params
 * @param {string} params.exchangeId Unique exchange/proposal identifier
 * @param {string} params.proposerId Anonymized proposer ID
 * @param {string} params.recipientId Anonymized recipient ID
 * @param {Object} params.terms Canonical terms object (journey date, origin, dest, coach class)
 * @param {string} [params.nonce] Optional salt nonce (generated if omitted)
 * @returns {{ commitmentHash: string, saltNonce: string, termsDigest: string, domain: string }}
 */
export function createAgreementCommitment({ exchangeId, proposerId, recipientId, terms, nonce }) {
  const saltNonce = nonce || generateSaltNonce();

  // Canonical JSON encoding of non-sensitive agreed terms
  const canonicalTerms = JSON.stringify({
    travel_date: terms.travel_date,
    origin_station: terms.origin_station,
    destination_station: terms.destination_station,
    coach_class: terms.coach_class,
    train_number: terms.train_number || 'UNSPECIFIED'
  });

  const termsDigest = hashBytes(canonicalTerms);

  // Packed commitment hash: domain || exchangeId || proposerId || recipientId || termsDigest || saltNonce
  const combinedPayload = `${PROTOCOL_DOMAIN}:${exchangeId}:${proposerId}:${recipientId}:${termsDigest}:${saltNonce}`;
  const commitmentHash = hashBytes(combinedPayload);

  return {
    commitmentHash,
    saltNonce,
    termsDigest,
    domain: PROTOCOL_DOMAIN
  };
}
