-- ============================================
-- Digital Products Store — Database Migration
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Products table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price_inr INTEGER NOT NULL CHECK (price_inr > 0),
  thumbnail_url TEXT,
  file_path TEXT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_products_slug ON products (slug);

-- Index for storefront queries (published products)
CREATE INDEX IF NOT EXISTS idx_products_published ON products (is_published) WHERE is_published = true;

-- ============================================
-- Orders table
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  download_token TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for download token lookups
CREATE INDEX IF NOT EXISTS idx_orders_download_token ON orders (download_token);

-- Index for Razorpay order ID lookups
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders (razorpay_order_id);

-- Index for customer email lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email);

-- ============================================
-- Row Level Security
-- ============================================

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can only read published products
CREATE POLICY "Public can view published products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- Service role has full access (bypasses RLS by default,
-- but explicit policy for clarity)
CREATE POLICY "Service role full access on products"
  ON products
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- No public access to orders — all operations via service_role
CREATE POLICY "Service role full access on orders"
  ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Storage Buckets (run in Supabase Dashboard or via API)
-- ============================================
-- NOTE: Storage buckets must be created manually in the
-- Supabase Dashboard:
--
-- 1. Create bucket: "digital-assets" (PRIVATE)
--    - Disable public access
--    - This stores paid downloadable files
--
-- 2. Create bucket: "product-thumbnails" (PUBLIC)
--    - Enable public access
--    - This stores product preview images
