import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Package,
  Boxes,
  Users,
  CreditCard,
  Tag,
  Sparkles,
  Settings,
  Store,
  LogOut,
  ChevronRight,
  TrendingUp,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { usePWAInstall } from '../../hooks/usePWAInstall.js';
import { InstallAppModal } from '../common/InstallAppModal.js';
import { useState } from 'react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, activeBusiness, logout } = useAuth();
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      try {
        const ok = await install();
        if (!ok) setShowInstallModal(true);
      } catch {
        setShowInstallModal(true);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Billing / POS', icon: Receipt, highlight: true },
    { id: 'weekly-sales', label: 'Weekly Sales', icon: BarChart3 },
    { id: 'sales', label: 'Sales & Invoices', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'customers', label: 'Customers CRM', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'offers', label: 'Offers & Discounts', icon: Tag },
    { id: 'ai-assistant', label: 'Shopkeeper AI', icon: Sparkles, badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                BUSSINESS <span className="text-blue-400 text-xs px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-400/20 font-semibold">BILLING</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                {activeBusiness?.name || 'Smart Retail System'}
              </p>
            </div>
          </div>
        </div>

        {/* Business Selector Pill */}
        <div className="px-4 py-3 border-b border-slate-800/50 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />
              <span className="font-medium text-slate-200 truncate max-w-[140px]">
                {activeBusiness?.name || 'Dubai Mini Mart'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {activeBusiness?.category || 'Retail'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : item.highlight
                    ? 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 border border-blue-800/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {item.highlight && !item.badge && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* PWA App Mode Card */}
        <div className="px-3 pb-2">
          {!isInstalled ? (
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border border-blue-700/40 text-left">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-blue-300 font-bold text-[11px]">
                  <Download className="w-3.5 h-3.5" />
                  <span>Bussiness Billing App</span>
                </div>
                <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded font-semibold">PWA</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight mb-2.5">
                Install as a standalone app on PC, Mac, Android, iPhone or Tablet with offline billing.
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 active:scale-95"
                >
                  <Download className="w-3 h-3" />
                  <span>Install App</span>
                </button>
                <button
                  onClick={() => setShowInstallModal(true)}
                  className="py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all"
                  title="View PC, iPhone & Play Store installation instructions"
                >
                  Guide
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px]">Native App Active</span>
            </div>
          )}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Shop Owner'}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role || 'Owner'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <InstallAppModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
    </>
  );
};
