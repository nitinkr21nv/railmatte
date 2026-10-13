import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { recordCommitmentOnMonad, MONAD_TESTNET_CONFIG } from '../services/web3';
import StatusBadge from '../components/StatusBadge';
import { 
  ArrowLeftRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  Wallet, 
  ExternalLink, 
  Ban, 
  PartyPopper,
  Lock,
  ArrowRight
} from 'lucide-react';

export default function ExchangeDetailPage() {
  const { id } = useParams();
  const { currentUser, wallet, connectWallet } = useAuth();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Web3 Monad Transaction state
  const [txPending, setTxPending] = useState(false);
  const [txError, setTxError] = useState(null);
  const [txSuccess, setTxSuccess] = useState(null);

  const loadProposal = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getProposalById(id);
      setProposal(res.proposal);
    } catch (err) {
      console.error('Failed to load proposal details:', err);
      setError(err.message || 'Unable to retrieve exchange proposal.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  const isProposer = proposal?.proposer_id === currentUser?.id;
  const isRecipient = proposal?.recipient_id === currentUser?.id;
  const isParticipant = isProposer || isRecipient;

  // Accept Proposal (Recipient only)
  const handleAccept = async () => {
    try {
      setActionLoading(true);
      await api.acceptProposal(id);
      await loadProposal();
    } catch (err) {
      alert(`Acceptance failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Decline Proposal (Recipient only)
  const handleDecline = async () => {
    if (!window.confirm('Are you sure you want to decline this exchange proposal?')) return;
    try {
      setActionLoading(true);
      await api.declineProposal(id);
      await loadProposal();
    } catch (err) {
      alert(`Decline failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel Proposal (Either party)
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this exchange proposal?')) return;
    try {
      setActionLoading(true);
      await api.cancelProposal(id);
      await loadProposal();
    } catch (err) {
      alert(`Cancellation failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Complete Exchange (Either party after physical swap)
  const handleComplete = async () => {
    try {
      setActionLoading(true);
      await api.completeProposal(id);
      await loadProposal();
    } catch (err) {
      alert(`Could not complete: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Anchor Commitment on Monad Testnet via Web3 Wallet
  const handleAnchorOnMonad = async () => {
    setTxPending(true);
    setTxError(null);
    setTxSuccess(null);

    const contractAddress =
      import.meta.env.VITE_CONTRACT_ADDRESS ||
      '0x0000000000000000000000000000000000000000';

    if (contractAddress === '0x0000000000000000000000000000000000000000') {
      setTxError(
        'Monad contract address is not yet configured in VITE_CONTRACT_ADDRESS. Deploy the contract using contracts/scripts/deploy.cjs or supply the contract address in frontend/.env.'
      );
      setTxPending(false);
      return;
    }

    try {
      if (!wallet.isConnected) {
        await connectWallet();
      }

      const commitmentHash = proposal.commitment?.commitment_hash;
      const res = await recordCommitmentOnMonad(contractAddress, commitmentHash, proposal.id);

      // Confirm to backend
      await api.confirmCommitment(proposal.id, {
        tx_hash: res.txHash,
        contract_address: res.contractAddress,
        recorder_address: res.recorderAddress,
      });

      setTxSuccess({
        txHash: res.txHash,
        explorerUrl: res.explorerUrl,
      });

      await loadProposal();
    } catch (err) {
      console.error('Monad transaction failed:', err);
      setTxError(err.message || 'Transaction rejected or failed on Monad Testnet.');
    } finally {
      setTxPending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs">
        Loading exchange proposal agreement...
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Exchange Proposal Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'You might not be authorized to view this proposal.'}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const reqA = proposal.requestA;
  const reqB = proposal.requestB;
  const isAccepted = proposal.status === 'ACCEPTED' || proposal.status === 'COMPLETED';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
            Exchange Agreement Lifecycle
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Seat Exchange #{proposal.id}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={proposal.status} />
          {proposal.status === 'PROPOSED' && (
            <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              Awaiting Bilateral Consent
            </span>
          )}
        </div>
      </div>

      {/* Participant Identity Context Banner */}
      {!isParticipant && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <strong>Reviewer Mode:</strong> You are viewing this exchange proposal as an observer. Switch user using the persona switcher at the top right to simulate action as {proposal.proposer?.display_name} or {proposal.recipient?.display_name}.
        </div>
      )}

      {/* Side-by-Side Seat Movement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passenger A (Proposer) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROPOSER</span>
              <div className="text-sm font-bold text-slate-900">{proposal.proposer?.display_name}</div>
            </div>
            {isProposer && (
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                You
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-slate-500">
              Journey: <strong className="text-slate-800">{reqA?.origin_station} &rarr; {reqA?.destination_station}</strong>
            </div>
            <div className="text-slate-500">
              Travel Date: <strong className="text-slate-800">{reqA?.travel_date}</strong> (Train {reqA?.train_number || 'Standard'})
            </div>
          </div>

          {/* Seat Swap visualization */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Currently Holding:</span>
              <span className="font-bold text-slate-900">
                Coach {reqA?.current_coach}, Seat {reqA?.current_seat} ({reqA?.current_berth_type})
              </span>
            </div>
            <div className="flex items-center justify-between text-teal-700 font-semibold pt-1 border-t border-slate-200/60">
              <span>Will Move To:</span>
              <span>
                Coach {reqB?.current_coach}, Seat {reqB?.current_seat} ({reqB?.current_berth_type})
              </span>
            </div>
          </div>
        </div>

        {/* Passenger B (Recipient) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RECIPIENT</span>
              <div className="text-sm font-bold text-slate-900">{proposal.recipient?.display_name}</div>
            </div>
            {isRecipient && (
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                You
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-slate-500">
              Journey: <strong className="text-slate-800">{reqB?.origin_station} &rarr; {reqB?.destination_station}</strong>
            </div>
            <div className="text-slate-500">
              Travel Date: <strong className="text-slate-800">{reqB?.travel_date}</strong> (Train {reqB?.train_number || 'Standard'})
            </div>
          </div>

          {/* Seat Swap visualization */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Currently Holding:</span>
              <span className="font-bold text-slate-900">
                Coach {reqB?.current_coach}, Seat {reqB?.current_seat} ({reqB?.current_berth_type})
              </span>
            </div>
            <div className="flex items-center justify-between text-teal-700 font-semibold pt-1 border-t border-slate-200/60">
              <span>Will Move To:</span>
              <span>
                Coach {reqA?.current_coach}, Seat {reqA?.current_seat} ({reqA?.current_berth_type})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bilateral Mutual Consent Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-teal-600" />
          Bilateral Mutual Consent Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Proposer Consent Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="font-bold text-slate-900 text-sm">
                Proposer Consent: Confirmed
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {proposal.proposer?.display_name} initiated this proposal and explicitly agreed to the exchange parameters.
            </p>
            <div className="text-[11px] text-slate-400">
              Consented: {new Date(proposal.proposer_consented_at).toLocaleString()}
            </div>
          </div>

          {/* Recipient Consent Card */}
          <div className={`p-4 rounded-2xl border space-y-2 ${
            proposal.recipient_consent
              ? 'bg-teal-50/60 border-teal-200'
              : 'bg-amber-50/60 border-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {proposal.recipient_consent ? (
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <div className="font-bold text-slate-900 text-sm">
                Recipient Consent: {proposal.recipient_consent ? 'Confirmed' : 'Pending Decision'}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {proposal.recipient_consent
                ? `${proposal.recipient?.display_name} explicitly accepted the proposal. Mutual bilateral consent is complete.`
                : `Awaiting explicit consent from ${proposal.recipient?.display_name}. No exchange occurs without both parties agreeing.`}
            </p>
            {proposal.recipient_consented_at && (
              <div className="text-[11px] text-slate-400">
                Consented: {new Date(proposal.recipient_consented_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Interactive Decision Actions */}
        {proposal.status === 'PROPOSED' && (
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {isRecipient && 'You hold the decision for this exchange proposal.'}
              {isProposer && 'Awaiting response from co-passenger. You may cancel if your plans have changed.'}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isRecipient && (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleDecline}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    Decline Proposal
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleAccept}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm"
                  >
                    {actionLoading ? 'Accepting...' : 'Accept Exchange'}
                  </button>
                </>
              )}

              {isProposer && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCancel}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancel Proposal
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Monad Trust Anchor Commitment Layer */}
      {isAccepted && proposal.commitment && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Monad Testnet Trust Anchor
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Cryptographic Agreement Commitment
              </h2>
            </div>
            <StatusBadge status={proposal.commitment.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-slate-400 font-medium">Domain-Separated Commitment Hash</span>
              <div className="font-mono text-teal-300 break-all text-[11px]">
                {proposal.commitment.commitment_hash}
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1">
              <span className="text-slate-400 font-medium">Off-Chain Cryptographic Salt Nonce</span>
              <div className="font-mono text-slate-300 break-all text-[11px]">
                {proposal.commitment.salt_nonce}
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Explanation */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white">Privacy Guarantee:</span>
              <p className="leading-relaxed">
                Only the mathematical commitment hash is registered on Monad. Your names, contact information, and journey PNRs remain strictly off-chain. The salt nonce prevents rainbow-table guessing attacks.
              </p>
            </div>
          </div>

          {/* Transaction states & trigger */}
          {proposal.commitment.status === 'CONFIRMED' ? (
            <div className="bg-teal-950/60 border border-teal-800/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Verified & Anchored on Monad Testnet</span>
              </div>
              <div className="text-xs text-slate-300 space-y-1 font-mono break-all">
                <div>Tx Hash: <span className="text-white">{proposal.commitment.tx_hash}</span></div>
                <div>Contract: <span className="text-slate-400">{proposal.commitment.contract_address}</span></div>
                <div>Recorded: <span>{new Date(proposal.commitment.recorded_at).toLocaleString()}</span></div>
              </div>
              {proposal.commitment.tx_hash && (
                <a
                  href={`https://testnet.monadexplorer.com/tx/${proposal.commitment.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200 pt-1"
                >
                  View on Monad Explorer <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {txError && (
                <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{txError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  Network: <strong>Monad Testnet</strong> (Chain ID: 10143)
                </div>

                <button
                  type="button"
                  disabled={txPending}
                  onClick={handleAnchorOnMonad}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20 disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" />
                  {txPending ? 'Submitting to Monad...' : 'Anchor Agreement on Monad'}
                </button>
              </div>
            </div>
          )}

          {/* Mark Journey Complete */}
          {proposal.status === 'ACCEPTED' && (
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Completed the train journey and physically exchanged seats?
              </span>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleComplete}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
              >
                <PartyPopper className="w-3.5 h-3.5 text-teal-400" />
                Mark Journey Completed
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
