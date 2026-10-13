import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { 
  Users, 
  Wallet, 
  ArrowLeftRight, 
  LayoutDashboard, 
  LifeBuoy, 
  Menu, 
  X, 
  Check, 
  ChevronDown,
  Info
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, availableUsers, switchUser, wallet, connectWallet } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: 'Exchanges', path: '/exchanges', icon: ArrowLeftRight },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Assistance', path: '/assistance', icon: LifeBuoy },
  ];

  const handleWalletClick = async () => {
    if (wallet.isConnected) return;
    try {
      setConnecting(true);
      await connectWallet();
    } catch (err) {
      alert(`Wallet connection: ${err.message}`);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center shrink-0" aria-label="RailMatte Home">
            <Logo compact={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-teal-700 bg-teal-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster: Demo Mode Persona Selector & Optional Wallet */}
          <div className="hidden md:flex items-center gap-3">
            {/* Demo Mode Persona Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                aria-expanded={demoDropdownOpen}
                aria-haspopup="true"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Demo:</span>
                <span className="font-semibold text-slate-900 max-w-[110px] truncate">
                  {currentUser ? currentUser.display_name.split(' ')[0] : 'Persona'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2.5 z-50 text-left">
                  <div className="px-3.5 pb-2 border-b border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Users className="w-3.5 h-3.5 text-teal-600" />
                      <span>Demo Mode — Personas</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Switch between passenger personas to simulate mutual consent in this prototype. No real credentials are required.
                    </p>
                  </div>

                  <div className="py-1">
                    {availableUsers.map((u) => {
                      const isSelected = currentUser?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => {
                            switchUser(u.id);
                            setDemoDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-teal-50/70 font-semibold text-teal-900' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-slate-900">{u.display_name}</div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {u.id === 'user-priya-001' ? 'Holds B3-42 (Upper) • Wants Lower' : u.id === 'user-rahul-002' ? 'Holds B3-19 (Lower) • Wants Upper' : 'Holds C2-14 (Aisle) • Wants Window'}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-3.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Info className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Prototypes only. Real auth is off-chain.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Monad Wallet Action (Optional) */}
            <button
              type="button"
              onClick={handleWalletClick}
              disabled={connecting}
              aria-label={wallet.isConnected ? `Connected: ${wallet.address}` : 'Connect Monad Wallet (Optional)'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                wallet.isConnected
                  ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                  : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              {connecting ? (
                'Connecting...'
              ) : wallet.isConnected ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                </span>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4">
          <nav className="space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium min-h-[44px] ${
                    active
                      ? 'text-teal-700 bg-teal-50 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-teal-600" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Demo Persona Switcher on Mobile */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Demo Passenger Persona
              </span>
              <span className="text-[10px] text-slate-400">Mutual consent testing</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {availableUsers.map((u) => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      switchUser(u.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium min-h-[44px] ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 border border-teal-200 font-semibold'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-left">
                      <div>{u.display_name}</div>
                      <div className="text-[10px] text-slate-400">
                        {u.id === 'user-priya-001' ? 'Coach B3-42 (Upper)' : u.id === 'user-rahul-002' ? 'Coach B3-19 (Lower)' : 'Coach C2-14 (Aisle)'}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet in Mobile */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleWalletClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-slate-900 text-white min-h-[44px]"
            >
              <Wallet className="w-4 h-4" />
              {wallet.isConnected
                ? `Connected (${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)})`
                : 'Connect Monad Wallet (Optional)'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
