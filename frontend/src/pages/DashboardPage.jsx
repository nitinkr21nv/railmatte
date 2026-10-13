import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { 
  ArrowLeftRight, 
  Calendar, 
  MapPin, 
  Train, 
  ShieldCheck, 
  LifeBuoy, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [assistanceReports, setAssistanceReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);

      const [reqData, propData, assistData] = await Promise.all([
        api.getRequests({ userId: currentUser.id }),
        api.getProposals(),
        api.getAssistanceReports()
      ]);

      setRequests(reqData.requests || []);
      setProposals(propData.proposals || []);
      setAssistanceReports(assistData.reports || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Unable to fetch dashboard records. Verify backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading passenger dashboard...</p>
      </div>
    );
  }

  // Filter proposals into incoming vs outgoing
  const incomingProposals = proposals.filter((p) => p.recipient_id === currentUser?.id);
  const outgoingProposals = proposals.filter((p) => p.proposer_id === currentUser?.id);
  const activeRequests = requests.filter((r) => r.status === 'OPEN');

  return (
    <div className="space-y-8">
      {/* Passenger Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Passenger Workspace</div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Welcome, {currentUser?.display_name || 'Passenger'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Identity: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{currentUser?.email}</code>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/exchanges"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Seat Request
          </Link>
          <Link
            to="/assistance"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <LifeBuoy className="w-4 h-4" />
            Assistance
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Real Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Active Requests</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{activeRequests.length}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Incoming Proposals</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {incomingProposals.filter((p) => p.status === 'PROPOSED').length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Accepted Exchanges</div>
          <div className="text-2xl font-bold text-teal-600 mt-1">
            {proposals.filter((p) => p.status === 'ACCEPTED' || p.status === 'COMPLETED').length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-medium text-slate-500">Assistance Logs</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{assistanceReports.length}</div>
        </div>
      </div>

      {/* Section 1: Active Exchange Requests */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-teal-600" />
            My Seat Exchange Requests
          </h2>
          <Link to="/exchanges" className="text-xs font-medium text-teal-600 hover:text-teal-700">
            View All ({requests.length})
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No exchange requests yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create a request with your current coach & berth and your desired preference to discover compatible swaps.
            </p>
            <Link
              to="/exchanges"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Create Your First Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {req.coach_class} Class
                  </span>
                  <StatusBadge status={req.status} />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{req.origin_station} &rarr; {req.destination_station}</span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {req.travel_date}
                    </span>
                    {req.train_number && (
                      <span className="flex items-center gap-1">
                        <Train className="w-3.5 h-3.5" />
                        Train {req.train_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Berth Movement Box */}
                <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs border border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">YOU HOLD</div>
                    <div className="font-semibold text-slate-800">
                      Coach {req.current_coach}, Seat {req.current_seat} ({req.current_berth_type})
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">YOU DESIRE</div>
                    <div className="font-semibold text-teal-700">
                      {req.desired_berth_type} Berth
                    </div>
                  </div>
                </div>

                {req.flexibility_note && (
                  <p className="text-xs text-slate-600 italic line-clamp-1">
                    &ldquo;{req.flexibility_note}&rdquo;
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">ID: {req.id}</span>
                  <Link
                    to={`/exchanges?matchReqId=${req.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Find Compatible Matches <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Bilateral Exchange Proposals */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          Exchange Proposals & Agreements
        </h2>

        {proposals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            No active proposals yet. Once you propose an exchange with a compatible passenger, bilateral consent tracking appears here.
          </div>
        ) : (
          <div className="space-y-3">
            {proposals.map((prop) => {
              const isRecipient = prop.recipient_id === currentUser?.id;
              const isProposer = prop.proposer_id === currentUser?.id;
              const needsMyConsent = isRecipient && prop.status === 'PROPOSED';

              return (
                <div
                  key={prop.id}
                  className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 transition-all ${
                    needsMyConsent ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {isRecipient ? 'Incoming Proposal from' : 'Outgoing Proposal to'}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {isRecipient ? prop.proposer?.display_name || 'Passenger' : prop.recipient?.display_name || 'Passenger'}
                      </span>
                    </div>
                    <StatusBadge status={prop.status} />
                  </div>

                  {/* Consent Status Strip */}
                  <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border border-slate-100">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Proposer ({prop.proposer?.display_name}):</strong> Consented at creation
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {prop.recipient_consent ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span>
                        <strong>Recipient ({prop.recipient?.display_name}):</strong>{' '}
                        {prop.recipient_consent ? 'Consented' : 'Awaiting Decision'}
                      </span>
                    </div>
                  </div>

                  {/* Blockchain Commitment summary if accepted */}
                  {prop.commitment && (
                    <div className="bg-teal-50/50 rounded-lg p-2.5 text-xs text-teal-900 border border-teal-200/60 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 font-medium">
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        <span>Monad Trust Anchor: {prop.commitment.status}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600">
                        Hash: {prop.commitment.commitment_hash.slice(0, 14)}...
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">Proposal ID: {prop.id}</span>
                    <Link
                      to={`/proposals/${prop.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      {needsMyConsent ? 'Review & Consent' : 'View Agreement Lifecycle'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 3: Journey Assistance Logs */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-indigo-600" />
            My Journey Assistance Logs
          </h2>
          <Link to="/assistance" className="text-xs font-medium text-teal-600 hover:text-teal-700">
            Submit New Report &rarr;
          </Link>
        </div>

        {assistanceReports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
            No assistance reports logged. You can report seat disputes, accessibility requests, or lost items in the Assistance tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assistanceReports.map((rep) => (
              <div key={rep.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                    {rep.category.replace('_', ' ')}
                  </span>
                  <StatusBadge status={rep.status} />
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {rep.description}
                </p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
                  <span>Logged: {new Date(rep.created_at).toLocaleDateString()}</span>
                  <span>ID: {rep.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
