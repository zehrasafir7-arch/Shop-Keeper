import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Award,
  CreditCard,
  Calendar,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../components/common/Toast.js';
import type { Customer } from '../../types/index.js';

interface CustomersPageProps {
  isAddCustomerOpen?: boolean;
  onCloseAddCustomer?: () => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  isAddCustomerOpen: externalAddOpen,
  onCloseAddCustomer: externalCloseAdd,
}) => {
  const { activeBusiness } = useAuth();
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Customer Modal
  const [internalAddOpen, setInternalAddOpen] = useState(false);
  const isAddOpen = externalAddOpen !== undefined ? externalAddOpen : internalAddOpen;
  const closeAddModal = () => {
    if (externalCloseAdd) externalCloseAdd();
    setInternalAddOpen(false);
  };

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected customer details modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const currency = activeBusiness?.currencySymbol || 'AED ';

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (e) {
      console.error('Failed to load customers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [activeBusiness?.id]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      showToast('Customer name and phone number are required.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createCustomer({
        name,
        phone,
        whatsapp: whatsapp || phone,
        email,
        address,
        notes,
      });

      setName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setAddress('');
      setNotes('');
      closeAddModal();
      loadCustomers();
      showToast('Customer profile created successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to create customer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Customer CRM & Store Ledger</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Customer Accounts</h1>
          <p className="text-xs text-slate-500">
            Track customer order frequencies, outstanding balances, and reward loyalty points.
          </p>
        </div>

        <button
          onClick={() => setInternalAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or phone number..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filteredCustomers.length} registered profiles
        </span>
      </div>

      {/* Customers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const hasDebt = cust.outstandingBalance > 0;
          return (
            <div
              key={cust.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{cust.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cust.phone}</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
                    {cust.name[0]?.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center my-3 bg-slate-50/60 rounded-xl">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Orders</p>
                    <p className="text-xs font-bold text-slate-800">{cust.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Total Spent</p>
                    <p className="text-xs font-bold text-blue-600">
                      {currency}{cust.totalSpent.toFixed(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Loyalty</p>
                    <p className="text-xs font-bold text-purple-600 flex items-center justify-center gap-0.5">
                      <Award className="w-3 h-3 text-purple-500" />
                      <span>{cust.loyaltyPoints} pts</span>
                    </p>
                  </div>
                </div>

                {hasDebt && (
                  <div className="mb-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
                    <span className="font-semibold">Credit Balance Due:</span>
                    <span className="font-black">{currency}{cust.outstandingBalance.toFixed(2)}</span>
                  </div>
                )}

                {cust.notes && (
                  <p className="text-[11px] text-slate-500 italic line-clamp-1 mb-2">"{cust.notes}"</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => setSelectedCustomer(cust)}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  View Profile
                </button>

                <a
                  href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={closeAddModal}
        title="Add New Customer Profile"
        subtitle="Capture customer contact details for billing and loyalty points"
        maxWidth="md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fatima Al-Zahra"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 123 4567"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Same as phone"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery / Home Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Apartment / Villa details"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Notes / Preferences</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. VIP shopper, prefers home delivery"
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Profile View Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={selectedCustomer.name}
          subtitle={`Customer ID: ${selectedCustomer.id}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                <span className="font-bold text-slate-800">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">WhatsApp</span>
                <span className="font-bold text-emerald-600">{selectedCustomer.whatsapp || selectedCustomer.phone}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Delivery Address</span>
                <span className="text-slate-700">{selectedCustomer.address || 'No address provided'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-semibold uppercase">Total Spending</p>
                <p className="text-sm font-extrabold text-blue-900 mt-0.5">
                  {currency}{selectedCustomer.totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <p className="text-[10px] text-purple-600 font-semibold uppercase">Loyalty Points</p>
                <p className="text-sm font-extrabold text-purple-900 mt-0.5">
                  {selectedCustomer.loyaltyPoints} Pts
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] text-amber-700 font-semibold uppercase">Outstanding</p>
                <p className="text-sm font-extrabold text-amber-900 mt-0.5">
                  {currency}{selectedCustomer.outstandingBalance.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
