export type BusinessCategory =
  | 'grocery'
  | 'supermarket'
  | 'mini_mart'
  | 'clothing'
  | 'electronics'
  | 'mobile'
  | 'pharmacy'
  | 'bakery'
  | 'restaurant'
  | 'cafe'
  | 'salon'
  | 'hardware'
  | 'stationery'
  | 'garage'
  | 'wholesale'
  | 'retail'
  | 'services'
  | 'other';

export type UserRole = 'owner' | 'manager' | 'cashier' | 'accountant' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  businessIds: string[];
  activeBusinessId: string;
  createdAt: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  tagline?: string;
  category: BusinessCategory;
  categoryName?: string;
  country: string;
  currency: string;
  currencySymbol: string;
  phone: string;
  email: string;
  address: string;
  taxNumber?: string;
  taxName?: string; // GST, VAT, TRN, Sales Tax
  taxRate: number; // default tax rate % e.g. 5 or 18
  taxInclusive: boolean;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  invoiceFooterNote?: string;
  logoUrl?: string;
  setupCompleted: boolean;
  setupStep?: number;
  plan: 'FREE' | 'STARTER' | 'BUSINESS' | 'PRO';
  createdAt: string;
}

export interface SavedAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  businessName: string;
  businessCategory: string;
  businessId: string;
  currency: string;
  token: string;
  lastSignedIn: string;
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  isMain: boolean;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  unit: string; // Piece, Kg, Gram, Liter, Box, Packet, Dozen, Service
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  taxPercent: number;
  currentStock: number;
  minStock: number;
  image?: string;
  description?: string;
  totalSold: number;
  totalRevenue: number;
  totalProfit: number;
  supplierName?: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  birthday?: string;
  anniversary?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  outstandingBalance: number;
  loyaltyPoints: number;
  lastVisit?: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  barcode?: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  discount: number; // flat or percentage converted
  taxPercent: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  profit: number;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT' | 'OTHER';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'DUE';

export interface Sale {
  id: string;
  businessId: string;
  branchId?: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  itemsCount: number;
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  totalCost: number;
  netProfit: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  amountDue: number;
  loyaltyPointsEarned: number;
  loyaltyPointsUsed: number;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  name: string;
  category: 'Rent' | 'Electricity' | 'Internet' | 'Salary' | 'Transport' | 'Marketing' | 'Maintenance' | 'Packaging' | 'Other';
  amount: number;
  paymentMethod: PaymentMethod;
  date: string;
  description?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  company: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  totalPurchases: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  businessId: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  createdAt: string;
}

export interface Offer {
  id: string;
  businessId: string;
  name: string;
  type: 'BOGO' | 'PERCENTAGE' | 'FLAT' | 'COMBO' | 'FESTIVAL';
  description: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  active: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  businessId: string;
  userId?: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  businessId: string;
  type: 'LOW_STOCK' | 'SALE' | 'PAYMENT_DUE' | 'OFFER' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface DashboardMetrics {
  todaySales: number;
  todaySalesGrowth: number;
  todayProfit: number;
  todayOrders: number;
  todayAvgOrderValue: number;
  yesterdaySales: number;
  totalCustomers: number;
  newCustomersToday: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  outstandingPayments: number;
  thisWeekSales: number;
  lastWeekSales: number;
  weeklyGrowth: number;
  thisMonthSales: number;
  thisMonthProfit: number;
  thisMonthExpenses: number;
  recentSales: Sale[];
  lowStockProducts: Product[];
  recentActivities: AuditLog[];
  weeklyBreakdown: Array<{
    day: string;
    date: string;
    sales: number;
    orders: number;
    profit: number;
    expenses: number;
  }>;
}
