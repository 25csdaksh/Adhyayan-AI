import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Sparkles, Terminal, Heart } from 'lucide-react';

export const LandingFooter = () => {
  return (
    <footer className="bg-white border-t border-[#E2E7E3] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-2 max-w-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1F5E4B] text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-[#17211D]">StudyLM</span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B756F] leading-relaxed">
              A modern, NotebookLM-style AI study and research platform grounded strictly in your personal textbooks, lecture slides, research papers, and web sources.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#1F5E4B] font-semibold pt-1">
              <Shield className="w-4 h-4" /> Academic Integrity &amp; Strict Source Grounding
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17211D]">Product</h4>
            <ul className="space-y-2 text-xs text-[#6B756F]">
              <li><Link to="/dashboard" className="hover:text-[#1F5E4B] transition-colors">Notebooks Dashboard</Link></li>
              <li><Link to="/notebooks/cn-unit-1" className="hover:text-[#1F5E4B] transition-colors">Interactive Workspace</Link></li>
              <li><Link to="/settings" className="hover:text-[#1F5E4B] transition-colors">Settings &amp; Preferences</Link></li>
              <li><Link to="/profile" className="hover:text-[#1F5E4B] transition-colors">User Profile</Link></li>
            </ul>
          </div>

          {/* Foundation & Diagnostics */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#17211D]">Engineering</h4>
            <ul className="space-y-2 text-xs text-[#6B756F]">
              <li><Link to="/health" className="hover:text-[#1F5E4B] transition-colors flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> API Health Check</Link></li>
              <li><span className="text-[#8E9993]">Phase 01: Architecture Ready</span></li>
              <li><span className="text-[#8E9993]">Phase 02: Design System Active</span></li>
              <li><span className="text-[#8E9993]">Phase 03: Document Ingestion (Upcoming)</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#EDF1EE] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E9993]">
          <p>© {new Date().getFullYear()} StudyLM. Designed with academic rigor.</p>
          <div className="flex items-center gap-6">
            <span>React 19 • Vite • Tailwind CSS v4</span>
            <Link to="/health" className="text-[#1F5E4B] font-medium hover:underline">
              System Diagnostics
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
