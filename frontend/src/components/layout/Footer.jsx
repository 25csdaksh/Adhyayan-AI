import React from 'react';
import { Terminal, Shield, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-md py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Adhyayan-AI Architecture Foundation • Phase 01</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            React 19 + Express + MongoDB
          </span>
          <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Environment Protected
          </span>
        </div>
      </div>
    </footer>
  );
};
