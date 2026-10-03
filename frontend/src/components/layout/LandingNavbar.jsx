import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Activity,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { BrandLogo } from '../common/BrandLogo';

export const LandingNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F3]/90 backdrop-blur-md border-b border-[#E5E1D7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <BrandLogo size="md" className="group-hover:scale-105 transition-transform" />
            <span className="text-[10px] font-semibold bg-[#E8F2EE] text-[#1F5E4B] px-2 py-0.5 rounded-full border border-[#D8E9E2] hidden sm:inline-block">
              AI Studio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5B6660]">
            <a href="#how-it-works" className="hover:text-[#141F1A] transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-[#141F1A] transition-colors">Capabilities</a>
            <a href="#workspace-preview" className="hover:text-[#141F1A] transition-colors">Workspace Preview</a>
            <a href="#study-tools" className="hover:text-[#141F1A] transition-colors">Study Tools</a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/health">
              <Button variant="ghost" size="sm" leftIcon={Activity}>
                Diagnostics
              </Button>
            </Link>

            {isAuthenticated ? (
              <Link to="/dashboard" className="flex items-center gap-2">
                <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                  Open Workspace
                </Button>
                <Avatar name={user?.name} size="sm" status="online" />
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm" leftIcon={LogIn}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" rightIcon={ArrowRight}>
                    Create Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[#6B756F] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-xl"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="sm:hidden px-4 pt-2 pb-6 bg-[#F7F8F6] border-b border-[#E2E7E3] space-y-3">
          <nav className="flex flex-col gap-2 text-sm font-medium text-[#6B756F]">
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white hover:text-[#17211D]"
            >
              How It Works
            </a>
            <a
              href="#capabilities"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white hover:text-[#17211D]"
            >
              Capabilities
            </a>
            <a
              href="#workspace-preview"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white hover:text-[#17211D]"
            >
              Workspace Preview
            </a>
            <a
              href="#study-tools"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white hover:text-[#17211D]"
            >
              Study Tools
            </a>
            <Link
              to="/health"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-white hover:text-[#17211D] flex items-center gap-2"
            >
              <Activity className="w-4 h-4 text-[#1F5E4B]" />
              Diagnostics
            </Link>
          </nav>

          <div className="pt-2 flex flex-col gap-2">
            {isAuthenticated ? (
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                <Button variant="primary" size="md" className="w-full" rightIcon={ArrowRight}>
                  Open Workspace ({user?.name})
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="md" className="w-full" leftIcon={LogIn}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" className="w-full" rightIcon={ArrowRight}>
                    Create Free Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
