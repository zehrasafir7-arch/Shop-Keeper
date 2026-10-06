import type {
  User,
  Business,
  Product,
  Customer,
  Sale,
  Expense,
  Offer,
  DashboardMetrics,
  AuditLog,
  AppNotification,
  SaleItem,
  PaymentMethod,
  PaymentStatus,
} from '../types/index.js';
import { localDb } from './localDb.js';
import { supabaseDb } from './supabaseDb.js';
import { isSupabaseConfigured, getSupabaseClient } from './supabase.js';

const API_BASE = '/api';

function getHeaders(): HeadersInit {
  const token =
    localStorage.getItem('business_billing_token') ||
    localStorage.getItem('shopkeeper_token');
  const activeBizId =
    localStorage.getItem('business_billing_active_biz') ||
    localStorage.getItem('shopkeeper_active_biz');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (activeBizId) {
    headers['x-business-id'] = activeBizId;
  }
  return headers;
}

function getActiveBizId(): string {
  return (
    localStorage.getItem('business_billing_active_biz') ||
    localStorage.getItem('shopkeeper_active_biz') ||
    'biz_dubai_mini_mart'
  );
}

export const api = {
  // --------------------------------------------------------------------------
  // AUTHENTICATION (SUPABASE AUTH WITH LOCAL FALLBACK)
  // --------------------------------------------------------------------------
  async register(data: any): Promise<{ user: User; business: Business; token: string }> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data: authRes, error } = await client.auth.signUp({
        email: data.email,
        password: data.password || 'password123',
        options: {
          data: {
            full_name: data.fullName || data.name || 'Owner',
            phone: data.phone || '',
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      const userId = authRes.user?.id || 'usr_' + Date.now();
      const newBiz = await supabaseDb.createBusiness(
        {
          name: data.businessName || 'My Business',
          category: data.category || 'retail',
          country: data.country || 'United Arab Emirates',
          currency: data.currency || 'AED',
          currencySymbol: data.currency === 'INR' ? '₹' : data.currency === 'USD' ? '$' : 'AED ',
          phone: data.phone || '',
          email: data.email || '',
          taxRate: Number(data.taxRate) || 5,
        },
        userId
      );

      const newUser: User = {
        id: userId,
        name: data.fullName || data.name || 'Owner',
        email: data.email,
        phone: data.phone || '',
        role: 'owner',
        businessIds: [newBiz.id],
        activeBusinessId: newBiz.id,
        createdAt: new Date().toISOString(),
      };

      return {
        user: newUser,
        business: newBiz,
        token: authRes.session?.access_token || 'supa_token_' + Date.now(),
      };
    }

    // Local / offline fallback
    const bizId = 'biz_' + Date.now();
    const userId = 'usr_' + Date.now();

    const newBiz: Business = {
      id: bizId,
      ownerId: userId,
      name: data.businessName || 'My Business',
      tagline: data.tagline || 'Quality Goods & Services',
      category: data.category || 'retail',
      country: data.country || 'United Arab Emirates',
      currency: data.currency || 'AED',
      currencySymbol: data.currency === 'INR' ? '₹' : data.currency === 'USD' ? '$' : 'AED ',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      taxNumber: data.taxNumber || '',
      taxName: data.taxName || 'VAT',
      taxRate: Number(data.taxRate) || 5,
      taxInclusive: !!data.taxInclusive,
      invoicePrefix: data.invoicePrefix || 'INV-',
      nextInvoiceNumber: 1001,
      invoiceFooterNote: 'Thank you for your business!',
      setupCompleted: true,
      plan: 'BUSINESS',
      createdAt: new Date().toISOString(),
    };

    const newUser: User = {
      id: userId,
      name: data.fullName || data.name || 'Owner',
      email: data.email,
      phone: data.phone || '',
      role: 'owner',
      businessIds: [bizId],
      activeBusinessId: bizId,
      createdAt: new Date().toISOString(),
    };

    return { user: newUser, business: newBiz, token: 'local_token_' + Date.now() };
  },

  async login(data: { email: string; password?: string }): Promise<{
    user: User;
    business: Business;
    businesses: Business[];
    token: string;
  }> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data: authRes, error } = await client.auth.signInWithPassword({
        email: data.email,
        password: data.password || 'password123',
      });

      if (error) {
        throw new Error(error.message);
      }

      const authUser = authRes.user;
      if (!authUser) throw new Error('User not found');

      // Fetch user profile & businesses from Supabase
      const { data: profile } = await client
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      let businesses = await supabaseDb.getBusinessesForUser(authUser.id);
      if (businesses.length === 0) {
        // Create an initial business for this account
        const initialBiz = await supabaseDb.createBusiness(
          {
            name: `${profile?.full_name || 'My'} Store`,
            category: 'retail',
            currency: 'AED',
            currencySymbol: 'AED ',
            email: authUser.email || '',
          },
          authUser.id
        );
        businesses = [initialBiz];
      }

      const activeBiz = businesses[0];
      const user: User = {
        id: authUser.id,
        name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        phone: profile?.phone || '',
        role: 'owner',
        businessIds: businesses.map((b) => b.id),
        activeBusinessId: activeBiz.id,
        createdAt: authUser.created_at || new Date().toISOString(),
      };

      return {
        user,
        business: activeBiz,
        businesses,
        token: authRes.session.access_token,
      };
    }

    // Local / demo fallback
    const email = data.email.toLowerCase().trim();
    const businesses = localDb.getBusinesses();
    const defaultBiz = businesses[0];

    if (email.includes('cashier')) {
      const cashierUser: User = {
        id: 'usr_demo_cashier',
        name: 'Salem Cashier',
        email: 'cashier@shopkeeperpro.com',
        phone: '+971 50 987 6543',
        role: 'cashier',
        businessIds: [defaultBiz.id],
        activeBusinessId: defaultBiz.id,
        createdAt: '2026-01-15T08:00:00.000Z',
      };
      return {
        user: cashierUser,
        business: defaultBiz,
        businesses: [defaultBiz],
        token: 'token_cashier_' + Date.now(),
      };
    }

    const ownerUser: User = {
      id: 'usr_demo_owner',
      name: 'Rashid Al Nuaimi',
      email: email || 'owner@dubaiminimart.ae',
      phone: '+971 50 123 4567',
      role: 'owner',
      businessIds: [defaultBiz.id],
      activeBusinessId: defaultBiz.id,
      createdAt: '2026-01-15T08:00:00.000Z',
    };
    return {
      user: ownerUser,
      business: defaultBiz,
      businesses: [defaultBiz],
      token: 'token_owner_' + Date.now(),
    };
  },

  async getMe(): Promise<{ user: User; business: Business; businesses: Business[] }> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient();
      const { data: sessionData } = await client.auth.getSession();
      const session = sessionData?.session;

      if (session?.user) {
        const authUser = session.user;
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const businesses = await supabaseDb.getBusinessesForUser(authUser.id);
        const activeBizId = getActiveBizId();
        const activeBiz = businesses.find((b) => b.id === activeBizId) || businesses[0] || localDb.getBusinesses()[0];

        const user: User = {
          id: authUser.id,
          name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          phone: profile?.phone || '',
          role: 'owner',
          businessIds: businesses.map((b) => b.id),
          activeBusinessId: activeBiz?.id || '',
          createdAt: authUser.created_at || new Date().toISOString(),
        };

        return { user, business: activeBiz, businesses };
      }
    }

    const cachedUser = localStorage.getItem('business_billing_user');
    const cachedBiz = localStorage.getItem('business_billing_active_biz_data');
    if (cachedUser && cachedBiz) {
      const u = JSON.parse(cachedUser);
      const b = JSON.parse(cachedBiz);
      return { user: u, business: b, businesses: [b] };
    }
    throw new Error('Not authenticated');
  },

  async forgotPassword(identifier: string): Promise<{ message: string; otpDemo: string }> {
    if (isSupabaseConfigured() && identifier.includes('@')) {
      const client = getSupabaseClient();
      await client.auth.resetPasswordForEmail(identifier);
      return {
        message: 'Password reset link sent to your email address via Supabase Auth.',
        otpDemo: 'Check your email inbox',
      };
    }
    return {
      message: 'Password reset code generated successfully.',
      otpDemo: '849201',
    };
  },

  // --------------------------------------------------------------------------
  // PRODUCTS & INVENTORY
  // --------------------------------------------------------------------------
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
      return supabaseDb.getProducts(getActiveBizId());
    }
    return localDb.getProducts(getActiveBizId());
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured()) {
      return supabaseDb.createProduct(getActiveBizId(), data);
    }
    const bizId = getActiveBizId();
    const newProd: Product = {
      id: 'prod_' + Date.now(),
      businessId: bizId,
      name: data.name || 'New Item',
      sku: data.sku || 'SKU-' + Date.now(),
      barcode: data.barcode || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      categoryId: data.categoryId || 'general',
      categoryName: data.categoryName || 'General',
      brand: data.brand || 'Store Brand',
      unit: data.unit || 'Piece',
      purchasePrice: Number(data.purchasePrice) || 0,
      sellingPrice: Number(data.sellingPrice) || 0,
      mrp: Number(data.mrp) || Number(data.sellingPrice) || 0,
      taxPercent: Number(data.taxPercent) || 0,
      currentStock: Number(data.currentStock) || 0,
      minStock: Number(data.minStock) || 5,
      totalSold: 0,
      totalRevenue: 0,
      totalProfit: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const prods = localDb.getProducts(bizId);
    prods.unshift(newProd);
    localDb.saveProducts(bizId, prods);
    return newProd;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured()) {
      return supabaseDb.updateProduct(id, updates);
    }
    const bizId = getActiveBizId();
    const prods = localDb.getProducts(bizId);
    const idx = prods.findIndex((p) => p.id === id);
    if (idx >= 0) {
      prods[idx] = { ...prods[idx], ...updates };
      localDb.saveProducts(bizId, prods);
      return prods[idx];
    }
    throw new Error('Product not found');
  },

  async adjustStock(id: string, adjustment: number, reason?: string): Promise<Product> {
    if (isSupabaseConfigured()) {
      return supabaseDb.adjustStock(id, adjustment, reason);
    }
    const bizId = getActiveBizId();
    const prods = localDb.getProducts(bizId);
    const prod = prods.find((p) => p.id === id);
    if (!prod) throw new Error('Product not found');
    prod.currentStock = Math.max(0, prod.currentStock + adjustment);
    localDb.saveProducts(bizId, prods);
    return prod;
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseConfigured()) {
      return supabaseDb.deleteProduct(id);
    }
    const bizId = getActiveBizId();
    const prods = localDb.getProducts(bizId).filter((p) => p.id !== id);
    localDb.saveProducts(bizId, prods);
  },

  // --------------------------------------------------------------------------
  // CUSTOMERS
  // --------------------------------------------------------------------------
  async getCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured()) {
      return supabaseDb.getCustomers(getActiveBizId());
    }
    return localDb.getCustomers(getActiveBizId());
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    if (isSupabaseConfigured()) {
      return supabaseDb.createCustomer(getActiveBizId(), data);
    }
    const bizId = getActiveBizId();
    const newCust: Customer = {
      id: 'cust_' + Date.now(),
      businessId: bizId,
      name: data.name || 'New Customer',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      totalSpent: 0,
      totalOrders: 0,
      loyaltyPoints: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString(),
    };
    localDb.saveCustomer(bizId, newCust);
    return newCust;
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    if (isSupabaseConfigured()) {
      return supabaseDb.updateCustomer(id, updates);
    }
    const bizId = getActiveBizId();
    const custs = localDb.getCustomers(bizId);
    const c = custs.find((x) => x.id === id);
    if (c) {
      Object.assign(c, updates);
      localDb.saveCustomer(bizId, c);
      return c;
    }
    throw new Error('Customer not found');
  },

  // --------------------------------------------------------------------------
  // SALES & BILLING
  // --------------------------------------------------------------------------
  async getSales(): Promise<Sale[]> {
    if (isSupabaseConfigured()) {
      return supabaseDb.getSales(getActiveBizId());
    }
    return localDb.getSales(getActiveBizId());
  },

  async createSale(data: any): Promise<Sale> {
    if (isSupabaseConfigured()) {
      return supabaseDb.createSale(getActiveBizId(), data);
    }
    const bizId = getActiveBizId();
    let subtotal = 0;
    let totalCost = 0;

    const saleItems: SaleItem[] = (data.items || []).map((it: any, idx: number) => {
      const itemTotal = it.quantity * it.sellingPrice;
      const itemCost = it.quantity * (it.purchasePrice || it.sellingPrice * 0.7);
      subtotal += itemTotal;
      totalCost += itemCost;

      return {
        id: 'item_' + idx + '_' + Date.now(),
        productId: it.productId,
        productName: it.productName,
        sku: 'SKU-' + it.productId,
        unit: 'Piece',
        quantity: it.quantity,
        purchasePrice: it.purchasePrice || it.sellingPrice * 0.7,
        sellingPrice: it.sellingPrice,
        discount: 0,
        taxPercent: 5,
        taxAmount: itemTotal * 0.05,
        subtotal: itemTotal,
        total: itemTotal,
        profit: itemTotal - itemCost,
      };
    });

    const discVal = Number(data.discountValue) || 0;
    const discountAmount = data.discountType === 'percentage' ? (subtotal * discVal) / 100 : discVal;
    const taxable = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxable * 0.05;
    const grandTotal = taxable + taxAmount;
    const netProfit = grandTotal - totalCost;

    const sale: Sale = {
      id: 'sale_' + Date.now(),
      businessId: bizId,
      invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
      customerId: data.customerId,
      customerName: data.customerName || 'Walk-in Customer',
      customerPhone: data.customerPhone,
      items: saleItems,
      itemsCount: saleItems.length,
      subtotal,
      discountType: data.discountType || 'fixed',
      discountValue: discVal,
      discountAmount,
      taxAmount,
      grandTotal,
      totalCost,
      netProfit,
      paymentMethod: data.paymentMethod || 'CASH',
      paymentStatus: 'PAID',
      amountPaid: data.amountPaid ?? grandTotal,
      amountDue: 0,
      loyaltyPointsEarned: Math.floor(grandTotal / 10),
      loyaltyPointsUsed: 0,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };

    localDb.saveSale(bizId, sale);
    return sale;
  },

  // --------------------------------------------------------------------------
  // DASHBOARD & ANALYTICS
  // --------------------------------------------------------------------------
  async getDashboard(): Promise<{ metrics: DashboardMetrics; business: Business }> {
    if (isSupabaseConfigured()) {
      const bizId = getActiveBizId();
      const metrics = await supabaseDb.getDashboardMetrics(bizId);
      const businesses = localDb.getBusinesses();
      return { metrics, business: businesses[0] };
    }
    const bizId = getActiveBizId();
    const metrics = localDb.getDashboardMetrics(bizId);
    const biz = localDb.getBusinesses()[0];
    return { metrics, business: biz };
  },

  async getWeeklySales(): Promise<{
    thisWeekSales: number;
    lastWeekSales: number;
    weeklyGrowth: number;
    weeklyBreakdown: Array<{
      day: string;
      date: string;
      sales: number;
      orders: number;
      profit: number;
      expenses: number;
    }>;
  }> {
    if (isSupabaseConfigured()) {
      return supabaseDb.getWeeklySales(getActiveBizId());
    }
    const metrics = localDb.getDashboardMetrics(getActiveBizId());
    return {
      thisWeekSales: metrics.thisWeekSales,
      lastWeekSales: metrics.lastWeekSales,
      weeklyGrowth: metrics.weeklyGrowth,
      weeklyBreakdown: metrics.weeklyBreakdown,
    };
  },

  // --------------------------------------------------------------------------
  // EXPENSES
  // --------------------------------------------------------------------------
  async getExpenses(): Promise<Expense[]> {
    if (isSupabaseConfigured()) {
      return supabaseDb.getExpenses(getActiveBizId());
    }
    return localDb.getExpenses(getActiveBizId());
  },

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    if (isSupabaseConfigured()) {
      return supabaseDb.createExpense(getActiveBizId(), data);
    }
    const bizId = getActiveBizId();
    const newExp: Expense = {
      id: 'exp_' + Date.now(),
      businessId: bizId,
      name: data.name || 'Expense',
      category: (data.category as any) || 'Other',
      amount: Number(data.amount) || 0,
      description: data.description || '',
      paymentMethod: data.paymentMethod || 'CASH',
      date: data.date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    localDb.saveExpense(bizId, newExp);
    return newExp;
  },

  // --------------------------------------------------------------------------
  // OFFERS
  // --------------------------------------------------------------------------
  async getOffers(): Promise<Offer[]> {
    if (isSupabaseConfigured()) {
      return supabaseDb.getOffers(getActiveBizId());
    }
    return [];
  },

  async createOffer(data: Partial<Offer>): Promise<Offer> {
    if (isSupabaseConfigured()) {
      return supabaseDb.createOffer(getActiveBizId(), data);
    }
    return data as Offer;
  },

  // --------------------------------------------------------------------------
  // BUSINESS MANAGEMENT
  // --------------------------------------------------------------------------
  async updateBusiness(id: string, updates: Partial<Business>): Promise<Business> {
    if (isSupabaseConfigured()) {
      return supabaseDb.updateBusiness(id, updates);
    }
    const businesses = localDb.getBusinesses();
    const b = businesses.find((x) => x.id === id) || businesses[0];
    return { ...b, ...updates };
  },

  async createBusiness(data: any): Promise<Business> {
    if (isSupabaseConfigured()) {
      return supabaseDb.createBusiness(data, 'usr_owner');
    }
    return {
      id: 'biz_' + Date.now(),
      ownerId: 'usr_owner',
      name: data.name,
      category: data.category || 'retail',
      country: data.country || 'United Arab Emirates',
      currency: data.currency || 'AED',
      currencySymbol: 'AED ',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      taxRate: 5,
      taxInclusive: true,
      invoicePrefix: 'INV-',
      nextInvoiceNumber: 1001,
      setupCompleted: true,
      plan: 'BUSINESS',
      createdAt: new Date().toISOString(),
    };
  },

  async switchBusiness(id: string): Promise<{ activeBusiness: Business }> {
    const businesses = localDb.getBusinesses();
    const b = businesses.find((x) => x.id === id) || businesses[0];
    return { activeBusiness: b };
  },

  // Notifications & Audit
  async getNotifications(): Promise<AppNotification[]> {
    return [];
  },

  async markNotificationRead(_id: string): Promise<void> {},

  async getAuditLogs(): Promise<AuditLog[]> {
    return [];
  },

  async askAIAssistant(_query: string): Promise<{ answer: string }> {
    return {
      answer: `Bussiness Billing AI: Real-time inventory is synced with your Supabase PostgreSQL cloud database! Keep stock levels optimized and reorder before thresholds are reached.`,
    };
  },

  async resetDemoSeed(): Promise<void> {
    localStorage.removeItem('bb_products_biz_dubai_mini_mart');
    localStorage.removeItem('bb_sales_biz_dubai_mini_mart');
    localStorage.removeItem('bb_customers_biz_dubai_mini_mart');
    localStorage.removeItem('bb_expenses_biz_dubai_mini_mart');
  },
};
