-- =================================================================
-- VeloxMart E-Commerce — Complete Supabase / PostgreSQL Schema
-- Run this in the Supabase SQL Editor
-- =================================================================

-- ── 1. Departments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS departments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  icon         TEXT,
  display_order INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Categories ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Products ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT,
  brand            TEXT,
  size_variant     TEXT,
  retail_price     NUMERIC(10,2),
  wholesale_price  NUMERIC(10,2),
  moq              INT DEFAULT 1,            -- minimum order quantity
  unit             TEXT DEFAULT 'piece',     -- piece | pack | roll | set | kg | litre
  image_url        TEXT,
  in_stock         BOOLEAN DEFAULT true,
  is_active        BOOLEAN DEFAULT true,
  is_featured      BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. Customers ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  phone        TEXT,
  email        TEXT UNIQUE,
  account_type TEXT DEFAULT 'retail'
               CHECK (account_type IN ('retail','wholesale')),
  gst_number   TEXT,
  is_approved  BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 5. Admin Roles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_roles (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at  TIMESTAMPTZ DEFAULT now()
);

-- ── 6. Addresses ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  label       TEXT DEFAULT 'Home',
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  line1       TEXT NOT NULL,
  line2       TEXT,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  pincode     TEXT NOT NULL,
  is_default  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Ensure only one default address per customer
CREATE UNIQUE INDEX IF NOT EXISTS addresses_default_idx
  ON addresses(customer_id)
  WHERE is_default = true;

-- ── 7. Orders ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number       TEXT UNIQUE NOT NULL,
  customer_id        UUID REFERENCES customers(id),
  address_id         UUID REFERENCES addresses(id),
  status             TEXT DEFAULT 'placed'
                     CHECK (status IN ('placed','confirmed','dispatched','delivered','cancelled')),
  payment_method     TEXT CHECK (payment_method IN ('cod','online')),
  payment_status     TEXT DEFAULT 'pending'
                     CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal           NUMERIC(10,2) NOT NULL,
  delivery_charge    NUMERIC(10,2) DEFAULT 0,
  gst_amount         NUMERIC(10,2) DEFAULT 0,
  total              NUMERIC(10,2) NOT NULL,
  razorpay_order_id  TEXT,
  razorpay_payment_id TEXT,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 8. Order Items ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id),
  product_name TEXT NOT NULL,        -- snapshot at order time
  product_slug TEXT,
  unit_price   NUMERIC(10,2) NOT NULL,
  quantity     INT NOT NULL CHECK (quantity > 0),
  subtotal     NUMERIC(10,2) NOT NULL
);

-- ── 9. Cart Items (persisted for logged-in users) ─────────────────
CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- ── 10. Wishlists ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- =================================================================
-- Row Level Security (RLS)
-- =================================================================

ALTER TABLE customers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists   ENABLE ROW LEVEL SECURITY;

-- Products, categories, departments: public read
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_departments" ON departments FOR SELECT USING (true);
CREATE POLICY "public_read_categories"  ON categories  FOR SELECT USING (true);
CREATE POLICY "public_read_products"    ON products    FOR SELECT USING (is_active = true);

-- Customers: own row
CREATE POLICY "customers_own_select" ON customers FOR SELECT  USING (auth.uid() = id);
CREATE POLICY "customers_own_insert" ON customers FOR INSERT  WITH CHECK (auth.uid() = id);
CREATE POLICY "customers_own_update" ON customers FOR UPDATE  USING (auth.uid() = id);

-- Addresses: own
CREATE POLICY "addresses_own" ON addresses FOR ALL USING (auth.uid() = customer_id);

-- Orders: own
CREATE POLICY "orders_own_select" ON orders FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "orders_own_insert" ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Order items: readable if own order
CREATE POLICY "order_items_own" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.customer_id = auth.uid())
);

-- Cart: own
CREATE POLICY "cart_own" ON cart_items FOR ALL USING (auth.uid() = customer_id);

-- Wishlists: own
CREATE POLICY "wishlist_own" ON wishlists FOR ALL USING (auth.uid() = customer_id);

-- =================================================================
-- Seed Data — Departments & Categories
-- =================================================================

INSERT INTO departments (name, slug, icon, display_order) VALUES
  ('Disposable Products', 'disposable-products', '🥤', 1),
  ('Cleaning Products',   'cleaning-products',   '🧹', 2),
  ('Cleaning Chemicals',  'cleaning-chemicals',  '🧴', 3),
  ('Paper Products',      'paper-products',      '🧻', 4),
  ('Plastic & Others',    'plastic-products',    '🪣', 5)
ON CONFLICT (slug) DO NOTHING;

-- Disposable categories
WITH d AS (SELECT id FROM departments WHERE slug = 'disposable-products')
INSERT INTO categories (department_id, name, slug, display_order)
SELECT d.id, c.name, c.slug, c.ord FROM d,
  (VALUES
    ('Paper Cups',           'paper-cups',           1),
    ('Paper Plates',         'paper-plates',         2),
    ('Silver Plates',        'silver-plates',        3),
    ('Biodegradable Products','biodegradable-products',4),
    ('Spoons',               'spoons',               5),
    ('Silver Foils',         'silver-foils',         6),
    ('Zip Pouches',          'zip-pouches',          7),
    ('Zip Locks',            'zip-locks',            8)
  ) AS c(name, slug, ord)
ON CONFLICT (slug) DO NOTHING;

-- Cleaning categories
WITH d AS (SELECT id FROM departments WHERE slug = 'cleaning-products')
INSERT INTO categories (department_id, name, slug, display_order)
SELECT d.id, c.name, c.slug, c.ord FROM d,
  (VALUES
    ('Garbage Bags',     'garbage-bags',     1),
    ('Toilet Brush',     'toilet-brush',     2),
    ('Plastic Kharata',  'plastic-kharata',  3),
    ('Floor Wipers',     'floor-wipers',     4),
    ('Wet & Dry Mops',   'wet-dry-mops',     5),
    ('Microfiber Cloths','microfiber-cloths',6),
    ('Scotch Brights',   'scotch-brights',   7),
    ('Urinal Screens',   'urinal-screens',   8),
    ('Grass Broom',      'grass-broom',      9),
    ('Dusters',          'dusters',          10),
    ('Carpet Brush',     'carpet-brush',     11),
    ('Dustpan',          'dustpan',          12)
  ) AS c(name, slug, ord)
ON CONFLICT (slug) DO NOTHING;

-- Chemical categories
WITH d AS (SELECT id FROM departments WHERE slug = 'cleaning-chemicals')
INSERT INTO categories (department_id, name, slug, display_order)
SELECT d.id, c.name, c.slug, c.ord FROM d,
  (VALUES
    ('Toilet Cleaner',    'toilet-cleaner',    1),
    ('Glass Cleaner',     'glass-cleaner',     2),
    ('Floor Cleaner',     'floor-cleaner',     3),
    ('Dishwash Liquid',   'dishwash-liquid',   4),
    ('Handwash',          'handwash',          5),
    ('Bleaching',         'bleaching',         6),
    ('Pest Control',      'pest-control',      7),
    ('Air Freshener',     'air-freshener',     8),
    ('Bathroom Freshener','bathroom-freshener',9)
  ) AS c(name, slug, ord)
ON CONFLICT (slug) DO NOTHING;

-- Paper categories
WITH d AS (SELECT id FROM departments WHERE slug = 'paper-products')
INSERT INTO categories (department_id, name, slug, display_order)
SELECT d.id, c.name, c.slug, c.ord FROM d,
  (VALUES
    ('Paper Napkins', 'paper-napkins', 1),
    ('Toilet Rolls',  'toilet-rolls',  2),
    ('HRT Rolls',     'hrt-rolls',     3),
    ('Box Tissues',   'box-tissues',   4),
    ('Kitchen Towel', 'kitchen-towel', 5)
  ) AS c(name, slug, ord)
ON CONFLICT (slug) DO NOTHING;

-- Plastic categories
WITH d AS (SELECT id FROM departments WHERE slug = 'plastic-products')
INSERT INTO categories (department_id, name, slug, display_order)
SELECT d.id, c.name, c.slug, c.ord FROM d,
  (VALUES
    ('Dustbins',     'dustbins',     1),
    ('Buckets',      'buckets',      2),
    ('Tumblers',     'tumblers',     3),
    ('Bucket Mop',   'bucket-mop',   4),
    ('Water Bottles','water-bottles',5),
    ('Batteries',    'batteries',    6)
  ) AS c(name, slug, ord)
ON CONFLICT (slug) DO NOTHING;

-- =================================================================
-- Helper: Make a user admin
-- =================================================================
-- INSERT INTO admin_roles(user_id) VALUES ('<your-user-uuid>');
