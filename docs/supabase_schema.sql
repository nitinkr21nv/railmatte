-- ==============================================================================
-- RAILMATTE SUPABASE POSTGRESQL SCHEMA
-- Tagline: Swap seats. Travel better.
-- Description: Voluntary train seat-exchange coordination, mutual consent,
--              journey assistance, and Monad trust commitment tracking.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Authenticated Passengers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    wallet_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. SEAT EXCHANGE REQUESTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exchange_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    travel_date DATE NOT NULL,
    origin_station TEXT NOT NULL,
    destination_station TEXT NOT NULL,
    train_number TEXT,
    train_name TEXT,
    current_coach TEXT NOT NULL,
    current_seat TEXT NOT NULL,
    current_berth_type TEXT NOT NULL,
    desired_berth_type TEXT NOT NULL,
    coach_class TEXT NOT NULL,
    flexibility_note VARCHAR(300),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PENDING_PROPOSAL', 'MATCHED', 'CANCELLED', 'EXPIRED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_lookup 
ON exchange_requests (travel_date, origin_station, destination_station, coach_class, status);

CREATE INDEX IF NOT EXISTS idx_requests_user 
ON exchange_requests (user_id, status);

-- ------------------------------------------------------------------------------
-- 3. EXCHANGE PROPOSALS (Mutual Consent Lifecycle)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exchange_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_a_id UUID NOT NULL REFERENCES exchange_requests(id) ON DELETE CASCADE,
    request_b_id UUID NOT NULL REFERENCES exchange_requests(id) ON DELETE CASCADE,
    proposer_id UUID NOT NULL REFERENCES profiles(id),
    recipient_id UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status IN ('PROPOSED', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED')),
    proposer_consent BOOLEAN NOT NULL DEFAULT TRUE,
    recipient_consent BOOLEAN NOT NULL DEFAULT FALSE,
    proposer_consented_at TIMESTAMPTZ DEFAULT NOW(),
    recipient_consented_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_different_requests CHECK (request_a_id <> request_b_id),
    CONSTRAINT chk_different_participants CHECK (proposer_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_proposals_participants 
ON exchange_proposals (proposer_id, recipient_id, status);

-- ------------------------------------------------------------------------------
-- 4. AGREEMENT COMMITMENTS (Monad Blockchain Trust Anchor)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agreement_commitments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL UNIQUE REFERENCES exchange_proposals(id) ON DELETE CASCADE,
    commitment_hash TEXT NOT NULL UNIQUE,
    salt_nonce TEXT NOT NULL,
    terms_digest TEXT NOT NULL,
    chain_id INTEGER NOT NULL DEFAULT 10143,
    tx_hash TEXT,
    contract_address TEXT,
    recorder_address TEXT,
    status TEXT NOT NULL DEFAULT 'PREPARED' CHECK (status IN ('PREPARED', 'PENDING', 'CONFIRMED', 'FAILED')),
    recorded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commitments_hash 
ON agreement_commitments (commitment_hash);

-- ------------------------------------------------------------------------------
-- 5. ASSISTANCE REPORTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assistance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('SEAT_CONFLICT', 'LOST_ITEM', 'ACCESSIBILITY_NEED', 'BERTH_DISPUTE', 'GENERAL_ASSISTANCE')),
    description TEXT NOT NULL,
    exchange_reference_id UUID REFERENCES exchange_proposals(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'REVIEWING', 'RESOLVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistance_user 
ON assistance_reports (user_id, status);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view public display names, update own profile
CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- Requests: Anyone can read active open requests; owners can modify
CREATE POLICY requests_select_open ON exchange_requests FOR SELECT USING (true);
CREATE POLICY requests_insert ON exchange_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY requests_update ON exchange_requests FOR UPDATE USING (auth.uid() = user_id);

-- Proposals: Only involved participants can read & update their proposals
CREATE POLICY proposals_select ON exchange_proposals FOR SELECT 
USING (auth.uid() = proposer_id OR auth.uid() = recipient_id);

-- Assistance Reports: Only reporter can read their assistance reports
CREATE POLICY assistance_select ON assistance_reports FOR SELECT 
USING (auth.uid() = user_id);
CREATE POLICY assistance_insert ON assistance_reports FOR INSERT 
WITH CHECK (auth.uid() = user_id);
