import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Plus,
  Receipt,
  Store,
  RotateCcw,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { PWAInstallButton } from '../common/PWAInstallButton.js';
import { OfflineSyncBadge } from '../common/OfflineSyncBadge.js';
import { SupabaseStatusBadge } from '../common/SupabaseStatusBadge.js';
import { useToast } from '../common/Toast.js';
import type { AppNotification } from '../../types/index.js';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNavigateTab: (tab: string) => void;
  notifications: AppNotification[];
  onRefreshData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onNavigateTab,
  notifications,
  onRefreshData,
}) => {
  const { activeBusiness, businesses, switchBusiness } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showBizDropdown, setShowBizDropdown] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const { showToast } = useToast();

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      await api.resetDemoSeed();
      onRefreshData();
      showToast('Dubai Mini Mart demo data has been restored!', 'success');
    } catch (e) {
      showToast('Failed to reset demo data', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const currentDateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button & Business Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Business Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowBizDropdown(!showBizDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {activeBusiness?.name || 'Dubai Mini Mart'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Main Branch • {activeBusiness?.currency || 'AED'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {showBizDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase">
                  Your Businesses
                </div>
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      switchBusiness(b.id);
                      setShowBizDropdown(false);
                      onRefreshData();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-slate-50 ${
                      b.id === activeBusiness?.id ? 'text-blue-600 font-semibold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{b.name}</p>
                      <p className="text-[10px] text-slate-400">{b.category} • {b.currency}</p>
                    </div>
                    {b.id === activeBusiness?.id && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
                <div className="border-t border-slate-100 pt-1 mt-1">
                  <button
                    onClick={() => {
                      setShowBizDropdown(false);
                      onNavigateTab('settings');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Register Another Business
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-2.5 text-xs text-slate-500 border-l border-slate-200 pl-3">
            <SupabaseStatusBadge />
            <OfflineSyncBadge onSyncComplete={onRefreshData} />
            <span className="text-slate-300">•</span>
            <span>{currentDateStr}</span>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button */}
          <PWAInstallButton variant="header" label="Install App" />

          {/* Quick Demo Reset */}
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            title="Reset demo data to initial state"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-blue-600' : ''}`} />
            <span className="hidden xl:inline">Reset Demo</span>
          </button>

          {/* AI Assistant Quick Button */}
          <button
            onClick={() => onNavigateTab('ai-assistant')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-blue-700 hover:bg-blue-100/60 transition-colors text-xs font-semibold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Shopkeeper AI</span>
          </button>

          {/* New Bill Button (Most Important Action) */}
          <button
            onClick={() => onNavigateTab('billing')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95"
          >
            <Receipt className="w-4 h-4" />
            <span>+ New Bill</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors relative"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Notifications ({notifications.length})
                  </h4>
                  <span className="text-[11px] text-blue-600 font-medium">Alerts</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No new notifications right now.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-xs transition-colors hover:bg-slate-50 flex items-start gap-2.5 ${
                          !notif.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="mt-0.5">
                          {notif.type === 'LOW_STOCK' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{notif.title}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">{notif.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
