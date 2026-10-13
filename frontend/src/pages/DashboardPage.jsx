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
  Info,
  ArrowUpRight,
  ArrowDownLeft,
  XCircle
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
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading passenger workspace...</p>
      </div>
    );
  }

  // Categorize proposals clearly
  const incomingPending = proposals.filter(
    (p) => p.recipient_id === currentUser?.id && p.status === 'PROPOSED'
  );
  const outgoingPending = proposals.filter(
    (p) => p.proposer_id === currentUser?.id && p.status === 'PROPOSED'
  );
  const acceptedOrCompleted = proposals.filter(
    (p) => p.status === 'ACCEPTED' || p.status === 'COMPLETED'
  );
  const closedProposals = proposals.filter(
    (p) => p.status === 'DECLINED' || p.status === 'CANCELLED'
  );
  const activeRequests = requests.filter((r) => r.status === 'OPEN');

  return (
    <div className="space-y-8">
      {/* Passenger Header Banner with Demo Persona Disclaimer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Prototype Demo Persona
            </span>
            <span className="text-xs text-slate-400">ID: {currentUser?.id}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {currentUser?.display_name || 'Passenger Workspace'}
          </h1>
          <p className="text-xs text-slate-500">
            Simulated session for mutual consent testing. Use the persona switcher in the header to switch to your co-passenger.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/exchanges"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            New Seat Request
          </Link>
          <Link
            to="/assistance"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <LifeBuoy className="w-4 h-4" />
            Assistance
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Real Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500">Your Active Requests</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{activeRequests.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500">Incoming Proposals</div>
          <div className="text-xl font-bold text-amber-600 mt-1">{incomingPending.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500">Agreed Exchanges</div>
          <div className="text-xl font-bold text-teal-600 mt-1">{acceptedOrCompleted.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-medium text-slate-500">Assistance Logs</div>
          <div className="text-xl font-bold text-indigo-600 mt-1">{assistanceReports.length}</div>
        </div>
      </div>

      {/* 1. Incoming Proposals Alert Strip (High Priority) */}
      {incomingPending.length > 0 && (
        <section className="bg-amber-50/90 rounded-2xl border border-amber-300 p-5 space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
            <ArrowDownLeft className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Action Required: Incoming Proposals ({incomingPending.length})</span>
          </div>
          <p className="text-xs text-amber-900">
            A co-passenger has proposed a seat exchange with your request. Review their seat details and provide or decline consent.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {incomingPending.map((prop) => (
              <div
                key={prop.id}
                className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    From: {prop.proposer?.display_name || 'Co-Passenger'}
                  </span>
                  <StatusBadge status={prop.status} />
                </div>
                <div className="text-slate-600">
                  Holds: <strong>Coach {prop.requestA?.current_coach}, Seat {prop.requestA?.current_seat} ({prop.requestA?.current_berth_type})</strong>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">ID: {prop.id}</span>
                  <Link
                    to={`/proposals/${prop.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-xs px-3 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm"
                  >
                    Review & Decide <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Your Active Seat Exchange Requests */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-teal-600" />
            Your Seat Exchange Requests
          </h2>
          <Link to="/exchanges" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
            Browse All Exchanges &rarr;
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-2.5">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No requests posted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post a seat request with your travel date and berth preference to start discovering compatible passenger swaps.
            </p>
            <Link
              to="/exchanges"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Create Seat Request
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded text-[11px]">
                    {req.coach_class} Class
                  </span>
                  <StatusBadge status={req.status} />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{req.origin_station} &rarr; {req.destination_station}</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {req.travel_date}
                    </span>
                    {req.train_number && (
                      <span className="flex items-center gap-1">
                        <Train className="w-3 h-3" />
                        Train {req.train_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Berth Movement Detail */}
                <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-2 border border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">YOU HOLD</div>
                    <div className="font-semibold text-slate-800">
                      Coach {req.current_coach}, {req.current_berth_type} ({req.current_seat})
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
                  <p className="text-slate-600 italic line-clamp-1 bg-amber-50/40 p-1.5 rounded border border-amber-100/50">
                    &ldquo;{req.flexibility_note}&rdquo;
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">ID: {req.id}</span>
                  {req.status === 'OPEN' && (
                    <Link
                      to={`/exchanges?matchReqId=${req.id}`}
                      className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700"
                    >
                      Find Compatible Matches <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Outgoing Proposals (Awaiting Co-Passenger) */}
      {outgoingPending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-sky-600" />
            Outgoing Proposals Awaiting Response ({outgoingPending.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {outgoingPending.map((prop) => (
              <div key={prop.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Sent to: {prop.recipient?.display_name || 'Co-Passenger'}
                  </span>
                  <StatusBadge status={prop.status} />
                </div>
                <p className="text-slate-500">
                  Waiting for co-passenger to review and accept the proposed seat exchange.
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">ID: {prop.id}</span>
                  <Link
                    to={`/proposals/${prop.id}`}
                    className="font-semibold text-slate-700 hover:text-slate-900"
                  >
                    View Status &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Mutually Accepted Agreements */}
      {acceptedOrCompleted.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            Mutually Agreed Exchanges ({acceptedOrCompleted.length})
          </h2>

          <div className="space-y-3">
            {acceptedOrCompleted.map((prop) => (
              <div key={prop.id} className="bg-white p-4 rounded-xl border border-teal-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>Exchange with {prop.proposer_id === currentUser?.id ? prop.recipient?.display_name : prop.proposer?.display_name}</span>
                  </div>
                  <StatusBadge status={prop.status} />
                </div>
                <div className="text-slate-600">
                  Bilateral consent complete. Both passengers have accepted the swap terms.
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Proposal ID: {prop.id}</span>
                  <Link
                    to={`/proposals/${prop.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700"
                  >
                    View Agreement & Monad Record <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Closed / Cancelled Proposals (if any) */}
      {closedProposals.length > 0 && (
        <details className="text-xs text-slate-500 border border-slate-200 rounded-xl p-3 bg-white">
          <summary className="cursor-pointer font-medium text-slate-700">
            View Closed / Cancelled History ({closedProposals.length})
          </summary>
          <div className="pt-2 space-y-2">
            {closedProposals.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                <span>Proposal #{p.id}</span>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </details>
      )}

      {/* 6. Journey Assistance Logs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-indigo-600" />
            Your Journey Assistance Reports ({assistanceReports.length})
          </h2>
          <Link to="/assistance" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
            Submit New Report &rarr;
          </Link>
        </div>

        {assistanceReports.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-5 text-center text-xs text-slate-500">
            No assistance reports logged. You can report seat disputes or accessibility requests in the Assistance tab.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {assistanceReports.map((rep) => (
              <div key={rep.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-sm text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                    {rep.category.replace('_', ' ')}
                  </span>
                  <StatusBadge status={rep.status} />
                </div>
                <p className="text-slate-600 leading-normal line-clamp-2">
                  {rep.description}
                </p>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
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
