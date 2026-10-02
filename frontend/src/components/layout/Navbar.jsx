import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Layers, Activity, Sparkles } from 'lucide-react';

export const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'System Overview', path: '/' },
    { name: 'Notebooks', path: '/notebooks' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">StudyLM</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> v0.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium -mt-0.5">AI Study & Research Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Phase Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="px-3 py-1 bg-slate-800/80 border border-slate-700/60 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-300">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Phase 01: Foundation</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
