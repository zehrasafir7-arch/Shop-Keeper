import React, { useState } from 'react';
import {
  Settings,
  Store,
  Building2,
  MapPin,
  Phone,
  Mail,
  Coins,
  Percent,
  Receipt,
  Plus,
  CheckCircle2,
  Layers,
  UserCheck,
  ShieldCheck,
  Download,
  Trash2,
  Key,
  Database,
  ExternalLink,
  Cloud,
  UploadCloud,
  Server,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../components/common/Toast.js';
import { SupabaseConfigModal } from '../../components/common/SupabaseConfigModal.js';
import { isSupabaseConfigured, getSupabaseCredentials } from '../../lib/supabase.js';
import type { BusinessCategory } from '../../types/index.js';

export const SettingsPage: React.FC = () => {
  const {
    user,
    activeBusiness,
    businesses,
    updateActiveBusiness,
    switchBusiness,
    savedAccounts,
    removeSavedAccount,
    clearAllSavedAccounts,
  } = useAuth();
  const { showToast } = useToast();

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [supabaseModalTab, setSupabaseModalTab] = useState<'connection' | 'migration' | 'sql'>('connection');
  const supaConfigured = isSupabaseConfigured();
  const { url: supaUrl } = getSupabaseCredentials();

  const [name, setName] = useState(activeBusiness?.name || '');
  const [address, setAddress] = useState(activeBusiness?.address || '');
  const [phone, setPhone] = useState(activeBusiness?.phone || '');
  const [email, setEmail] = useState(activeBusiness?.email || '');
  const [taxName, setTaxName] = useState(activeBusiness?.taxName || 'VAT');
  const [taxRate, setTaxRate] = useState(activeBusiness?.taxRate || 5);
  const [taxInclusive, setTaxInclusive] = useState(activeBusiness?.taxInclusive ?? true);
  const [invoicePrefix, setInvoicePrefix] = useState(activeBusiness?.invoicePrefix || 'INV-');
  const [footerNote, setFooterNote] = useState(activeBusiness?.invoiceFooterNote || '');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New business modal
  const [isNewBizOpen, setIsNewBizOpen] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizCategory, setNewBizCategory] = useState<BusinessCategory>('clothing');
  const [newBizCurrency, setNewBizCurrency] = useState('AED');
  const [isCreatingBiz, setIsCreatingBiz] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);
    try {
      await updateActiveBusiness({
        name,
        address,
        phone,
        email,
        taxName,
        taxRate: Number(taxRate),
        taxInclusive,
        invoicePrefix,
        invoiceFooterNote: footerNote,
      });
      setSavedSuccess(true);
      showToast('Store settings saved successfully!', 'success');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName) return;
    setIsCreatingBiz(true);
    try {
      const created = await api.createBusiness({
        name: newBizName,
        category: newBizCategory,
        currency: newBizCurrency,
      });
      await switchBusiness(created.id);
      setIsNewBizOpen(false);
      setNewBizName('');
      showToast(`Switched to new shop: ${created.name}`, 'success');
    } catch (e) {
      showToast('Failed to register additional business', 'error');
    } finally {
      setIsCreatingBiz(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Store Configuration</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Shop Settings & Multi-Branch</h1>
          <p className="text-xs text-slate-500">
            Configure receipt headers, taxes, currency symbols, and manage multiple business branches.
          </p>
        </div>

        <button
          onClick={() => setIsNewBizOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register Another Shop</span>
        </button>
      </div>

      {/* Multi-Business Tenant Switcher (Section 44) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Your Registered Businesses (Multi-Tenant SaaS)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Each business maintains completely isolated inventory, sales, customers, and ledger records.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {businesses.map((biz) => {
            const isCurrent = biz.id === activeBusiness?.id;
            return (
              <div
                key={biz.id}
                onClick={() => !isCurrent && switchBusiness(biz.id)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900">{biz.name}</h4>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                  {biz.category} • {biz.currency}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                    Plan: {biz.plan}
                  </span>
                  {!isCurrent && (
                    <span className="text-[10px] text-blue-600 font-semibold hover:underline">
                      Switch to this shop →
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Store settings successfully updated!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Prefix</label>
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Store Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tax System</label>
            <select
              value={taxName}
              onChange={(e) => setTaxName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="GST">GST</option>
              <option value="VAT">VAT</option>
              <option value="Sales Tax">Sales Tax</option>
              <option value="None">None</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Default Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Footer Note</label>
            <input
              type="text"
              value={footerNote}
              onChange={(e) => setFooterNote(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Sign-In Account & Device Sessions Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Sign-In Account & Device Sessions</h3>
              <p className="text-xs text-slate-500">
                Manage your credentials, offline access, and saved accounts on this device
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const accountExport = {
                user,
                activeBusiness,
                businesses,
                exportedAt: new Date().toISOString(),
                app: 'Bussiness Billing',
              };
              const blob = new Blob([JSON.stringify(accountExport, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `BussinessBilling_Account_${user?.email || 'backup'}.json`;
              a.click();
              URL.revokeObjectURL(url);
              showToast('Account details backup downloaded!', 'success');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Account Backup</span>
          </button>
        </div>

        {/* Current Active Account Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Signed In User
            </span>
            <p className="font-bold text-slate-800 text-sm truncate">{user?.name || 'Shop Owner'}</p>
            <p className="text-slate-500 truncate">{user?.email}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Assigned Role
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] capitalize">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>{user?.role || 'Owner'}</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Active Store Profile
            </span>
            <p className="font-bold text-slate-800 truncate">{activeBusiness?.name || 'Dubai Mini Mart'}</p>
            <p className="text-slate-500 capitalize">{activeBusiness?.category} • {activeBusiness?.currency}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Device Session Status
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Saved & Persistent</span>
            </span>
          </div>
        </div>

        {/* Saved Accounts on this Device */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-600" />
              <span>Saved Accounts for 1-Click Sign-In ({savedAccounts.length})</span>
            </h4>
            {savedAccounts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear all saved accounts from this device?')) {
                    clearAllSavedAccounts();
                    showToast('Saved accounts removed from this browser', 'info');
                  }
                }}
                className="text-[11px] text-rose-600 hover:text-rose-700 font-medium"
              >
                Clear all saved accounts
              </button>
            )}
          </div>

          {savedAccounts.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              No additional accounts saved on this device. When you log in with "Remember me", accounts are stored here.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedAccounts.map((acc) => (
                <div
                  key={acc.email}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 uppercase border border-blue-200">
                      {acc.name?.[0] || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 truncate">{acc.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{acc.email}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{acc.businessName} • {acc.role}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      removeSavedAccount(acc.email);
                      showToast(`Removed ${acc.name} from saved accounts`, 'info');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove from device"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Supabase Cloud PostgreSQL & Data Migration Card */}
        <div className="p-4 rounded-xl border bg-gradient-to-r from-emerald-50/60 to-blue-50/60 border-emerald-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Supabase PostgreSQL Cloud Database</span>
                  <span
                    className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-extrabold ${
                      supaConfigured
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {supaConfigured ? 'Connected' : 'Setup Required'}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  {supaConfigured
                    ? `Primary Source of Truth: ${new URL(supaUrl).hostname}`
                    : 'Currently using local browser storage. Connect Supabase for multi-user cloud sync.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSupabaseModalTab('migration');
                  setIsSupabaseModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Migrate Data to Cloud</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSupabaseModalTab('connection');
                  setIsSupabaseModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
              >
                Configure
              </button>

              <button
                type="button"
                onClick={() => {
                  setSupabaseModalTab('sql');
                  setIsSupabaseModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
              >
                SQL Schema
              </button>
            </div>
          </div>
        </div>

        {/* Netlify Deployment Notice */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
          <Database className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-900 mb-0.5">Netlify Hosting & Standalone PWA Architecture</p>
            <p>
              Your store data and account details are safely cached in browser local storage. When you deploy to Netlify, SPA redirects (<code>netlify.toml</code> and <code>_redirects</code>) ensure smooth page refreshes and uninterrupted cashier checkout even without a server container.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Register Additional Business */}
      <Modal
        isOpen={isNewBizOpen}
        onClose={() => setIsNewBizOpen(false)}
        title="Register Another Business"
        subtitle="Create a new store profile under your account"
        maxWidth="md"
      >
        <form onSubmit={handleCreateBusiness} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Store Name *</label>
            <input
              type="text"
              value={newBizName}
              onChange={(e) => setNewBizName(e.target.value)}
              placeholder="e.g. Dubai Perfumes & Oud"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={newBizCategory}
              onChange={(e) => setNewBizCategory(e.target.value as BusinessCategory)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            >
              <option value="clothing">Clothing / Apparel</option>
              <option value="electronics">Electronics / Mobiles</option>
              <option value="grocery">Grocery / Mart</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="restaurant">Restaurant / Cafe</option>
              <option value="salon">Salon / Spa</option>
              <option value="garage">Garage / Workshop</option>
              <option value="retail">General Retail</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
            <select
              value={newBizCurrency}
              onChange={(e) => setNewBizCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
            >
              <option value="AED">AED (AED)</option>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewBizOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingBiz}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-60"
            >
              {isCreatingBiz ? 'Creating...' : 'Create Business'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Supabase Cloud Connection & Migration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        defaultTab={supabaseModalTab}
      />
    </div>
  );
};
