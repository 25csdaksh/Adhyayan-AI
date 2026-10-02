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
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Dropdown, DropdownItem, DropdownDivider } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { MOCK_USER } from '../../mock/mockData';

export const AppNavbar = ({
  onOpenMobileSidebar,
  onOpenCreateNotebook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E7E3] h-16">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumb Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-[#6B756F] hover:text-[#17211D] hover:bg-[#F2F5F3] rounded-xl cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1F5E4B] text-white flex items-center justify-center shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-[#17211D] tracking-tight">StudyLM</span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#8E9993] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notebooks, sources, notes..."
              className="w-full bg-[#F7F8F6] border border-[#E2E7E3] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#17211D] placeholder:text-[#8E9993] focus:bg-white focus:border-[#1F5E4B] focus:outline-none transition-all"
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
                <p className="font-semibold text-[#17211D]">Source Indexed</p>
                <p className="text-[11px] text-[#6B756F]">Kurose_Ross_Ch1-4.pdf ready for Q&amp;A</p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAFBF9] border border-[#E2E7E3]">
                <p className="font-semibold text-[#17211D]">Quiz Generated</p>
                <p className="text-[11px] text-[#6B756F]">3 new questions created for Computer Networks</p>
              </div>
            </div>
          </Dropdown>

          {/* User Profile Menu */}
          <Dropdown
            align="right"
            trigger={
              <div className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-[#F2F5F3] transition-colors cursor-pointer border border-transparent hover:border-[#E2E7E3]">
                <Avatar name={MOCK_USER.name} src={MOCK_USER.avatar} size="sm" status="online" />
                <span className="hidden md:inline text-xs font-semibold text-[#17211D]">{MOCK_USER.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8E9993] hidden md:inline" />
              </div>
            }
          >
            <div className="px-4 py-3 border-b border-[#EDF1EE]">
              <p className="text-xs font-bold text-[#17211D]">{MOCK_USER.fullName}</p>
              <p className="text-[11px] text-[#6B756F] truncate">{MOCK_USER.email}</p>
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
            <DropdownItem icon={LogOut} danger onClick={() => navigate('/')}>
              Switch to Public Landing
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};
