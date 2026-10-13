import '../config/env.js';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// Determine if Supabase credentials are configured in environment
export const isSupabaseConfigured = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Never print or leak credential values in logs
function logDbError(operation, error) {
  const code = error?.code ? ` (Code: ${error.code})` : '';
  const hint = error?.hint ? ` - Hint: ${error.hint}` : '';
  console.error(`[RailMatte DB Error] ${operation} failed: ${error?.message || error}${code}${hint}`);
}

// Client instance
export let supabase = null;
let isOperational = false;
export let isSupabaseLive = false;
let lastHealthCheck = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  } catch (err) {
    console.warn('[RailMatte DB] Supabase initialization failed:', err.message);
  }
}

/**
 * Perform a live health check against the Supabase database.
 * Tests actual table readability without leaking credentials.
 */
export async function checkDatabaseHealth() {
  if (!isSupabaseConfigured || !supabase) {
    isOperational = false;
    isSupabaseLive = false;
    lastHealthCheck = {
      configured: false,
      operational: false,
      mode: 'memory',
      message: 'Supabase PostgreSQL not configured in .env -> Using robust in-memory datastore'
    };
    return lastHealthCheck;
  }

  try {
    let host = 'configured';
    try {
      host = new URL(process.env.SUPABASE_URL).hostname;
    } catch {}

    const { data, error } = await supabase.from('profiles').select('id').limit(1);

    if (error) {
      isOperational = false;
      isSupabaseLive = false;
      lastHealthCheck = {
        configured: true,
        operational: false,
        mode: 'memory_fallback',
        host,
        error: error.message,
        code: error.code || null,
        hint: error.hint || null
      };
      return lastHealthCheck;
    }

    isOperational = true;
    isSupabaseLive = true;
    lastHealthCheck = {
      configured: true,
      operational: true,
      mode: 'supabase',
      host,
      verified: true
    };
    return lastHealthCheck;
  } catch (err) {
    isOperational = false;
    isSupabaseLive = false;
    lastHealthCheck = {
      configured: true,
      operational: false,
      mode: 'memory_fallback',
      error: err.message,
      code: err.code || null
    };
    return lastHealthCheck;
  }
}

export function getDatabaseStatus() {
  return (
    lastHealthCheck || {
      configured: isSupabaseConfigured,
      operational: isOperational,
      mode: isOperational ? 'supabase' : isSupabaseConfigured ? 'memory_fallback' : 'memory'
    }
  );
}

// Allow explicit override for tests
export function setOperationalState(state) {
  isOperational = Boolean(state);
  isSupabaseLive = Boolean(state);
}

// ============================================================================
// IN-MEMORY DATA STORE (Zero-friction local dev & test fallback)
// ============================================================================
export const memoryStore = {
  profiles: new Map([
    [
      'user-priya-001',
      {
        id: 'user-priya-001',
        email: 'priya.sharma@example.com',
        display_name: 'Priya Sharma',
        wallet_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    [
      'user-rahul-002',
      {
        id: 'user-rahul-002',
        email: 'rahul.verma@example.com',
        display_name: 'Rahul Verma',
        wallet_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    [
      'user-ananya-003',
      {
        id: 'user-ananya-003',
        email: 'ananya.iyer@example.com',
        display_name: 'Ananya Iyer',
        wallet_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ]
  ]),

  requests: new Map([
    [
      'req-priya-101',
      {
        id: 'req-priya-101',
        user_id: 'user-priya-001',
        travel_date: '2026-10-20',
        origin_station: 'New Delhi (NDLS)',
        destination_station: 'Mumbai Central (MMCT)',
        train_number: '12952',
        train_name: 'Mumbai Rajdhani Express',
        current_coach: 'B3',
        current_seat: '42',
        current_berth_type: 'Upper',
        desired_berth_type: 'Lower',
        coach_class: '3A',
        flexibility_note: 'Traveling with elderly parent, desperately need a lower berth if possible.',
        status: 'OPEN',
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ],
    [
      'req-rahul-102',
      {
        id: 'req-rahul-102',
        user_id: 'user-rahul-002',
        travel_date: '2026-10-20',
        origin_station: 'New Delhi (NDLS)',
        destination_station: 'Mumbai Central (MMCT)',
        train_number: '12952',
        train_name: 'Mumbai Rajdhani Express',
        current_coach: 'B3',
        current_seat: '19',
        current_berth_type: 'Lower',
        desired_berth_type: 'Upper',
        coach_class: '3A',
        flexibility_note: 'Happy to take upper berth to work quietly on laptop without daytime seating disturbance.',
        status: 'OPEN',
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ],
    [
      'req-ananya-103',
      {
        id: 'req-ananya-103',
        user_id: 'user-ananya-003',
        travel_date: '2026-10-22',
        origin_station: 'Bengaluru (SBC)',
        destination_station: 'Chennai Central (MAS)',
        train_number: '12028',
        train_name: 'Shatabdi Express',
        current_coach: 'C2',
        current_seat: '14',
        current_berth_type: 'Aisle',
        desired_berth_type: 'Window',
        coach_class: 'CC',
        flexibility_note: 'Prefer window seat for working with natural light.',
        status: 'OPEN',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ]
  ]),

  proposals: new Map(),
  commitments: new Map(),
  assistanceReports: new Map()
};

// Auto-seed helper for freshly granted Supabase tables
async function seedDefaultDataIfEmpty() {
  if (!isOperational || !supabase) return;

  try {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    if (count === 0) {
      const demoUsers = Array.from(memoryStore.profiles.values());
      await supabase.from('profiles').insert(demoUsers);

      const demoRequests = Array.from(memoryStore.requests.values());
      await supabase.from('exchange_requests').insert(demoRequests);
    }
  } catch (err) {
    logDbError('seedDefaultDataIfEmpty', err);
  }
}

// ============================================================================
// STORE INTERFACE IMPLEMENTATION
// Uses Supabase PostgreSQL when operational, or robust in-memory datastore
// ============================================================================

export const store = {
  // --- USERS & PROFILES ---
  async getUser(id) {
    if (isOperational && supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (error) {
        logDbError(`getUser(${id})`, error);
        throw new Error(`Database error retrieving user: ${error.message}`);
      }
      return data || null;
    }
    return memoryStore.profiles.get(id) || null;
  },

  async getAllUsers() {
    if (isOperational && supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        logDbError('getAllUsers', error);
        throw new Error(`Database error listing users: ${error.message}`);
      }
      if (!data || data.length === 0) {
        await seedDefaultDataIfEmpty();
        const { data: refetched } = await supabase.from('profiles').select('*');
        return refetched || [];
      }
      return data;
    }
    return Array.from(memoryStore.profiles.values());
  },

  async createOrUpdateUser({ id, email, display_name, wallet_address }) {
    const record = {
      id: id || crypto.randomUUID(),
      email: email || `${id || 'user'}@railmatte.local`,
      display_name: display_name || 'Passenger',
      wallet_address: wallet_address || null,
      updated_at: new Date().toISOString()
    };

    if (isOperational && supabase) {
      const { data, error } = await supabase.from('profiles').upsert(record).select().single();
      if (error) {
        logDbError('createOrUpdateUser', error);
        throw new Error(`Database error saving profile: ${error.message}`);
      }
      return data;
    }

    const existing = memoryStore.profiles.get(record.id);
    const saved = { ...existing, ...record, created_at: existing?.created_at || new Date().toISOString() };
    memoryStore.profiles.set(saved.id, saved);
    return saved;
  },

  // --- EXCHANGE REQUESTS ---
  async getAllRequests({ status, userId } = {}) {
    if (isOperational && supabase) {
      let query = supabase.from('exchange_requests').select('*, profiles(id, display_name, email)');
      if (status) query = query.eq('status', status);
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error) {
        logDbError('getAllRequests', error);
        throw new Error(`Database error listing requests: ${error.message}`);
      }
      if ((!data || data.length === 0) && !status && !userId) {
        await seedDefaultDataIfEmpty();
        const { data: refetched } = await query;
        return refetched || [];
      }
      return data || [];
    }

    let results = Array.from(memoryStore.requests.values());
    if (status) results = results.filter((r) => r.status === status);
    if (userId) results = results.filter((r) => r.user_id === userId);

    return results.map((r) => {
      const prof = memoryStore.profiles.get(r.user_id);
      return {
        ...r,
        profiles: prof ? { id: prof.id, display_name: prof.display_name, email: prof.email } : null
      };
    });
  },

  async getRequestById(id) {
    if (isOperational && supabase) {
      const { data, error } = await supabase
        .from('exchange_requests')
        .select('*, profiles(id, display_name, email)')
        .eq('id', id)
        .maybeSingle();
      if (error) {
        logDbError(`getRequestById(${id})`, error);
        throw new Error(`Database error fetching request: ${error.message}`);
      }
      return data || null;
    }

    const req = memoryStore.requests.get(id);
    if (!req) return null;
    const prof = memoryStore.profiles.get(req.user_id);
    return {
      ...req,
      profiles: prof ? { id: prof.id, display_name: prof.display_name, email: prof.email } : null
    };
  },

  async createRequest(data) {
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const record = {
      id,
      user_id: data.user_id,
      travel_date: data.travel_date,
      origin_station: data.origin_station,
      destination_station: data.destination_station,
      train_number: data.train_number || null,
      train_name: data.train_name || null,
      current_coach: data.current_coach,
      current_seat: data.current_seat,
      current_berth_type: data.current_berth_type,
      desired_berth_type: data.desired_berth_type,
      coach_class: data.coach_class,
      flexibility_note: data.flexibility_note || '',
      status: 'OPEN',
      created_at: now,
      updated_at: now
    };

    if (isOperational && supabase) {
      // Ensure user profile exists to satisfy foreign key constraint
      const existingUser = await this.getUser(data.user_id);
      if (!existingUser) {
        await this.createOrUpdateUser({
          id: data.user_id,
          email: `${data.user_id}@passenger.railmatte.local`,
          display_name: `Passenger ${data.user_id.slice(0, 6)}`
        });
      }

      const { data: dbData, error } = await supabase.from('exchange_requests').insert(record).select().single();
      if (error) {
        logDbError('createRequest', error);
        throw new Error(`Database error creating exchange request: ${error.message}`);
      }
      return dbData;
    }

    memoryStore.requests.set(id, record);
    return record;
  },

  async updateRequest(id, updates) {
    const now = new Date().toISOString();
    if (isOperational && supabase) {
      const { data, error } = await supabase
        .from('exchange_requests')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        logDbError(`updateRequest(${id})`, error);
        throw new Error(`Database error updating request: ${error.message}`);
      }
      return data;
    }

    const existing = memoryStore.requests.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: now };
    memoryStore.requests.set(id, updated);
    return updated;
  },

  // --- PROPOSALS (BILATERAL MUTUAL CONSENT) ---
  async getProposals({ userId, status } = {}) {
    if (isOperational && supabase) {
      let query = supabase.from('exchange_proposals').select('*');
      if (status) query = query.eq('status', status);
      if (userId) query = query.or(`proposer_id.eq.${userId},recipient_id.eq.${userId}`);
      const { data, error } = await query;
      if (error) {
        logDbError('getProposals', error);
        throw new Error(`Database error retrieving proposals: ${error.message}`);
      }
      return data || [];
    }

    let list = Array.from(memoryStore.proposals.values());
    if (userId) {
      list = list.filter((p) => p.proposer_id === userId || p.recipient_id === userId);
    }
    if (status) {
      list = list.filter((p) => p.status === status);
    }
    return list;
  },

  async getProposalById(id) {
    if (isOperational && supabase) {
      const { data, error } = await supabase.from('exchange_proposals').select('*').eq('id', id).maybeSingle();
      if (error) {
        logDbError(`getProposalById(${id})`, error);
        throw new Error(`Database error fetching proposal: ${error.message}`);
      }
      return data || null;
    }
    return memoryStore.proposals.get(id) || null;
  },

  async createProposal({ request_a_id, request_b_id, proposer_id, recipient_id }) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const proposal = {
      id,
      request_a_id,
      request_b_id,
      proposer_id,
      recipient_id,
      status: 'PROPOSED',
      proposer_consent: true,
      recipient_consent: false,
      proposer_consented_at: now,
      recipient_consented_at: null,
      created_at: now,
      updated_at: now
    };

    if (isOperational && supabase) {
      const { data, error } = await supabase.from('exchange_proposals').insert(proposal).select().single();
      if (error) {
        logDbError('createProposal', error);
        throw new Error(`Database error creating proposal: ${error.message}`);
      }
      return data;
    }

    memoryStore.proposals.set(id, proposal);
    return proposal;
  },

  async updateProposal(id, updates) {
    const now = new Date().toISOString();
    if (isOperational && supabase) {
      const { data, error } = await supabase
        .from('exchange_proposals')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        logDbError(`updateProposal(${id})`, error);
        throw new Error(`Database error updating proposal: ${error.message}`);
      }
      return data;
    }

    const existing = memoryStore.proposals.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: now };
    memoryStore.proposals.set(id, updated);
    return updated;
  },

  // --- AGREEMENT COMMITMENTS (BLOCKCHAIN TRUST ANCHORS) ---
  async getCommitmentByProposalId(proposalId) {
    if (isOperational && supabase) {
      const { data, error } = await supabase
        .from('agreement_commitments')
        .select('*')
        .eq('proposal_id', proposalId)
        .maybeSingle();
      if (error) {
        logDbError(`getCommitmentByProposalId(${proposalId})`, error);
        throw new Error(`Database error fetching commitment: ${error.message}`);
      }
      return data || null;
    }
    return memoryStore.commitments.get(proposalId) || null;
  },

  async saveCommitment(data) {
    const id = data.id || crypto.randomUUID();
    const record = {
      id,
      proposal_id: data.proposal_id,
      commitment_hash: data.commitment_hash,
      salt_nonce: data.salt_nonce,
      terms_digest: data.terms_digest,
      chain_id: data.chain_id || 10143,
      tx_hash: data.tx_hash || null,
      contract_address: data.contract_address || null,
      recorder_address: data.recorder_address || null,
      status: data.status || 'PREPARED',
      recorded_at: data.recorded_at || null,
      created_at: new Date().toISOString()
    };

    if (isOperational && supabase) {
      const { data: dbData, error } = await supabase.from('agreement_commitments').upsert(record).select().single();
      if (error) {
        logDbError('saveCommitment', error);
        throw new Error(`Database error saving agreement commitment: ${error.message}`);
      }
      return dbData;
    }

    memoryStore.commitments.set(data.proposal_id, record);
    return record;
  },

  async updateCommitment(proposalId, updates) {
    if (isOperational && supabase) {
      const { data, error } = await supabase
        .from('agreement_commitments')
        .update(updates)
        .eq('proposal_id', proposalId)
        .select()
        .single();
      if (error) {
        logDbError(`updateCommitment(${proposalId})`, error);
        throw new Error(`Database error updating commitment: ${error.message}`);
      }
      return data;
    }

    const existing = memoryStore.commitments.get(proposalId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    memoryStore.commitments.set(proposalId, updated);
    return updated;
  },

  // --- ASSISTANCE REPORTS ---
  async getAssistanceReports({ userId } = {}) {
    if (isOperational && supabase) {
      let query = supabase.from('assistance_reports').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error) {
        logDbError('getAssistanceReports', error);
        throw new Error(`Database error listing assistance reports: ${error.message}`);
      }
      return data || [];
    }

    let list = Array.from(memoryStore.assistanceReports.values());
    if (userId) list = list.filter((r) => r.user_id === userId);
    return list;
  },

  async getAssistanceReportById(id) {
    if (isOperational && supabase) {
      const { data, error } = await supabase.from('assistance_reports').select('*').eq('id', id).maybeSingle();
      if (error) {
        logDbError(`getAssistanceReportById(${id})`, error);
        throw new Error(`Database error fetching assistance report: ${error.message}`);
      }
      return data || null;
    }
    return memoryStore.assistanceReports.get(id) || null;
  },

  async createAssistanceReport(data) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const report = {
      id,
      user_id: data.user_id,
      category: data.category,
      description: data.description,
      exchange_reference_id: data.exchange_reference_id || null,
      status: 'SUBMITTED',
      created_at: now,
      updated_at: now
    };

    if (isOperational && supabase) {
      const existingUser = await this.getUser(data.user_id);
      if (!existingUser) {
        await this.createOrUpdateUser({
          id: data.user_id,
          email: `${data.user_id}@passenger.railmatte.local`,
          display_name: `Passenger ${data.user_id.slice(0, 6)}`
        });
      }

      const { data: dbData, error } = await supabase.from('assistance_reports').insert(report).select().single();
      if (error) {
        logDbError('createAssistanceReport', error);
        throw new Error(`Database error creating assistance report: ${error.message}`);
      }
      return dbData;
    }

    memoryStore.assistanceReports.set(id, report);
    return report;
  },

  async updateAssistanceReport(id, updates) {
    const now = new Date().toISOString();
    if (isOperational && supabase) {
      const { data, error } = await supabase
        .from('assistance_reports')
        .update({ ...updates, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (error) {
        logDbError(`updateAssistanceReport(${id})`, error);
        throw new Error(`Database error updating assistance report: ${error.message}`);
      }
      return data;
    }

    const existing = memoryStore.assistanceReports.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: now };
    memoryStore.assistanceReports.set(id, updated);
    return updated;
  }
};
