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
  ShieldCheck
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, availableUsers, switchUser, wallet, connectWallet } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
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
          {/* Logo */}
          <Link to="/" className="flex items-center" aria-label="RailMatte Home">
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-teal-700 bg-teal-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster: Passenger Persona Switcher & Wallet */}
          <div className="hidden md:flex items-center gap-3">
            {/* Passenger Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                title="Switch active passenger to test bilateral consent"
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span className="max-w-[120px] truncate">
                  {currentUser ? currentUser.display_name : 'Select Passenger'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Simulate Passenger Session
                  </div>
                  {availableUsers.map((u) => {
                    const isSelected = currentUser?.id === u.id;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          switchUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                          isSelected ? 'bg-teal-50/60 font-semibold text-teal-800' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-medium text-slate-800">{u.display_name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                      </button>
                    );
                  })}
                  <div className="px-3 pt-2 text-[10px] text-slate-400 border-t border-slate-100">
                    Switch between Priya and Rahul to test bilateral exchange consent in real-time.
                  </div>
                </div>
              )}
            </div>

            {/* Monad Wallet Action */}
            <button
              type="button"
              onClick={handleWalletClick}
              disabled={connecting}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                wallet.isConnected
                  ? 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
                  : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
              }`}
              title={wallet.isConnected ? `Connected: ${wallet.address}` : 'Connect Monad Testnet Wallet'}
            >
              <Wallet className="w-3.5 h-3.5" />
              {connecting ? (
                'Connecting...'
              ) : wallet.isConnected ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                  <span>{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
                </span>
              ) : (
                'Connect Wallet'
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                    active
                      ? 'text-teal-700 bg-teal-50 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5 text-teal-600" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Persona switcher in mobile */}
          <div className="pt-3 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 mb-2">Active Passenger</div>
            <div className="grid grid-cols-1 gap-1">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    switchUser(u.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                    currentUser?.id === u.id ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{u.display_name}</span>
                  {currentUser?.id === u.id && <Check className="w-4 h-4 text-teal-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Wallet in mobile */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleWalletClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium bg-slate-900 text-white"
            >
              <Wallet className="w-4 h-4" />
              {wallet.isConnected
                ? `Connected (${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)})`
                : 'Connect Monad Wallet'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
