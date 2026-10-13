# RailMatte

**Tagline:** Swap seats. Travel better.

> An independent train seat-exchange coordinator and journey companion for voluntary passenger berth swaps, enforced through bilateral mutual consent and privacy-preserving trust anchoring on the Monad network.

---

## 1. Product Overview & Problem

Millions of train passengers travel daily with suboptimal seat allocations—elderly passengers placed on upper berths, families split across distant coaches, or commuters needing quiet window seats to work. Today, seat swaps happen through awkward, uncoordinated negotiations in congested corridors, leading to misunderstandings, disputes, and friction.

**RailMatte solves this through three core principles:**
1. **Consent First:** No seat exchange is confirmed unless both participants explicitly review and agree.
2. **Privacy First:** Sensitive passenger identities, contact details, PNRs, and journey documents stay strictly off-chain.
3. **Verifiable Trust:** Monad anchors privacy-preserving cryptographic commitments to agreed exchanges without leaking travel data.

> **Important Disclaimer:** RailMatte is an independent hackathon prototype. It does **not** modify official railway reservation records, PNR charts, or ticketing databases (IRCTC/CRIS). Exchanges remain strictly voluntary and based on courteous, bilateral passenger agreement.

---

## 2. Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS v4, React Router v7, Lucide React, Ethers.js v6.
- **Backend API:** Node.js, Express, Deterministic Compatibility Engine, SHA256 Salted Hasher, Google Gemini AI (optional draft helper).
- **Database:** Supabase PostgreSQL with documented migrations (`docs/supabase_schema.sql`) and a robust in-memory datastore fallback for zero-friction local testing.
- **Blockchain / Trust Anchor:** Solidity `RailMatteAgreementRegistry.sol` on Monad Testnet (Chain ID: `10143`), Hardhat development and test toolchain.
- **Licence:** MIT Open Source License.

---

## 3. Architecture & Data Flow

```
Passenger A (React 19 Frontend)                Passenger B (React 19 Frontend)
     |                                               |
     |--- 1. Post Request (Date, Route, Seat)        |--- 1. Post Request
     v                                               v
+---------------------------------------------------------+
|                  RailMatte Backend API                  |
| - Deterministic Scoring Engine evaluates compatibility  |
+---------------------------------------------------------+
     |
     |--- 2. Propose Exchange (Proposer Consents) --------> Passenger B
                                                                 |
                                              3. Explicit Consent|
                                                                 v
+----------------------------------------------------------------+
| Mutual Consent Confirmed (Both Consents = TRUE)                |
| - Backend generates off-chain:                                 |
|   termsDigest = sha256(canonical terms)                        |
|   saltNonce = crypto.randomBytes(32)                           |
|   commitmentHash = sha256(Domain : ID : Digest : Nonce)        |
+----------------------------------------------------------------+
                               |
                               |--- 4. Submit to Monad Testnet via Web3 Wallet
                               v
+----------------------------------------------------------------+
| Monad Network (Chain ID: 10143)                                |
| RailMatteAgreementRegistry.sol                                 |
| - Records commitmentHash, exchangeId, recorder, timestamp       |
| - Emits AgreementCommitted event                               |
+----------------------------------------------------------------+
```

---

## 4. Local Setup & Quickstart

### Prerequisites
- Node.js `v20+` or `v22+`
- npm `v10+`

### Installation

Clone the repository and install dependencies in all workspaces:

```bash
# 1. Install root dependencies
npm install

# 2. Install frontend dependencies
cd frontend && npm install && cd ..

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Install smart contract dependencies
cd contracts && npm install && cd ..
```

### Running Tests

Run the unified test suite (smart contracts + backend API tests):

```bash
npm test
```
*Executes all 6 Hardhat contract tests and all 10 Node.js backend integration tests.*

### Running the Services Locally

In separate terminal windows:

**Start Backend Server:**
```bash
npm run dev:backend
# Starts Express API at http://localhost:5000
```

**Start Frontend Client:**
```bash
npm run dev:frontend
# Starts Vite application at http://localhost:5173
```

---

## 5. Environment Variables

Copy `.env.example` to `.env` or set environment variables accordingly:

### Root / Backend Configuration (`.env`)
| Variable | Mandatory? | Default / Example | Purpose |
|---|---|---|---|
| `PORT` | Optional | `5000` | HTTP port for backend API |
| `NODE_ENV` | Optional | `development` | Runtime environment mode |
| `FRONTEND_URL` | Optional | `http://localhost:5173` | CORS allowed origin |
| `SUPABASE_URL` | Optional | `https://xyz.supabase.co` | Supabase PostgreSQL project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | `ey...` | Supabase privileged service-role key |
| `MONAD_RPC_URL` | Optional | `https://testnet-rpc.monad.xyz` | Monad RPC node endpoint |
| `MONAD_CHAIN_ID` | Optional | `10143` | Monad network chain ID |
| `MONAD_CONTRACT_ADDRESS` | Optional | `0x0000...` | Deployed agreement registry address |
| `GEMINI_API_KEY` | Optional | `AIza...` | Google Gemini API key for journey assistance drafting |

### Frontend Configuration (`frontend/.env`)
| Variable | Mandatory? | Default / Example | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | Optional | `http://localhost:5000/api` | API backend URL |
| `VITE_MONAD_CHAIN_ID` | Optional | `10143` | Monad Testnet chain ID |
| `VITE_MONAD_RPC_URL` | Optional | `https://testnet-rpc.monad.xyz` | Monad RPC endpoint |
| `VITE_MONAD_EXPLORER_URL` | Optional | `https://testnet.monadexplorer.com` | Monad explorer base URL |
| `VITE_CONTRACT_ADDRESS` | Optional | `0x0000...` | Deployed agreement registry address |

*Note: If Supabase or Gemini keys are omitted, the application runs cleanly using its built-in In-Memory datastore and local heuristic draft models.*

---

## 6. Database Setup & Supabase Migrations

The complete PostgreSQL schema is located at [`docs/supabase_schema.sql`](file:///d:/Unstop/Metropolis/RailMatte/docs/supabase_schema.sql).

Tables implemented:
1. `profiles`: Passenger account profiles and linked wallet addresses.
2. `exchange_requests`: Travel date, stations, train details, current and desired berth types.
3. `exchange_proposals`: Bilateral mutual consent state machine (`proposer_consent`, `recipient_consent`).
4. `agreement_commitments`: Off-chain terms digest, salt nonce, and Monad transaction confirmation.
5. `assistance_reports`: Journey incident logs and neutral status tracking.

To apply migrations on Supabase:
1. Open the Supabase SQL Editor.
2. Paste and run the contents of `docs/supabase_schema.sql`.

---

## 7. Smart Contract Design & Privacy Architecture

The smart contract [`contracts/contracts/RailMatteAgreementRegistry.sol`](file:///d:/Unstop/Metropolis/RailMatte/contracts/contracts/RailMatteAgreementRegistry.sol) is a gas-efficient, minimal agreement-commitment registry.

### Privacy Safeguards:
- **No PII On-Chain:** Names, emails, phone numbers, PNRs, and seat numbers are strictly excluded.
- **Salt Nonce Protection:** A 256-bit cryptographically random salt nonce (`crypto.randomBytes(32)`) prevents dictionary and rainbow-table hash guessing attacks.
- **Domain Separation:** Prefixed with `RAILMATTE_EXCHANGE_AGREEMENT_V1` to avoid cross-application hash collisions.

### Deploying to Monad Testnet:
```bash
cd contracts
npx hardhat run scripts/deploy.cjs --network monadTestnet
```

---

## 8. API Endpoint Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck and runtime configuration status |
| `GET` | `/api/users/me` | Current authenticated passenger session |
| `GET` | `/api/users` | List available passenger profiles (demo switcher) |
| `GET` | `/api/requests` | List open seat exchange requests |
| `POST` | `/api/requests` | Create a new seat exchange request |
| `GET` | `/api/requests/:id/matches` | Evaluate deterministic candidate matches |
| `PATCH` | `/api/requests/:id/cancel` | Cancel own exchange request |
| `GET` | `/api/proposals` | List user exchange proposals |
| `POST` | `/api/proposals` | Propose an exchange between two requests |
| `POST` | `/api/proposals/:id/accept` | Recipient provides explicit bilateral consent |
| `POST` | `/api/proposals/:id/decline` | Recipient declines proposal |
| `POST` | `/api/proposals/:id/cancel` | Cancel active proposal |
| `POST` | `/api/proposals/:id/complete` | Mark journey successfully completed |
| `GET` | `/api/commitments/:proposalId` | Retrieve commitment hash and salt nonce |
| `POST` | `/api/commitments/:proposalId/confirm` | Record verified Monad transaction hash |
| `GET` | `/api/assistance` | List user assistance logs |
| `POST` | `/api/assistance` | Submit an assistance report |
| `POST` | `/api/assistance/ai-draft` | Generate structured draft using Gemini AI |

---

## 9. Known Limitations & Roadmap

- **Prototype Boundary:** RailMatte cannot officially alter railway booking charts or guarantee physical coach presence. Official railway permission remains with on-board train ticket examiners (TTE).
- **Offline / Low Connectivity:** Indian railway journeys frequently experience cellular dead zones. Future roadmap includes offline Bluetooth Low Energy (BLE) peer exchange handshakes.
- **Zero-Knowledge Proofs:** Future iterations can implement zk-SNARK proofs of confirmed reservation without revealing the PNR number.

---

## 10. Honest Disclosure

- **Hackathon Development:** Built for the Metropolis Monad Hackathon.
- **AI Tooling:** AI coding assistants (Google Antigravity / Gemini) were utilized for pairing, test generation, and architectural design. All logic, contracts, algorithms, and tests have been compiled, executed, and verified by the developers.

---

## 11. Licence

This project is licensed under the [MIT License](file:///d:/Unstop/Metropolis/RailMatte/LICENSE).
