import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeftRight, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  Train,
  Check,
  UserCheck
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-12 py-2">
      {/* Refined Hero Section: Balanced Two-Column Desktop Composition */}
      <section className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 sm:p-10 lg:p-12 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Concise Hero Copy & Primary Action */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-300 border border-teal-500/20">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Voluntary Travel Coordination • Monad Trust Anchor</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Swap seats. <br />
              <span className="text-teal-400">Travel better.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Connect with fellow passengers on your train to coordinate voluntary berth swaps. Discover complementary preferences, confirm bilateral consent, and anchor agreements with privacy-preserving proof on Monad.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link
                to="/exchanges"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors shadow-sm"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Find a Seat Exchange
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                How It Works
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                Mutual consent required
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                Off-chain passenger privacy
              </span>
              <span className="flex items-center gap-1.5">
                <Train className="w-3.5 h-3.5 text-teal-400" />
                Deterministic matching
              </span>
            </div>
          </div>

          {/* Right Column: Realistic Seat-Exchange Product Preview (Demo Sample) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-4 sm:p-5 shadow-inner space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span className="font-semibold text-slate-200">Live Workflow Preview</span>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
                  Demo Sample
                </span>
              </div>

              {/* Step A: Request Sample */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60 space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Passenger A (Priya Sharma)</span>
                  <span className="text-teal-400 font-medium">Train 12952 • 3A</span>
                </div>
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Holds: Coach B3, Seat 42 (Upper)</span>
                  <span className="text-teal-300 text-[11px]">Desires: Lower</span>
                </div>
              </div>

              {/* Step B: Compatible Match */}
              <div className="bg-slate-900/90 p-3 rounded-xl border border-teal-500/40 space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-teal-300 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-400" />
                    Compatible Candidate Match
                  </span>
                  <span className="bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                    100% Reciprocal
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] leading-snug">
                  Passenger B (Rahul) holds <strong>Coach B3, Seat 19 (Lower)</strong> and desires an <strong>Upper Berth</strong>.
                </div>
              </div>

              {/* Step C: Mutual Consent & Trust Anchor */}
              <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span>Bilateral Consent: Confirmed</span>
                </div>
                <span className="text-teal-300 font-mono text-[10px]">
                  Anchored on Monad
                </span>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-700/60">
                Explore real interactive requests in the <Link to="/exchanges" className="text-teal-400 underline underline-offset-2">Seat Exchanges directory</Link>.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tightened 4-Step Lifecycle */}
      <section id="how-it-works" className="space-y-6 pt-2">
        <div className="max-w-2xl space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            How Voluntary Exchange Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A transparent four-stage process enforcing bilateral consent and privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-teal-600 bg-teal-50 w-6 h-6 rounded-md flex items-center justify-center">
              1
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Post Seat Request</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your travel date, train, coach, seat and desired berth preference. No PNRs or ticket images are collected.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-sky-600 bg-sky-50 w-6 h-6 rounded-md flex items-center justify-center">
              2
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Deterministic Match</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rule-based scoring ranks candidates on the same route and date with explainable factors (reciprocal berths, coach proximity).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-indigo-600 bg-indigo-50 w-6 h-6 rounded-md flex items-center justify-center">
              3
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Mutual Consent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Neither passenger is committed unilaterally. Both parties must review proposed coach movements and explicitly accept.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-xs font-bold text-purple-600 bg-purple-50 w-6 h-6 rounded-md flex items-center justify-center">
              4
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">Monad Trust Anchor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Agreed terms are anchored via a salted commitment hash on Monad, establishing tamper-evident proof without publishing personal data.
            </p>
          </div>
        </div>
      </section>

      {/* Simplified Privacy & Monad Section */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="max-w-2xl space-y-1">
          <div className="text-xs font-bold text-teal-600 uppercase tracking-wide">Privacy By Design</div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            What Stays Private vs. What Monad Anchors
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Public blockchains are permanent. RailMatte never places personal passenger information on-chain.
          </p>
        </div>

        {/* Clean 2-Column Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
              <Lock className="w-4 h-4 text-rose-600" />
              <span>Strictly Private (Off-Chain)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Passenger Identities:</strong> Names and contact information remain in your local session.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>PNRs & Tickets:</strong> Never collected, uploaded, or exposed on any ledger.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Secret Cryptographic Salt:</strong> 256-bit random salt kept off-chain prevents dictionary guessing.</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-teal-900 text-sm">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Auditable On Monad (On-Chain)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Commitment Hash:</strong> 32-byte mathematical digest of agreed terms and secret salt.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Exchange Session Identifier:</strong> Anonymous opaque reference ID.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Block Timestamp:</strong> Monad block timestamp verifying when mutual consent occurred.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Expandable Technical Details (Keeps main page concise & readable) */}
        <details className="group border border-slate-200 rounded-xl p-4 bg-slate-50/50 text-xs text-slate-600">
          <summary className="font-semibold text-slate-800 cursor-pointer flex items-center justify-between list-none">
            <span>Technical Verification & Cryptographic Specification</span>
            <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className="pt-3 space-y-2.5 border-t border-slate-200/80 mt-3 text-slate-600">
            <p>
              <strong>Canonical Formula:</strong> Commitment is calculated via:
              <code className="block bg-white p-2 rounded border border-slate-200 mt-1 font-mono text-[11px] text-slate-800 break-all">
                commitmentHash = sha256(&quot;RAILMATTE_EXCHANGE_AGREEMENT_V1&quot; + &quot;:&quot; + exchangeId + &quot;:&quot; + termsDigest + &quot;:&quot; + saltNonce)
              </code>
            </p>
            <p>
              <strong>Smart Contract:</strong> <code className="font-mono text-slate-800">RailMatteAgreementRegistry.sol</code> emits <code className="font-mono text-slate-800">event AgreementCommitted(bytes32 indexed commitmentHash, bytes32 indexed exchangeId, address indexed recorder, uint256 timestamp)</code> and prevents duplicates.
            </p>
            <p>
              <strong>Network:</strong> Target environment is <strong>Monad Testnet (Chain ID: 10143)</strong>. The contract is tested with Hardhat and ready for deployment via <code className="font-mono text-slate-800">scripts/deploy.cjs</code>.
            </p>
          </div>
        </details>
      </section>

      {/* Scope Disclaimer */}
      <section className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 sm:p-5 text-xs text-amber-900 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-amber-950 text-xs sm:text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Product Boundary & Railway Integrity Disclosure</span>
        </div>
        <p className="leading-relaxed">
          RailMatte is an independent coordination prototype for voluntary seat swaps between consenting passengers. It does <strong>not</strong> modify official Indian Railways reservation databases, PNR allocations, or ticketing systems. Official authority on board trains remains exclusively with railway personnel and ticket examiners (TTE).
        </p>
      </section>
    </div>
  );
}
