import { useState, useEffect } from 'react';
import { offlineQueue } from '../lib/offlineQueue.js';

export type SyncState = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNCED';

export function useOnlineStatus(onSyncComplete?: () => void) {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncState, setSyncState] = useState<SyncState>(
    typeof navigator !== 'undefined' && !navigator.onLine ? 'OFFLINE' : 'ONLINE'
  );
  const [pendingCount, setPendingCount] = useState<number>(0);

  const updateQueueCount = () => {
    const queue = offlineQueue.getQueue();
    setPendingCount(queue.length);
  };

  const attemptSync = async () => {
    const queue = offlineQueue.getQueue();
    if (queue.length === 0) {
      setSyncState('ONLINE');
      return;
    }

    setSyncState('SYNCING');
    try {
      const result = await offlineQueue.syncPendingBills();
      updateQueueCount();
      if (result.success > 0) {
        setSyncState('SYNCED');
        if (onSyncComplete) onSyncComplete();
        setTimeout(() => setSyncState('ONLINE'), 3000);
      } else {
        setSyncState('ONLINE');
      }
    } catch (e) {
      setSyncState('ONLINE');
    }
  };

  useEffect(() => {
    updateQueueCount();

    const handleOnline = () => {
      setIsOnline(true);
      attemptSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check for pending bills if online
    const interval = setInterval(() => {
      updateQueueCount();
      if (navigator.onLine && offlineQueue.getQueue().length > 0 && syncState !== 'SYNCING') {
        attemptSync();
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    syncState,
    pendingCount,
    updateQueueCount,
    triggerManualSync: attemptSync,
  };
}
