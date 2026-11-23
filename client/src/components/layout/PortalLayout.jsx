import React, { useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import {
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Building2,
  Truck,
  Car,
  ShieldAlert,
  Menu,
  X,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import Button from '../ui/Button.jsx';
import NotificationBell from '../../features/notifications/NotificationBell.jsx';

/**
 * DRIVAIR Global Application Shell (readme1.md Section 3)
 * - Deep Onyx (#0A0A0A) background
 * - Desktop: Left sidebar rail (256px) with Cyber Yellow active pill
 * - Mobile: Top brand bar + Bottom navigation bar (up to 4-5 items) + Drawer for overflow
 */
export default function PortalLayout({
  title,
  allowedRole,
  tabs = [],
  activeTab = '',
  onTabChange = () => {},
  children,
}) {
  const { user, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'company':
        return Building2;
      case 'driver':
        return Truck;
      case 'vehicleOwner':
        return Car;
      case 'admin':
        return ShieldAlert;
      default:
        return UserIcon;
    }
  };

  const RoleIcon = getRoleIcon();

  // Bottom navigation shows top 4 primary tabs; remaining go into "More" drawer
  const primaryMobileTabs = tabs.slice(0, 4);
  const overflowMobileTabs = tabs.slice(4);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#FDE047] selection:text-[#0A0A0A]">
      {/* ============================================================ */}
      {/* 1. DESKTOP & MOBILE TOP BAR                                   */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#FDE047] flex items-center justify-center text-[#0A0A0A] font-black text-xl shadow-md shadow-yellow-500/10">
                D
              </div>
              <span className="text-xl font-black text-white tracking-tight">DRIVAIR</span>
            </div>
            <div className="h-4 w-px bg-white/15 hidden sm:block" />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-[#171717] text-[#FDE047] font-bold border border-white/10 uppercase tracking-wider">
              <RoleIcon size={13} />
              {allowedRole} Portal
            </span>
          </div>

          {/* Desktop Right Header Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <NotificationBell onNavigateTab={onTabChange} />

            <div className="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-[#171717] border border-white/10">
              <div className="w-7 h-7 rounded-full bg-[#FDE047] text-[#0A0A0A] flex items-center justify-center text-xs font-black">
                {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
              </div>
              <div className="text-left pr-2">
                <p className="text-xs font-bold text-white leading-none">
                  {user?.fullName || user?.email || 'User'}
                </p>
                <p className="text-[10px] text-[#B8B8B8] capitalize mt-0.5">{user?.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center space-x-1.5 text-xs text-[#B8B8B8] hover:text-[#EF4444] font-semibold px-3 py-1.5 rounded-full border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 transition cursor-pointer"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile Drawer Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <NotificationBell onNavigateTab={onTabChange} />
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2.5 rounded-xl text-[#B8B8B8] hover:text-white bg-[#171717] border border-white/10 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. MAIN WORKSPACE WITH DESKTOP SIDEBAR                        */}
      {/* ============================================================ */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Left Sidebar Rail (256px wide per spec Section 3) */}
        {tabs.length > 0 && (
          <aside className="hidden lg:block w-64 shrink-0 py-8 pr-6 border-r border-white/10">
            <div className="sticky top-24 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#858585] px-3 block mb-3">
                Operations Menu
              </span>
              <nav className="space-y-1.5">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#FDE047] text-[#0A0A0A] font-extrabold shadow-sm'
                          : 'text-[#B8B8B8] hover:text-white hover:bg-[#171717]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {Icon && <Icon size={17} />}
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge !== undefined && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-[#0A0A0A] text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-8 mt-8 border-t border-white/10 px-3 space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#171717] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-[#FDE047] uppercase tracking-wider block">
                    SLA Guarantee
                  </span>
                  <p className="text-[11px] text-[#B8B8B8] leading-relaxed">
                    Direct contracts protected by canonical automated numbering & paise precision.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 pb-24 lg:pb-12">
          {/* Workspace Title & Context */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-[#B8B8B8] mt-1">
                DRIVAIR Verified Transport Command · {allowedRole} Portal
              </p>
            </div>
          </div>

          {/* Child Feature Views */}
          {children}
        </main>
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE BOTTOM NAVIGATION (readme1.md Section 3 Mobile)     */}
      {/* ============================================================ */}
      {tabs.length > 0 && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#171717]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
          {primaryMobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition cursor-pointer min-h-[44px] ${
                  isActive ? 'text-[#FDE047]' : 'text-[#858585] hover:text-[#B8B8B8]'
                }`}
              >
                {Icon && <Icon size={20} className={isActive ? 'scale-110' : ''} />}
                <span className="text-[10px] font-bold mt-1 truncate max-w-[64px]">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {overflowMobileTabs.length > 0 && (
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-[#858585] hover:text-[#B8B8B8] min-h-[44px]"
            >
              <MoreHorizontal size={20} />
              <span className="text-[10px] font-bold mt-1">More</span>
            </button>
          )}
        </nav>
      )}

      {/* ============================================================ */}
      {/* 4. MOBILE SLIDE-OVER DRAWER FOR OVERFLOW DESTINATIONS         */}
      {/* ============================================================ */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-[#171717] border-l border-white/10 h-full p-6 flex flex-col justify-between z-10 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <p className="text-sm font-black text-white">{user?.fullName || user?.email}</p>
                  <span className="text-[10px] font-bold uppercase text-[#FDE047]">
                    {allowedRole} Portal
                  </span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-2 text-[#858585] hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#858585] px-2 block mb-2">
                  All Destinations
                </span>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#FDE047] text-[#0A0A0A]'
                          : 'text-[#B8B8B8] hover:text-white hover:bg-[#202020]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {Icon && <Icon size={16} />}
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight size={14} className="opacity-50" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={logout}
                className="w-full py-3 bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] rounded-full text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
