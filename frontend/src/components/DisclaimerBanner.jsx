import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <aside
      aria-label="Important prototype and railway disclaimer"
      className="bg-slate-900 border-b border-slate-800 text-slate-300 text-xs py-2 px-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-teal-400 shrink-0" />
          <span>
            <strong className="text-white font-medium">Voluntary Companion Prototype:</strong> RailMatte facilitates mutual seat exchange agreements between consenting passengers. It does <em className="not-italic text-teal-300">not</em> modify official railway reservations or PNR records.
          </span>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:inline-block">
          Monad Testnet Trust Anchor (Chain ID: 10143)
        </div>
      </div>
    </aside>
  );
}
