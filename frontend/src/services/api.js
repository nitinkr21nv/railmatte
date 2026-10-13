/**
 * RailMatte API Client Service
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.currentUserId = localStorage.getItem('railmatte_active_user_id') || 'user-priya-001';
  }

  setUserId(userId) {
    this.currentUserId = userId;
    localStorage.setItem('railmatte_active_user_id', userId);
  }

  getUserId() {
    return this.currentUserId;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': this.currentUserId,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (!err.status) {
        console.warn(`[API] Network error reaching ${url}:`, err.message);
      }
      throw err;
    }
  }

  // Health
  getHealth() {
    return this.request('/health');
  }

  // Users
  getUsers() {
    return this.request('/users');
  }

  getCurrentUser() {
    return this.request('/users/me');
  }

  updateProfile(updates) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Requests
  getRequests(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/requests${qs ? `?${qs}` : ''}`);
  }

  getRequestById(id) {
    return this.request(`/requests/${id}`);
  }

  createRequest(data) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getRequestMatches(id) {
    return this.request(`/requests/${id}/matches`);
  }

  cancelRequest(id) {
    return this.request(`/requests/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  // Proposals & Mutual Consent
  getProposals(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.request(`/proposals${qs ? `?${qs}` : ''}`);
  }

  getProposalById(id) {
    return this.request(`/proposals/${id}`);
  }

  createProposal(requestAId, requestBId) {
    return this.request('/proposals', {
      method: 'POST',
      body: JSON.stringify({ request_a_id: requestAId, request_b_id: requestBId }),
    });
  }

  acceptProposal(id) {
    return this.request(`/proposals/${id}/accept`, {
      method: 'POST',
    });
  }

  declineProposal(id) {
    return this.request(`/proposals/${id}/decline`, {
      method: 'POST',
    });
  }

  cancelProposal(id) {
    return this.request(`/proposals/${id}/cancel`, {
      method: 'POST',
    });
  }

  completeProposal(id) {
    return this.request(`/proposals/${id}/complete`, {
      method: 'POST',
    });
  }

  // Blockchain Commitments
  getCommitment(proposalId) {
    return this.request(`/commitments/${proposalId}`);
  }

  confirmCommitment(proposalId, txData) {
    return this.request(`/commitments/${proposalId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(txData),
    });
  }

  // Assistance Reports
  getAssistanceReports() {
    return this.request('/assistance');
  }

  createAssistanceReport(data) {
    return this.request('/assistance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getAssistanceReportById(id) {
    return this.request(`/assistance/${id}`);
  }

  generateAiDraft(note) {
    return this.request('/assistance/ai-draft', {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  // Railway Reference Data
  getRailwayStations(q = '') {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.request(`/railway/stations${qs}`);
  }

  getRailwayTrains(q = '') {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return this.request(`/railway/trains${qs}`);
  }
}

export const api = new ApiClient();
