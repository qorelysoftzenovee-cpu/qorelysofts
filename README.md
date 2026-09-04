# Digital Products Store

A production-ready digital products store built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase** (Database, Auth, Storage), and **Razorpay**.

## Features

- **Storefront**: Clean, responsive grid layout displaying published digital products with prices in INR (₹).
- **Product Detail**: Full overview, features list, and direct checkout form.
- **Server-Side Razorpay Integration**: Order generation and cryptographic signature verification (HMAC-SHA256) performed exclusively server-side.
- **Protected Storage**: Digital files are stored in a private Supabase bucket (`digital-assets`) and delivered via 30-minute time-limited signed URLs upon verified payment.
- **Admin Dashboard**: Protected by Supabase Auth and admin email check. Upload products, attach files, manage thumbnail previews, and monitor sales.
- **Row Level Security (RLS)**: Strict security policies on database tables.

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/qorelysoftzenovee-cpu/qorelysofts.git
cd qorelysofts
npm install
```

### 2. Environment Variables

Create `.env.local` based on `.env.example`:

```bash
cp .env.example .env.local
```

Fill in the required keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# App URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Admin Access
ADMIN_EMAIL=your_admin_email@domain.com
```

### 3. Database & Storage Setup

1. Run the migration script in `supabase/migration.sql` in your Supabase SQL Editor.
2. Create two Supabase Storage buckets:
   - `digital-assets` (Private: uncheck public access)
   - `product-thumbnails` (Public: check public access)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
