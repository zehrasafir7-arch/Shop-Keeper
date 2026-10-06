import React, { useState } from 'react';
import {
  Store,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Clock,
  Trash2,
  CheckCircle2,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import type { SavedAccount } from '../../types/index.js';

interface LoginPageProps {
  onGoToRegister: () => void;
  onGoToLanding: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onGoToRegister,
  onGoToLanding,
  onOpenForgotPassword,
}) => {
  const {
    login,
    loginAsDemoOwner,
    loginAsDemoCashier,
    savedAccounts,
    quickSignInSavedAccount,
    removeSavedAccount,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signingInAccount, setSigningInAccount] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, rememberMe);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSignIn = async (account: SavedAccount) => {
    setError(null);
    setSigningInAccount(account.email);
    try {
      await quickSignInSavedAccount(account);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with saved account. Please enter password.');
      setEmail(account.email);
    } finally {
      setSigningInAccount(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={onGoToLanding}
          className="inline-flex items-center gap-2 mb-4 hover:opacity-85 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
            <Store className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            BUSSINESS <span className="text-blue-600">BILLING</span>
          </span>
        </button>
        <h2 className="text-xl font-bold text-slate-900">Sign in to your shop portal</h2>
        <p className="mt-1 text-xs text-slate-500">
          Billing, POS counter, inventory & business analytics
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/80">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Saved Accounts on this Device */}
          {savedAccounts.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Saved Accounts on this Device</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {savedAccounts.length} saved
                </span>
              </div>

              <div className="space-y-2">
                {savedAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 uppercase border border-blue-200/60">
                        {acc.name?.[0] || 'U'}
                      </div>
                      <div className="overflow-hidden text-left">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800 truncate">{acc.name}</p>
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-semibold">
                            {acc.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{acc.businessName || 'Business'}</span>
                          <span>•</span>
                          <span>{acc.currency}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuickSignIn(acc)}
                        disabled={signingInAccount === acc.email}
                        className="py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all"
                      >
                        {signingInAccount === acc.email ? 'Signing In...' : 'Sign In'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSavedAccount(acc.email)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove saved account from device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-slate-400 font-medium">Or enter credentials</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick 1-Click Demo Accounts */}
          <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-100">
            <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Instant Test Logins (1-Click)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={loginAsDemoOwner}
                className="py-1.5 px-2 bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-blue-700 rounded-lg text-xs font-semibold shadow-xs transition-colors flex flex-col items-center"
              >
                <span>Owner Login</span>
                <span className="text-[9px] opacity-75">Dubai Mini Mart</span>
              </button>
              <button
                type="button"
                onClick={loginAsDemoCashier}
                className="py-1.5 px-2 bg-white hover:bg-slate-800 hover:text-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors flex flex-col items-center"
              >
                <span>Cashier Login</span>
                <span className="text-[9px] opacity-75">Counter POS Role</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourbusiness.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={onOpenForgotPassword}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-700 select-none">
                  Save sign in account on this device
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onGoToRegister}
                className="font-bold text-blue-600 hover:text-blue-500 underline"
              >
                Register Free Business
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
