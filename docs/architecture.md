# RailMatte Architecture & Data Flow

**Tagline:** Swap seats. Travel better.

## 1. System Overview

RailMatte is structured as a clear, lightweight JavaScript monorepo consisting of three primary layers:
1. **Frontend (`frontend/`):** React 19 + Vite 8 + Tailwind CSS v4 + React Router v7 + Lucide React + Ethers.js.
2. **Backend API (`backend/`):** Node.js + Express + Deterministic Matching Engine + Cryptographic Salted Hasher + Dual-mode persistence (Supabase PostgreSQL / In-Memory local datastore fallback).
3. **Smart Contract Registry (`contracts/`):** Solidity `RailMatteAgreementRegistry.sol` deployed on the Monad network (Chain ID: `10143`), audited with automated Hardhat test suites.

```
+-------------------------------------------------------------------------------+
|                               FRONTEND CLIENT                                 |
|  - React 19 SPA / Tailwind CSS                                                |
|  - Bilateral Mutual Consent Interface                                         |
|  - Passenger Persona Switcher (Priya <-> Rahul for testing)                   |
|  - EVM Web3 Wallet Connector (Ethers.js -> Monad Testnet 10143)               |
+---------------------------------------+---------------------------------------+
                                        | HTTP REST (JSON)
                                        v
+-------------------------------------------------------------------------------+
|                               BACKEND SERVER                                  |
|  - Express Application (Port 5000)                                            |
|  - Deterministic Matching Engine (Rule-based scoring, exact explanations)     |
|  - State Machine Enforcement (Bilateral consent, mutual acceptance)          |
|  - Privacy Hasher (keccak256 with 32-byte salt nonce & domain separation)     |
|  - Optional Gemini AI Journey Assistance Classifier                           |
+--------------------+----------------------------------+-----------------------+
                     |                                  |
          (Dual Storage Interface)                      | (Client initiates tx)
                     v                                  v
+------------------------------------+   +------------------------------------+
|         DATABASE LAYER             |   |       MONAD BLOCKCHAIN             |
|  - Supabase PostgreSQL Client      |   |  - Monad Testnet (Chain ID 10143)   |
|  - Profiles, Requests, Proposals,  |   |  - RailMatteAgreementRegistry.sol  |
|    Commitments, Assistance Reports |   |  - Privacy-Preserving Hashes Only  |
|  - In-Memory Fallback for Dev/Test |   |  - Zero Personal PNRs On-Chain     |
+------------------------------------+   +------------------------------------+
```

## 2. End-to-End Exchange Lifecycle Flow

1. **Request Formulation:**
   - Passenger A inputs journey parameters: Travel Date, Origin, Destination, Train Identifier, Coach Class, Current Coach/Seat/Berth, and Desired Berth Preference.
   - PNR numbers, passenger phone numbers, and identity documents are deliberately excluded.

2. **Deterministic Compatibility Evaluation:**
   - Candidate requests on identical route, date, and travel class are evaluated by `services/matching.js`.
   - Scoring algorithm factors:
     - Exact date & route match: Base 35 points
     - Train number verification: Up to 15 points
     - Reciprocal berth complementarity (A holds what B wants, and B holds what A wants): 40 points
     - Same coach proximity: 10 points
   - Returns explainable list of reasons for passenger transparency.

3. **Bilateral Proposal & Mutual Consent:**
   - Passenger A initiates a proposal targeting Passenger B's compatible request.
   - Proposer consent is automatically recorded (`proposer_consent: true`).
   - Proposal enters `PROPOSED` state.
   - Passenger B reviews the side-by-side exchange parameters in their dashboard.
   - Passenger B provides explicit consent (`recipient_consent: true`).
   - The server validates that both consents are satisfied before transitioning status to `ACCEPTED`.

4. **Cryptographic Commitment Generation (Off-Chain):**
   - Once both participants accept, the backend computes:
     ```
     termsDigest = sha256(canonicalJSON(travel_date, origin, dest, class, train))
     saltNonce = crypto.randomBytes(32)
     commitmentHash = sha256("RAILMATTE_EXCHANGE_AGREEMENT_V1" : exchangeId : proposerId : recipientId : termsDigest : saltNonce)
     ```
   - The commitment is prepared with status `PREPARED`.

5. **Monad Trust Anchoring (On-Chain):**
   - Either passenger connects their EVM wallet on Monad Testnet (`Chain ID: 10143`).
   - Calls `recordAgreement(commitmentHash, exchangeId)` on `RailMatteAgreementRegistry`.
   - The contract records the timestamp, commitment hash, and recorder address, and emits `AgreementCommitted`.
   - The confirmed transaction hash is verified and saved to the backend database.
