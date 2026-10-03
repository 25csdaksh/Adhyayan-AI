import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, Terminal, Heart } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

export const LandingFooter = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2 max-w-sm">
            <div className="flex items-center">
              <BrandLogo size="lg" className="h-11 w-auto max-w-[210px] object-contain" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              A modern, NotebookLM-grade AI study and research platform grounded strictly in your personal textbooks, lecture slides, research papers, and web sources.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold pt-1">
              <Shield className="w-4 h-4 text-emerald-600" /> Academic Integrity &amp; Strict Source Grounding
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Product Studio</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link to="/dashboard" className="hover:text-emerald-700 transition-colors">Notebooks Dashboard</Link></li>
              <li><Link to="/notebooks/cn-unit-1" className="hover:text-emerald-700 transition-colors">Interactive Workspace</Link></li>
              <li><Link to="/settings" className="hover:text-emerald-700 transition-colors">Settings &amp; Preferences</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-700 transition-colors">User Profile</Link></li>
            </ul>
          </div>

          {/* Foundation & Diagnostics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">System &amp; Engine</h4>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li><Link to="/health" className="hover:text-emerald-700 transition-colors flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-emerald-600" /> API Diagnostics Probe</Link></li>
              <li><span className="text-slate-400">Gemini 3.5 Flash Active</span></li>
              <li><span className="text-slate-400">Zero Hallucination Grounding</span></li>
              <li><span className="text-slate-400">Private Vector Indices</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AdhyayanLM. All rights reserved. Designed with academic rigor.</p>
          <div className="flex items-center gap-6">
            <span className="font-mono text-slate-400">React 19 • Vite • Tailwind CSS</span>
            <Link to="/health" className="text-emerald-700 font-semibold hover:underline">
              System Diagnostics
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
