import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { store } from './src/server/db.js';
import { generateAndroidProjectZip } from './server/androidProjectGenerator.js';
import type { User, Business, Product, Customer, Sale, Expense, Purchase, Offer } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Serve Web App Manifest
app.get('/manifest.webmanifest', (_req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'public/manifest.webmanifest'), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
    },
  });
});

// Serve Digital Asset Links for Google Play Store / Android Trusted Web Activities (TWA)
app.get('/.well-known/assetlinks.json', (_req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'public/.well-known/assetlinks.json'), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
});

// Multi-tenant business context helper
function getBusinessId(req: Request): string {
  const headerId = req.headers['x-business-id'];
  if (typeof headerId === 'string' && headerId.trim()) {
    return headerId.trim();
  }
  const queryId = req.query.businessId;
  if (typeof queryId === 'string' && queryId.trim()) {
    return queryId.trim();
  }
  return 'biz_dubai_mini_mart';
}

// ----------------- AUTH APIS -----------------

// POST /api/auth/register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, businessName, phone, email, password, businessType, country, currency } = req.body;

    if (!name || !businessName || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    const existingUser = store.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = 'usr_' + Date.now();
    const businessId = 'biz_' + Date.now();

    const currencySymbolMap: Record<string, string> = {
      INR: '₹',
      AED: 'AED ',
      USD: '$',
      EUR: '€',
      GBP: '£',
      SAR: 'SAR ',
      OMR: 'OMR ',
      KWD: 'KWD ',
    };

    const selectedCurrency = currency || 'INR';
    const currencySymbol = currencySymbolMap[selectedCurrency] || selectedCurrency + ' ';

    // 1. Create Business
    const newBusiness: Business = {
      id: businessId,
      ownerId: userId,
      name: businessName,
      tagline: 'Billing Made Simple. Business Made Smarter.',
      category: businessType || 'retail',
      categoryName: businessType ? businessType.toUpperCase() : 'Retail Store',
      country: country || 'India',
      currency: selectedCurrency,
      currencySymbol,
      phone: phone || '',
      email,
      address: '',
      taxNumber: '',
      taxName: selectedCurrency === 'INR' ? 'GST' : 'VAT',
      taxRate: selectedCurrency === 'INR' ? 18 : 5,
      taxInclusive: true,
      invoicePrefix: businessName.substring(0, 3).toUpperCase() + '-INV-',
      nextInvoiceNumber: 1001,
      invoiceFooterNote: 'Thank you for your business! Please visit again.',
      setupCompleted: false,
      setupStep: 1,
      plan: 'STARTER',
      createdAt: new Date().toISOString(),
    };

    store.createBusiness(newBusiness);

    // 2. Create User
    const newUser: User = {
      id: userId,
      name,
      email,
      phone: phone || '',
      role: 'owner',
      businessIds: [businessId],
      activeBusinessId: businessId,
      createdAt: new Date().toISOString(),
    };

    store.createUser(newUser);

    // Create Audit Log
    store.getData().auditLogs.unshift({
      id: 'log_' + Date.now(),
      businessId,
      userId,
      userName: name,
      action: 'Account Created',
      details: `User registered with business ${businessName}`,
      timestamp: new Date().toISOString(),
    });

    return res.status(201).json({
      user: newUser,
      business: newBusiness,
      token: `token_${userId}_${Date.now()}`,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password.' });
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Demo/Simple verification (for production SaaS: bcrypt)
    if (password !== 'password123' && password.length < 4) {
      return res.status(401).json({ error: 'Invalid password. Try "password123" for demo accounts.' });
    }

    const businesses = store.getBusinessesForUser(user.id);
    const activeBusiness = businesses.find((b) => b.id === user.activeBusinessId) || businesses[0];

    return res.json({
      user,
      business: activeBusiness,
      businesses,
      token: `token_${user.id}_${Date.now()}`,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', (req: Request, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Find user by token prefix or default to demo owner
  const userId = token.startsWith('token_') ? token.split('_')[1] : 'usr_owner_demo';
  const user = store.findUserById(userId) || store.findUserById('usr_owner_demo');

  if (!user) {
    return res.status(401).json({ error: 'Session expired' });
  }

  const businesses = store.getBusinessesForUser(user.id);
  const activeBusiness =
    businesses.find((b) => b.id === user.activeBusinessId) ||
    store.findBusinessById('biz_dubai_mini_mart') ||
    businesses[0];

  return res.json({
    user,
    business: activeBusiness,
    businesses,
  });
});

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Please enter registered email or mobile number.' });
  }
  return res.json({
    message: `Password reset verification link and OTP sent to ${identifier}.`,
    otpDemo: '482901',
  });
});

// ----------------- BUSINESS APIS -----------------

// GET /api/businesses
app.get('/api/businesses', (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || 'usr_owner_demo';
  const businesses = store.getBusinessesForUser(userId);
  return res.json(businesses);
});

// POST /api/businesses
app.post('/api/businesses', (req: Request, res: Response) => {
  try {
    const { ownerId, name, category, currency, address, phone } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Business name is required.' });
    }

    const businessId = 'biz_' + Date.now();
    const currencyMap: Record<string, string> = {
      INR: '₹',
      AED: 'AED ',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const newBiz: Business = {
      id: businessId,
      ownerId: ownerId || 'usr_owner_demo',
      name,
      category: category || 'retail',
      country: 'United Arab Emirates',
      currency: currency || 'AED',
      currencySymbol: currencyMap[currency || 'AED'] || currency + ' ',
      phone: phone || '',
      email: '',
      address: address || '',
      taxRate: 5,
      taxInclusive: true,
      invoicePrefix: name.substring(0, 3).toUpperCase() + '-',
      nextInvoiceNumber: 1001,
      setupCompleted: true,
      plan: 'STARTER',
      createdAt: new Date().toISOString(),
    };

    store.createBusiness(newBiz);

    // Link to user
    const user = store.findUserById(ownerId || 'usr_owner_demo');
    if (user) {
      user.businessIds.push(businessId);
      user.activeBusinessId = businessId;
      store.updateUser(user.id, user);
    }

    return res.status(201).json(newBiz);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create business.' });
  }
});

// PUT /api/businesses/:id
app.put('/api/businesses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = store.updateBusiness(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Business not found.' });
  }
  return res.json(updated);
});

// POST /api/businesses/:id/switch
app.post('/api/businesses/:id/switch', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.body;
  const biz = store.findBusinessById(id);
  if (!biz) {
    return res.status(404).json({ error: 'Business not found' });
  }
  if (userId) {
    store.updateUser(userId, { activeBusinessId: id });
  }
  return res.json({ activeBusiness: biz });
});

// ----------------- DASHBOARD & ANALYTICS APIS -----------------

// GET /api/dashboard
app.get('/api/dashboard', (req: Request, res: Response) => {
  const businessId = getBusinessId(req);
  const metrics = store.getDashboardMetrics(businessId);
  const business = store.findBusinessById(businessId);
  return res.json({
    metrics,
    business,
  });
});

// GET /api/sales/weekly
app.get('/api/sales/weekly', (req: Request, res: Response) => {
  const businessId = getBusinessId(req);
  const metrics = store.getDashboardMetrics(businessId);
  return res.json({
    thisWeekSales: metrics.thisWeekSales,
    lastWeekSales: metrics.lastWeekSales,
    weeklyGrowth: metrics.weeklyGrowth,
    weeklyBreakdown: metrics.weeklyBreakdown,
  });
});

// ----------------- PRODUCTS & INVENTORY APIS -----------------

// GET /api/products
app.get('/api/products', (req: Request, res: Response) => {
  const businessId = getBusinessId(req);
  const products = store.getProducts(businessId);
  return res.json(products);
});

// POST /api/products
app.post('/api/products', (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    const {
      name,
      sku,
      barcode,
      categoryId,
      categoryName,
      brand,
      unit,
      purchasePrice,
      sellingPrice,
      mrp,
      taxPercent,
      currentStock,
      minStock,
      description,
    } = req.body;

    if (!name || sellingPrice === undefined) {
      return res.status(400).json({ error: 'Product name and selling price are required.' });
    }

    const pPrice = Number(purchasePrice) || 0;
    const sPrice = Number(sellingPrice) || 0;

    if (pPrice < 0 || sPrice < 0) {
      return res.status(400).json({ error: 'Prices cannot be negative.' });
    }

    const newProd: Product = {
      id: 'prod_' + Date.now(),
      businessId,
      name,
      sku: sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      barcode: barcode || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      categoryId: categoryId || 'general',
      categoryName: categoryName || 'General',
      brand: brand || 'Store Brand',
      unit: unit || 'Piece',
      purchasePrice: pPrice,
      sellingPrice: sPrice,
      mrp: Number(mrp) || sPrice,
      taxPercent: Number(taxPercent) || 0,
      currentStock: Number(currentStock) || 0,
      minStock: Number(minStock) || 5,
      description: description || '',
      totalSold: 0,
      totalRevenue: 0,
      totalProfit: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    store.createProduct(newProd);

    // Audit log
    store.getData().auditLogs.unshift({
      id: 'log_' + Date.now(),
      businessId,
      userName: 'Manager',
      action: 'Product Added',
      details: `Added "${newProd.name}" (Stock: ${newProd.currentStock})`,
      timestamp: new Date().toISOString(),
    });

    return res.status(201).json(newProd);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create product.' });
  }
});

// PUT /api/products/:id
app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const updated = store.updateProduct(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  return res.json(updated);
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const success = store.deleteProduct(id);
  if (!success) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  return res.json({ message: 'Product archived successfully.' });
});

// POST /api/products/:id/adjust-stock
app.post('/api/products/:id/adjust-stock', (req: Request, res: Response) => {
  const { id } = req.params;
  const { adjustment, reason } = req.body;
  const prod = store.findProductById(id);
  if (!prod) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const newStock = Math.max(0, prod.currentStock + Number(adjustment));
  const diff = newStock - prod.currentStock;
  prod.currentStock = newStock;
  store.updateProduct(id, { currentStock: newStock });

  store.getData().auditLogs.unshift({
    id: 'log_' + Date.now(),
    businessId: prod.businessId,
    userName: 'Manager',
    action: 'Stock Adjusted',
    details: `${prod.name}: ${diff >= 0 ? '+' : ''}${diff} units (${reason || 'Manual count'})`,
    timestamp: new Date().toISOString(),
  });

  return res.json(prod);
});

// ----------------- CUSTOMERS APIS -----------------

// GET /api/customers
app.get('/api/customers', (req: Request, res: Response) => {
  const businessId = getBusinessId(req);
  const customers = store.getCustomers(businessId);
  return res.json(customers);
});

// POST /api/customers
app.post('/api/customers', (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    const { name, phone, whatsapp, email, address, notes } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Customer name and phone number are required.' });
    }

    const newCust: Customer = {
      id: 'cust_' + Date.now(),
      businessId,
      name,
      phone,
      whatsapp: whatsapp || phone,
      email: email || '',
      address: address || '',
      notes: notes || '',
      totalOrders: 0,
      totalSpent: 0,
      outstandingBalance: 0,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
    };

    store.createCustomer(newCust);
    return res.status(201).json(newCust);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create customer.' });
  }
});

// ----------------- BILLING & SALES APIS -----------------

// GET /api/sales
app.get('/api/sales', (req: Request, res: Response) => {
  const businessId = getBusinessId(req);
  const sales = store.getSales(businessId);
  return res.json(sales);
});

// POST /api/sales - Checkout Transaction
app.post('/api/sales', (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    const business = store.findBusinessById(businessId);
    const {
      customerId,
      customerName,
      customerPhone,
      items,
      discountType = 'fixed',
      discountValue = 0,
      paymentMethod = 'CASH',
      amountPaid,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Please add items to create bill.' });
    }

    let subtotal = 0;
    let totalCost = 0;
    const processedItems = [];

    // Verify stock and calculate subtotal/profit
    for (const item of items) {
      const prod = store.findProductById(item.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${item.productName || item.productId}` });
      }

      const qty = Number(item.quantity);
      if (qty <= 0) {
        return res.status(400).json({ error: `Invalid quantity for ${prod.name}` });
      }

      if (prod.currentStock < qty) {
        return res.status(400).json({
          error: `Insufficient stock for "${prod.name}". Available: ${prod.currentStock}, Requested: ${qty}`,
        });
      }

      const unitPrice = Number(item.sellingPrice || prod.sellingPrice);
      const unitCost = Number(prod.purchasePrice || 0);
      const lineTotal = unitPrice * qty;
      const lineCost = unitCost * qty;
      const lineProfit = lineTotal - lineCost;

      subtotal += lineTotal;
      totalCost += lineCost;

      processedItems.push({
        id: 'item_' + Date.now() + Math.random().toString(36).substring(2, 5),
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        unit: prod.unit,
        quantity: qty,
        purchasePrice: unitCost,
        sellingPrice: unitPrice,
        discount: 0,
        taxPercent: prod.taxPercent || 0,
        taxAmount: Math.round(((lineTotal * (prod.taxPercent || 0)) / 100) * 100) / 100,
        subtotal: lineTotal,
        total: lineTotal,
        profit: lineProfit,
      });
    }

    // Discount calculation
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * Number(discountValue || 0)) / 100;
    } else {
      discountAmount = Number(discountValue || 0);
    }
    discountAmount = Math.min(discountAmount, subtotal);

    const discountedSubtotal = subtotal - discountAmount;

    // Tax calculation based on business tax settings
    const taxRate = business?.taxRate || 0;
    let taxAmount = 0;
    let grandTotal = 0;

    if (business?.taxInclusive) {
      // If prices are inclusive of tax
      taxAmount = Math.round(((discountedSubtotal * taxRate) / (100 + taxRate)) * 100) / 100;
      grandTotal = discountedSubtotal;
    } else {
      taxAmount = Math.round(((discountedSubtotal * taxRate) / 100) * 100) / 100;
      grandTotal = discountedSubtotal + taxAmount;
    }

    const netProfit = grandTotal - totalCost;

    // Invoice Number Generation
    const prefix = business?.invoicePrefix || 'INV-';
    const nextNum = business?.nextInvoiceNumber || 1001;
    const invoiceNumber = `${prefix}${nextNum}`;

    const paid = amountPaid !== undefined ? Number(amountPaid) : grandTotal;
    const due = Math.max(0, grandTotal - paid);
    const paymentStatus = due === 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'DUE';

    const loyaltyEarned = Math.floor(grandTotal / 10); // 1 point per 10 currency units

    const newSale: Sale = {
      id: 'sale_' + Date.now(),
      businessId,
      invoiceNumber,
      customerId: customerId || undefined,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || undefined,
      itemsCount: processedItems.length,
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountType,
      discountValue: Number(discountValue) || 0,
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      paymentMethod,
      paymentStatus,
      amountPaid: Math.round(paid * 100) / 100,
      amountDue: Math.round(due * 100) / 100,
      loyaltyPointsEarned: loyaltyEarned,
      loyaltyPointsUsed: 0,
      notes,
      createdAt: new Date().toISOString(),
    };

    const savedSale = store.createSale(newSale);

    return res.status(201).json(savedSale);
  } catch (err: any) {
    console.error('Error completing bill:', err);
    return res.status(500).json({ error: 'Failed to process sale. Please try again.' });
  }
});

// ----------------- EXPENSES & PURCHASES APIS -----------------

// GET /api/expenses
app.get('/api/expenses', (req: Request, res: Response) => {
  const businessId = getBusinessId(req);
  return res.json(store.getExpenses(businessId));
});

// POST /api/expenses
app.post('/api/expenses', (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    const { name, category, amount, paymentMethod, date, description } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ error: 'Expense name and amount are required.' });
    }

    const newExpense: Expense = {
      id: 'exp_' + Date.now(),
      businessId,
      name,
      category: category || 'Other',
      amount: Number(amount),
      paymentMethod: paymentMethod || 'CASH',
      date: date || new Date().toISOString(),
      description: description || '',
      createdAt: new Date().toISOString(),
    };

    store.createExpense(newExpense);

    store.getData().auditLogs.unshift({
      id: 'log_' + Date.now(),
      businessId,
      userName: 'Accountant',
      action: 'Expense Added',
      details: `${newExpense.name} (${newExpense.category}) - ${newExpense.amount}`,
      timestamp: new Date().toISOString(),
    });

    return res.status(201).json(newExpense);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to record expense.' });
  }
});

// GET /api/offers
app.get('/api/offers', (req: Request, res: Response) => {
  const businessId = getBusinessId(req);
  return res.json(store.getOffers(businessId));
});

// POST /api/offers
app.post('/api/offers', (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    const { name, type, description, discountValue, startDate, endDate } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Offer name is required.' });
    }

    const newOffer: Offer = {
      id: 'off_' + Date.now(),
      businessId,
      name,
      type: type || 'PERCENTAGE',
      description: description || '',
      discountValue: Number(discountValue) || 10,
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      active: true,
      createdAt: new Date().toISOString(),
    };

    store.createOffer(newOffer);
    return res.status(201).json(newOffer);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create offer.' });
  }
});

// ----------------- NOTIFICATIONS & AUDIT LOGS -----------------

// GET /api/notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const businessId = getBusinessId(req);
  return res.json(store.getNotifications(businessId));
});

// POST /api/notifications/:id/read
app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  store.markNotificationRead(req.params.id);
  return res.json({ success: true });
});

// GET /api/audit-logs
app.get('/api/audit-logs', (req: Request, res: Response) => {
  const businessId = getBusinessId(req);
  return res.json(store.getAuditLogs(businessId));
});

// ----------------- AI BUSINESS ASSISTANT API -----------------

// POST /api/ai/assistant
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const businessId = getBusinessId(req);
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required.' });
    }

    const metrics = store.getDashboardMetrics(businessId);
    const business = store.findBusinessById(businessId);
    const products = store.getProducts(businessId);
    const currency = business?.currencySymbol || 'AED ';

    const lowerQ = query.toLowerCase();

    // Fast deterministic grounded response from live data
    if (lowerQ.includes('today') && (lowerQ.includes('sale') || lowerQ.includes('revenue'))) {
      return res.json({
        answer: `Today's total sales are **${currency}${metrics.todaySales.toLocaleString()}** across **${metrics.todayOrders} orders**, generating **${currency}${metrics.todayProfit.toLocaleString()}** in net profit.`,
      });
    }

    if (lowerQ.includes('week') || lowerQ.includes('weekly')) {
      return res.json({
        answer: `This week's revenue stands at **${currency}${metrics.thisWeekSales.toLocaleString()}**, compared to **${currency}${metrics.lastWeekSales.toLocaleString()}** last week (Growth: **${metrics.weeklyGrowth >= 0 ? '+' : ''}${metrics.weeklyGrowth}%**).`,
      });
    }

    if (lowerQ.includes('profit') || lowerQ.includes('loss')) {
      return res.json({
        answer: `This month's sales are **${currency}${metrics.thisMonthSales.toLocaleString()}** with gross profit of **${currency}${metrics.thisMonthProfit.toLocaleString()}** and operating expenses of **${currency}${metrics.thisMonthExpenses.toLocaleString()}**, resulting in a net profit of **${currency}${(metrics.thisMonthProfit - metrics.thisMonthExpenses).toLocaleString()}**.`,
      });
    }

    if (lowerQ.includes('low stock') || lowerQ.includes('stock')) {
      const lowItems = metrics.lowStockProducts.map((p) => `• **${p.name}**: ${p.currentStock} left (Min: ${p.minStock})`).join('\n');
      return res.json({
        answer: metrics.lowStockCount > 0
          ? `You have **${metrics.lowStockCount} items** running low on stock:\n\n${lowItems}\n\nRecommended: Reorder from your supplier soon.`
          : 'All inventory items are currently well-stocked above minimum thresholds.',
      });
    }

    if (lowerQ.includes('top') || lowerQ.includes('best')) {
      const topProduct = [...products].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))[0];
      return res.json({
        answer: topProduct
          ? `Your best-selling product is **${topProduct.name}** with **${topProduct.totalSold} units sold**, bringing **${currency}${(topProduct.totalRevenue || 0).toLocaleString()}** in revenue!`
          : 'No sales recorded yet to determine best sellers.',
      });
    }

    // Default intelligent business response
    return res.json({
      answer: `Here is your current store summary for **${business?.name}**:\n\n• **Today's Sales:** ${currency}${metrics.todaySales.toLocaleString()} (${metrics.todayOrders} orders)\n• **Today's Net Profit:** ${currency}${metrics.todayProfit.toLocaleString()}\n• **Active Products:** ${metrics.totalProducts} (${metrics.lowStockCount} low stock alerts)\n• **Total Registered Customers:** ${metrics.totalCustomers}\n• **Pending Receivables:** ${currency}${metrics.outstandingPayments.toLocaleString()}`,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to process AI assistant inquiry.' });
  }
});

// POST /api/seed/reset - Reset demo store
app.post('/api/seed/reset', (req: Request, res: Response) => {
  store.resetSeed();
  return res.json({ success: true, message: 'Dubai Mini Mart demo data restored successfully.' });
});

// ----------------- VITE / STATIC SERVING -----------------

async function startServer() {
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Shopkeeper Pro] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
