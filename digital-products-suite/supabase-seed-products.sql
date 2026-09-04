-- ==============================================================================
-- SUPABASE SEED — Digital Products Suite (10 Products)
-- ==============================================================================
-- Inserts all 10 products into the existing 'products' table.
-- Prices range from ₹499 to ₹1,499 for professional positioning.
-- 
-- Prerequisites:
--   1. Products table exists with columns:
--      id (uuid), title, slug, description, price_inr (int),
--      thumbnail_url (text), file_path (text), is_published (bool), created_at (timestamptz)
--   2. ZIP files are already uploaded to Supabase Storage bucket 'digital-assets'
--      at paths: products/product-01.zip through products/product-10.zip
--
-- Usage:
--   Run this in Supabase SQL Editor or via psql.
-- ==============================================================================

-- Product 01: Tailwind Landing Kit
INSERT INTO products (id, title, slug, description, price_inr, thumbnail_url, file_path, is_published, created_at)
VALUES (
  gen_random_uuid(),
  'Tailwind Landing Kit — 10 Drop-in Components',
  'tailwind-landing-kit',
  'Ship landing pages in minutes, not days. 10 production-ready React + Tailwind CSS components: Hero with video modal, 3-tier pricing table with monthly/annual toggle, testimonial wall, feature comparison matrix, bento grid, FAQ accordion, animated stats counter, CTA banner, responsive header nav, and multi-column footer. Fully typed, accessible, and copy-paste ready.',
  799,
  NULL,
  'products/product-01.zip',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  file_path = EXCLUDED.file_path,
  is_published = EXCLUDED.is_published;

-- Product 02: Auth RBAC Boilerplate
INSERT INTO products (id, title, slug, description, price_inr, thumbnail_url, file_path, is_published, created_at)
VALUES (
  gen_random_uuid(),
  'Auth & RBAC Boilerplate — Express + TypeScript',
  'auth-rbac-boilerplate',
  'Production-grade role-based access control system built with Express and TypeScript. Features JWT access + refresh token rotation, bcrypt password hashing, Admin/Editor/User role hierarchy, configurable rate limiting, and protected route middleware. Drop it into any Express app and have enterprise-grade auth running in under 10 minutes.',
  999,
  NULL,
  'products/product-02.zip',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  file_path = EXCLUDED.file_path,
  is_published = EXCLUDED.is_published;

-- Product 03: GMaps Lead Scraper
INSERT INTO products (id, title, slug, description, price_inr, thumbnail_url, file_path, is_published, created_at)
VALUES (
  gen_random_uuid(),
  'Google Maps Lead Scraper — Automated Prospecting',
  'gmaps-lead-scraper-pro',
  'Automated Puppeteer-powered Google Maps lead extraction tool. Search any business type in any city and export names, phone numbers, ratings, review counts, websites, and addresses to clean CSV. Built-in anti-detection (custom user agent, viewport randomization), configurable rate limiting with jitter, and batch processing. Turn Google Maps into your lead database.',
  1199,
  NULL,
  'products/product-03.zip',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  file_path = EXCLUDED.file_path,
  is_published = EXCLUDED.is_published;

-- Product 04: SEO Auditor CLI
INSERT INTO products (id, title, slug, description, price_inr, thumbnail_url, file_path, is_published, created_at)
VALUES (
  gen_random_uuid(),
  'SEO Auditor CLI — Technical Site Analysis',
  'seo-auditor-cli',
  'One-command technical SEO audit for any website. Analyzes meta tags, heading hierarchy, OpenGraph & Twitter Cards, broken images, HTTPS, compression, Schema.org markup, and TTFB — then calculates a weighted 0-100 SEO score. Outputs beautiful terminal dashboards plus JSON and Markdown reports. Perfect for agencies, freelancers, and dev teams.',
  699,
  NULL,
  'products/product-04.zip',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  file_path = EXCLUDED.file_path,
  is_published = EXCLUDED.is_published;

-- Product 05: Stripe & Razorpay Webhooks Handler
INSERT INTO products (id, title, slug, description, price_inr, thumbnail_url, file_path, is_published, created_at)
VALUES (
  gen_random_uuid(),
  'Stripe & Razorpay Webhook Handler — Next.js',
  'stripe-razorpay-webhooks',
  'Drop-in Next.js App Router webhook handlers for both Stripe and Razorpay. Cryptographic signature verification, typed event handling for payments, subscriptions, and invoices, plus a generic transaction wrapper with commit/rollback. Stop writing payment webhook boilerplate — just plug in your business logic.',
  1499,
  NULL,
  'products/product-05.zip',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  file_path = EXCLUDED.file_path,
  is_published = EXCLUDED.is_published;

-- Product 06: CSV to SQLite Converter
INSERT INTO products (id, title, slug, description, price_inr, thumbnail_url, file_path, is_published, created_at)
VALUES (
  gen_random_uuid(),
  'CSV to SQLite Converter — Smart CLI Tool',
  'csv-to-sqlite-converter',
  'Convert any CSV file to a queryable SQLite database in seconds. Automatic delimiter detection, intelligent type inference (INTEGER, REAL, TEXT, DATE), batch transactions for performance, auto-indexing on ID/email columns, and RFC 4180 compliant parsing. Handles BOM markers, quoted fields, and large files with streaming. Includes dry-run mode to preview schema before writing.',
  499,
  NULL,
  'products/product-06.zip',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  file_path = EXCLUDED.file_path,
  is_published = EXCLUDED.is_published;

-- Product 07: API Rate Limiter (Redis)
INSERT INTO products (id, title, slug, description, price_inr, thumbnail_url, file_path, is_published, created_at)
VALUES (
  gen_random_uuid(),
  'API Rate Limiter — Upstash Redis Sliding Window',
  'api-rate-limiter-redis',
  'Production-ready sliding window rate limiter middleware powered by Upstash Redis. Features burst tolerance, IP whitelisting with CIDR support, custom key extraction (API key, user ID), proper HTTP headers (X-RateLimit-*), and fail-open resilience when Redis is unavailable. Works as Express middleware or standalone function. Deploy globally with Upstash serverless Redis.',
  899,
  NULL,
  'products/product-07.zip',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  file_path = EXCLUDED.file_path,
  is_published = EXCLUDED.is_published;

-- Product 08: Markdown Docs Generator
INSERT INTO products (id, title, slug, description, price_inr, thumbnail_url, file_path, is_published, created_at)
VALUES (
  gen_random_uuid(),
  'Markdown Docs Generator — Auto API Reference',
  'markdown-docs-generator',
  'Generate beautiful API documentation from your TypeScript/JSDoc comments automatically. Parses @param, @returns, @example, @deprecated, @throws, and more. Produces organized Markdown with table of contents, parameter tables, code examples, and deprecation notices. Supports --watch mode for live regeneration. Zero external dependencies — works with Node.js built-in modules.',
  599,
  NULL,
  'products/product-08.zip',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  file_path = EXCLUDED.file_path,
  is_published = EXCLUDED.is_published;

-- Product 09: System Health Monitor
INSERT INTO products (id, title, slug, description, price_inr, thumbnail_url, file_path, is_published, created_at)
VALUES (
  gen_random_uuid(),
  'System Health Monitor — Real-time Dashboard',
  'system-health-monitor',
  'Self-hosted single-file Node.js health monitoring dashboard. Tracks CPU, memory, disk usage with color-coded gauges, monitors external endpoint uptime with response times, stores 60 minutes of history, and serves a beautiful dark-themed responsive UI. REST API included. Zero dependencies — deploy anywhere Node.js runs. Your lightweight alternative to heavy monitoring stacks.',
  799,
  NULL,
  'products/product-09.zip',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  file_path = EXCLUDED.file_path,
  is_published = EXCLUDED.is_published;

-- Product 10: Social OG Image Generator
INSERT INTO products (id, title, slug, description, price_inr, thumbnail_url, file_path, is_published, created_at)
VALUES (
  gen_random_uuid(),
  'Social OG Image Generator — Dynamic & Serverless',
  'social-og-image-generator',
  'Generate stunning Open Graph images on-the-fly for your blog, SaaS, or social media. Includes both a Vercel Edge Function version (@vercel/og) and a standalone Node.js server (node-canvas). Supports 4 gradient themes, auto-sizing title text, author badges, category tags, and decorative elements. In-memory LRU cache for performance. Ship beautiful link previews without Figma.',
  1099,
  NULL,
  'products/product-10.zip',
  true,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price_inr = EXCLUDED.price_inr,
  file_path = EXCLUDED.file_path,
  is_published = EXCLUDED.is_published;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run after inserting to verify all 10 products are present:
SELECT slug, title, price_inr, is_published FROM products
WHERE slug IN (
  'tailwind-landing-kit',
  'auth-rbac-boilerplate',
  'gmaps-lead-scraper-pro',
  'seo-auditor-cli',
  'stripe-razorpay-webhooks',
  'csv-to-sqlite-converter',
  'api-rate-limiter-redis',
  'markdown-docs-generator',
  'system-health-monitor',
  'social-og-image-generator'
)
ORDER BY price_inr;
