// Client-Side Database & Storage for Netlify Static Hosting & Offline Standalone Mode
import type {
  User,
  Business,
  Product,
  Customer,
  Sale,
  Expense,
  DashboardMetrics,
} from '../types/index.js';

const DEMO_BIZ: Business = {
  id: 'biz_dubai_mini_mart',
  ownerId: 'usr_demo_owner',
  name: 'Dubai Mini Mart',
  tagline: 'Your Neighborhood Grocery Store',
  category: 'mini_mart',
  country: 'United Arab Emirates',
  currency: 'AED',
  currencySymbol: 'AED',
  phone: '+971 50 123 4567',
  email: 'store@dubaiminimart.ae',
  address: 'Shop 14, Al Barsha 1, Dubai, UAE',
  taxNumber: '100234567800003',
  taxName: 'VAT',
  taxRate: 5,
  taxInclusive: false,
  invoicePrefix: 'DMM-',
  nextInvoiceNumber: 1045,
  invoiceFooterNote: 'Thank you for shopping with Dubai Mini Mart! Fresh goods guaranteed.',
  setupCompleted: true,
  plan: 'BUSINESS',
  createdAt: '2026-01-15T08:00:00.000Z',
};

const DEMO_OWNER: User = {
  id: 'usr_demo_owner',
  name: 'Rashid Al Nuaimi',
  email: 'demo@shopkeeperpro.com',
  phone: '+971 50 123 4567',
  role: 'owner',
  businessIds: ['biz_dubai_mini_mart'],
  activeBusinessId: 'biz_dubai_mini_mart',
  createdAt: '2026-01-15T08:00:00.000Z',
};

const DEMO_CASHIER: User = {
  id: 'usr_demo_cashier',
  name: 'Salem Cashier',
  email: 'cashier@shopkeeperpro.com',
  phone: '+971 50 987 6543',
  role: 'cashier',
  businessIds: ['biz_dubai_mini_mart'],
  activeBusinessId: 'biz_dubai_mini_mart',
  createdAt: '2026-01-15T08:00:00.000Z',
};

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    businessId: 'biz_dubai_mini_mart',
    name: 'Al Rawabi Fresh Milk 1L',
    sku: 'MILK-RAW-1L',
    barcode: '6291003001015',
    categoryId: 'dairy',
    categoryName: 'Dairy',
    brand: 'Al Rawabi',
    unit: 'Bottle',
    purchasePrice: 5.5,
    sellingPrice: 7.0,
    mrp: 7.0,
    taxPercent: 5,
    currentStock: 42,
    minStock: 10,
    totalSold: 120,
    totalRevenue: 840,
    totalProfit: 180,
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 'prod_2',
    businessId: 'biz_dubai_mini_mart',
    name: 'Lipton Yellow Label Tea 100 Bags',
    sku: 'TEA-LIP-100',
    barcode: '6221155010041',
    categoryId: 'beverages',
    categoryName: 'Beverages',
    brand: 'Lipton',
    unit: 'Box',
    purchasePrice: 14.0,
    sellingPrice: 19.5,
    mrp: 20.0,
    taxPercent: 5,
    currentStock: 28,
    minStock: 5,
    totalSold: 65,
    totalRevenue: 1267.5,
    totalProfit: 357.5,
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 'prod_3',
    businessId: 'biz_dubai_mini_mart',
    name: 'Basmati Rice Premium 5KG',
    sku: 'RICE-BAS-5KG',
    barcode: '8901234567890',
    categoryId: 'grains',
    categoryName: 'Grains & Pulses',
    brand: 'India Gate',
    unit: 'Bag',
    purchasePrice: 32.0,
    sellingPrice: 45.0,
    mrp: 48.0,
    taxPercent: 0,
    currentStock: 16,
    minStock: 4,
    totalSold: 30,
    totalRevenue: 1350,
    totalProfit: 390,
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 'prod_4',
    businessId: 'biz_dubai_mini_mart',
    name: 'Nutella Hazelnut Spread 750g',
    sku: 'NUT-750G',
    barcode: '8000500179864',
    categoryId: 'spreads',
    categoryName: 'Spreads & Jam',
    brand: 'Ferrero',
    unit: 'Jar',
    purchasePrice: 22.0,
    sellingPrice: 29.5,
    mrp: 31.0,
    taxPercent: 5,
    currentStock: 20,
    minStock: 5,
    totalSold: 40,
    totalRevenue: 1180,
    totalProfit: 300,
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: 'prod_5',
    businessId: 'biz_dubai_mini_mart',
    name: 'Coca-Cola Can 330ml (Pack of 6)',
    sku: 'COKE-CAN-6P',
    barcode: '5449000000996',
    categoryId: 'beverages',
    categoryName: 'Beverages',
    brand: 'Coca-Cola',
    unit: 'Pack',
    purchasePrice: 11.5,
    sellingPrice: 15.0,
    mrp: 15.0,
    taxPercent: 5,
    currentStock: 50,
    minStock: 12,
    totalSold: 85,
    totalRevenue: 1275,
    totalProfit: 297.5,
    status: 'active',
    createdAt: '2026-01-15',
  },
];

const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'cust_1',
    businessId: 'biz_dubai_mini_mart',
    name: 'Ahmed Mansoor',
    phone: '+971 55 432 1098',
    email: 'ahmed.m@example.com',
    address: 'Villa 12, Al Barsha 2, Dubai',
    totalSpent: 1420.5,
    totalOrders: 14,
    loyaltyPoints: 142,
    outstandingBalance: 0,
    createdAt: '2026-02-01',
  },
  {
    id: 'cust_2',
    businessId: 'biz_dubai_mini_mart',
    name: 'Fatima Zahra',
    phone: '+971 52 876 5432',
    email: 'fatima.z@example.com',
    address: 'Apt 402, Marina Tower, Dubai',
    totalSpent: 890.0,
    totalOrders: 8,
    loyaltyPoints: 89,
    outstandingBalance: 50.0,
    createdAt: '2026-02-15',
  },
];

function getLocal<T>(key: string, defaultVal: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(data);
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }
}

export const localDb = {
  getUsers(): User[] {
    return getLocal<User[]>('bb_users', [DEMO_OWNER, DEMO_CASHIER]);
  },

  getBusinesses(): Business[] {
    return getLocal<Business[]>('bb_businesses', [DEMO_BIZ]);
  },

  getProducts(bizId: string): Product[] {
    return getLocal<Product[]>('bb_products_' + bizId, SEED_PRODUCTS);
  },

  saveProducts(bizId: string, prods: Product[]): void {
    setLocal('bb_products_' + bizId, prods);
  },

  getSales(bizId: string): Sale[] {
    return getLocal<Sale[]>('bb_sales_' + bizId, []);
  },

  saveSale(bizId: string, sale: Sale): void {
    const sales = this.getSales(bizId);
    sales.unshift(sale);
    setLocal('bb_sales_' + bizId, sales);

    // deduct stock
    const prods = this.getProducts(bizId);
    sale.items.forEach((item) => {
      const prod = prods.find((p) => p.id === item.productId);
      if (prod) {
        prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
        prod.totalSold = (prod.totalSold || 0) + item.quantity;
        prod.totalRevenue = (prod.totalRevenue || 0) + item.total;
      }
    });
    this.saveProducts(bizId, prods);
  },

  getCustomers(bizId: string): Customer[] {
    return getLocal<Customer[]>('bb_customers_' + bizId, SEED_CUSTOMERS);
  },

  saveCustomer(bizId: string, customer: Customer): void {
    const custs = this.getCustomers(bizId);
    const idx = custs.findIndex((c) => c.id === customer.id);
    if (idx >= 0) custs[idx] = customer;
    else custs.push(customer);
    setLocal('bb_customers_' + bizId, custs);
  },

  getExpenses(bizId: string): Expense[] {
    return getLocal<Expense[]>('bb_expenses_' + bizId, []);
  },

  saveExpense(bizId: string, expense: Expense): void {
    const exps = this.getExpenses(bizId);
    exps.unshift(expense);
    setLocal('bb_expenses_' + bizId, exps);
  },

  getDashboardMetrics(bizId: string): DashboardMetrics {
    const sales = this.getSales(bizId);
    const prods = this.getProducts(bizId);

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter((s) => s.createdAt.startsWith(todayStr));

    const todayRevenue = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);
    const todayProfit = todaySales.reduce((acc, s) => acc + (s.netProfit || s.grandTotal * 0.25), 0);
    const todayOrdersCount = todaySales.length;

    const lowStockCount = prods.filter((p) => p.currentStock <= p.minStock).length;

    return {
      todaySales: todayRevenue,
      todaySalesGrowth: 8.5,
      todayProfit: todayProfit,
      todayOrders: todayOrdersCount,
      todayAvgOrderValue: todayOrdersCount > 0 ? todayRevenue / todayOrdersCount : 0,
      yesterdaySales: 1250,
      totalCustomers: this.getCustomers(bizId).length,
      newCustomersToday: 2,
      totalProducts: prods.length,
      lowStockCount,
      outOfStockCount: prods.filter((p) => p.currentStock <= 0).length,
      outstandingPayments: 50.0,
      thisWeekSales: todayRevenue * 5.8 + 3400,
      lastWeekSales: 4120,
      weeklyGrowth: 14.2,
      thisMonthSales: todayRevenue * 24 + 12000,
      thisMonthProfit: todayProfit * 24 + 3200,
      thisMonthExpenses: 1200,
      recentSales: sales.slice(0, 5),
      lowStockProducts: prods.filter((p) => p.currentStock <= p.minStock),
      recentActivities: [],
      weeklyBreakdown: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => ({
        day,
        date: `2026-03-${10 + idx}`,
        sales: 650 + idx * 110,
        orders: 14 + idx * 2,
        profit: 180 + idx * 30,
        expenses: 40 + idx * 5,
      })),
    };
  },
};
