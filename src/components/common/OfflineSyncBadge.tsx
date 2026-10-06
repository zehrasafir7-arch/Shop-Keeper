import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus, SyncState } from '../../hooks/useOnlineStatus.js';

interface OfflineSyncBadgeProps {
  onSyncComplete?: () => void;
  className?: string;
}

export const OfflineSyncBadge: React.FC<OfflineSyncBadgeProps> = ({
  onSyncComplete,
  className = '',
}) => {
  const { syncState, pendingCount, triggerManualSync } = useOnlineStatus(onSyncComplete);

  if (syncState === 'OFFLINE') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold ${className}`}
        title="Offline Mode Active: Bills are saved locally and will auto-sync when connection resumes."
      >
        <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        <span>OFFLINE</span>
        {pendingCount > 0 && (
          <span className="bg-amber-200 text-amber-900 px-1 rounded text-[10px]">
            {pendingCount} saved
          </span>
        )}
      </div>
    );
  }

  if (syncState === 'SYNCING') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold ${className}`}
      >
        <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
        <span>SYNCING ({pendingCount})</span>
      </div>
    );
  }

  if (syncState === 'SYNCED') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>SYNCED</span>
      </div>
    );
  }

  // ONLINE
  return (
    <div
      onClick={() => pendingCount > 0 && triggerManualSync()}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/50 text-emerald-800 text-xs font-semibold ${
        pendingCount > 0 ? 'cursor-pointer hover:bg-emerald-100' : ''
      } ${className}`}
      title={pendingCount > 0 ? `${pendingCount} offline bills ready to sync. Click to sync.` : 'Connected to cloud'}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span>ONLINE</span>
      {pendingCount > 0 && (
        <span className="bg-blue-600 text-white px-1.5 py-0.2 rounded-full text-[9px] font-bold">
          {pendingCount}
        </span>
      )}
    </div>
  );
};
