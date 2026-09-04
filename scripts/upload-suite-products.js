const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yaadhbybnsctadmgjxkr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYWRoYnlibnNjdGFkbWdqeGtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUyMDUwMywiZXhwIjoyMTA0MDk2NTAzfQ.cEAqLfMs0UjjV2m20akNDlIaXF7W77DEFJBABL_W7oM';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SUITE_DIST_DIR = path.join(__dirname, '..', 'digital-products-suite', 'dist');

const PRODUCTS_METADATA = [
  {
    num: '01',
    zipFile: 'product-01.zip',
    slug: 'tailwind-landing-kit',
    title: 'Tailwind Landing Kit — 10 Drop-in React Components',
    description: 'Ship conversion-focused landing pages in minutes. Includes 10 production-ready React + Tailwind CSS components: Hero with video modal, 3-tier pricing table with toggle, testimonial wall, feature comparison matrix, bento grid, collapsible FAQ accordion, animated stats counter, CTA banner, sticky header nav, and multi-column footer.',
    price_inr: 799,
    thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '02',
    zipFile: 'product-02.zip',
    slug: 'auth-rbac-boilerplate',
    title: 'Auth & RBAC Boilerplate — Express + TypeScript',
    description: 'Production-grade role-based access control (RBAC) system built with Express and TypeScript. Features dual-token JWT access + refresh rotation, bcrypt password hashing, token blacklisting, Admin/Editor/User hierarchy, route authorization middleware, brute-force rate limiters, and out-of-the-box demo accounts.',
    price_inr: 999,
    thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '03',
    zipFile: 'product-03.zip',
    slug: 'gmaps-lead-scraper-pro',
    title: 'Google Maps Lead Scraper — Automated Prospecting Suite',
    description: 'Automated Puppeteer-powered Google Maps lead extraction engine. Search any business type in any city and extract business names, phone numbers, ratings, review counts, websites, and addresses directly into an RFC 4180 CSV with Excel BOM compatibility. Features anti-detection headers, viewport randomization, and jitter delays.',
    price_inr: 1199,
    thumbnail_url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '04',
    zipFile: 'product-04.zip',
    slug: 'seo-auditor-cli',
    title: 'SEO Auditor CLI — Automated Technical Site Analysis',
    description: 'One-command technical SEO auditor for any website. Analyzes meta tags, heading hierarchy (H1-H3), OpenGraph & Twitter Cards, broken images via parallel HEAD probes, HTTPS, compression, Schema.org JSON-LD, and TTFB. Generates a 0-100 weighted score, ANSI terminal dashboard, JSON data, and Markdown reports.',
    price_inr: 699,
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '05',
    zipFile: 'product-05.zip',
    slug: 'stripe-razorpay-webhooks',
    title: 'Stripe & Razorpay Webhook Handler — Next.js App Router',
    description: 'Drop-in Next.js Route Handlers for both Stripe and Razorpay payment webhooks. Includes constant-time HMAC signature verification, typed event handling for checkouts, subscriptions, and invoices, plus a generic transactional database wrapper with automatic commit and rollback.',
    price_inr: 1499,
    thumbnail_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '06',
    zipFile: 'product-06.zip',
    slug: 'csv-to-sqlite-converter',
    title: 'CSV to SQLite Converter — High-Throughput CLI Tool',
    description: 'Convert any CSV file to an indexed SQLite database in seconds. Features delimiter auto-detection, intelligent column type inference (INTEGER, REAL, TEXT, DATE), 1000-row batch transactions, auto-indexing on ID/email columns, streaming parser for large datasets, and a dry-run preview mode.',
    price_inr: 499,
    thumbnail_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '07',
    zipFile: 'product-07.zip',
    slug: 'api-rate-limiter-redis',
    title: 'API Rate Limiter — Upstash Redis Sliding Window',
    description: 'Production-ready sliding window rate limiter middleware powered by Upstash Redis sorted sets. Features burst tolerance, IPv4 CIDR subnet whitelisting, custom key extraction (API keys, user IDs), standard RFC headers (X-RateLimit-*), and fail-open resilience when Redis is unreachable. Dual Express & standalone API.',
    price_inr: 899,
    thumbnail_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '08',
    zipFile: 'product-08.zip',
    slug: 'markdown-docs-generator',
    title: 'Markdown Docs Generator — Auto TypeScript API Reference',
    description: 'Zero-dependency TypeScript & JSDoc comment parser that compiles code comments into GitHub-flavored Markdown API reference documentation. Parses @param, @returns, @example, @deprecated, @throws, and complex generics. Features Table of Contents anchor generation and live --watch mode.',
    price_inr: 599,
    thumbnail_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '09',
    zipFile: 'product-09.zip',
    slug: 'system-health-monitor',
    title: 'System Health Monitor — Real-Time Server Dashboard',
    description: 'Lightweight, zero-dependency single-file Node.js server monitoring dashboard. Tracks CPU utilization tick deltas, memory usage, disk volume capacity, and external endpoint ping latency with 60-point sliding history. Serves a responsive dark-themed status UI with color-coded circular gauges and REST API.',
    price_inr: 799,
    thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  },
  {
    num: '10',
    zipFile: 'product-10.zip',
    slug: 'social-og-image-generator',
    title: 'Social OG Image Generator — Dynamic & Serverless',
    description: 'Generate beautiful Open Graph preview cards dynamically. Includes both a Vercel Edge Runtime handler (@vercel/og ImageResponse) and a standalone Node.js server with node-canvas. Features 4 customizable gradient themes, auto-sizing typography, category badges, author avatars, and in-memory LRU caching.',
    price_inr: 1099,
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
];

async function main() {
  console.log('\n🚀 UPLOADING DIGITAL PRODUCTS SUITE TO SUPABASE...\n');

  for (const item of PRODUCTS_METADATA) {
    const localZip = path.join(SUITE_DIST_DIR, item.zipFile);
    if (!fs.existsSync(localZip)) {
      console.error(`❌ Local zip not found: ${localZip}`);
      continue;
    }

    const zipBuffer = fs.readFileSync(localZip);
    const storagePath = `products/${item.zipFile}`;

    process.stdout.write(`  [${item.num}/10] Uploading ${item.zipFile} (${(zipBuffer.length / 1024).toFixed(1)} KB)... `);

    // 1. Upload ZIP to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('digital-assets')
      .upload(storagePath, zipBuffer, {
        upsert: true,
        contentType: 'application/zip'
      });

    if (uploadError) {
      console.log(`❌ Storage error: ${uploadError.message}`);
      continue;
    }
    console.log(`✓ Stored at ${storagePath}`);

    // 2. Upsert in products table
    const productRecord = {
      title: item.title,
      slug: item.slug,
      description: item.description,
      price_inr: item.price_inr,
      thumbnail_url: item.thumbnail_url,
      file_path: storagePath,
      is_published: true,
    };

    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('slug', item.slug)
      .maybeSingle();

    if (existing) {
      const { error: updateErr } = await supabase
        .from('products')
        .update(productRecord)
        .eq('id', existing.id);

      if (updateErr) {
        console.error(`     ❌ DB update error: ${updateErr.message}`);
      } else {
        console.log(`     ✓ Updated existing product (id: ${existing.id})`);
      }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('products')
        .insert({
          ...productRecord,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertErr) {
        console.error(`     ❌ DB insert error: ${insertErr.message}`);
      } else {
        console.log(`     ✓ Inserted new product (id: ${inserted.id})`);
      }
    }
  }

  // Final count check
  const { count, error: countErr } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  if (!countErr) {
    console.log(`\n🎉 DONE! Total published products in database: ${count}\n`);
  }
}

main().catch(err => {
  console.error('Fatal error during upload:', err);
  process.exit(1);
});
