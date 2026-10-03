import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Activity, Sparkles } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

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
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo size="md" className="group-hover:scale-105 transition-transform" />
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
