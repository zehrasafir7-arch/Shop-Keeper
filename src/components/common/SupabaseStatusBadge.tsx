import React, { useState } from 'react';
import { Database, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { isSupabaseConfigured, getSupabaseCredentials } from '../../lib/supabase.js';
import { SupabaseConfigModal } from './SupabaseConfigModal.js';

interface SupabaseStatusBadgeProps {
  className?: string;
  variant?: 'badge' | 'button' | 'card';
}

export const SupabaseStatusBadge: React.FC<SupabaseStatusBadgeProps> = ({
  className = '',
  variant = 'badge',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isConfigured = isSupabaseConfigured();
  const { url } = getSupabaseCredentials();

  const hostname = url ? new URL(url).hostname : '';

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs transition-all ${
            isConfigured
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          } ${className}`}
          title="Supabase PostgreSQL Cloud Database Configuration"
        >
          <Database className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">
            {isConfigured ? 'Supabase Connected' : 'Connect Supabase'}
          </span>
          <span className="sm:hidden">
            {isConfigured ? 'Cloud' : 'Connect'}
          </span>
        </button>

        <SupabaseConfigModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
          isConfigured
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
        } ${className}`}
        title="Click to manage Supabase PostgreSQL database & data migration"
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
        />
        <Database className="w-3 h-3" />
        <span className="truncate max-w-[120px]">
          {isConfigured ? hostname.split('.')[0] || 'Supabase' : 'Setup Cloud DB'}
        </span>
      </button>

      <SupabaseConfigModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
