import { api } from './api.js';
import type { Sale } from '../types/index.js';

const STORAGE_KEY = 'shopkeeper_offline_bills_queue';

export interface PendingOfflineBill {
  id: string;
  payload: any;
  tempInvoiceNumber: string;
  createdAt: string;
}

export const offlineQueue = {
  getQueue(): PendingOfflineBill[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  enqueueBill(payload: any): PendingOfflineBill {
    const queue = this.getQueue();
    const tempBill: PendingOfflineBill = {
      id: 'offline_' + Date.now() + Math.random().toString(36).substring(2, 6),
      payload,
      tempInvoiceNumber: 'OFFLINE-' + Math.floor(1000 + Math.random() * 9000),
      createdAt: new Date().toISOString(),
    };
    queue.push(tempBill);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return tempBill;
  },

  removeBill(id: string): void {
    const queue = this.getQueue().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  },

  clearQueue(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  async syncPendingBills(onProgress?: (synced: number, total: number) => void): Promise<{ success: number; failed: number }> {
    const queue = this.getQueue();
    if (queue.length === 0) return { success: 0, failed: 0 };

    let success = 0;
    let failed = 0;
    const remaining: PendingOfflineBill[] = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      try {
        await api.createSale(item.payload);
        success++;
        if (onProgress) onProgress(success, queue.length);
      } catch (err) {
        console.error('Failed to sync offline bill:', item, err);
        failed++;
        remaining.push(item);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    return { success, failed };
  },
};
