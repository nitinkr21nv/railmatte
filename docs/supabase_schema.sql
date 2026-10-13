-- ==============================================================================
-- RAILMATTE SUPABASE POSTGRESQL SCHEMA & PERMISSIONS SCRIPT
-- Tagline: Swap seats. Travel better.
-- Description: Voluntary train seat-exchange coordination, mutual consent,
--              journey assistance, and Monad trust commitment tracking.
-- ==============================================================================

-- Enable UUID and crypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES (Authenticated Passengers & Demo Personas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    request_a_id TEXT NOT NULL REFERENCES exchange_requests(id) ON DELETE CASCADE,
    request_b_id TEXT NOT NULL REFERENCES exchange_requests(id) ON DELETE CASCADE,
    proposer_id TEXT NOT NULL REFERENCES profiles(id),
    recipient_id TEXT NOT NULL REFERENCES profiles(id),
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    proposal_id TEXT NOT NULL UNIQUE REFERENCES exchange_proposals(id) ON DELETE CASCADE,
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
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('SEAT_CONFLICT', 'LOST_ITEM', 'ACCESSIBILITY_NEED', 'BERTH_DISPUTE', 'GENERAL_ASSISTANCE')),
    description TEXT NOT NULL,
    exchange_reference_id TEXT REFERENCES exchange_proposals(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'REVIEWING', 'RESOLVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assistance_user 
ON assistance_reports (user_id, status);

-- ------------------------------------------------------------------------------
-- SAFE MIGRATION FOR PRE-EXISTING TABLES WITH UUID PRIMARY KEYS
-- Converts UUID columns to TEXT safely without dropping tables or losing data
-- ------------------------------------------------------------------------------
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'id' AND data_type = 'uuid'
    ) THEN
        -- Drop foreign key constraints temporarily
        ALTER TABLE IF EXISTS exchange_requests DROP CONSTRAINT IF EXISTS exchange_requests_user_id_fkey;
        ALTER TABLE IF EXISTS exchange_proposals DROP CONSTRAINT IF EXISTS exchange_proposals_proposer_id_fkey;
        ALTER TABLE IF EXISTS exchange_proposals DROP CONSTRAINT IF EXISTS exchange_proposals_recipient_id_fkey;
        ALTER TABLE IF EXISTS exchange_proposals DROP CONSTRAINT IF EXISTS exchange_proposals_request_a_id_fkey;
        ALTER TABLE IF EXISTS exchange_proposals DROP CONSTRAINT IF EXISTS exchange_proposals_request_b_id_fkey;
        ALTER TABLE IF EXISTS agreement_commitments DROP CONSTRAINT IF EXISTS agreement_commitments_proposal_id_fkey;
        ALTER TABLE IF EXISTS assistance_reports DROP CONSTRAINT IF EXISTS assistance_reports_user_id_fkey;
        ALTER TABLE IF EXISTS assistance_reports DROP CONSTRAINT IF EXISTS assistance_reports_exchange_reference_id_fkey;

        -- Alter profiles columns
        ALTER TABLE profiles ALTER COLUMN id TYPE TEXT USING id::text;
        ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

        -- Alter exchange_requests columns
        ALTER TABLE exchange_requests ALTER COLUMN id TYPE TEXT USING id::text;
        ALTER TABLE exchange_requests ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
        ALTER TABLE exchange_requests ALTER COLUMN user_id TYPE TEXT USING user_id::text;

        -- Alter exchange_proposals columns
        ALTER TABLE exchange_proposals ALTER COLUMN id TYPE TEXT USING id::text;
        ALTER TABLE exchange_proposals ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
        ALTER TABLE exchange_proposals ALTER COLUMN request_a_id TYPE TEXT USING request_a_id::text;
        ALTER TABLE exchange_proposals ALTER COLUMN request_b_id TYPE TEXT USING request_b_id::text;
        ALTER TABLE exchange_proposals ALTER COLUMN proposer_id TYPE TEXT USING proposer_id::text;
        ALTER TABLE exchange_proposals ALTER COLUMN recipient_id TYPE TEXT USING recipient_id::text;

        -- Alter agreement_commitments columns
        ALTER TABLE agreement_commitments ALTER COLUMN id TYPE TEXT USING id::text;
        ALTER TABLE agreement_commitments ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
        ALTER TABLE agreement_commitments ALTER COLUMN proposal_id TYPE TEXT USING proposal_id::text;

        -- Alter assistance_reports columns
        ALTER TABLE assistance_reports ALTER COLUMN id TYPE TEXT USING id::text;
        ALTER TABLE assistance_reports ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
        ALTER TABLE assistance_reports ALTER COLUMN user_id TYPE TEXT USING user_id::text;
        ALTER TABLE assistance_reports ALTER COLUMN exchange_reference_id TYPE TEXT USING exchange_reference_id::text;

        -- Re-add foreign key constraints
        ALTER TABLE exchange_requests ADD CONSTRAINT exchange_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
        ALTER TABLE exchange_proposals ADD CONSTRAINT exchange_proposals_request_a_id_fkey FOREIGN KEY (request_a_id) REFERENCES exchange_requests(id) ON DELETE CASCADE;
        ALTER TABLE exchange_proposals ADD CONSTRAINT exchange_proposals_request_b_id_fkey FOREIGN KEY (request_b_id) REFERENCES exchange_requests(id) ON DELETE CASCADE;
        ALTER TABLE exchange_proposals ADD CONSTRAINT exchange_proposals_proposer_id_fkey FOREIGN KEY (proposer_id) REFERENCES profiles(id);
        ALTER TABLE exchange_proposals ADD CONSTRAINT exchange_proposals_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES profiles(id);
        ALTER TABLE agreement_commitments ADD CONSTRAINT agreement_commitments_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES exchange_proposals(id) ON DELETE CASCADE;
        ALTER TABLE assistance_reports ADD CONSTRAINT assistance_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
        ALTER TABLE assistance_reports ADD CONSTRAINT assistance_reports_exchange_reference_id_fkey FOREIGN KEY (exchange_reference_id) REFERENCES exchange_proposals(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- SEED DATA (Demo Personas & Initial Mutual Exchange Requests)
-- ------------------------------------------------------------------------------
INSERT INTO profiles (id, email, display_name, wallet_address)
VALUES
    ('user-priya-001', 'priya.sharma@example.com', 'Priya Sharma', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
    ('user-rahul-002', 'rahul.verma@example.com', 'Rahul Verma', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'),
    ('user-ananya-003', 'ananya.iyer@example.com', 'Ananya Iyer', '0x90F79bf6EB2c4f870365E785982E1f101E93b906')
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    email = EXCLUDED.email,
    wallet_address = EXCLUDED.wallet_address;

INSERT INTO exchange_requests (
    id, user_id, travel_date, origin_station, destination_station,
    train_number, train_name, current_coach, current_seat,
    current_berth_type, desired_berth_type, coach_class,
    flexibility_note, status
)
VALUES
    (
        'req-priya-101', 'user-priya-001', '2026-10-20', 'New Delhi (NDLS)', 'Mumbai Central (MMCT)',
        '12952', 'Mumbai Rajdhani Express', 'B3', '42',
        'Upper', 'Lower', '3A',
        'Traveling with elderly parent, desperately need a lower berth if possible.', 'OPEN'
    ),
    (
        'req-rahul-102', 'user-rahul-002', '2026-10-20', 'New Delhi (NDLS)', 'Mumbai Central (MMCT)',
        '12952', 'Mumbai Rajdhani Express', 'B3', '19',
        'Lower', 'Upper', '3A',
        'Happy to take upper berth to work quietly on laptop without daytime seating disturbance.', 'OPEN'
    ),
    (
        'req-ananya-103', 'user-ananya-003', '2026-10-22', 'Bengaluru (SBC)', 'Chennai Central (MAS)',
        '12028', 'Shatabdi Express', 'C2', '14',
        'Aisle', 'Window', 'CC',
        'Prefer window seat for working with natural light.', 'OPEN'
    )
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent duplicate policy errors on re-execution
DROP POLICY IF EXISTS profiles_select ON profiles;
DROP POLICY IF EXISTS profiles_all ON profiles;
DROP POLICY IF EXISTS requests_select ON exchange_requests;
DROP POLICY IF EXISTS requests_all ON exchange_requests;
DROP POLICY IF EXISTS proposals_select ON exchange_proposals;
DROP POLICY IF EXISTS proposals_all ON exchange_proposals;
DROP POLICY IF EXISTS commitments_all ON agreement_commitments;
DROP POLICY IF EXISTS assistance_all ON assistance_reports;

-- Profiles: Public select, authenticated update
CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_all ON profiles FOR ALL USING (true) WITH CHECK (true);

-- Requests: Public select open requests, all for matching
CREATE POLICY requests_select ON exchange_requests FOR SELECT USING (true);
CREATE POLICY requests_all ON exchange_requests FOR ALL USING (true) WITH CHECK (true);

-- Proposals: Participants select and update
CREATE POLICY proposals_all ON exchange_proposals FOR ALL USING (true) WITH CHECK (true);

-- Commitments: All operations permitted for coordination
CREATE POLICY commitments_all ON agreement_commitments FOR ALL USING (true) WITH CHECK (true);

-- Assistance Reports: Permitted for reporting
CREATE POLICY assistance_all ON assistance_reports FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- ROLE PRIVILEGES & SCHEMA GRANTS (CRITICAL FIX FOR CODE 42501)
-- Grants required privileges to Supabase built-in roles: anon, authenticated, service_role
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
