import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Calendar, DollarSign, Tag, TrendingDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../components/common/Toast.js';
import type { Expense, PaymentMethod } from '../../types/index.js';

interface ExpensesPageProps {
  isAddExpenseOpen?: boolean;
  onCloseAddExpense?: () => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  isAddExpenseOpen: externalAddOpen,
  onCloseAddExpense: externalCloseAdd,
}) => {
  const { activeBusiness } = useAuth();
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [internalAddOpen, setInternalAddOpen] = useState(false);
  const isAddOpen = externalAddOpen !== undefined ? externalAddOpen : internalAddOpen;
  const closeAddModal = () => {
    if (externalCloseAdd) externalCloseAdd();
    setInternalAddOpen(false);
  };

  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<any>('Rent');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currency = activeBusiness?.currencySymbol || 'AED ';

  const loadExpenses = async () => {
    try {
      const data = await api.getExpenses();
      setExpenses(data);
    } catch (e) {
      console.error('Failed to load expenses', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [activeBusiness?.id]);

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amount <= 0) {
      showToast('Expense title and valid amount are required.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createExpense({
        name,
        amount: Number(amount),
        category,
        paymentMethod,
        description,
        date: new Date().toISOString(),
      });

      setName('');
      setAmount(0);
      setDescription('');
      closeAddModal();
      loadExpenses();
      showToast('Expense recorded successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to record expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            <span>Store Operating Costs</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Expenses & Overheads</h1>
          <p className="text-xs text-slate-500">
            Track rent, electricity bills, internet, staff wages, and marketing costs.
          </p>
        </div>

        <button
          onClick={() => setInternalAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Recorded Expenses</span>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
            {currency}{totalExpenseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Deducted from gross profit to calculate Net Profit</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <TrendingDown className="w-6 h-6" />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-semibold text-slate-400 bg-slate-50/80 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Expense Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{exp.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{exp.paymentMethod}</td>
                  <td className="py-3.5 px-4 text-slate-500">{exp.description || '—'}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-rose-600">
                    {currency}{exp.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={closeAddModal}
        title="Record Shop Expense"
        subtitle="Log store operating bills and maintenance expenses"
        maxWidth="md"
      >
        <form onSubmit={handleCreateExpense} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shop Rent / Electricity Bill"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ({currency}) *</label>
              <input
                type="number"
                step="0.01"
                min={0.01}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Rent">Rent</option>
                <option value="Electricity">Electricity</option>
                <option value="Internet">Internet</option>
                <option value="Salary">Salary</option>
                <option value="Transport">Transport</option>
                <option value="Marketing">Marketing</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Packaging">Packaging</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paid Via</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="CASH">Cash</option>
              <option value="CARD">Debit / Credit Card</option>
              <option value="UPI">UPI / Digital Wallet</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Month of September commercial electricity"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/25 active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
