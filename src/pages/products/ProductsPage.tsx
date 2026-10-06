import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  Boxes,
  ArrowUpDown,
  CheckCircle,
  Camera,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../lib/api.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../components/common/Toast.js';
import { CameraBarcodeScannerModal } from '../../components/common/CameraBarcodeScannerModal.js';
import type { Product } from '../../types/index.js';

interface ProductsPageProps {
  isAddProductOpen?: boolean;
  onCloseAddProduct?: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  isAddProductOpen: externalAddOpen,
  onCloseAddProduct: externalCloseAdd,
}) => {
  const { activeBusiness } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals
  const [internalAddOpen, setInternalAddOpen] = useState(false);
  const isAddOpen = externalAddOpen !== undefined ? externalAddOpen : internalAddOpen;
  const closeAddModal = () => {
    if (externalCloseAdd) externalCloseAdd();
    setInternalAddOpen(false);
  };

  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState('Stock Count Correction');

  // Add Product Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryName, setCategoryName] = useState('Snacks & Confectionery');
  const [unit, setUnit] = useState('Piece');
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [mrp, setMrp] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(activeBusiness?.taxRate || 5);
  const [currentStock, setCurrentStock] = useState<number>(20);
  const [minStock, setMinStock] = useState<number>(10);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  const currency = activeBusiness?.currencySymbol || 'AED ';

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (e) {
      console.error('Failed to load products', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [activeBusiness?.id]);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.categoryName || 'General')))];

  const filteredProducts = products.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || p.categoryName === categoryFilter;
    return matchesQuery && matchesCat;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || sellingPrice <= 0) {
      showToast('Product name and a valid selling price are required.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createProduct({
        name,
        sku: sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
        barcode: barcode || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
        categoryName,
        unit,
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        mrp: Number(mrp) || Number(sellingPrice),
        taxPercent: Number(taxPercent),
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        description,
      });

      // Reset form
      setName('');
      setSku('');
      setBarcode('');
      setPurchasePrice(0);
      setSellingPrice(0);
      closeAddModal();
      loadProducts();
      showToast('Product added to catalog successfully!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to add product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    try {
      await api.adjustStock(adjustingProduct.id, adjustmentQty, adjustmentReason);
      setAdjustingProduct(null);
      setAdjustmentQty(0);
      loadProducts();
      showToast(`Stock updated for ${adjustingProduct.name}`, 'success');
    } catch (e) {
      showToast('Failed to adjust stock', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, prodName: string) => {
    try {
      await api.deleteProduct(id);
      loadProducts();
      showToast(`Archived "${prodName}"`, 'info');
    } catch (e) {
      showToast('Failed to archive product', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider">
            <Package className="w-4 h-4" />
            <span>Product Catalog & Pricing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Products & Stock</h1>
          <p className="text-xs text-slate-500">
            Manage barcodes, SKU codes, purchase costs, selling prices, and reorder levels.
          </p>
        </div>

        <button
          onClick={() => setInternalAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or barcode..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table (Section 20) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-semibold text-slate-400 bg-slate-50/80 uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Purchase Cost</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Profit / Unit</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const profitUnit = p.sellingPrice - p.purchasePrice;
                  const marginPercent = p.sellingPrice > 0 ? (profitUnit / p.sellingPrice) * 100 : 0;
                  const isLow = p.currentStock <= p.minStock && p.currentStock > 0;
                  const isOut = p.currentStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.unit} format</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        <p>{p.sku}</p>
                        <p className="text-[10px] text-slate-400">{p.barcode}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {p.categoryName}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {currency}{p.purchasePrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-600">
                        {currency}{p.sellingPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">
                        {currency}{profitUnit.toFixed(2)} ({marginPercent.toFixed(0)}%)
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {p.currentStock} {p.unit}s
                          </span>
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustmentQty(0);
                            }}
                            title="Adjust Stock"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                          >
                            <Boxes className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            title="Archive Product"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal (Section 21) */}
      <Modal
        isOpen={isAddOpen}
        onClose={closeAddModal}
        title="Add New Catalog Product"
        subtitle="Specify product prices, barcode, units, and minimum stock threshold"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Masafi Mineral Water 1.5L"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Leave blank to auto-generate"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Barcode</label>
                <button
                  type="button"
                  onClick={() => setIsCameraScannerOpen(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan via Camera</span>
                </button>
              </div>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan or enter 12-digit barcode"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Snacks, Dairy, Beverages, etc."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Packaging Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="Piece">Piece</option>
                <option value="Packet">Packet</option>
                <option value="Box">Box</option>
                <option value="Kg">Kg (Kilogram)</option>
                <option value="Gram">Gram</option>
                <option value="Liter">Liter</option>
                <option value="Bottle">Bottle</option>
                <option value="Dozen">Dozen</option>
                <option value="Service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Price ({currency})</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price ({currency}) *</label>
              <input
                type="number"
                step="0.01"
                min={0.01}
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Stock</label>
              <input
                type="number"
                min={0}
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Low-Stock Alert Threshold</label>
              <input
                type="number"
                min={1}
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
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
              {isSubmitting ? 'Saving...' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <Modal
          isOpen={!!adjustingProduct}
          onClose={() => setAdjustingProduct(null)}
          title={`Adjust Stock: ${adjustingProduct.name}`}
          subtitle={`Current Available: ${adjustingProduct.currentStock} ${adjustingProduct.unit}s`}
          maxWidth="sm"
        >
          <form onSubmit={handleAdjustStock} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stock Quantity to Add / Deduct
              </label>
              <p className="text-[11px] text-slate-400 mb-1">
                Enter positive number to add (e.g. +10) or negative to deduct (e.g. -5 for damaged goods).
              </p>
              <input
                type="number"
                value={adjustmentQty}
                onChange={(e) => setAdjustmentQty(Number(e.target.value))}
                placeholder="+10 or -5"
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Adjustment</label>
              <select
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white"
              >
                <option value="New stock delivery count">New stock delivery count</option>
                <option value="Physical count audit correction">Physical count audit correction</option>
                <option value="Damaged / Expired stock write-off">Damaged / Expired stock write-off</option>
                <option value="Customer returned item">Customer returned item</option>
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
              >
                Save Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Live Camera Barcode Scanner Modal */}
      <CameraBarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScan={(code) => {
          setBarcode(code);
          showToast(`Scanned Barcode: ${code}`, 'success');
          setIsCameraScannerOpen(false);
        }}
        products={products}
        title="Scan Product Barcode"
        subtitle="Point camera at product to auto-fill barcode into product form"
      />
    </div>
  );
};
