/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Menu,
  X,
  Boxes,
  Cpu,
  Coins,
  Network,
  Smartphone,
  BookOpen,
  Binary,
  Terminal,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'pipeline' | 'utxo' | 'network' | 'spv' | 'labs' | 'hashlab' | 'api';
  setActiveTab: (tab: 'dashboard' | 'pipeline' | 'utxo' | 'network' | 'spv' | 'labs' | 'hashlab' | 'api') => void;
  onResetSimulation: () => void;
  chainValid: boolean;
  totalBlocks: number;
}

const NAV_ITEMS: {
  id: 'dashboard' | 'pipeline' | 'utxo' | 'network' | 'spv' | 'labs' | 'hashlab' | 'api';
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}[] = [
  { id: 'dashboard', label: 'Core Ledger', shortLabel: 'Ledger', icon: <Boxes className="w-3.5 h-3.5" /> },
  { id: 'pipeline', label: 'Block Creation Pipeline', shortLabel: 'Pipeline', icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: 'utxo', label: 'UTXO & Double-Spend', shortLabel: 'UTXO', icon: <Coins className="w-3.5 h-3.5" /> },
  { id: 'network', label: 'P2P & Consensus Forks', shortLabel: 'P2P Network', icon: <Network className="w-3.5 h-3.5" /> },
  { id: 'spv', label: 'SPV Light Proofs', shortLabel: 'SPV Proofs', icon: <Smartphone className="w-3.5 h-3.5" /> },
  { id: 'labs', label: 'Whitepaper Labs', shortLabel: 'Labs', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: 'hashlab', label: 'SHA-256', shortLabel: 'SHA-256', icon: <Binary className="w-3.5 h-3.5" /> },
  { id: 'api', label: 'APIs', shortLabel: 'APIs', icon: <Terminal className="w-3.5 h-3.5" /> },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onResetSimulation,
  chainValid,
  totalBlocks,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectTab = (tab: HeaderProps['activeTab']) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand title wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg select-none">
              ₿
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
                Bitcoin-VisualCore
              </span>
              <span className="text-[11px] text-slate-400 whitespace-nowrap hidden sm:block">
                Educational Architecture Simulator
              </span>
            </div>
          </div>

          {/* Zone 2: Desktop Navigation tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-medium">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary action, status & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className={`inline-flex items-center gap-1.5 ${chainValid ? 'text-emerald-400' : 'text-rose-400 font-semibold'}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {chainValid ? 'Chain Intact' : 'Tampered Chain'}
              </span>
              <span className="text-slate-600">·</span>
              <span>Height #{totalBlocks - 1}</span>
            </div>

            <button
              onClick={onResetSimulation}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              title="Reset blockchain state to Genesis Block"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset State</span>
            </button>

            {/* Mobile Hamburger Button (Visible on < lg screens) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Tab Bar (Always visible on mobile/tablet for instant 1-tap switching) */}
      <div className="lg:hidden border-t border-slate-800/80 bg-slate-900/90 px-3 py-2 overflow-x-auto scrollbar-none flex items-center gap-1.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Expanded Mobile Menu Drawer (when hamburger icon is clicked) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-2 animate-in fade-in duration-150">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider px-2 mb-1">
            All Blockchain Panels & Modules
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400 font-semibold'
                      : 'bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center ${
                      isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{item.label}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono px-2">
            <span className={chainValid ? 'text-emerald-400' : 'text-rose-400'}>
              {chainValid ? '● Chain Valid' : '▲ Tamper Detected'}
            </span>
            <span>Blocks: #{totalBlocks - 1}</span>
          </div>
        </div>
      )}
    </header>
  );
};
