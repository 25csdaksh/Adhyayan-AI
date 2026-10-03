import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  Settings,
  User,
  Plus,
  Activity,
  X,
  ShieldCheck,
} from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { BrandLogo } from '../common/BrandLogo';
import { notebookService } from '../../api/notebookService';
import { useAuth } from '../../context/AuthContext';

export const AppSidebar = ({
  mobileOpen = false,
  onCloseMobile,
  onOpenCreateNotebook,
}) => {
  const { user } = useAuth();
  const [recentNotebooks, setRecentNotebooks] = useState([]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Notebooks', path: '/dashboard?tab=all', icon: BookOpen },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  useEffect(() => {
    let isMounted = true;
    if (user) {
      notebookService
        .getNotebooks({ limit: 4 })
        .then((res) => {
          if (isMounted && res?.data?.notebooks) {
            setRecentNotebooks(res.data.notebooks);
          }
        })
        .catch(() => {
          // ignore or keep empty
        });
    } else {
      setRecentNotebooks([]);
    }
    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayName = user?.name || 'Researcher';
  const displayEmail = user?.email || '';

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 bg-white border-r border-slate-200/80 w-64 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2 pb-1">
          <Link to="/dashboard" className="flex items-center group py-1">
            <BrandLogo size="lg" className="h-10 sm:h-11 w-auto max-w-[195px] object-contain group-hover:scale-[1.03] transition-transform" />
          </Link>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Create Notebook CTA */}
        {onOpenCreateNotebook && (
          <Button
            variant="primary"
            size="md"
            className="w-full justify-start gap-2.5 shadow-xs"
            leftIcon={Plus}
            onClick={() => {
              onOpenCreateNotebook();
              onCloseMobile?.();
            }}
          >
            New Notebook
          </Button>
        )}

        {/* Primary Navigation */}
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-[#8E9993] mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#E8F2EE] text-[#1F5E4B] font-semibold'
                      : 'text-[#6B756F] hover:bg-[#F2F5F3] hover:text-[#17211D]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Recent Notebooks Quick Access */}
        <div className="space-y-1 pt-2">
          <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-[#8E9993] mb-2 flex items-center justify-between">
            <span>Recent Workspaces</span>
            <Clock className="w-3 h-3 text-[#8E9993]" />
          </p>
          {recentNotebooks.length > 0 ? (
            recentNotebooks.map((nb) => (
              <Link
                key={nb._id || nb.id}
                to={`/notebooks/${nb._id || nb.id}`}
                onClick={onCloseMobile}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs text-[#6B756F] hover:bg-[#F2F5F3] hover:text-[#17211D] transition-colors truncate group"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0 bg-[#1F5E4B]"
                />
                <span className="truncate group-hover:text-[#1F5E4B]">{nb.title}</span>
              </Link>
            ))
          ) : (
            <p className="px-3 py-1 text-[11px] text-[#8E9993] italic">No workspaces yet</p>
          )}
        </div>
      </div>

      {/* Bottom Area: User Profile & Diagnostics */}
      <div className="pt-4 border-t border-[#EDF1EE] space-y-2">
        <Link
          to="/health"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#6B756F] hover:bg-[#F2F5F3] hover:text-[#17211D] transition-colors"
        >
          <Activity className="w-4 h-4 text-[#1F5E4B]" />
          <span>API Health &amp; Diagnostics</span>
        </Link>

        <Link
          to="/profile"
          onClick={onCloseMobile}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F2F5F3] transition-colors group"
        >
          <Avatar src={user?.avatar} name={displayName} size="sm" status="online" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#17211D] group-hover:text-[#1F5E4B] transition-colors truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-[#8E9993] truncate">{displayEmail}</p>
          </div>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-[#17211D]/40 backdrop-blur-xs transition-opacity"
          />
          <div className="relative z-10 w-64 h-full animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
