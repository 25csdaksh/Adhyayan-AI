import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Sparkles,
  BookOpen,
  Menu,
  X,
  Activity,
  Plus,
  Settings,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AppNavbar = ({
  onOpenMobileSidebar,
  onOpenCreateNotebook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('You have been logged out successfully.', 'Signed Out');
    navigate('/', { replace: true });
  };

  const displayName = user?.name || 'Researcher';
  const displayEmail = user?.email || '';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Mobile Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
            <BrandLogo size="sm" className="hover:scale-105 transition-transform" />
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notebooks, sources, notes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all"
            />
          </div>
        </form>

        {/* Right: Actions, Notifications, & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenCreateNotebook && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={Plus}
              onClick={onOpenCreateNotebook}
              className="hidden sm:inline-flex"
            >
              New Notebook
            </Button>
          )}

          {/* Notifications Dropdown */}
          <Dropdown
            align="right"
            trigger={
              <button
                type="button"
                className="relative p-2 text-[#6B756F] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-xl transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D6A84F]" />
              </button>
            }
          >
            <div className="px-4 py-3 border-b border-[#EDF1EE]">
              <p className="text-xs font-bold text-[#17211D]">Notifications</p>
              <p className="text-[11px] text-[#6B756F]">Your study activity &amp; updates</p>
            </div>
            <div className="p-3 text-xs space-y-2">
              <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#E2E7E3]">
                <p className="font-semibold text-[#17211D]">Secure Session Active</p>
                <p className="text-[11px] text-[#6B756F]">Logged in as {displayEmail}</p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#E2E7E3]">
                <p className="font-semibold text-[#17211D]">Source Indexed</p>
                <p className="text-[11px] text-[#6B756F]">Computer Networks ready for Q&amp;A</p>
              </div>
            </div>
          </Dropdown>

          {/* User Profile Menu */}
          <Dropdown
            align="right"
            trigger={
              <div className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-[#F2F5F3] transition-colors cursor-pointer border border-transparent hover:border-[#E2E7E3]">
                <Avatar name={displayName} src={user?.avatar} size="sm" status="online" />
                <span className="hidden md:inline text-xs font-semibold text-[#17211D] max-w-[120px] truncate">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8E9993] hidden md:inline" />
              </div>
            }
          >
            <div className="px-4 py-3 border-b border-[#EDF1EE]">
              <p className="text-xs font-bold text-[#17211D] truncate">{displayName}</p>
              <p className="text-[11px] text-[#6B756F] truncate">{displayEmail}</p>
            </div>
            <DropdownItem icon={User} onClick={() => navigate('/profile')}>
              My Profile
            </DropdownItem>
            <DropdownItem icon={Settings} onClick={() => navigate('/settings')}>
              Settings &amp; AI Preferences
            </DropdownItem>
            <DropdownItem icon={Activity} onClick={() => navigate('/health')}>
              API System Diagnostics
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem icon={LogOut} danger onClick={handleLogout}>
              Sign Out
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};
