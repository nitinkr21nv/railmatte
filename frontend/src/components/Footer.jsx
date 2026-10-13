import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { ShieldCheck, Lock, ExternalLink, GitFork } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="md:col-span-2 space-y-3.5">
          <Logo light={true} />
          <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
            A voluntary train seat-exchange coordinator and journey companion. Enabling passengers to discover mutually agreeable seat adjustments through explicit bilateral consent and privacy-preserving trust anchoring on Monad.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              Off-chain passenger privacy
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Monad Testnet (10143)
            </span>
          </div>
        </div>

        {/* Product Navigation */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Product</h3>
          <ul className="space-y-2 text-xs sm:text-sm">
            <li>
              <Link to="/exchanges" className="hover:text-white transition-colors">
                Seat Exchanges
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-white transition-colors">
                Passenger Dashboard
              </Link>
            </li>
            <li>
              <Link to="/assistance" className="hover:text-white transition-colors">
                Journey Assistance
              </Link>
            </li>
            <li>
              <a 
                href="https://testnet.monadexplorer.com" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-white transition-colors"
              >
                Monad Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>

        {/* Strict Disclaimers & Integrity */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Prototype Disclaimer</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            RailMatte is an independent hackathon prototype. It does <strong className="text-slate-300">not</strong> connect to CRIS, IRCTC, or official railway ticket booking infrastructure. Seat swaps remain strictly voluntary and based on courteous, bilateral passenger agreement.
          </p>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
            Licensed under OSI MIT License
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          &copy; {new Date().getFullYear()} RailMatte Contributors. Built for Metropolis Monad Hackathon.
        </div>
        <div className="flex items-center gap-4">
          <span>Privacy First</span>
          <span>&bull;</span>
          <span>Consent First</span>
          <span>&bull;</span>
          <span>Verifiable Trust</span>
        </div>
      </div>
    </footer>
  );
}
