import React, { useState } from 'react';
import {
  Store,
  Building2,
  MapPin,
  Phone,
  Mail,
  Coins,
  Percent,
  Receipt,
  Boxes,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../components/common/Toast.js';
import confetti from 'canvas-confetti';
import type { BusinessCategory } from '../../types/index.js';

interface BusinessSetupWizardProps {
  onComplete: () => void;
}

export const BusinessSetupWizard: React.FC<BusinessSetupWizardProps> = ({ onComplete }) => {
  const { activeBusiness, updateActiveBusiness } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;

  // Form states
  const [businessName, setBusinessName] = useState(activeBusiness?.name || '');
  const [category, setCategory] = useState<BusinessCategory>(activeBusiness?.category || 'grocery');
  const [address, setAddress] = useState(activeBusiness?.address || '');
  const [phone, setPhone] = useState(activeBusiness?.phone || '');
  const [email, setEmail] = useState(activeBusiness?.email || '');
  const [currency, setCurrency] = useState(activeBusiness?.currency || 'INR');
  const [taxName, setTaxName] = useState(activeBusiness?.taxName || 'GST');
  const [taxRate, setTaxRate] = useState(activeBusiness?.taxRate || 18);
  const [taxInclusive, setTaxInclusive] = useState(activeBusiness?.taxInclusive ?? true);
  const [invoicePrefix, setInvoicePrefix] = useState(activeBusiness?.invoicePrefix || 'INV-');
  const [footerNote, setFooterNote] = useState(
    activeBusiness?.invoiceFooterNote || 'Thank you for shopping with us! Please visit again.'
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final submission
      setIsSaving(true);
      try {
        const currencyMap: Record<string, string> = {
          INR: '₹',
          AED: 'AED ',
          USD: '$',
          EUR: '€',
          GBP: '£',
        };

        await updateActiveBusiness({
          name: businessName,
          category,
          address,
          phone,
          email,
          currency,
          currencySymbol: currencyMap[currency] || currency + ' ',
          taxName,
          taxRate: Number(taxRate),
          taxInclusive,
          invoicePrefix,
          invoiceFooterNote: footerNote,
          setupCompleted: true,
          setupStep: 10,
        });

        // Trigger celebration confetti
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore if canvas not supported
        }

        showToast('Store settings configured successfully!', 'success');
        onComplete();
      } catch (e) {
        showToast('Failed to save settings. Please try again.', 'error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSkip = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleNext();
    }
  };

  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto w-full">
        {/* Progress Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Store Onboarding Wizard</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Configure Your Shop in 10 Quick Steps
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Step {currentStep} of {totalSteps} • You can skip and modify these settings anytime in Settings
          </p>

          {/* Progress Bar */}
          <div className="mt-4 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8">
          {/* STEP 1: Business Name */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Confirm Your Shop Name</h3>
                  <p className="text-xs text-slate-500">This appears on receipts, invoices, and reports</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Dubai Mini Mart"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Business Type */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">What type of store do you run?</h3>
                  <p className="text-xs text-slate-500">Customizes terminology and item units</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                {[
                  { id: 'grocery', name: 'Grocery / Kirana' },
                  { id: 'supermarket', name: 'Supermarket' },
                  { id: 'mini_mart', name: 'Mini Mart' },
                  { id: 'clothing', name: 'Clothing / Fashion' },
                  { id: 'electronics', name: 'Electronics / Mobile' },
                  { id: 'pharmacy', name: 'Pharmacy / Medicine' },
                  { id: 'bakery', name: 'Bakery / Sweets' },
                  { id: 'restaurant', name: 'Restaurant / Cafe' },
                  { id: 'salon', name: 'Salon / Parlour' },
                  { id: 'garage', name: 'Garage / Workshop' },
                  { id: 'retail', name: 'General Retail' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as BusinessCategory)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      category === item.id
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Store Address */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Physical Store Address</h3>
                  <p className="text-xs text-slate-500">Printed on receipt headers for customers</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Shop Address</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop #14, Al Karama Commercial Complex, Dubai, UAE"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Store Phone */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Store Support Phone</h3>
                  <p className="text-xs text-slate-500">For invoice header and customer WhatsApp receipts</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Helpline / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+971 4 398 7654"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 5: Official Email */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Store Email</h3>
                  <p className="text-xs text-slate-500">Where supplier POs and daily summaries can be delivered</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@yourstore.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 6: Store Logo & Branding */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Branding & Thermal Logo</h3>
                  <p className="text-xs text-slate-500">Standard clean header will be used by default</p>
                </div>
              </div>
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <p className="text-xs text-slate-600 font-medium">Text Header Mode Enabled</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Your store name "{businessName || 'Store'}" will be cleanly centered at the top of all thermal receipts. You can upload custom monochrome logos anytime under Settings.
                </p>
              </div>
            </div>
          )}

          {/* STEP 7: Primary Currency */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Currency & Formatting</h3>
                  <p className="text-xs text-slate-500">Configures prices, bills, and accounting balances</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="AED">AED (AED - UAE Dirham)</option>
                  <option value="USD">USD ($ - United States Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="SAR">SAR (SAR - Saudi Riyal)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 8: Tax Configuration */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Tax Settings (GST / VAT)</h3>
                  <p className="text-xs text-slate-500">Configure default tax rules for sales and item pricing</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tax System</label>
                  <select
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GST">GST (India / Canada)</option>
                    <option value="VAT">VAT (UAE / UK / EU)</option>
                    <option value="Sales Tax">Sales Tax (USA)</option>
                    <option value="None">None (No tax)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Default Rate (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="taxInclusive"
                  type="checkbox"
                  checked={taxInclusive}
                  onChange={(e) => setTaxInclusive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <label htmlFor="taxInclusive" className="text-xs text-slate-700">
                  Item selling prices are already tax-inclusive (Recommended for retail)
                </label>
              </div>
            </div>
          )}

          {/* STEP 9: Invoice Settings */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Invoice Prefix & Notes</h3>
                  <p className="text-xs text-slate-500">Customize receipt numbers and footer greetings</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="INV- or DMM-2026-"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Receipt Footer Note</label>
                <input
                  type="text"
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 10: Opening Stock Confirmation */}
          {currentStep === 10 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Ready to Start Billing!</h3>
                  <p className="text-xs text-slate-500">Your store database has been provisioned</p>
                </div>
              </div>
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Setup Checklist Complete
                </p>
                <p>• Fast POS Counter configured with {currency} currency</p>
                <p>• {taxName} ({taxRate}%) calculated automatically</p>
                <p>• Pre-loaded sample items ready for instant checkout</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {currentStep < totalSteps && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Skip
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all disabled:opacity-60"
              >
                <span>{currentStep === totalSteps ? 'Launch Dashboard' : 'Next Step'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
