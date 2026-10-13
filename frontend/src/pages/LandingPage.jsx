import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeftRight, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Layers, 
  FileCheck2, 
  AlertTriangle,
  ArrowRight,
  Train
} from 'lucide-react';
import Logo from '../components/Logo';

export default function LandingPage() {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Monad Hackathon Trust & Coordination Layer</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Swap seats. <br />
            <span className="text-teal-400">Travel better.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            The smart, voluntary train seat-exchange companion. Connect with fellow passengers on your train, discover mutually agreeable berth swaps, and confirm bilateral consent with privacy-preserving cryptographic trust on Monad.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link
              to="/exchanges"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Explore Seat Exchanges
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 transition-all"
            >
              Passenger Dashboard
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              100% Voluntary Passenger Agreement
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-400" />
              Zero PNRs or personal identity on-chain
            </span>
            <span className="flex items-center gap-1.5">
              <Train className="w-4 h-4 text-teal-400" />
              Deterministic route & coach matching
            </span>
          </div>
        </div>
      </section>

      {/* 4-Step Voluntary Exchange Lifecycle */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How RailMatte Works
          </h2>
          <p className="text-sm text-slate-600">
            A transparent four-stage lifecycle designed for passenger dignity, security, and consent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Request</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Post your travel date, train, coach, and berth details alongside your desired preference. No PNR or ticket images required.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Compatible Match</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our transparent scoring engine discovers complementary requests on the same route with exact match explanations.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Mutual Consent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Neither party is committed unilaterally. Both passengers must review and explicitly accept before any agreement is established.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-semibold text-slate-900 text-base">Trust Record</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The agreed terms are anchored onto the Monad network using a salted cryptographic commitment hash, providing verifiable proof without leaking personal data.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Trust Architecture Matrix */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-8">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">Privacy By Design</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            What Monad Anchors vs. What Stays Private
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Public blockchains are permanent. That is why RailMatte never places personal passenger information on-chain. We use a cryptographically salted domain-separated commitment hash.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
              <Lock className="w-4 h-4" />
              <span>Off-Chain (Strictly Private & Confidential)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Passenger Names & Identities:</strong> Kept on local secure session.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>PNRs & Ticket Numbers:</strong> Never required, never collected, never published.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Contact Information:</strong> Phone numbers & emails never enter the smart contract.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Cryptographic Salt Nonce:</strong> 32-byte secret salt prevents dictionary guessing.</span>
              </li>
            </ul>
          </div>

          <div className="bg-teal-50/50 p-6 rounded-2xl border border-teal-200/80 space-y-4">
            <div className="flex items-center gap-2 text-teal-800 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>On-Chain on Monad (Publicly Auditable)</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Commitment Hash:</strong> 32-byte hash: <code>keccak256(domain || exchangeId || terms || salt)</code></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Exchange Session UUID:</strong> Opaque bytes32 identifier.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Block Timestamp:</strong> Monad block timestamp proving when mutual agreement was finalized.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Recorder Address:</strong> Signer EVM address recording the commitment.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Disclaimers & Integrity Note */}
      <section className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-2 font-semibold text-amber-950 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Product Scope & Boundary Transparency</span>
        </div>
        <p className="leading-relaxed">
          RailMatte is an independent travel companion created for voluntary seat swaps between consenting passengers. It does <strong>not</strong> modify official Indian Railways reservation databases, PNR charts, or ticketing records. An on-chain commitment proves that two consenting parties registered agreed terms at a specific block time, but does not independently verify physical coach presence or modify official railway charts.
        </p>
      </section>
    </div>
  );
}
