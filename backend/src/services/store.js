import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// Determine if live Supabase is configured
const hasSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
export const isSupabaseLive = hasSupabase;

let supabase = null;
if (hasSupabase) {
  try {
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('[RailMatte DB] Connected to Supabase PostgreSQL');
  } catch (err) {
    console.warn('[RailMatte DB] Supabase initialization failed, falling back to memory store:', err.message);
  }
} else {
  console.log('[RailMatte DB] Running in Memory Datastore mode (No external Supabase credentials required for local testing)');
}

// ============================================================================
// IN-MEMORY DATA STORE (Zero-friction local dev & test fallback)
// ============================================================================
const memoryStore = {
  profiles: new Map([
    [
      'user-priya-001',
      {
        id: 'user-priya-001',
        email: 'priya.sharma@example.com',
        display_name: 'Priya Sharma',
        wallet_address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    [
      'user-rahul-002',
      {
        id: 'user-rahul-002',
        email: 'rahul.verma@example.com',
        display_name: 'Rahul Verma',
        wallet_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    [
      'user-ananya-003',
      {
        id: 'user-ananya-003',
        email: 'ananya.iyer@example.com',
        display_name: 'Ananya Iyer',
        wallet_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString()
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

// ============================================================================
// STORE INTERFACE IMPLEMENTATION
// ============================================================================

export const store = {
  // --- USERS & PROFILES ---
  async getUser(id) {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      if (!error && data) return data;
    }
    return memoryStore.profiles.get(id) || null;
  },

  async getAllUsers() {
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) return data;
    }
    return Array.from(memoryStore.profiles.values());
  },

  async createOrUpdateUser({ id, email, display_name, wallet_address }) {
    const record = {
      id: id || `user-${crypto.randomUUID().slice(0, 8)}`,
      email: email || `${id || 'user'}@railmatte.local`,
      display_name: display_name || 'Passenger',
      wallet_address: wallet_address || null,
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      const { data, error } = await supabase.from('profiles').upsert(record).select().single();
      if (!error && data) return data;
    }

    const existing = memoryStore.profiles.get(record.id);
    const saved = { ...existing, ...record, created_at: existing?.created_at || new Date().toISOString() };
    memoryStore.profiles.set(saved.id, saved);
    return saved;
  },

  // --- EXCHANGE REQUESTS ---
  async getAllRequests({ status, userId } = {}) {
    if (supabase) {
      let query = supabase.from('exchange_requests').select('*, profiles(id, display_name, email)');
      if (status) query = query.eq('status', status);
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) return data;
    }

    let results = Array.from(memoryStore.requests.values());
    if (status) results = results.filter((r) => r.status === status);
    if (userId) results = results.filter((r) => r.user_id === userId);

    // Attach profile snippet
    return results.map((r) => {
      const prof = memoryStore.profiles.get(r.user_id);
      return {
        ...r,
        profiles: prof ? { id: prof.id, display_name: prof.display_name, email: prof.email } : null
      };
    });
  },

  async getRequestById(id) {
    if (supabase) {
      const { data, error } = await supabase.from('exchange_requests').select('*, profiles(id, display_name, email)').eq('id', id).maybeSingle();
      if (!error && data) return data;
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
    const id = data.id || `req-${crypto.randomUUID().slice(0, 8)}`;
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

    if (supabase) {
      const { data: dbData, error } = await supabase.from('exchange_requests').insert(record).select().single();
      if (!error && dbData) return dbData;
    }

    memoryStore.requests.set(id, record);
    return record;
  },

  async updateRequest(id, updates) {
    const now = new Date().toISOString();
    if (supabase) {
      const { data, error } = await supabase.from('exchange_requests').update({ ...updates, updated_at: now }).eq('id', id).select().single();
      if (!error && data) return data;
    }

    const existing = memoryStore.requests.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: now };
    memoryStore.requests.set(id, updated);
    return updated;
  },

  // --- PROPOSALS (BILATERAL MUTUAL CONSENT) ---
  async getProposals({ userId, status } = {}) {
    if (supabase) {
      let query = supabase.from('exchange_proposals').select('*');
      if (status) query = query.eq('status', status);
      if (userId) query = query.or(`proposer_id.eq.${userId},recipient_id.eq.${userId}`);
      const { data, error } = await query;
      if (!error && data) return data;
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
    if (supabase) {
      const { data, error } = await supabase.from('exchange_proposals').select('*').eq('id', id).maybeSingle();
      if (!error && data) return data;
    }
    return memoryStore.proposals.get(id) || null;
  },

  async createProposal({ request_a_id, request_b_id, proposer_id, recipient_id }) {
    const id = `prop-${crypto.randomUUID().slice(0, 8)}`;
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

    if (supabase) {
      const { data, error } = await supabase.from('exchange_proposals').insert(proposal).select().single();
      if (!error && data) return data;
    }

    memoryStore.proposals.set(id, proposal);
    return proposal;
  },

  async updateProposal(id, updates) {
    const now = new Date().toISOString();
    if (supabase) {
      const { data, error } = await supabase.from('exchange_proposals').update({ ...updates, updated_at: now }).eq('id', id).select().single();
      if (!error && data) return data;
    }

    const existing = memoryStore.proposals.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: now };
    memoryStore.proposals.set(id, updated);
    return updated;
  },

  // --- AGREEMENT COMMITMENTS (BLOCKCHAIN TRUST ANCHORS) ---
  async getCommitmentByProposalId(proposalId) {
    if (supabase) {
      const { data, error } = await supabase.from('agreement_commitments').select('*').eq('proposal_id', proposalId).maybeSingle();
      if (!error && data) return data;
    }
    return memoryStore.commitments.get(proposalId) || null;
  },

  async saveCommitment(data) {
    const id = data.id || `comm-${crypto.randomUUID().slice(0, 8)}`;
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

    if (supabase) {
      const { data: dbData, error } = await supabase.from('agreement_commitments').upsert(record).select().single();
      if (!error && dbData) return dbData;
    }

    memoryStore.commitments.set(data.proposal_id, record);
    return record;
  },

  async updateCommitment(proposalId, updates) {
    if (supabase) {
      const { data, error } = await supabase.from('agreement_commitments').update(updates).eq('proposal_id', proposalId).select().single();
      if (!error && data) return data;
    }

    const existing = memoryStore.commitments.get(proposalId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    memoryStore.commitments.set(proposalId, updated);
    return updated;
  },

  // --- ASSISTANCE REPORTS ---
  async getAssistanceReports({ userId } = {}) {
    if (supabase) {
      let query = supabase.from('assistance_reports').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) return data;
    }

    let list = Array.from(memoryStore.assistanceReports.values());
    if (userId) list = list.filter((r) => r.user_id === userId);
    return list;
  },

  async getAssistanceReportById(id) {
    if (supabase) {
      const { data, error } = await supabase.from('assistance_reports').select('*').eq('id', id).maybeSingle();
      if (!error && data) return data;
    }
    return memoryStore.assistanceReports.get(id) || null;
  },

  async createAssistanceReport(data) {
    const id = `rep-${crypto.randomUUID().slice(0, 8)}`;
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

    if (supabase) {
      const { data: dbData, error } = await supabase.from('assistance_reports').insert(report).select().single();
      if (!error && dbData) return dbData;
    }

    memoryStore.assistanceReports.set(id, report);
    return report;
  },

  async updateAssistanceReport(id, updates) {
    const now = new Date().toISOString();
    if (supabase) {
      const { data, error } = await supabase.from('assistance_reports').update({ ...updates, updated_at: now }).eq('id', id).select().single();
      if (!error && data) return data;
    }

    const existing = memoryStore.assistanceReports.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: now };
    memoryStore.assistanceReports.set(id, updated);
    return updated;
  }
};
