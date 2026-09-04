# SaaS Starter Lite 🚀
### Production-Ready Next.js 14 App Router + Supabase Auth Boilerplate

A minimal, battle-tested SaaS foundation designed to help you ship your next web application in hours instead of weeks.

---

## ⚡ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth) (`@supabase/ssr` cookie session management)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: Zero-config on [Vercel](https://vercel.com/)

---

## 📁 Project Structure

\`\`\`text
saas-starter-lite/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx           # Styled login page
│   │   │   ├── register/page.tsx        # Styled registration page
│   │   │   └── forgot-password/page.tsx # Password recovery page
│   │   ├── auth/
│   │   │   └── callback/route.ts        # Supabase OAuth/magic link callback
│   │   ├── dashboard/
│   │   │   ├── layout.tsx               # Protected dashboard shell & sidebar
│   │   │   ├── page.tsx                 # Metrics cards, customer table
│   │   │   ├── settings/page.tsx        # User profile & account security
│   │   │   └── sign-out-button.tsx      # Client signout trigger
│   │   ├── globals.css                  # Tailwind styles & theme variables
│   │   ├── layout.tsx                   # Root HTML layout with Inter font
│   │   └── page.tsx                     # Landing page (Hero, Proof, Pricing, FAQ)
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts                # Browser client (createBrowserClient)
│   │       ├── server.ts                # Server client (createServerClient with cookies)
│   │       └── middleware.ts            # Session refresh & route protection
│   └── middleware.ts                    # Next.js edge route protection
├── .env.example                         # Template environment variables
├── next.config.mjs                      # Next.js configuration
├── package.json                         # Dependencies & scripts
├── postcss.config.mjs                   # PostCSS configuration
├── tailwind.config.ts                   # Tailwind theme colors & extensions
└── tsconfig.json                        # TypeScript configuration
\`\`\`

---

## 🛠️ Step-by-Step Setup Guide

### 1. Extract & Install Dependencies

\`\`\`bash
# Unzip the package into your project directory
cd saas-starter-lite

# Install dependencies using npm, yarn, or pnpm
npm install
\`\`\`

### 2. Configure Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **API**.
3. Copy your **Project URL** and **anon public key**.
4. In your Supabase Dashboard, navigate to **Authentication** → **URL Configuration**:
   - **Site URL**: `http://localhost:3000` (or your production domain)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`

### 3. Setup Environment Variables

Duplicate `.env.example` to create `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your project credentials:

\`\`\`env
# Supabase API Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Application URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Landing Page**: `http://localhost:3000/`
- **Sign Up**: `http://localhost:3000/register`
- **Sign In**: `http://localhost:3000/login`
- **Protected Dashboard**: `http://localhost:3000/dashboard`

---

## 🔒 Protected Route Behavior

- Any visit to `/dashboard` or `/dashboard/*` without a valid Supabase Auth session automatically redirects to `/login?redirect=/dashboard`.
- Any authenticated user visiting `/login` or `/register` is automatically redirected to `/dashboard`.
- All cookie session tokens are refreshed automatically on every request in `src/middleware.ts`.

---

## 🚢 Production Deployment (Vercel)

1. Push this project to your GitHub repository:
   \`\`\`bash
   git init
   git add -A
   git commit -m "Initial commit from SaaS Starter Lite"
   git push origin main
   \`\`\`
2. In the Vercel Dashboard, click **Add New Project** and import the repository.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (set to `https://your-domain.vercel.app`)
4. Click **Deploy**. Your SaaS will be live in under 60 seconds!

---

## 📄 License & Commercial Rights

This package is licensed for use in unlimited personal and commercial projects. You are free to build client websites, venture-backed applications, or indie SaaS products with zero additional royalties.

Developed with care by **QorelySofts** ([qorelysofts.co.in](https://www.qorelysofts.co.in)).
For questions or support: `qorelysoftzenovee@gmail.com`.
