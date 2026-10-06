import React, { useState } from 'react';
import {
  Store,
  Receipt,
  BarChart3,
  Boxes,
  Users,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Smartphone,
  Printer,
  ShoppingBag,
  Laptop,
  Apple,
  Play,
  QrCode,
  Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PWAInstallButton } from '../components/common/PWAInstallButton.js';
import { InstallAppModal } from '../components/common/InstallAppModal.js';

interface LandingPageProps {
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGoToLogin,
  onGoToRegister,
}) => {
  const { loginAsDemoOwner } = useAuth();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installModalTab, setInstallModalTab] = useState<'pc' | 'android' | 'ios' | 'playstore' | 'qr'>('pc');

  const openInstallTab = (tab: 'pc' | 'android' | 'ios' | 'playstore' | 'qr') => {
    setInstallModalTab(tab);
    setShowInstallModal(true);
  };

  const businessTypes = [
    { name: 'Grocery & Mini Marts', icon: '🛒', desc: 'Fast barcode checkout & batch tracking' },
    { name: 'Supermarkets', icon: '🏪', desc: 'Multi-counter POS & volume discounts' },
    { name: 'Clothing & Boutiques', icon: '👕', desc: 'Size, color & variant inventory' },
    { name: 'Electronics & Mobiles', icon: '📱', desc: 'IMEI / Serial warranty tracking' },
    { name: 'Pharmacies & Medical', icon: '💊', desc: 'Expiry alerts & batch management' },
    { name: 'Perfume & Cosmetics', icon: '✨', desc: 'Luxury fragrance & combo offers' },
    { name: 'Bakeries & Cafes', icon: '☕', desc: 'Quick kitchen orders & daily fresh stock' },
    { name: 'Garages & Workshops', icon: '🔧', desc: 'Parts & labor billing in one invoice' },
  ];

  const features = [
    {
      title: 'Ultra-Fast POS Billing',
      desc: 'Create thermal receipts and GST/VAT tax invoices in under 3 seconds with barcode scan support.',
      icon: Receipt,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Real-Time Inventory & Low-Stock Alerts',
      desc: 'Automatic stock deduction with each bill. Get notified immediately when items fall below safe thresholds.',
      icon: Boxes,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      title: 'True Profit & Loss Calculations',
      desc: 'Accurately calculates Cost of Goods Sold (COGS), gross margins, and operating expenses. No guess work.',
      icon: BarChart3,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Customer CRM & Loyalty Points',
      desc: 'Track frequent buyers, maintain store credit accounts, and reward shoppers with customizable loyalty points.',
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Bussiness Billing AI Assistant',
      desc: 'Ask questions like "Which product gives me highest profit?" or generate WhatsApp marketing promos in seconds.',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Multi-Business & Multi-Branch',
      desc: 'Manage Dubai Mini Mart, perfume shops, and auto garages under one master account with full data isolation.',
      icon: Store,
      color: 'bg-rose-50 text-rose-600',
    },
  ];

  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      period: 'forever',
      desc: 'Ideal for neighborhood kiosks and single counters starting out.',
      features: ['Up to 100 products', '50 invoices / month', 'Thermal receipt printing', 'Standard reports'],
      cta: 'Start Free',
      popular: false,
    },
    {
      name: 'Starter Plan',
      price: '$19',
      period: 'per month',
      desc: 'For growing retail stores and mini marts needing full control.',
      features: [
        'Unlimited products & bills',
        'Real-time inventory alerts',
        'Profit & loss reporting',
        'Customer ledger & store credit',
        'Barcode scanner integration',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Business Pro',
      price: '$49',
      period: 'per month',
      desc: 'Complete solution for supermarkets, multi-branch & chains.',
      features: [
        'Multi-branch management',
        'Staff roles & cashier permissions',
        'Shopkeeper AI Assistant',
        'Marketing promo campaign builder',
        'WhatsApp direct invoicing',
        'Priority 24/7 support',
      ],
      cta: 'Upgrade to Pro',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                BUSSINESS <span className="text-blue-600 text-xs px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 font-bold">BILLING</span>
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#business-types" className="hover:text-blue-600 transition-colors">Business Types</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <PWAInstallButton variant="outline" />
            <button
              onClick={onGoToLogin}
              className="text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGoToRegister}
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200/60 text-blue-800 text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span>Built for Grocery, Retail, Supermarkets & 15+ Business Types</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Billing Made Simple.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Business Made Smarter.
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The all-in-one SaaS POS, inventory management, weekly profit tracking, and customer loyalty software built for shop owners worldwide.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onGoToRegister}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Instant Demo Sandbox Shortcut */}
            <button
              onClick={loginAsDemoOwner}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base border border-slate-300/80 shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Explore "Dubai Mini Mart" Demo</span>
            </button>

            <PWAInstallButton variant="primary" className="w-full sm:w-auto py-3.5 px-6 text-sm" />
          </div>

          {/* Quick Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>GST & VAT ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Works on Phone, Tablet & PC</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Thermal & A4 Print Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Device & Native Installation Showcase */}
      <section className="py-12 bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white border-y border-blue-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-950/80 border border-blue-700/60 px-3 py-1 rounded-full">
              Install Anywhere
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              One App. Works Seamlessly on PC, Mobile, Tablet & iPhone
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Transform this website into a native application with 1-click. Available for Google Chrome, Windows, Mac, Android, iOS Safari, and Google Play Store TWA.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: PC & Mac */}
            <div
              onClick={() => openInstallTab('pc')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Laptop className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm flex items-center justify-between">
                  <span>PC & Mac Desktop</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">Chrome / Edge</span>
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Standalone desktop window, taskbar shortcut, hardware barcode scanner support & thermal receipt printer integration.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-xs text-blue-400 font-bold group-hover:translate-x-1 transition-transform">
                <span>View PC Install Steps →</span>
              </div>
            </div>

            {/* Card 2: Android & Tablet */}
            <div
              onClick={() => openInstallTab('android')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm flex items-center justify-between">
                  <span>Android & Tablets</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">Mobile POS</span>
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Fast counter checkout on Samsung, Xiaomi, Pixel phones or dedicated cashier tablets. Full-screen display mode.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-xs text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                <span>View Android Steps →</span>
              </div>
            </div>

            {/* Card 3: iPhone & iPad */}
            <div
              onClick={() => openInstallTab('ios')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-slate-400/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 text-white flex items-center justify-center mb-3 group-hover:bg-white group-hover:text-slate-950 transition-colors">
                  <Apple className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm flex items-center justify-between">
                  <span>iPhone & iPad</span>
                  <span className="text-[10px] bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded font-mono">iOS Safari</span>
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  2-tap install via Safari "Add to Home Screen". Clean native iOS feel, custom app icon & responsive touch layouts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-xs text-slate-300 font-bold group-hover:translate-x-1 transition-transform">
                <span>View iOS Safari Steps →</span>
              </div>
            </div>

            {/* Card 4: Play Store / APK & QR */}
            <div
              onClick={() => openInstallTab('playstore')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 text-purple-400 flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Play className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm flex items-center justify-between">
                  <span>Google Play / APK</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">TWA Verified</span>
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Includes digital asset links and Play Store packaging support. Or scan the QR code to open directly on your mobile device.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-xs text-purple-400 font-bold group-hover:translate-x-1 transition-transform">
                <span>Play Store & QR Code →</span>
              </div>
            </div>
          </div>

          {/* Quick CTA inside Section */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => openInstallTab('pc')}
              className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Install Bussiness Billing Now</span>
            </button>
            <button
              onClick={() => openInstallTab('qr')}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-2 border border-white/10 transition-all"
            >
              <QrCode className="w-4 h-4 text-purple-400" />
              <span>Scan QR on Mobile Phone</span>
            </button>
          </div>
        </div>
      </section>

      {/* Business Types Grid */}
      <section id="business-types" className="py-16 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Universal SaaS</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Tailored for Every Type of Shop & Enterprise
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Select your category during registration and Shopkeeper Pro automatically adapts tax formulas, units, and inventory defaults.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {businessTypes.map((biz, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-blue-400 hover:bg-white hover:shadow-md transition-all group"
              >
                <div className="text-3xl mb-3">{biz.icon}</div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                  {biz.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1">{biz.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Features</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              Everything Needed to Modernize Store Operations
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Replace messy paper notebooks and slow legacy cash registers with an intelligent, cloud-synchronized platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Transparent Pricing</h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              Affordable Plans for Every Stage of Business
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Start free, test thoroughly, and upgrade only when your store reaches higher sales volumes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-7 flex flex-col justify-between border transition-all ${
                  p.popular
                    ? 'border-blue-600 ring-2 ring-blue-600/20 bg-gradient-to-b from-blue-50/40 to-white shadow-xl relative'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">{p.price}</span>
                    <span className="text-xs text-slate-500">/{p.period}</span>
                  </div>

                  <div className="mt-6 space-y-2.5">
                    {p.features.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2.5 text-xs text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={onGoToRegister}
                  className={`mt-8 w-full py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                    p.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Questions & Answers</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900">Can I use regular USB or Bluetooth barcode scanners?</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Yes! Shopkeeper Pro supports standard hardware barcode scanners that act as keyboard wedge devices. When you scan an item barcode on the POS screen, it instantly detects and adds the product to the bill.
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900">How is profit calculated?</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Profit is calculated accurately from your purchase price (Cost of Goods Sold). Gross Profit = Selling Price - Purchase Price. Net Profit = Gross Profit - Operating Expenses (Rent, Electricity, Salaries).
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200/80">
              <h4 className="text-sm font-bold text-slate-900">Can I manage multiple shops under one login?</h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Yes. Shopkeeper Pro provides native multi-tenant isolation. You can switch between different businesses (e.g. Dubai Mini Mart and a boutique) with one click from the header.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              <Store className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white text-sm">BUSSINESS BILLING</span>
            <span className="text-slate-500">© 2026. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span className="text-slate-400">Tagline: "Billing Made Simple. Business Made Smarter."</span>
            <button onClick={loginAsDemoOwner} className="hover:text-blue-400 font-semibold underline">
              Demo Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Multi-Platform & Play Store Installation Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        defaultTab={installModalTab}
      />
    </div>
  );
};
