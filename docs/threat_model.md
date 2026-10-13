# RailMatte Threat Model & Security Architecture

## 1. Trust Assumptions & Boundary Definitions

RailMatte is an independent travel companion enabling voluntary passenger seat swaps.
- **Out of Scope / Non-Goals:** RailMatte does NOT modify official Indian Railways reservation databases (CRIS/IRCTC), ticket booking charts, or official PNR records.
- **In Scope:** Peer-to-peer voluntary coordination, bilateral consent enforcement, privacy preservation, and auditable proof on Monad.

## 2. Threat Analysis & Mitigations

| Threat | Risk | Mitigation in RailMatte |
|---|---|---|
| **Public Blockchain PII Leakage** | Critical | **Zero PII On-Chain:** Names, phone numbers, email addresses, PNRs, and seat identifiers are never stored on Monad. Only a salted commitment hash is recorded. |
| **Dictionary / Rainbow Table Hash Inversion** | High | **Cryptographically Secure Salt Nonce:** A 256-bit random nonce (`crypto.randomBytes(32)`) is combined with canonical terms. Without the off-chain nonce, guessing the hash input is computationally infeasible ($2^{256}$ space). |
| **Unilateral Acceptance Fraud** | High | **Bilateral State Machine:** Proposal status cannot transition to `ACCEPTED` unless both `proposer_consent` and `recipient_consent` are true. The backend strictly forbids a proposer from accepting their own proposal. |
| **Conflicting / Duplicate Proposals** | Medium | **Duplicate Proposal Guard:** Database and in-memory store verify whether an active pending proposal already exists between two requests before creation. |
| **Cross-Protocol Hash Replay** | Medium | **Domain Separation:** Commitments are prefixed with `RAILMATTE_EXCHANGE_AGREEMENT_V1` to prevent collisions with other contracts or protocols. |
| **Privileged Credential Leakage** | Critical | **Server-Side Key Isolation:** Supabase service-role keys and Gemini API keys reside exclusively in backend environment variables, never bundled into frontend assets. |
| **API Payload Abuse / DOS** | Medium | **Body Size Limits & Input Validation:** Strict 100kb payload limit on Express body parser; character limits on notes (300 chars) and assistance descriptions (1000 chars). |

## 3. What the Monad On-Chain Record Proves vs. Does Not Prove

### What It Proves:
1. Two consenting parties finalized an exchange agreement at or before block timestamp $T$.
2. The agreement terms correspond mathematically to the off-chain commitment hash.
3. No participant can retroactively tamper with the agreed terms without invalidating the hash.

### What It Does NOT Prove:
1. Does not prove the official railway ticket was modified.
2. Does not guarantee physical coach presence or courtesy of either passenger.
3. Does not replace the travel ticket examiner's (TTE) official authority on board the train.
