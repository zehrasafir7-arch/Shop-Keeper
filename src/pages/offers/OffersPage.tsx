import React, { useState, useEffect } from 'react';
import { Tag, Plus, Calendar, Percent, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../components/common/Toast.js';
import type { Offer } from '../../types/index.js';

export const OffersPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const { showToast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<any>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOffers = async () => {
    try {
      const data = await api.getOffers();
      setOffers(data);
    } catch (e) {
      console.error('Failed to load offers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, [activeBusiness?.id]);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsSubmitting(true);
    try {
      await api.createOffer({
        name,
        type,
        discountValue: Number(discountValue),
        description,
      });

      setName('');
      setDescription('');
      setIsAddOpen(false);
      loadOffers();
      showToast('Offer created and activated successfully!', 'success');
    } catch (e) {
      showToast('Failed to create offer', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
            <Tag className="w-4 h-4" />
            <span>Store Promotions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Offers & Discounts</h1>
          <p className="text-xs text-slate-500">
            Create festival deals, Buy 1 Get 1 promotions, and seasonal markdowns.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase">
                  {offer.type}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900">{offer.name}</h3>
              <p className="text-xs text-slate-600 mt-1">{offer.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Discount Value:</span>
              <span className="font-extrabold text-indigo-600">
                {offer.type === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `Value: ${offer.discountValue}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Offer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Promotional Offer"
        subtitle="Configure discount type and promo duration"
        maxWidth="md"
      >
        <form onSubmit={handleCreateOffer} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Offer Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekend Flash Sale: 15% OFF"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Offer Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENTAGE">Percentage Discount (%)</option>
                <option value="FLAT">Flat Cash Discount</option>
                <option value="BOGO">Buy 1 Get 1 Free</option>
                <option value="COMBO">Combo Deal</option>
                <option value="FESTIVAL">Festival Special</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Value</label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details shown to counter cashiers and shoppers"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'Activate Offer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
