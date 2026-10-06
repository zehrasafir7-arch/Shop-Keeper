-- ==============================================================================
-- SHOPKEEPER PRO / BUSSINESS BILLING - PRODUCTION SUPABASE DATABASE SCHEMA
-- Migration: 001_initial_schema.sql
-- PostgreSQL with Row Level Security (RLS), Triggers, & Automated Inventory
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean Helper Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 3. PROFILES TABLE (Linked with auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on Supabase auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 4. BUSINESSES & MULTI-TENANT MEMBERSHIP
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tagline TEXT,
    category TEXT DEFAULT 'retail',
    category_name TEXT DEFAULT 'General Retail',
    country TEXT DEFAULT 'United Arab Emirates',
    currency TEXT DEFAULT 'AED',
    currency_symbol TEXT DEFAULT 'AED ',
    phone TEXT,
    email TEXT,
    address TEXT,
    tax_number TEXT,
    tax_name TEXT DEFAULT 'VAT',
    tax_rate NUMERIC(5, 2) DEFAULT 5.00,
    tax_inclusive BOOLEAN DEFAULT true,
    invoice_prefix TEXT DEFAULT 'INV-',
    next_invoice_number INT DEFAULT 1001,
    invoice_footer_note TEXT DEFAULT 'Thank you for your business!',
    logo_url TEXT,
    plan TEXT DEFAULT 'BUSINESS',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_businesses_timestamp
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Multi-User Business Membership (Roles: OWNER, ADMIN, MANAGER, CASHIER, STAFF)
CREATE TABLE IF NOT EXISTS public.business_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'STAFF')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- Helper security function to check if current authenticated user belongs to the business
CREATE OR REPLACE FUNCTION public.is_business_member(p_business_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_members
        WHERE business_id = p_business_id
          AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role(p_business_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM public.business_members
    WHERE business_id = p_business_id AND user_id = auth.uid()
    LIMIT 1;
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 5. PRODUCT CATEGORIES & PRODUCTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    barcode TEXT,
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    category_name TEXT DEFAULT 'General',
    brand TEXT DEFAULT 'Store Brand',
    unit TEXT DEFAULT 'Piece',
    purchase_price NUMERIC(12, 2) DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    mrp NUMERIC(12, 2) DEFAULT 0.00,
    tax_percent NUMERIC(5, 2) DEFAULT 0.00,
    stock_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    low_stock_threshold NUMERIC(12, 2) NOT NULL DEFAULT 5.00,
    description TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_products_timestamp
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. CUSTOMERS & SUPPLIERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    whatsapp TEXT,
    address TEXT,
    gst_number TEXT,
    total_purchases NUMERIC(12, 2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_customers_timestamp
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    gst_number TEXT,
    total_purchases NUMERIC(12, 2) DEFAULT 0.00,
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_suppliers_timestamp
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. SALES & SALE ITEMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL DEFAULT 'Walk-in Customer',
    customer_phone TEXT,
    cashier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_type TEXT DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
    discount_value NUMERIC(12, 2) DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(12, 2) DEFAULT 0.00,
    net_profit NUMERIC(12, 2) DEFAULT 0.00,
    payment_method TEXT DEFAULT 'CASH',
    payment_status TEXT DEFAULT 'PAID' CHECK (payment_status IN ('PAID', 'PARTIAL', 'DUE')),
    amount_paid NUMERIC(12, 2) DEFAULT 0.00,
    amount_due NUMERIC(12, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT,
    unit TEXT DEFAULT 'Piece',
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 1.00,
    purchase_price NUMERIC(12, 2) DEFAULT 0.00,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(12, 2) DEFAULT 0.00,
    tax_percent NUMERIC(5, 2) DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    profit NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. INVENTORY TRANSACTIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('SALE', 'PURCHASE', 'RETURN', 'ADJUSTMENT')),
    quantity_change NUMERIC(12, 2) NOT NULL,
    quantity_after NUMERIC(12, 2) NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Database Trigger: Automatically decrease inventory on Sale Items creation
CREATE OR REPLACE FUNCTION public.handle_sale_item_inventory()
RETURNS TRIGGER AS $$
DECLARE
    v_current_stock NUMERIC;
    v_new_stock NUMERIC;
BEGIN
    IF NEW.product_id IS NOT NULL THEN
        SELECT stock_quantity INTO v_current_stock
        FROM public.products
        WHERE id = NEW.product_id;

        v_new_stock := COALESCE(v_current_stock, 0) - NEW.quantity;

        UPDATE public.products
        SET stock_quantity = v_new_stock,
            updated_at = NOW()
        WHERE id = NEW.product_id;

        INSERT INTO public.inventory_transactions (
            business_id,
            product_id,
            type,
            quantity_change,
            quantity_after,
            reference_id,
            reference_type,
            notes
        ) VALUES (
            NEW.business_id,
            NEW.product_id,
            'SALE',
            -NEW.quantity,
            v_new_stock,
            NEW.sale_id,
            'sales',
            'POS bill sold item: ' || NEW.product_name
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sale_item_inventory ON public.sale_items;
CREATE TRIGGER trigger_sale_item_inventory
    AFTER INSERT ON public.sale_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_sale_item_inventory();

-- ==============================================================================
-- 9. EXPENSES & OFFERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT DEFAULT 'CASH',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    receipt_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT DEFAULT 'PERCENTAGE' CHECK (type IN ('BOGO', 'PERCENTAGE', 'FLAT', 'COMBO', 'FESTIVAL')),
    description TEXT,
    discount_value NUMERIC(12, 2) DEFAULT 0.00,
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and edit only their own profile
CREATE POLICY "Users can view their profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Businesses: Members can view and edit businesses they belong to
CREATE POLICY "Members can view their businesses"
    ON public.businesses FOR SELECT
    USING (is_business_member(id) OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create businesses"
    ON public.businesses FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Owners and Admins can update business"
    ON public.businesses FOR UPDATE
    USING (is_business_member(id) OR created_by = auth.uid());

CREATE POLICY "Owners can delete business"
    ON public.businesses FOR DELETE
    USING (created_by = auth.uid() OR get_user_role(id) = 'OWNER');

-- Business Members
CREATE POLICY "Members can view membership"
    ON public.business_members FOR SELECT
    USING (user_id = auth.uid() OR is_business_member(business_id));

CREATE POLICY "Authorized members can manage staff"
    ON public.business_members FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid() -- self-insert when creating a business
        OR get_user_role(business_id) IN ('OWNER', 'ADMIN')
    );

CREATE POLICY "Owners can update member roles"
    ON public.business_members FOR UPDATE
    USING (get_user_role(business_id) IN ('OWNER', 'ADMIN'));

CREATE POLICY "Owners can remove members"
    ON public.business_members FOR DELETE
    USING (get_user_role(business_id) IN ('OWNER', 'ADMIN') OR user_id = auth.uid());

-- Product Categories
CREATE POLICY "Categories access policy"
    ON public.product_categories FOR ALL
    USING (is_business_member(business_id));

-- Products
CREATE POLICY "Products access policy"
    ON public.products FOR ALL
    USING (is_business_member(business_id));

-- Customers
CREATE POLICY "Customers access policy"
    ON public.customers FOR ALL
    USING (is_business_member(business_id));

-- Suppliers
CREATE POLICY "Suppliers access policy"
    ON public.suppliers FOR ALL
    USING (is_business_member(business_id));

-- Sales & Items
CREATE POLICY "Sales access policy"
    ON public.sales FOR ALL
    USING (is_business_member(business_id));

CREATE POLICY "Sale items access policy"
    ON public.sale_items FOR ALL
    USING (is_business_member(business_id));

-- Inventory Transactions
CREATE POLICY "Inventory transactions access policy"
    ON public.inventory_transactions FOR ALL
    USING (is_business_member(business_id));

-- Expenses
CREATE POLICY "Expenses access policy"
    ON public.expenses FOR ALL
    USING (is_business_member(business_id));

-- Offers
CREATE POLICY "Offers access policy"
    ON public.offers FOR ALL
    USING (is_business_member(business_id));

-- ==============================================================================
-- 11. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_biz ON public.business_members(business_id);
CREATE INDEX IF NOT EXISTS idx_products_biz ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_customers_biz ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_sales_biz ON public.sales(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_created ON public.sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_expenses_biz ON public.expenses(business_id);
CREATE INDEX IF NOT EXISTS idx_inventory_prod ON public.inventory_transactions(product_id);

-- End of 001_initial_schema.sql
