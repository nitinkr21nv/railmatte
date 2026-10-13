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
  PartyPopper,
  Lock,
  ChevronDown,
  Info,
  Terminal
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

  const contractAddress =
    proposal?.commitment?.contract_address ||
    import.meta.env.VITE_CONTRACT_ADDRESS ||
    '0xefA55c69cbB76D9a625Cb820D6306bC9152a7e38';
  const isContractConfigured =
    Boolean(contractAddress) &&
    contractAddress !== '0x0000000000000000000000000000000000000000' &&
    /^0x[0-9a-fA-F]{40}$/.test(contractAddress);

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
    if (!isContractConfigured) {
      setTxError(
        'Monad Agreement Registry contract has not been deployed yet. Deploy via contracts/scripts/deploy.cjs and set VITE_CONTRACT_ADDRESS in frontend/.env.'
      );
      return;
    }

    setTxPending(true);
    setTxError(null);
    setTxSuccess(null);

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
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Exchange Proposal Not Found</h2>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
            Exchange Agreement Lifecycle
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Seat Exchange #{proposal.id}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          <StatusBadge status={proposal.status} />
          {proposal.status === 'PROPOSED' && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              Bilateral Consent Required
            </span>
          )}
        </div>
      </div>

      {/* Demo Persona Context Banner */}
      {!isParticipant && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Observer Mode:</strong> Switch personas in the top menu to act as {proposal.proposer?.display_name} or {proposal.recipient?.display_name}.
          </span>
        </div>
      )}

      {/* Side-by-Side Seat Movement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Proposer Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PROPOSER</span>
              <div className="text-sm font-bold text-slate-900">{proposal.proposer?.display_name}</div>
            </div>
            {isProposer && (
              <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                Your Persona
              </span>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-500">
              Journey: <strong className="text-slate-800">{reqA?.origin_station} &rarr; {reqA?.destination_station}</strong>
            </div>
            <div className="text-slate-500">
              Travel Date: <strong className="text-slate-800">{reqA?.travel_date}</strong> (Train {reqA?.train_number || 'Standard'})
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Currently Holding:</span>
              <span className="font-semibold text-slate-800">
                Coach {reqA?.current_coach}, Seat {reqA?.current_seat} ({reqA?.current_berth_type})
              </span>
            </div>
            <div className="flex items-center justify-between text-teal-700 font-semibold pt-1 border-t border-slate-200/60">
              <span>Proposed Movement:</span>
              <span>
                Coach {reqB?.current_coach}, Seat {reqB?.current_seat} ({reqB?.current_berth_type})
              </span>
            </div>
          </div>
        </div>

        {/* Recipient Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RECIPIENT</span>
              <div className="text-sm font-bold text-slate-900">{proposal.recipient?.display_name}</div>
            </div>
            {isRecipient && (
              <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60">
                Your Persona
              </span>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-500">
              Journey: <strong className="text-slate-800">{reqB?.origin_station} &rarr; {reqB?.destination_station}</strong>
            </div>
            <div className="text-slate-500">
              Travel Date: <strong className="text-slate-800">{reqB?.travel_date}</strong> (Train {reqB?.train_number || 'Standard'})
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Currently Holding:</span>
              <span className="font-semibold text-slate-800">
                Coach {reqB?.current_coach}, Seat {reqB?.current_seat} ({reqB?.current_berth_type})
              </span>
            </div>
            <div className="flex items-center justify-between text-teal-700 font-semibold pt-1 border-t border-slate-200/60">
              <span>Proposed Movement:</span>
              <span>
                Coach {reqA?.current_coach}, Seat {reqA?.current_seat} ({reqA?.current_berth_type})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bilateral Mutual Consent Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            Bilateral Mutual Consent Status
          </h2>
          <span className="text-[11px] font-medium text-slate-500">
            {proposal.recipient_consent ? 'Both Consents Satisfied' : 'Pending Co-Passenger Consent'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Proposer Status */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Proposer Consent: Confirmed</span>
            </div>
            <p className="text-slate-500 leading-normal">
              {proposal.proposer?.display_name} initiated this request and consented to the proposed swap.
            </p>
            <div className="text-[10px] text-slate-400">
              Recorded: {new Date(proposal.proposer_consented_at).toLocaleString()}
            </div>
          </div>

          {/* Recipient Status */}
          <div className={`p-4 rounded-xl border space-y-1.5 text-xs ${
            proposal.recipient_consent
              ? 'bg-teal-50/60 border-teal-200'
              : 'bg-amber-50/60 border-amber-200'
          }`}>
            <div className="flex items-center gap-2 font-bold text-slate-900">
              {proposal.recipient_consent ? (
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>Recipient Consent: {proposal.recipient_consent ? 'Confirmed' : 'Pending Decision'}</span>
            </div>
            <p className="text-slate-600 leading-normal">
              {proposal.recipient_consent
                ? `${proposal.recipient?.display_name} explicitly agreed. Both parties have consented.`
                : `Awaiting decision from ${proposal.recipient?.display_name}. Swap is not confirmed until accepted.`}
            </p>
            {proposal.recipient_consented_at && (
              <div className="text-[10px] text-slate-400">
                Recorded: {new Date(proposal.recipient_consented_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Clear Action Panel */}
        {proposal.status === 'PROPOSED' && (
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 text-center sm:text-left">
              {isRecipient && 'You are the recipient. You can accept or decline this exchange proposal.'}
              {isProposer && 'Awaiting response from co-passenger. You can cancel this proposal if plans change.'}
              {!isParticipant && 'Switch persona in the header to simulate the recipient accepting or declining.'}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isRecipient && (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleDecline}
                    className="flex-1 sm:flex-initial px-4 py-2 rounded-xl font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleAccept}
                    className="flex-1 sm:flex-initial px-5 py-2 rounded-xl font-semibold bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-sm"
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
                  className="w-full sm:w-auto px-4 py-2 rounded-xl font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
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
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-7 text-white shadow-lg space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Monad Testnet Trust Anchor
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Privacy-Preserving Agreement Record
              </h2>
            </div>
            <StatusBadge status={proposal.commitment.status} />
          </div>

          {/* Plain-Language Privacy Guarantee First */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 flex items-start gap-3 text-xs text-slate-300">
            <Lock className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white">Privacy Guarantee:</span>
              <p className="leading-relaxed">
                Your personal details, contact info, and PNRs are never placed on-chain. Only the mathematical commitment hash is registered on Monad. The secret salt nonce is held securely off-chain and never exposed.
              </p>
            </div>
          </div>

          {/* Honest Monad Setup Check */}
          {!isContractConfigured ? (
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-4 sm:p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <Terminal className="w-4 h-4" />
                <span>Monad Contract Setup Required for On-Chain Recording</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                The smart contract (<code className="font-mono text-teal-300">RailMatteAgreementRegistry.sol</code>) is fully compiled and passed all 6 automated tests. In this prototype environment, the contract has not yet been deployed to Monad Testnet.
              </p>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
                <div># To deploy to Monad Testnet (Chain ID 10143):</div>
                <div className="text-teal-300">npm run --prefix contracts deploy:monad</div>
                <div># Then configure VITE_CONTRACT_ADDRESS in frontend/.env</div>
              </div>
            </div>
          ) : proposal.commitment.status === 'CONFIRMED' ? (
            <div className="bg-teal-950/60 border border-teal-800/80 rounded-2xl p-4 sm:p-5 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-teal-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Transaction on Monad Testnet</span>
              </div>
              <div className="text-slate-300 space-y-1 font-mono break-all text-[11px]">
                <div>Tx Hash: <span className="text-white">{proposal.commitment.tx_hash}</span></div>
                <div>Contract: <span className="text-slate-400">{proposal.commitment.contract_address}</span></div>
              </div>
              {proposal.commitment.tx_hash && (
                <a
                  href={`https://testnet.monadexplorer.com/tx/${proposal.commitment.tx_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-teal-300 hover:text-teal-200 pt-1"
                >
                  View on Monad Explorer <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {txError && (
                <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{txError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  Ready to anchor on Monad Testnet (Chain ID: 10143)
                </span>
                <button
                  type="button"
                  disabled={txPending}
                  onClick={handleAnchorOnMonad}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" />
                  {txPending ? 'Submitting to Monad...' : 'Anchor on Monad Testnet'}
                </button>
              </div>
            </div>
          )}

          {/* Expandable Technical Digest (Keeps Salt Nonce Private) */}
          <details className="group border border-slate-800 rounded-xl p-3.5 bg-slate-800/40 text-xs text-slate-400">
            <summary className="font-semibold text-slate-300 cursor-pointer flex items-center justify-between list-none">
              <span>View On-Chain Commitment Hash</span>
              <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="pt-2.5 space-y-2 border-t border-slate-800 mt-2.5 text-[11px] font-mono break-all text-slate-300">
              <div>
                <span className="text-slate-500 block">Commitment Hash:</span>
                <span className="text-teal-300">{proposal.commitment.commitment_hash}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Salt Nonce Status:</span>
                <span className="text-slate-300">Secured off-chain (not exposed in interface)</span>
              </div>
            </div>
          </details>

          {/* Mark Journey Complete */}
          {proposal.status === 'ACCEPTED' && (
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 text-center sm:text-left">
                Train journey finished and seats physically exchanged?
              </span>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleComplete}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
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
