import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  ArrowLeftRight, 
  PlusCircle, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Train, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Info
} from 'lucide-react';

const BERTH_OPTIONS = ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'Window', 'Aisle'];
const CLASS_OPTIONS = ['3A', '2A', '1A', 'SL', 'CC', 'EC', '2S'];

export default function SeatExchangePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Create Request Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    travel_date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
    origin_station: '',
    destination_station: '',
    train_number: '',
    train_name: '',
    current_coach: '',
    current_seat: '',
    current_berth_type: 'Upper',
    desired_berth_type: 'Lower',
    coach_class: '3A',
    flexibility_note: '',
  });

  // Matching Drawer State
  const [matchingRequestId, setMatchingRequestId] = useState(null);
  const [matchingData, setMatchingData] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchingError, setMatchingError] = useState(null);
  const [proposing, setProposing] = useState(false);

  // Load requests
  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getRequests();
      setRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load exchange requests:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Open matching modal if URL query param `matchReqId` present
  useEffect(() => {
    const matchId = searchParams.get('matchReqId');
    if (matchId) {
      handleOpenMatching(matchId);
    }
  }, [searchParams]);

  const handleOpenMatching = async (reqId) => {
    setMatchingRequestId(reqId);
    setMatchingLoading(true);
    setMatchingError(null);
    try {
      const data = await api.getRequestMatches(reqId);
      setMatchingData(data);
    } catch (err) {
      console.error('Match evaluation failed:', err);
      setMatchingError('Could not evaluate candidate matches. Ensure backend is running.');
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.origin_station || !formData.destination_station) {
      setFormError('Please specify both origin and destination stations.');
      return;
    }
    if (!formData.current_coach || !formData.current_seat) {
      setFormError('Please specify current coach and seat number.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createRequest(formData);
      setShowCreateModal(false);
      // Reset form
      setFormData({
        travel_date: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10),
        origin_station: '',
        destination_station: '',
        train_number: '',
        train_name: '',
        current_coach: '',
        current_seat: '',
        current_berth_type: 'Upper',
        desired_berth_type: 'Lower',
        coach_class: '3A',
        flexibility_note: '',
      });
      await loadRequests();
    } catch (err) {
      setFormError(err.message || 'Failed to submit exchange request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposeExchange = async (candidateReqId) => {
    try {
      setProposing(true);
      const res = await api.createProposal(matchingRequestId, candidateReqId);
      setMatchingRequestId(null);
      navigate(`/proposals/${res.proposal.id}`);
    } catch (err) {
      alert(`Proposal creation: ${err.message}`);
    } finally {
      setProposing(false);
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this seat exchange request?')) return;
    try {
      await api.cancelRequest(id);
      await loadRequests();
    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      r.origin_station.toLowerCase().includes(q) ||
      r.destination_station.toLowerCase().includes(q) ||
      (r.train_number && r.train_number.toLowerCase().includes(q)) ||
      (r.train_name && r.train_name.toLowerCase().includes(q));

    const matchesClass = !filterClass || r.coach_class === filterClass;
    const matchesDate = !filterDate || r.travel_date === filterDate;

    return matchesSearch && matchesClass && matchesDate;
  });

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-teal-600" />
            Voluntary Seat Exchanges
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse open passenger requests or create your own to discover reciprocal berth matches.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Create Seat Request
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search stations or train..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none bg-white"
          >
            <option value="">All Travel Classes</option>
            {CLASS_OPTIONS.map((c) => (
              <option key={c} value={c}>{c} Class</option>
            ))}
          </select>
        </div>

        <div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-xs">Loading requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No matching requests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search filters, or create a new request for your journey.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRequests.map((req) => {
            const isMine = req.user_id === currentUser?.id;

            return (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                      {req.coach_class} Class
                    </span>
                    <StatusBadge status={req.status} />
                  </div>

                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate">{req.origin_station} &rarr; {req.destination_station}</span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {req.travel_date}
                      </span>
                      {req.train_number && (
                        <span className="flex items-center gap-1">
                          <Train className="w-3.5 h-3.5" />
                          {req.train_number}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seat detail box */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">HOLDS</span>
                      <span className="font-semibold text-slate-800">
                        Coach {req.current_coach}, {req.current_berth_type} ({req.current_seat})
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-400 font-medium">PREFERS</span>
                      <span className="font-semibold text-teal-700">
                        {req.desired_berth_type} Berth
                      </span>
                    </div>
                  </div>

                  {req.flexibility_note && (
                    <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/60">
                      &ldquo;{req.flexibility_note}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-400 truncate">
                    {isMine ? (
                      <span className="text-teal-700 font-medium">Your Request</span>
                    ) : (
                      <span>{req.profiles?.display_name || 'Passenger'}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isMine && req.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => handleCancelRequest(req.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    )}
                    {req.status === 'OPEN' && (
                      <button
                        type="button"
                        onClick={() => handleOpenMatching(req.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                        Find Matches
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE REQUEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-5 my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Create Seat Exchange Request</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Privacy-first voluntary coordination. No PNR required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Travel Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.travel_date}
                    onChange={(e) => setFormData({ ...formData, travel_date: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Travel Class *</label>
                  <select
                    value={formData.coach_class}
                    onChange={(e) => setFormData({ ...formData, coach_class: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none bg-white"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c} Class</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Origin Station *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi (NDLS)"
                    value={formData.origin_station}
                    onChange={(e) => setFormData({ ...formData, origin_station: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Destination Station *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai Central (MMCT)"
                    value={formData.destination_station}
                    onChange={(e) => setFormData({ ...formData, destination_station: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Train Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 12952"
                    value={formData.train_number}
                    onChange={(e) => setFormData({ ...formData, train_number: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Train Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajdhani Express"
                    value={formData.train_name}
                    onChange={(e) => setFormData({ ...formData, train_name: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="font-semibold text-slate-800 text-xs">Current Berth Assignment</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Coach *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B3"
                      value={formData.current_coach}
                      onChange={(e) => setFormData({ ...formData, current_coach: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none uppercase bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Seat/Berth # *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 42"
                      value={formData.current_seat}
                      onChange={(e) => setFormData({ ...formData, current_seat: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Berth Type *</label>
                    <select
                      value={formData.current_berth_type}
                      onChange={(e) => setFormData({ ...formData, current_berth_type: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none bg-white"
                    >
                      {BERTH_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Desired Berth Preference *</label>
                <select
                  value={formData.desired_berth_type}
                  onChange={(e) => setFormData({ ...formData, desired_berth_type: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none bg-white"
                >
                  {BERTH_OPTIONS.map((b) => (
                    <option key={b} value={b}>{b} Berth</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-slate-700">Flexibility Note (Optional)</label>
                  <span className="text-[10px] text-slate-400">
                    {formData.flexibility_note.length}/300
                  </span>
                </div>
                <textarea
                  maxLength={300}
                  rows={2}
                  placeholder="e.g. Traveling with senior citizen, would greatly appreciate a lower berth."
                  value={formData.flexibility_note}
                  onChange={(e) => setFormData({ ...formData, flexibility_note: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Publish Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MATCH EVALUATION MODAL / DRAWER */}
      {matchingRequestId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-5 my-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Deterministic Compatibility Engine
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  Compatible Exchange Matches
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMatchingRequestId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close matches dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {matchingLoading ? (
              <div className="py-12 text-center text-slate-500 text-xs">Evaluating compatible candidates...</div>
            ) : matchingError ? (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {matchingError}
              </div>
            ) : matchingData?.matches?.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                <Info className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-800">No compatible matches on this exact sector yet</p>
                <p>As other passengers post requests matching your date, train and travel class, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Showing <strong>{matchingData.matches.length}</strong> compatible request(s) for your journey:
                </p>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {matchingData.matches.map((item, idx) => {
                    const candidate = item.candidate;
                    const score = item.score;
                    const reasons = item.reasons;

                    return (
                      <div
                        key={candidate.id}
                        className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-slate-900">
                                {candidate.profiles?.display_name || 'Passenger'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Holds Coach {candidate.current_coach}, {candidate.current_berth_type} ({candidate.current_seat})
                              </div>
                            </div>
                          </div>

                          {/* Match Score Badge */}
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-600 text-white">
                              {score}% Match
                            </span>
                          </div>
                        </div>

                        {/* Explainable reasons */}
                        <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-1 text-xs">
                          <div className="font-semibold text-slate-700 text-[11px]">Match Factors:</div>
                          {reasons.map((r, rIdx) => (
                            <div key={rIdx} className="flex items-start gap-1.5 text-slate-600 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>

                        {candidate.flexibility_note && (
                          <p className="text-xs text-slate-600 italic">
                            &ldquo;{candidate.flexibility_note}&rdquo;
                          </p>
                        )}

                        <div className="pt-2 flex items-center justify-end">
                          <button
                            type="button"
                            disabled={proposing}
                            onClick={() => handleProposeExchange(candidate.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                          >
                            <span>Propose Mutual Exchange</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
