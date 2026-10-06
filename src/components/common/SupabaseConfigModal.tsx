import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  Key,
  ArrowRight,
  UploadCloud,
  Check,
} from 'lucide-react';
import { Modal } from './Modal.js';
import {
  getSupabaseCredentials,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
} from '../../lib/supabase.js';
import { supabaseDb } from '../../lib/supabaseDb.js';
import { localDb } from '../../lib/localDb.js';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from './Toast.js';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'connection' | 'migration' | 'sql';
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'connection',
}) => {
  const { activeBusiness, refreshMe } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'connection' | 'migration' | 'sql'>(defaultTab);
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState<{ step: string; percent: number; details: string }>({
    step: 'Ready',
    percent: 0,
    details: 'Click start to begin migrating your existing local catalog and bills to Supabase.',
  });
  const [migrationStats, setMigrationStats] = useState<{
    productsCount: number;
    customersCount: number;
    salesCount: number;
    expensesCount: number;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const { url, anonKey } = getSupabaseCredentials();
      setUrlInput(url);
      setKeyInput(anonKey);
      setTestResult(null);
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.startsWith('https://')) {
      showToast('Please enter a valid Supabase URL starting with https://', 'error');
      return;
    }
    if (keyInput.length < 20) {
      showToast('Please enter a valid Supabase anon publishable key', 'error');
      return;
    }

    saveSupabaseConfig(urlInput, keyInput);
    setTesting(true);
    const res = await testSupabaseConnection();
    setTesting(false);
    setTestResult(res);

    if (res.ok) {
      showToast('Supabase cloud database connected successfully!', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleTestNow = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setTesting(false);
    setTestResult(res);
  };

  const handleResetConfig = () => {
    if (confirm('Clear custom Supabase configuration and revert to default?')) {
      clearSupabaseConfig();
      setUrlInput('');
      setKeyInput('');
      setTestResult(null);
      showToast('Supabase credentials cleared', 'info');
      setTimeout(() => window.location.reload(), 600);
    }
  };

  // Start migration
  const handleStartMigration = async () => {
    if (!activeBusiness) {
      showToast('Please ensure you have an active store selected.', 'error');
      return;
    }
    if (!isSupabaseConfigured()) {
      showToast('Please connect your Supabase project first in the Connection tab.', 'error');
      setActiveTab('connection');
      return;
    }

    setIsMigrating(true);
    setMigrationStats(null);
    try {
      const stats = await supabaseDb.migrateLocalDataToSupabase(activeBusiness.id, (status) => {
        setMigrationProgress(status);
      });
      setMigrationStats(stats);
      showToast('Migration completed successfully!', 'success');
      await refreshMe();
    } catch (err: any) {
      showToast(err.message || 'Migration failed', 'error');
      setMigrationProgress((prev) => ({ ...prev, details: `Error: ${err.message}` }));
    } finally {
      setIsMigrating(false);
    }
  };

  const localProds = activeBusiness ? localDb.getProducts(activeBusiness.id) : [];
  const localCusts = activeBusiness ? localDb.getCustomers(activeBusiness.id) : [];
  const localSales = activeBusiness ? localDb.getSales(activeBusiness.id) : [];
  const localExps = activeBusiness ? localDb.getExpenses(activeBusiness.id) : [];

  const sqlCode = `-- Supabase 001_initial_schema.sql (Copy into Supabase SQL Editor)
-- You can find the complete script in /supabase/migrations/001_initial_schema.sql
-- Run this in your Supabase Project -> SQL Editor to create tables, RLS & triggers!`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Cloud Database & PostgreSQL"
      subtitle="Production cloud persistence, multi-user RLS, and data migration"
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('connection')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'connection'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Connection Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('migration')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'migration'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Migrate Local Data to Cloud</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>SQL Schema Migration</span>
          </button>
        </div>

        {/* Tab 1: Connection Settings */}
        {activeTab === 'connection' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              isSupabaseConfigured()
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                : 'bg-amber-50/70 border-amber-200 text-amber-800'
            }`}>
              {isSupabaseConfigured() ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-relaxed">
                <p className="font-bold text-sm mb-0.5">
                  {isSupabaseConfigured()
                    ? 'Connected to Supabase Cloud PostgreSQL'
                    : 'Supabase Not Configured (Using Local Storage Mode)'}
                </p>
                <p>
                  {isSupabaseConfigured()
                    ? 'All products, inventory adjustments, customers, and POS invoices are securely persisted in PostgreSQL with Row Level Security (RLS).'
                    : 'Enter your Supabase Project URL and Public Anon Key below to activate real cloud database persistence across devices.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Supabase Anon Public Key (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Safe for client-side use with PostgreSQL Row Level Security (RLS). Never expose your service_role key.
                </p>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    testResult.ok
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleTestNow}
                    disabled={testing || !urlInput}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                    <span>{testing ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetConfig}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                  >
                    Clear Credentials
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={testing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all"
                >
                  Save & Connect Supabase
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Data Migration to Cloud */}
        {activeTab === 'migration' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs leading-relaxed">
              <p className="font-bold text-sm mb-1">Local Browser Data Detected for Store:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2 text-center">
                <div className="p-2 bg-white rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-base font-extrabold text-blue-700 block">{localProds.length}</span>
                  <span className="text-[10px] text-slate-500 uppercase">Products</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-base font-extrabold text-blue-700 block">{localCusts.length}</span>
                  <span className="text-[10px] text-slate-500 uppercase">Customers</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-base font-extrabold text-blue-700 block">{localSales.length}</span>
                  <span className="text-[10px] text-slate-500 uppercase">Past Invoices</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-blue-100 shadow-2xs">
                  <span className="text-base font-extrabold text-blue-700 block">{localExps.length}</span>
                  <span className="text-[10px] text-slate-500 uppercase">Expenses</span>
                </div>
              </div>
              <p className="text-[11px] text-blue-800">
                This migration tool will safely sync all existing records into your PostgreSQL tables, check for duplicate SKUs/barcodes, and establish proper relational links.
              </p>
            </div>

            {/* Migration Progress Bar */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800">{migrationProgress.step}</span>
                <span className="font-bold text-blue-600">{migrationProgress.percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${migrationProgress.percent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">{migrationProgress.details}</p>
            </div>

            {migrationStats && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Migration Successfully Finished!</span>
                </p>
                <p>
                  Uploaded <b>{migrationStats.productsCount}</b> products, <b>{migrationStats.customersCount}</b> customers, <b>{migrationStats.salesCount}</b> sales, and <b>{migrationStats.expensesCount}</b> expenses to your Supabase cloud PostgreSQL database.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleStartMigration}
                disabled={isMigrating || !isSupabaseConfigured()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isMigrating ? 'Migrating Data...' : 'Start Cloud Migration'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: SQL Schema Instructions */}
        {activeTab === 'sql' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              The migration file has been created at <code>supabase/migrations/001_initial_schema.sql</code>. It includes all PostgreSQL tables, foreign keys, triggers for automated inventory deduction, and Row Level Security policies.
            </p>

            <div className="relative">
              <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-[11px] overflow-x-auto max-h-48 font-mono scrollbar-thin">
                {`-- Run in Supabase SQL Editor:
-- File: supabase/migrations/001_initial_schema.sql
-- 1. Creates profiles, businesses, business_members
-- 2. Creates products, categories, customers, suppliers
-- 3. Creates sales, sale_items, inventory_transactions
-- 4. Enables Row Level Security (RLS) on all tables
-- 5. Attaches trigger to auto-decrease stock on POS checkout!`}
              </pre>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`-- Please open and run: supabase/migrations/001_initial_schema.sql`);
                  setCopiedSql(true);
                  showToast('SQL reference copied to clipboard!', 'success');
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="absolute top-2 right-2 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 border border-white/10"
              >
                {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p className="font-bold text-slate-800">Quick 3-Step Setup in Supabase Dashboard:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px]">
                <li>Open your project at <b>supabase.com/dashboard</b></li>
                <li>Click <b>SQL Editor</b> on the left sidebar &gt; <b>New query</b></li>
                <li>Paste the contents of <code>supabase/migrations/001_initial_schema.sql</code> and click <b>Run</b>!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
