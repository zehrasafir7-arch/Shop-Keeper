# Bussiness Billing (Shopkeeper Pro) - Supabase Cloud Database Setup

This application has been migrated to use **Supabase + PostgreSQL** as the primary cloud database and **Supabase Auth** as the multi-user authentication system.

---

## 🚀 Quick Setup Instructions

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in or create an account.
2. Click **New project** and select your organization.
3. Set your **Database Password** and choose the region closest to your store.
4. Click **Create new project**.

---

### Step 2: Run the SQL Schema Migration
1. In your Supabase project dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/migrations/001_initial_schema.sql` from this repository.
4. Copy its entire content, paste it into the Supabase SQL editor, and click **Run**.
5. This creates all necessary tables with Row Level Security (RLS) and triggers:
   - `profiles` (linked to `auth.users`)
   - `businesses` & `business_members` (multi-tenant RLS: OWNER, ADMIN, MANAGER, CASHIER, STAFF)
   - `products` & `product_categories`
   - `customers` & `suppliers`
   - `sales` & `sale_items`
   - `inventory_transactions` (auto-deduct stock on cashier checkout via trigger)
   - `expenses` & `offers`

---

### Step 3: Configure Environment Variables
1. In your Supabase dashboard, go to **Project Settings** (gear icon) > **API**.
2. Copy the **Project URL** and the **Project API keys (anon / public)**.
3. Set your environment variables in `.env` (or configure in the in-app connection modal):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. *Tip:* You can also click **Connect Supabase** directly inside the app header or in **Settings** to paste your credentials without needing to edit files!

---

### Step 4: Start the Application
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

---

### Step 5: Test the Flow
1. **Create Account:** Click **Register Free Business** on the login page. Enter your email, store name, and password. This creates a Supabase Auth user and auto-provisions your store in the `businesses` table.
2. **Add Products:** Go to the **Products** tab. Add an item (e.g., "Al Rawabi Fresh Milk 1L", Barcode, Price, and Stock: 50).
3. **Add Customers:** Go to the **Customers** tab and create a regular shopper profile.
4. **Create a Bill:**
   - Open **Billing / POS**.
   - Scan or select the product.
   - Click **Complete Payment**.
   - Notice the stock quantity automatically decreases from 50 to 49!
5. **Verify in Supabase:**
   - Open your Supabase Dashboard > **Table Editor**.
   - Check `sales` and `sale_items` to see the transaction.
   - Check `inventory_transactions` to verify the audit trail of the sale.

---

### Step 6: Migrating Existing Local Storage Data
If you had previous data in browser local storage:
1. Go to **Settings** > **Supabase Cloud PostgreSQL & Data Migration**.
2. Click **Migrate Data to Cloud**.
3. The migration engine will read your local products, customers, and receipts, check for duplicates, and upload them into your Supabase database with progress reporting.

---

## 🔒 Security & Row Level Security (RLS)
- **Database Level Enforcement:** Every business table has Row Level Security enabled.
- Users can only query or modify data belonging to businesses where their `user_id` has a valid membership in `business_members`.
- Passwords are never stored in plain text or local storage; authentication is handled entirely by Supabase Auth with secure JWT tokens.
