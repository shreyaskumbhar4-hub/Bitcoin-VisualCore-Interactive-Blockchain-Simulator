/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LEARNING_MODULES } from '../core/learningLabs';
import { BookOpen, CheckCircle, ArrowRight, Sparkles, Terminal } from 'lucide-react';

interface StudentLabGuideProps {
  onNavigateToTab: (tab: 'dashboard' | 'network' | 'hashlab' | 'api') => void;
}

export const StudentLabGuide: React.FC<StudentLabGuideProps> = ({ onNavigateToTab }) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(LEARNING_MODULES[0].id);
  const [completedLabs, setCompletedLabs] = useState<Record<string, boolean>>({});

  const activeModule =
    LEARNING_MODULES.find((m) => m.id === selectedModuleId) || LEARNING_MODULES[0];

  const toggleComplete = (id: string) => {
    setCompletedLabs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAction = () => {
    toggleComplete(activeModule.id);
    if (activeModule.interactiveChallenge.targetTab === 'hashlab') {
      onNavigateToTab('hashlab');
    } else if (activeModule.interactiveChallenge.targetTab === 'network') {
      onNavigateToTab('network');
    } else {
      onNavigateToTab('dashboard');
    }
  };

  const completedCount = Object.values(completedLabs).filter(Boolean).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Interactive Student Labs & Whitepaper Curriculum
            </h2>
            <p className="text-xs text-slate-400">
              Grounded directly in Satoshi Nakamoto's original 2008 architecture
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400">
          <span>Labs Completed:</span>{' '}
          <span className="text-amber-400 font-bold">
            {completedCount} / {LEARNING_MODULES.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module Sidebar */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Curriculum Modules:
          </label>
          {LEARNING_MODULES.map((mod, index) => {
            const isCompleted = completedLabs[mod.id];
            const isSelected = selectedModuleId === mod.id;

            return (
              <button
                key={mod.id}
                onClick={() => setSelectedModuleId(mod.id)}
                className={`w-full text-left p-2.5 rounded-md transition-all text-xs flex items-center justify-between border ${
                  isSelected
                    ? 'bg-slate-800 border-amber-500/50 text-amber-400 font-semibold'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Lab {index + 1}
                  </div>
                  <div className="truncate font-medium">{mod.title.split('. ')[1] || mod.title}</div>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(mod.id);
                  }}
                  className="cursor-pointer"
                >
                  <CheckCircle
                    className={`w-4 h-4 transition-colors ${
                      isCompleted ? 'text-emerald-400 fill-emerald-400/20' : 'text-slate-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Module Content */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-amber-400 font-bold text-sm">
                {activeModule.title}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {activeModule.whitepaperSection}
              </span>
            </div>

            {/* Satoshi Whitepaper Excerpt */}
            <div className="p-3 bg-slate-900/80 rounded border-l-2 border-amber-500 text-xs italic text-slate-300 leading-relaxed font-serif">
              "{activeModule.whitepaperExcerpt}"
              <span className="block mt-1 text-[10px] text-slate-500 font-sans not-italic font-mono">
                — Satoshi Nakamoto, Bitcoin: A Peer-to-Peer Electronic Cash System (2008)
              </span>
            </div>

            {/* Concept Explanation */}
            <div>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wide mb-1 font-sans">
                Core Conceptual Breakdown:
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeModule.explanation}
              </p>
            </div>

            {/* Hands-on Interactive Challenge */}
            <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-lg">
              <span className="text-amber-400 font-semibold text-xs flex items-center gap-1.5 mb-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Hands-on Student Task:</span>
              </span>
              <p className="text-xs text-slate-200 mb-3 leading-relaxed">
                {activeModule.interactiveChallenge.instruction}
              </p>

              <button
                onClick={handleAction}
                className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-md transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>{activeModule.interactiveChallenge.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
