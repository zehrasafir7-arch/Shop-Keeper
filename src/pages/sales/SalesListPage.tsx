import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, Receipt, Printer, Share2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { Modal } from '../../components/common/Modal.js';
import type { Sale } from '../../types/index.js';

export const SalesListPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const currency = activeBusiness?.currencySymbol || 'AED ';

  const loadSales = async () => {
    try {
      const data = await api.getSales();
      setSales(data);
    } catch (e) {
      console.error('Failed to load sales', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [activeBusiness?.id]);

  const filteredSales = sales.filter(
    (s) =>
      s.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customerPhone && s.customerPhone.includes(searchQuery))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>Ledger Records</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Sales & Tax Invoices</h1>
          <p className="text-xs text-slate-500">
            Audit history of every POS transaction, receipt, and payment method.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number or customer..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filteredSales.length} total bills recorded
        </span>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-semibold text-slate-400 bg-slate-50/80 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Net Profit</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No sales invoices found.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">{s.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(s.createdAt).toLocaleDateString()} {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.customerName}</td>
                    <td className="py-3 px-4 text-slate-600">{s.itemsCount} items</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">
                      {currency}{s.netProfit.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      {currency}{s.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setViewingSale(s)}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {viewingSale && (
        <Modal
          isOpen={!!viewingSale}
          onClose={() => setViewingSale(null)}
          title={`Invoice: ${viewingSale.invoiceNumber}`}
          subtitle={`${viewingSale.customerName} • ${new Date(viewingSale.createdAt).toLocaleString()}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h3 className="text-base font-bold uppercase">{activeBusiness?.name}</h3>
                <p className="text-[10px] text-slate-500">{activeBusiness?.address}</p>
                <p className="text-[10px] text-slate-500">Tel: {activeBusiness?.phone}</p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Invoice:</span>
                  <span className="font-bold">{viewingSale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{viewingSale.customerName}</span>
                </div>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300 space-y-1">
                {viewingSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{item.quantity}x {item.productName}</span>
                    <span className="font-bold">{currency}{item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{currency}{viewingSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span>{currency}{viewingSale.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
