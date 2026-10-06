import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  User,
  Business,
  Product,
  Customer,
  Supplier,
  Sale,
  Expense,
  Purchase,
  Offer,
  AuditLog,
  AppNotification,
  DashboardMetrics,
} from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'shopkeeper_store.json');

export interface DatabaseSchema {
  users: User[];
  businesses: Business[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  expenses: Expense[];
  purchases: Purchase[];
  offers: Offer[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
}

function getInitialSeedData(): DatabaseSchema {
  const now = new Date();
  const todayStr = now.toISOString();

  // Helper to format date offset
  const dateOffset = (daysAgo: number, hoursOffset = 10): string => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hoursOffset, 30, 0, 0);
    return d.toISOString();
  };

  const businessId = 'biz_dubai_mini_mart';
  const ownerId = 'usr_owner_demo';
  const cashierId = 'usr_cashier_demo';

  const users: User[] = [
    {
      id: ownerId,
      name: 'Rashid Al-Nuaimi',
      email: 'owner@dubaiminimart.ae',
      phone: '+971 50 889 9123',
      role: 'owner',
      businessIds: [businessId],
      activeBusinessId: businessId,
      createdAt: dateOffset(30),
    },
    {
      id: cashierId,
      name: 'Kareem Ahmed',
      email: 'cashier@shopkeeperpro.com',
      phone: '+971 55 112 3344',
      role: 'cashier',
      businessIds: [businessId],
      activeBusinessId: businessId,
      createdAt: dateOffset(20),
    },
  ];

  const businesses: Business[] = [
    {
      id: businessId,
      ownerId,
      name: 'Dubai Mini Mart',
      tagline: 'Your Daily Fresh Corner & Provisions',
      category: 'grocery',
      categoryName: 'Grocery & Mini Mart',
      country: 'United Arab Emirates',
      currency: 'AED',
      currencySymbol: 'AED ',
      phone: '+971 4 398 7654',
      email: 'contact@dubaiminimart.ae',
      address: 'Shop #14, Al Karama Commercial Complex, Dubai, UAE',
      taxNumber: '100452938100003',
      taxName: 'VAT',
      taxRate: 5,
      taxInclusive: true,
      invoicePrefix: 'DMM-2026-',
      nextInvoiceNumber: 1042,
      invoiceFooterNote: 'Thank you for shopping at Dubai Mini Mart! Returns accepted within 7 days with bill.',
      logoUrl: '',
      setupCompleted: true,
      setupStep: 10,
      plan: 'BUSINESS',
      createdAt: dateOffset(30),
    },
  ];

  const products: Product[] = [
    {
      id: 'prod_oman_chips',
      businessId,
      name: 'Oman Chips 50g Chilli Flavour',
      sku: 'SNK-OMN-01',
      barcode: '6291003001012',
      categoryId: 'cat_snacks',
      categoryName: 'Snacks & Confectionery',
      brand: 'Oman Food',
      unit: 'Packet',
      purchasePrice: 1.0,
      sellingPrice: 1.5,
      mrp: 1.5,
      taxPercent: 5,
      currentStock: 8, // Low stock!
      minStock: 20,
      description: 'Iconic spicy potato chips, crispy chilli flavor',
      totalSold: 165,
      totalRevenue: 247.5,
      totalProfit: 82.5,
      status: 'active',
      createdAt: dateOffset(28),
    },
    {
      id: 'prod_masafi_water',
      businessId,
      name: 'Masafi Pure Mineral Water 500ml',
      sku: 'BEV-MSF-02',
      barcode: '6291003001029',
      categoryId: 'cat_beverages',
      categoryName: 'Beverages',
      brand: 'Masafi',
      unit: 'Piece',
      purchasePrice: 0.75,
      sellingPrice: 1.25,
      mrp: 1.25,
      taxPercent: 5,
      currentStock: 48,
      minStock: 24,
      description: 'Bottled natural water from underground wells of the UAE',
      totalSold: 310,
      totalRevenue: 387.5,
      totalProfit: 155.0,
      status: 'active',
      createdAt: dateOffset(28),
    },
    {
      id: 'prod_medjool_dates',
      businessId,
      name: 'Medjool Premium Dates 500g',
      sku: 'DAT-MDJ-03',
      barcode: '6291003001036',
      categoryId: 'cat_dryfruits',
      categoryName: 'Dates & Dry Fruits',
      brand: 'Bateel Farms',
      unit: 'Box',
      purchasePrice: 18.0,
      sellingPrice: 28.0,
      mrp: 30.0,
      taxPercent: 5,
      currentStock: 14,
      minStock: 10,
      description: 'Jumbo succulent fresh Medjool dates',
      totalSold: 62,
      totalRevenue: 1736.0,
      totalProfit: 620.0,
      status: 'active',
      createdAt: dateOffset(25),
    },
    {
      id: 'prod_almarai_milk',
      businessId,
      name: 'Almarai Full Cream Fresh Milk 2L',
      sku: 'DRY-ALM-04',
      barcode: '6291003001043',
      categoryId: 'cat_dairy',
      categoryName: 'Dairy & Eggs',
      brand: 'Almarai',
      unit: 'Bottle',
      purchasePrice: 8.5,
      sellingPrice: 11.5,
      mrp: 12.0,
      taxPercent: 5,
      currentStock: 16,
      minStock: 12,
      description: '100% pure fresh cow milk pasteurized',
      totalSold: 94,
      totalRevenue: 1081.0,
      totalProfit: 282.0,
      status: 'active',
      createdAt: dateOffset(26),
    },
    {
      id: 'prod_tiffany_biscuits',
      businessId,
      name: 'Tiffany Glucose Biscuits Family Pack (12x50g)',
      sku: 'BSC-TIF-05',
      barcode: '6291003001050',
      categoryId: 'cat_snacks',
      categoryName: 'Snacks & Confectionery',
      brand: 'Tiffany',
      unit: 'Box',
      purchasePrice: 4.2,
      sellingPrice: 6.5,
      mrp: 7.0,
      taxPercent: 5,
      currentStock: 35,
      minStock: 15,
      description: 'Wholesome crispy glucose tea biscuits',
      totalSold: 88,
      totalRevenue: 572.0,
      totalProfit: 202.4,
      status: 'active',
      createdAt: dateOffset(24),
    },
    {
      id: 'prod_galaxy_chocolate',
      businessId,
      name: 'Galaxy Smooth Milk Chocolate Bar 90g',
      sku: 'CHO-GLX-06',
      barcode: '6291003001067',
      categoryId: 'cat_snacks',
      categoryName: 'Snacks & Confectionery',
      brand: 'Galaxy',
      unit: 'Piece',
      purchasePrice: 4.5,
      sellingPrice: 7.0,
      mrp: 7.5,
      taxPercent: 5,
      currentStock: 26,
      minStock: 12,
      description: 'Silk-smooth melt-in-mouth milk chocolate',
      totalSold: 112,
      totalRevenue: 784.0,
      totalProfit: 280.0,
      status: 'active',
      createdAt: dateOffset(22),
    },
    {
      id: 'prod_arabian_oud',
      businessId,
      name: 'Arabian Oud Royal Amber Eau De Parfum 100ml',
      sku: 'PRF-ARB-07',
      barcode: '6291003001074',
      categoryId: 'cat_perfumes',
      categoryName: 'Perfumes & Personal Care',
      brand: 'Arabian Oud',
      unit: 'Piece',
      purchasePrice: 65.0,
      sellingPrice: 125.0,
      mrp: 140.0,
      taxPercent: 5,
      currentStock: 5, // Low stock!
      minStock: 6,
      description: 'Long-lasting oriental woody floral fragrance',
      totalSold: 19,
      totalRevenue: 2375.0,
      totalProfit: 1140.0,
      status: 'active',
      createdAt: dateOffset(20),
    },
    {
      id: 'prod_nescafe_3in1',
      businessId,
      name: 'Nescafe 3-in-1 Classic Instant Coffee (30 Sticks)',
      sku: 'COF-NSC-09',
      barcode: '6291003001098',
      categoryId: 'cat_beverages',
      categoryName: 'Beverages',
      brand: 'Nestle',
      unit: 'Box',
      purchasePrice: 16.5,
      sellingPrice: 24.5,
      mrp: 26.0,
      taxPercent: 5,
      currentStock: 18,
      minStock: 10,
      description: 'Rich blend of coffee, creamer and sugar',
      totalSold: 54,
      totalRevenue: 1323.0,
      totalProfit: 432.0,
      status: 'active',
      createdAt: dateOffset(18),
    },
    {
      id: 'prod_lipton_tea',
      businessId,
      name: 'Lipton Yellow Label Tea Bags (100 Bags)',
      sku: 'TEA-LPT-10',
      barcode: '6291003001104',
      categoryId: 'cat_beverages',
      categoryName: 'Beverages',
      brand: 'Lipton',
      unit: 'Box',
      purchasePrice: 12.0,
      sellingPrice: 17.5,
      mrp: 19.0,
      taxPercent: 5,
      currentStock: 24,
      minStock: 10,
      description: 'Rich amber color and invigorating aroma',
      totalSold: 71,
      totalRevenue: 1242.5,
      totalProfit: 390.5,
      status: 'active',
      createdAt: dateOffset(18),
    },
  ];

  const customers: Customer[] = [
    {
      id: 'cust_ahmed_mansoor',
      businessId,
      name: 'Ahmed Al-Mansoor',
      phone: '+971 50 123 4567',
      whatsapp: '+971501234567',
      email: 'ahmed.m@emirates.net',
      address: 'Villa 12, Al Mankhool, Bur Dubai',
      totalOrders: 18,
      totalSpent: 1845.0,
      outstandingBalance: 0,
      loyaltyPoints: 180,
      lastVisit: dateOffset(0, 11),
      notes: 'VIP customer, prefers fresh milk delivered on Saturdays',
      createdAt: dateOffset(25),
    },
    {
      id: 'cust_fatima_zahra',
      businessId,
      name: 'Fatima Al-Zahra',
      phone: '+971 52 987 6543',
      whatsapp: '+971529876543',
      email: 'fatima.zahra@gmail.com',
      address: 'Flat 402, Karama Star Building',
      totalOrders: 14,
      totalSpent: 1280.0,
      outstandingBalance: 45.0, // Outstanding payment!
      loyaltyPoints: 120,
      lastVisit: dateOffset(1, 16),
      notes: 'Monthly account customer',
      createdAt: dateOffset(24),
    },
    {
      id: 'cust_rahul_sharma',
      businessId,
      name: 'Rahul Sharma',
      phone: '+971 55 456 7890',
      whatsapp: '+971554567890',
      email: 'r.sharma.dxb@yahoo.com',
      address: 'Apartment 701, Park Gate Residences',
      totalOrders: 9,
      totalSpent: 735.0,
      outstandingBalance: 0,
      loyaltyPoints: 70,
      lastVisit: dateOffset(2, 19),
      createdAt: dateOffset(20),
    },
    {
      id: 'cust_sarah_jenkins',
      businessId,
      name: 'Sarah Jenkins',
      phone: '+971 54 876 5432',
      whatsapp: '+971548765432',
      email: 'sarah.j@outlook.com',
      address: 'Marina Heights Tower, Dubai Marina',
      totalOrders: 6,
      totalSpent: 620.0,
      outstandingBalance: 0,
      loyaltyPoints: 60,
      lastVisit: dateOffset(3, 14),
      createdAt: dateOffset(15),
    },
    {
      id: 'cust_tariq_aziz',
      businessId,
      name: 'Mohammed Tariq Aziz',
      phone: '+971 56 234 5678',
      whatsapp: '+971562345678',
      email: 'tariq.aziz@hotmail.com',
      address: 'Shop 4, Gold Souk Area',
      totalOrders: 12,
      totalSpent: 1450.0,
      outstandingBalance: 120.0, // Outstanding payment!
      loyaltyPoints: 140,
      lastVisit: dateOffset(0, 9),
      createdAt: dateOffset(22),
    },
  ];

  const suppliers: Supplier[] = [
    {
      id: 'sup_almarai',
      businessId,
      name: 'Almarai Distribution UAE',
      company: 'Almarai Dairy Co LLC',
      phone: '+971 4 885 1200',
      email: 'orders.uae@almarai.com',
      address: 'Jebel Ali Industrial Area 1, Dubai',
      gstNumber: '100234567800003',
      totalPurchases: 4500.0,
      outstandingBalance: 0,
      createdAt: dateOffset(28),
    },
    {
      id: 'sup_national_food',
      businessId,
      name: 'National Food Industries (Oman Chips)',
      company: 'NFI Trading Group',
      phone: '+971 4 347 8899',
      email: 'wholesale@nfigroup.ae',
      address: 'Al Quoz Industrial Area 3, Dubai',
      totalPurchases: 2800.0,
      outstandingBalance: 350.0,
      createdAt: dateOffset(28),
    },
  ];

  // Generate realistic historical sales across past 7 days, yesterday, and today
  const sales: Sale[] = [
    // Today Sale 1
    {
      id: 'sale_1041',
      businessId,
      invoiceNumber: 'DMM-2026-1041',
      customerId: 'cust_ahmed_mansoor',
      customerName: 'Ahmed Al-Mansoor',
      customerPhone: '+971 50 123 4567',
      itemsCount: 3,
      items: [
        {
          id: 'item_1',
          productId: 'prod_medjool_dates',
          productName: 'Medjool Premium Dates 500g',
          sku: 'DAT-MDJ-03',
          unit: 'Box',
          quantity: 2,
          purchasePrice: 18.0,
          sellingPrice: 28.0,
          discount: 0,
          taxPercent: 5,
          taxAmount: 2.67,
          subtotal: 56.0,
          total: 56.0,
          profit: 20.0,
        },
        {
          id: 'item_2',
          productId: 'prod_almarai_milk',
          productName: 'Almarai Full Cream Fresh Milk 2L',
          sku: 'DRY-ALM-04',
          unit: 'Bottle',
          quantity: 2,
          purchasePrice: 8.5,
          sellingPrice: 11.5,
          discount: 0,
          taxPercent: 5,
          taxAmount: 1.1,
          subtotal: 23.0,
          total: 23.0,
          profit: 6.0,
        },
        {
          id: 'item_3',
          productId: 'prod_oman_chips',
          productName: 'Oman Chips 50g Chilli Flavour',
          sku: 'SNK-OMN-01',
          unit: 'Packet',
          quantity: 4,
          purchasePrice: 1.0,
          sellingPrice: 1.5,
          discount: 0,
          taxPercent: 5,
          taxAmount: 0.29,
          subtotal: 6.0,
          total: 6.0,
          profit: 2.0,
        },
      ],
      subtotal: 85.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxAmount: 4.06,
      grandTotal: 85.0,
      totalCost: 57.0,
      netProfit: 28.0,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      amountPaid: 85.0,
      amountDue: 0,
      loyaltyPointsEarned: 8,
      loyaltyPointsUsed: 0,
      notes: 'Customer paid via digital wallet',
      createdAt: dateOffset(0, 11),
    },
    // Today Sale 2
    {
      id: 'sale_1040',
      businessId,
      invoiceNumber: 'DMM-2026-1040',
      customerName: 'Walk-in Customer',
      itemsCount: 2,
      items: [
        {
          id: 'item_4',
          productId: 'prod_arabian_oud',
          productName: 'Arabian Oud Royal Amber Eau De Parfum 100ml',
          sku: 'PRF-ARB-07',
          unit: 'Piece',
          quantity: 1,
          purchasePrice: 65.0,
          sellingPrice: 125.0,
          discount: 5.0,
          taxPercent: 5,
          taxAmount: 5.71,
          subtotal: 125.0,
          total: 120.0,
          profit: 55.0,
        },
        {
          id: 'item_5',
          productId: 'prod_galaxy_chocolate',
          productName: 'Galaxy Smooth Milk Chocolate Bar 90g',
          sku: 'CHO-GLX-06',
          unit: 'Piece',
          quantity: 2,
          purchasePrice: 4.5,
          sellingPrice: 7.0,
          discount: 0,
          taxPercent: 5,
          taxAmount: 0.67,
          subtotal: 14.0,
          total: 14.0,
          profit: 5.0,
        },
      ],
      subtotal: 139.0,
      discountType: 'fixed',
      discountValue: 5.0,
      discountAmount: 5.0,
      taxAmount: 6.38,
      grandTotal: 134.0,
      totalCost: 74.0,
      netProfit: 60.0,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      amountPaid: 134.0,
      amountDue: 0,
      loyaltyPointsEarned: 0,
      loyaltyPointsUsed: 0,
      createdAt: dateOffset(0, 9),
    },
    // Yesterday Sale
    {
      id: 'sale_1039',
      businessId,
      invoiceNumber: 'DMM-2026-1039',
      customerId: 'cust_fatima_zahra',
      customerName: 'Fatima Al-Zahra',
      customerPhone: '+971 52 987 6543',
      itemsCount: 4,
      items: [
        {
          id: 'item_6',
          productId: 'prod_nescafe_3in1',
          productName: 'Nescafe 3-in-1 Classic Instant Coffee (30 Sticks)',
          sku: 'COF-NSC-09',
          unit: 'Box',
          quantity: 2,
          purchasePrice: 16.5,
          sellingPrice: 24.5,
          discount: 0,
          taxPercent: 5,
          taxAmount: 2.33,
          subtotal: 49.0,
          total: 49.0,
          profit: 16.0,
        },
        {
          id: 'item_7',
          productId: 'prod_tiffany_biscuits',
          productName: 'Tiffany Glucose Biscuits Family Pack (12x50g)',
          sku: 'BSC-TIF-05',
          unit: 'Box',
          quantity: 3,
          purchasePrice: 4.2,
          sellingPrice: 6.5,
          discount: 0,
          taxPercent: 5,
          taxAmount: 0.93,
          subtotal: 19.5,
          total: 19.5,
          profit: 6.9,
        },
      ],
      subtotal: 68.5,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxAmount: 3.26,
      grandTotal: 68.5,
      totalCost: 45.6,
      netProfit: 22.9,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      amountPaid: 68.5,
      amountDue: 0,
      loyaltyPointsEarned: 7,
      loyaltyPointsUsed: 0,
      createdAt: dateOffset(1, 16),
    },
    // Past Days Sales (to power weekly charts)
    {
      id: 'sale_1038',
      businessId,
      invoiceNumber: 'DMM-2026-1038',
      customerName: 'Walk-in Customer',
      itemsCount: 2,
      items: [],
      subtotal: 175.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxAmount: 8.33,
      grandTotal: 175.0,
      totalCost: 110.0,
      netProfit: 65.0,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      amountPaid: 175.0,
      amountDue: 0,
      loyaltyPointsEarned: 0,
      loyaltyPointsUsed: 0,
      createdAt: dateOffset(2, 14),
    },
    {
      id: 'sale_1037',
      businessId,
      invoiceNumber: 'DMM-2026-1037',
      customerName: 'Walk-in Customer',
      itemsCount: 1,
      items: [],
      subtotal: 245.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxAmount: 11.67,
      grandTotal: 245.0,
      totalCost: 160.0,
      netProfit: 85.0,
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      amountPaid: 245.0,
      amountDue: 0,
      loyaltyPointsEarned: 0,
      loyaltyPointsUsed: 0,
      createdAt: dateOffset(3, 12),
    },
    {
      id: 'sale_1036',
      businessId,
      invoiceNumber: 'DMM-2026-1036',
      customerName: 'Walk-in Customer',
      itemsCount: 3,
      items: [],
      subtotal: 310.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxAmount: 14.76,
      grandTotal: 310.0,
      totalCost: 200.0,
      netProfit: 110.0,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      amountPaid: 310.0,
      amountDue: 0,
      loyaltyPointsEarned: 0,
      loyaltyPointsUsed: 0,
      createdAt: dateOffset(4, 15),
    },
    {
      id: 'sale_1035',
      businessId,
      invoiceNumber: 'DMM-2026-1035',
      customerName: 'Walk-in Customer',
      itemsCount: 2,
      items: [],
      subtotal: 195.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxAmount: 9.29,
      grandTotal: 195.0,
      totalCost: 125.0,
      netProfit: 70.0,
      paymentMethod: 'CASH',
      paymentStatus: 'PAID',
      amountPaid: 195.0,
      amountDue: 0,
      loyaltyPointsEarned: 0,
      loyaltyPointsUsed: 0,
      createdAt: dateOffset(5, 18),
    },
    {
      id: 'sale_1034',
      businessId,
      invoiceNumber: 'DMM-2026-1034',
      customerName: 'Walk-in Customer',
      itemsCount: 4,
      items: [],
      subtotal: 420.0,
      discountType: 'fixed',
      discountValue: 0,
      discountAmount: 0,
      taxAmount: 20.0,
      grandTotal: 420.0,
      totalCost: 280.0,
      netProfit: 140.0,
      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      amountPaid: 420.0,
      amountDue: 0,
      loyaltyPointsEarned: 0,
      loyaltyPointsUsed: 0,
      createdAt: dateOffset(6, 17),
    },
  ];

  const expenses: Expense[] = [
    {
      id: 'exp_rent',
      businessId,
      name: 'Shop Rental Al Karama',
      category: 'Rent',
      amount: 3500.0,
      paymentMethod: 'BANK_TRANSFER',
      date: dateOffset(15),
      description: 'Monthly commercial shop lease installment',
      createdAt: dateOffset(15),
    },
    {
      id: 'exp_dewa',
      businessId,
      name: 'DEWA Electricity & Water',
      category: 'Electricity',
      amount: 450.0,
      paymentMethod: 'CARD',
      date: dateOffset(8),
      description: 'Air conditioning & chiller refrigeration power bill',
      createdAt: dateOffset(8),
    },
    {
      id: 'exp_internet',
      businessId,
      name: 'Etisalat Business Pro Fiber 250Mbps',
      category: 'Internet',
      amount: 299.0,
      paymentMethod: 'CARD',
      date: dateOffset(5),
      description: 'POS line & CCTV internet connectivity',
      createdAt: dateOffset(5),
    },
  ];

  const purchases: Purchase[] = [
    {
      id: 'pur_101',
      businessId,
      supplierId: 'sup_almarai',
      supplierName: 'Almarai Distribution UAE',
      invoiceNumber: 'PO-ALM-8891',
      date: dateOffset(5),
      items: [
        {
          productId: 'prod_almarai_milk',
          productName: 'Almarai Full Cream Fresh Milk 2L',
          quantity: 24,
          purchasePrice: 8.5,
          total: 204.0,
        },
      ],
      totalAmount: 204.0,
      paidAmount: 204.0,
      dueAmount: 0,
      createdAt: dateOffset(5),
    },
  ];

  const offers: Offer[] = [
    {
      id: 'off_dates_weekend',
      businessId,
      name: 'Ramadan & Weekend Treat: 15% OFF on Medjool Dates',
      type: 'PERCENTAGE',
      description: 'Enjoy 15% off on premium jumbo Medjool dates box',
      discountValue: 15,
      startDate: dateOffset(2),
      endDate: dateOffset(-5),
      active: true,
      createdAt: dateOffset(2),
    },
    {
      id: 'off_bogo_chips',
      businessId,
      name: 'Buy 5 Oman Chips Get 1 Free',
      type: 'BOGO',
      description: 'Special school and evening snack promotion',
      discountValue: 10,
      startDate: dateOffset(7),
      endDate: dateOffset(-14),
      active: true,
      createdAt: dateOffset(7),
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'log_01',
      businessId,
      userId: ownerId,
      userName: 'Rahul Al-Mansoor',
      action: 'Business Initialized',
      details: 'Dubai Mini Mart setup completed with VAT configuration (5%)',
      timestamp: dateOffset(30),
    },
    {
      id: 'log_02',
      businessId,
      userId: ownerId,
      userName: 'Rahul Al-Mansoor',
      action: 'Inventory Added',
      details: 'Received stock delivery of Masafi Water & Medjool Dates',
      timestamp: dateOffset(12),
    },
    {
      id: 'log_03',
      businessId,
      userId: cashierId,
      userName: 'Kareem Ahmed',
      action: 'Invoice Created',
      details: 'Generated invoice #DMM-2026-1041 for AED 85.00',
      timestamp: dateOffset(0, 11),
    },
    {
      id: 'log_04',
      businessId,
      userId: cashierId,
      userName: 'Kareem Ahmed',
      action: 'Payment Received',
      details: 'AED 134.00 received via Card for #DMM-2026-1040',
      timestamp: dateOffset(0, 9),
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: 'notif_1',
      businessId,
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: 'Oman Chips 50g Chilli Flavour has only 8 units left (Min threshold: 20).',
      read: false,
      timestamp: dateOffset(0, 8),
    },
    {
      id: 'notif_2',
      businessId,
      type: 'LOW_STOCK',
      title: 'Low Stock Alert',
      message: 'Arabian Oud Royal Amber Eau De Parfum 100ml has only 5 units left.',
      read: false,
      timestamp: dateOffset(0, 7),
    },
    {
      id: 'notif_3',
      businessId,
      type: 'PAYMENT_DUE',
      title: 'Outstanding Balance Pending',
      message: 'Customer Mohammed Tariq Aziz has AED 120.00 outstanding.',
      read: false,
      timestamp: dateOffset(1, 10),
    },
  ];

  return {
    users,
    businesses,
    products,
    customers,
    suppliers,
    sales,
    expenses,
    purchases,
    offers,
    auditLogs,
    notifications,
  };
}

class Store {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error('Failed to read db file, initializing with fresh seed data', err);
    }

    const initial = getInitialSeedData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving data to DB file:', err);
    }
  }

  public resetSeed(): DatabaseSchema {
    this.data = getInitialSeedData();
    this.saveData();
    return this.data;
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // --- Auth & Users ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveData();
    return this.data.users[idx];
  }

  // --- Businesses ---
  public findBusinessById(id: string): Business | undefined {
    return this.data.businesses.find((b) => b.id === id);
  }

  public getBusinessesForUser(userId: string): Business[] {
    const user = this.findUserById(userId);
    if (!user) return [];
    return this.data.businesses.filter(
      (b) => b.ownerId === userId || user.businessIds.includes(b.id)
    );
  }

  public createBusiness(business: Business): Business {
    this.data.businesses.push(business);
    this.saveData();
    return business;
  }

  public updateBusiness(id: string, updates: Partial<Business>): Business | undefined {
    const idx = this.data.businesses.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    this.data.businesses[idx] = { ...this.data.businesses[idx], ...updates };
    this.saveData();
    return this.data.businesses[idx];
  }

  // --- Products ---
  public getProducts(businessId: string): Product[] {
    return this.data.products.filter((p) => p.businessId === businessId && p.status !== 'archived');
  }

  public findProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public createProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.saveData();
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return undefined;
    this.data.products[idx] = { ...this.data.products[idx], ...updates };
    this.saveData();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.products[idx].status = 'archived';
    this.saveData();
    return true;
  }

  // --- Customers ---
  public getCustomers(businessId: string): Customer[] {
    return this.data.customers.filter((c) => c.businessId === businessId);
  }

  public findCustomerById(id: string): Customer | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  public createCustomer(customer: Customer): Customer {
    this.data.customers.unshift(customer);
    this.saveData();
    return customer;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const idx = this.data.customers.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    this.data.customers[idx] = { ...this.data.customers[idx], ...updates };
    this.saveData();
    return this.data.customers[idx];
  }

  // --- Sales & Billing ---
  public getSales(businessId: string): Sale[] {
    return this.data.sales
      .filter((s) => s.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createSale(sale: Sale): Sale {
    // 1. Insert sale record
    this.data.sales.unshift(sale);

    // 2. Reduce inventory and update product totals
    for (const item of sale.items) {
      const prod = this.data.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.currentStock = Math.max(0, prod.currentStock - item.quantity);
        prod.totalSold = (prod.totalSold || 0) + item.quantity;
        prod.totalRevenue = (prod.totalRevenue || 0) + item.total;
        prod.totalProfit = (prod.totalProfit || 0) + item.profit;

        // Check if low stock threshold reached
        if (prod.currentStock <= prod.minStock) {
          this.data.notifications.unshift({
            id: 'notif_' + Date.now() + Math.random().toString(36).substring(2, 5),
            businessId: sale.businessId,
            type: 'LOW_STOCK',
            title: 'Low Stock Alert',
            message: `${prod.name} has only ${prod.currentStock} left (Min: ${prod.minStock}).`,
            read: false,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }

    // 3. Update customer stats if customer attached
    if (sale.customerId) {
      const customer = this.data.customers.find((c) => c.id === sale.customerId);
      if (customer) {
        customer.totalOrders = (customer.totalOrders || 0) + 1;
        customer.totalSpent = (customer.totalSpent || 0) + sale.grandTotal;
        customer.loyaltyPoints =
          (customer.loyaltyPoints || 0) + (sale.loyaltyPointsEarned || 0) - (sale.loyaltyPointsUsed || 0);
        customer.lastVisit = sale.createdAt;
        if (sale.amountDue > 0) {
          customer.outstandingBalance = (customer.outstandingBalance || 0) + sale.amountDue;
        }
      }
    }

    // 4. Update Business Next Invoice Number
    const biz = this.data.businesses.find((b) => b.id === sale.businessId);
    if (biz) {
      biz.nextInvoiceNumber = (biz.nextInvoiceNumber || 1000) + 1;
    }

    // 5. Create Audit Log
    this.data.auditLogs.unshift({
      id: 'log_' + Date.now(),
      businessId: sale.businessId,
      userName: 'POS Operator',
      action: 'Invoice Created',
      details: `Generated invoice #${sale.invoiceNumber} for ${biz?.currencySymbol || ''}${sale.grandTotal.toFixed(2)} (${sale.paymentMethod})`,
      timestamp: new Date().toISOString(),
    });

    this.saveData();
    return sale;
  }

  // --- Expenses ---
  public getExpenses(businessId: string): Expense[] {
    return this.data.expenses
      .filter((e) => e.businessId === businessId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public createExpense(expense: Expense): Expense {
    this.data.expenses.unshift(expense);
    this.saveData();
    return expense;
  }

  // --- Suppliers & Purchases ---
  public getSuppliers(businessId: string): Supplier[] {
    return this.data.suppliers.filter((s) => s.businessId === businessId);
  }

  public getPurchases(businessId: string): Purchase[] {
    return this.data.purchases.filter((p) => p.businessId === businessId);
  }

  public createPurchase(purchase: Purchase): Purchase {
    this.data.purchases.unshift(purchase);
    // Increase stock for purchase items
    for (const item of purchase.items) {
      const prod = this.data.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.currentStock += item.quantity;
      }
    }
    this.saveData();
    return purchase;
  }

  // --- Offers ---
  public getOffers(businessId: string): Offer[] {
    return this.data.offers.filter((o) => o.businessId === businessId);
  }

  public createOffer(offer: Offer): Offer {
    this.data.offers.unshift(offer);
    this.saveData();
    return offer;
  }

  // --- Audit Logs & Notifications ---
  public getAuditLogs(businessId: string): AuditLog[] {
    return this.data.auditLogs
      .filter((l) => l.businessId === businessId)
      .slice(0, 20);
  }

  public getNotifications(businessId: string): AppNotification[] {
    return this.data.notifications.filter((n) => n.businessId === businessId);
  }

  public markNotificationRead(id: string): void {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveData();
    }
  }

  // --- Dashboard Real-Time Computed Metrics ---
  public getDashboardMetrics(businessId: string): DashboardMetrics {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysAgo = todayStart - 6 * 86400000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const sales = this.getSales(businessId);
    const products = this.getProducts(businessId);
    const customers = this.getCustomers(businessId);
    const expenses = this.getExpenses(businessId);

    let todaySales = 0;
    let todayProfit = 0;
    let todayOrders = 0;
    let yesterdaySales = 0;
    let thisWeekSales = 0;
    let lastWeekSales = 0;
    let thisMonthSales = 0;
    let thisMonthProfit = 0;

    for (const s of sales) {
      const t = new Date(s.createdAt).getTime();
      if (t >= todayStart) {
        todaySales += s.grandTotal;
        todayProfit += s.netProfit;
        todayOrders += 1;
      } else if (t >= yesterdayStart && t < todayStart) {
        yesterdaySales += s.grandTotal;
      }

      if (t >= sevenDaysAgo) {
        thisWeekSales += s.grandTotal;
      } else if (t >= sevenDaysAgo - 7 * 86400000 && t < sevenDaysAgo) {
        lastWeekSales += s.grandTotal;
      }

      if (t >= monthStart) {
        thisMonthSales += s.grandTotal;
        thisMonthProfit += s.netProfit;
      }
    }

    const thisMonthExpenses = expenses
      .filter((e) => new Date(e.date).getTime() >= monthStart)
      .reduce((sum, e) => sum + e.amount, 0);

    const outstandingPayments = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);
    const lowStockProducts = products.filter((p) => p.currentStock <= p.minStock && p.currentStock > 0);
    const outOfStockCount = products.filter((p) => p.currentStock === 0).length;

    const todayAvgOrderValue = todayOrders > 0 ? todaySales / todayOrders : 0;
    const todaySalesGrowth =
      yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : todaySales > 0 ? 100 : 0;
    const weeklyGrowth =
      lastWeekSales > 0 ? ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100 : thisWeekSales > 0 ? 100 : 0;

    // 7-day breakdown for Weekly Sales
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyBreakdown: Array<{
      day: string;
      date: string;
      sales: number;
      orders: number;
      profit: number;
      expenses: number;
    }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = startOfDay + 86400000;
      const dayName = daysOfWeek[d.getDay()];
      const dateFormatted = `${d.getDate()}/${d.getMonth() + 1}`;

      const daySales = sales.filter((s) => {
        const time = new Date(s.createdAt).getTime();
        return time >= startOfDay && time < endOfDay;
      });

      const dayExpenses = expenses.filter((e) => {
        const time = new Date(e.date).getTime();
        return time >= startOfDay && time < endOfDay;
      });

      const totalDaySales = daySales.reduce((sum, s) => sum + s.grandTotal, 0);
      const totalDayProfit = daySales.reduce((sum, s) => sum + s.netProfit, 0);
      const totalDayExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

      weeklyBreakdown.push({
        day: dayName,
        date: dateFormatted,
        sales: Math.round(totalDaySales * 100) / 100,
        orders: daySales.length,
        profit: Math.round(totalDayProfit * 100) / 100,
        expenses: Math.round(totalDayExpenses * 100) / 100,
      });
    }

    return {
      todaySales: Math.round(todaySales * 100) / 100,
      todaySalesGrowth: Math.round(todaySalesGrowth * 10) / 10,
      todayProfit: Math.round(todayProfit * 100) / 100,
      todayOrders,
      todayAvgOrderValue: Math.round(todayAvgOrderValue * 100) / 100,
      yesterdaySales: Math.round(yesterdaySales * 100) / 100,
      totalCustomers: customers.length,
      newCustomersToday: 1,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      outOfStockCount,
      outstandingPayments: Math.round(outstandingPayments * 100) / 100,
      thisWeekSales: Math.round(thisWeekSales * 100) / 100,
      lastWeekSales: Math.round(lastWeekSales * 100) / 100,
      weeklyGrowth: Math.round(weeklyGrowth * 10) / 10,
      thisMonthSales: Math.round(thisMonthSales * 100) / 100,
      thisMonthProfit: Math.round(thisMonthProfit * 100) / 100,
      thisMonthExpenses: Math.round(thisMonthExpenses * 100) / 100,
      recentSales: sales.slice(0, 5),
      lowStockProducts,
      recentActivities: this.getAuditLogs(businessId).slice(0, 6),
      weeklyBreakdown,
    };
  }
}

export const store = new Store();
