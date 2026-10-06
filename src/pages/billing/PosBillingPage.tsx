import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Barcode,
  Camera,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  CreditCard,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { offlineQueue } from '../../lib/offlineQueue.js';
import { OfflineSyncBadge } from '../../components/common/OfflineSyncBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { CameraBarcodeScannerModal } from '../../components/common/CameraBarcodeScannerModal.js';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner.js';
import { playBarcodeBeep } from '../../lib/audioBeep.js';
import confetti from 'canvas-confetti';
import type { Product, Customer, Sale, PaymentMethod } from '../../types/index.js';

interface PosBillingPageProps {
  onRefreshData?: () => void;
}

interface CartItem {
  product: Product;
  quantity: number;
  customPrice: number;
}

export const PosBillingPage: React.FC<PosBillingPageProps> = ({ onRefreshData }) => {
  const { activeBusiness } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [walkinName, setWalkinName] = useState('Walk-in Customer');
  const [walkinPhone, setWalkinPhone] = useState('');

  // Discount & Payment
  const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // Completed sale receipt modal
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  // Barcode input ref for fast scanner focus
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const currency = activeBusiness?.currencySymbol || 'AED ';

  const loadCatalog = async () => {
    try {
      const [prods, custs] = await Promise.all([api.getProducts(), api.getCustomers()]);
      setProducts(prods);
      setCustomers(custs);
    } catch (e) {
      console.error('Failed to load POS catalog', e);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, [activeBusiness?.id]);

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.categoryName || 'General')))];

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || (p.categoryName || 'General') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add product to cart
  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      setErrorMsg(`"${product.name}" is out of stock!`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.currentStock) {
          setErrorMsg(`Maximum available stock reached (${product.currentStock} units)`);
          setTimeout(() => setErrorMsg(null), 3000);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, customPrice: product.sellingPrice }];
    });
  };

  // Modify quantity
  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    const prod = products.find((p) => p.id === productId);
    if (prod && newQty > prod.currentStock) {
      setErrorMsg(`Stock limit exceeded. Only ${prod.currentStock} available.`);
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setErrorMsg(null);
  };

  // Calculate bill totals
  const subtotal = cart.reduce((sum, item) => sum + item.customPrice * item.quantity, 0);

  const discountAmount =
    discountType === 'percentage'
      ? Math.min(subtotal, (subtotal * discountValue) / 100)
      : Math.min(subtotal, discountValue);

  const discountedSubtotal = subtotal - discountAmount;
  const taxRate = activeBusiness?.taxRate || 0;
  const taxInclusive = activeBusiness?.taxInclusive ?? true;

  let taxAmount = 0;
  let grandTotal = 0;

  if (taxInclusive) {
    taxAmount = (discountedSubtotal * taxRate) / (100 + taxRate);
    grandTotal = discountedSubtotal;
  } else {
    taxAmount = (discountedSubtotal * taxRate) / 100;
    grandTotal = discountedSubtotal + taxAmount;
  }

  // Handle Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMsg('Please select at least one item to generate a bill.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const payload = {
      customerId: selectedCustomerId || undefined,
      customerName: selectedCustomer ? selectedCustomer.name : walkinName,
      customerPhone: selectedCustomer ? selectedCustomer.phone : walkinPhone || undefined,
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        sellingPrice: i.customPrice,
      })),
      discountType,
      discountValue,
      paymentMethod,
      amountPaid: grandTotal,
    };

    // If offline, queue locally and issue instant offline invoice
    if (!navigator.onLine) {
      const offlineItem = offlineQueue.enqueueBill(payload);
      const simulatedSale: Sale = {
        id: offlineItem.id,
        businessId: activeBusiness?.id || 'biz_offline',
        invoiceNumber: offlineItem.tempInvoiceNumber,
        customerId: payload.customerId,
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        itemsCount: cart.length,
        items: cart.map((c, idx) => ({
          id: 'item_' + idx,
          productId: c.product.id,
          productName: c.product.name,
          sku: c.product.sku,
          unit: c.product.unit,
          quantity: c.quantity,
          purchasePrice: c.product.purchasePrice,
          sellingPrice: c.customPrice,
          discount: 0,
          taxPercent: c.product.taxPercent || 0,
          taxAmount: 0,
          subtotal: c.customPrice * c.quantity,
          total: c.customPrice * c.quantity,
          profit: 0,
        })),
        subtotal,
        discountType,
        discountValue,
        discountAmount,
        taxAmount,
        grandTotal,
        totalCost: 0,
        netProfit: 0,
        paymentMethod,
        paymentStatus: 'PAID',
        amountPaid: grandTotal,
        amountDue: 0,
        loyaltyPointsEarned: Math.floor(grandTotal / 10),
        loyaltyPointsUsed: 0,
        notes: 'Recorded in Offline Mode. Queued for cloud sync.',
        createdAt: new Date().toISOString(),
      };

      setCompletedSale(simulatedSale);
      setIsReceiptOpen(true);
      clearCart();
      setIsProcessing(false);
      return;
    }

    try {
      const sale = await api.createSale(payload);
      setCompletedSale(sale);
      setIsReceiptOpen(true);
      clearCart();
      loadCatalog();
      if (onRefreshData) onRefreshData();

      // Confetti effect
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    } catch (err: any) {
      // If network failure occurs, fall back to offline queue
      if (!navigator.onLine || err.message?.includes('fetch') || err.message?.includes('network')) {
        const offlineItem = offlineQueue.enqueueBill(payload);
        setErrorMsg(`Network connection interrupted. Bill saved offline as #${offlineItem.tempInvoiceNumber} and will auto-sync when online.`);
        clearCart();
      } else {
        setErrorMsg(err.message || 'Failed to complete bill.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Universal barcode scan handler (Shared by Camera Scanner, USB Barcode Gun, and Enter key)
  const handleBarcodeScanned = (rawCode: string) => {
    const code = rawCode.trim().toLowerCase();
    if (!code) return;

    const matched = products.find(
      (p) =>
        p.barcode.toLowerCase() === code ||
        p.sku.toLowerCase() === code ||
        p.id.toLowerCase() === code
    );

    if (matched) {
      addToCart(matched);
      playBarcodeBeep();
      setSearchQuery('');
      setErrorMsg(null);
    } else {
      setErrorMsg(`No product found with barcode/SKU "${rawCode}"`);
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  // Hardware USB / Bluetooth handheld barcode scanner listener
  useBarcodeScanner({
    onScan: handleBarcodeScanned,
    enabled: !isReceiptOpen,
  });

  // Handle Form Submit (Manual Barcode or Enter Key)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    handleBarcodeScanned(searchQuery);
  };

  const handlePrint = () => {
    window.print();
  };

  const getWhatsAppInvoiceUrl = () => {
    if (!completedSale) return '#';
    const itemsText = completedSale.items
      .map((i) => `• ${i.productName} (${i.quantity} x ${currency}${i.sellingPrice}) = ${currency}${i.total}`)
      .join('%0A');

    const message = `*INVOICE: ${completedSale.invoiceNumber}*%0A*${activeBusiness?.name}*%0A------------------------%0A${itemsText}%0A------------------------%0A*Grand Total: ${currency}${completedSale.grandTotal.toFixed(2)}*%0APaid via: ${completedSale.paymentMethod}%0A%0A${activeBusiness?.invoiceFooterNote || 'Thank you for shopping with us!'}`;

    const phone = completedSale.customerPhone?.replace(/[^0-9]/g, '') || '';
    return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
  };

  return (
    <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-4">
      {/* Toast Alert */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-slate-700">
            ×
          </button>
        </div>
      )}

      {/* POS Two-Column Grid: Catalog on Left, Billing Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Product Catalog (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barcode & Search Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, SKU or scan barcode..."
                  className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsCameraScannerOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                title="Scan barcode using phone or webcam camera"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Camera Scanner</span>
                <span className="sm:hidden">Camera</span>
              </button>
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Barcode className="w-4 h-4" />
                <span>Scan / Enter</span>
              </button>
            </form>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[620px] overflow-y-auto pr-1">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No products found. Add products from the catalog.
              </div>
            ) : (
              filteredProducts.map((p) => {
                const isOutOfStock = p.currentStock <= 0;
                const isLow = p.currentStock <= p.minStock && !isOutOfStock;
                const inCart = cart.find((i) => i.product.id === p.id);

                return (
                  <div
                    key={p.id}
                    onClick={() => !isOutOfStock && addToCart(p)}
                    className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between select-none ${
                      isOutOfStock
                        ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed'
                        : inCart
                        ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-500/20 shadow-xs cursor-pointer'
                        : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                        {isOutOfStock ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                            Out
                          </span>
                        ) : isLow ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Low: {p.currentStock}
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold text-slate-400">
                            {p.currentStock} {p.unit}s
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-xs font-extrabold text-blue-600">
                          {currency}{p.sellingPrice.toFixed(2)}
                        </span>
                        <span className="text-[9px] text-slate-400 ml-1">/{p.unit}</span>
                      </div>

                      {inCart ? (
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                          {inCart.quantity}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Current Bill & Checkout (5 Cols on desktop) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-200/40 p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header: Customer Selector & Offline Status */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Current POS Bill</h3>
                <OfflineSyncBadge onSyncComplete={() => loadCatalog()} />
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Customer Information */}
            <div className="space-y-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Customer:
                </span>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const cust = customers.find((c) => c.id === e.target.value);
                    if (cust) {
                      setWalkinName(cust.name);
                      setWalkinPhone(cust.phone);
                    }
                  }}
                  className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 max-w-[170px]"
                >
                  <option value="">Walk-in Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedCustomerId && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="text"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg"
                  />
                  <input
                    type="tel"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <span>No items added yet. Click product cards or scan barcode on the left.</span>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {currency}{item.customPrice.toFixed(2)} x {item.quantity} {item.product.unit}
                      </p>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right shrink-0 w-16">
                      <p className="text-xs font-extrabold text-slate-900">
                        {currency}{(item.customPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Discounts & Taxes Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              {/* Discount Input */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-500 font-medium">Discount:</span>
                <div className="flex items-center gap-1">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-slate-50"
                  >
                    <option value="fixed">{currency}</option>
                    <option value="percentage">%</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-16 border border-slate-200 rounded px-2 py-0.5 text-right font-medium text-xs"
                  />
                </div>
              </div>

              {/* Subtotal */}
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{currency}{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount Applied:</span>
                  <span>-{currency}{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>
                  {activeBusiness?.taxName || 'Tax'} ({taxRate}% {taxInclusive ? 'Included' : 'Added'}):
                </span>
                <span>{currency}{taxAmount.toFixed(2)}</span>
              </div>

              {/* Grand Total */}
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                <span className="text-2xl font-black text-blue-600">
                  {currency}{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all border ${
                      paymentMethod === method
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Checkout CTA Button */}
          <div className="mt-5 pt-3 border-t border-slate-100">
            <button
              onClick={handleCheckout}
              disabled={isProcessing || cart.length === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {isProcessing
                  ? 'Processing Bill...'
                  : `Complete Payment (${currency}${grandTotal.toFixed(2)})`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Completed Invoice / Thermal Receipt Modal (Sections 18 & 19) */}
      {completedSale && (
        <Modal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          title="Payment Completed Successfully"
          subtitle={`Invoice #${completedSale.invoiceNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            {/* Thermal Receipt Paper Layout */}
            <div className="p-6 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono text-xs shadow-inner">
              {/* Receipt Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <h2 className="text-base font-bold tracking-tight uppercase">
                  {activeBusiness?.name}
                </h2>
                <p className="text-[10px] text-slate-600">{activeBusiness?.address}</p>
                <p className="text-[10px] text-slate-600">Tel: {activeBusiness?.phone}</p>
                {activeBusiness?.taxNumber && (
                  <p className="text-[10px] text-slate-600">
                    {activeBusiness.taxName || 'VAT'}/TRN: {activeBusiness.taxNumber}
                  </p>
                )}
              </div>

              {/* Invoice Meta */}
              <div className="py-2 border-b border-dashed border-slate-400 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Invoice:</span>
                  <span className="font-bold">{completedSale.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(completedSale.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{completedSale.customerName}</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1.5">
                {completedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="flex-1 pr-2">
                      <p className="font-bold">{item.productName}</p>
                      <p className="text-[10px] text-slate-500">
                        {item.quantity} x {currency}{item.sellingPrice.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold">{currency}{item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="py-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{currency}{completedSale.subtotal.toFixed(2)}</span>
                </div>
                {completedSale.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-{currency}{completedSale.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px]">
                  <span>{activeBusiness?.taxName || 'Tax'} Included:</span>
                  <span>{currency}{completedSale.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-300">
                  <span>TOTAL PAID:</span>
                  <span>{currency}{completedSale.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Method: {completedSale.paymentMethod}</span>
                  <span>Status: PAID</span>
                </div>
              </div>

              {/* Footer Greetings */}
              <div className="text-center pt-3 border-t border-dashed border-slate-400 text-[10px] text-slate-500">
                <p>{activeBusiness?.invoiceFooterNote || 'Thank you for your visit!'}</p>
                <p className="text-[9px] mt-0.5">Powered by Bussiness Billing SaaS</p>
              </div>
            </div>

            {/* Action Buttons: Print, WhatsApp Share, Close */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Receipt</span>
              </button>

              <a
                href={getWhatsAppInvoiceUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 text-center"
              >
                <Share2 className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Live Camera Barcode Scanner Modal */}
      <CameraBarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScan={handleBarcodeScanned}
        products={products}
        title="POS Camera Barcode Scanner"
        subtitle="Point camera at product barcode to immediately add to current bill"
      />
    </div>
  );
};
