import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Star,
  Users,
  Layers,
  Database,
  Lock,
  ChevronDown,
  Sparkles,
  BarChart3,
  Code2,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-brand-600">
      {/* ──── NAVBAR ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md shadow-brand-600/30">
              <Zap className="h-4 w-4" />
            </div>
            <span>SaaS<span className="text-brand-500">Lite</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/30 transition-all hover:bg-brand-500"
            >
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ──── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
        {/* Glow gradients */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[140px]" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-[140px]" />

        <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-300 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> Next.js 14 + Supabase Auth Boilerplate
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Launch Your Next SaaS{' '}
            <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-teal-300 bg-clip-text text-transparent">
              in Record Time.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
            The minimal, production-ready SaaS starter kit. Includes pre-configured Supabase authentication,
            protected dashboard layouts, 3-tier pricing tables, and clean Tailwind styling.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-500/40"
            >
              Start Building Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all hover:bg-slate-800 hover:text-white"
            >
              Preview Protected Dashboard
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 border-t border-slate-800/80 pt-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Trusted by 500+ indie makers, solo developers &amp; early-stage startups
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-sm font-bold text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9/5 Rating
              </span>
              <span>100% TypeScript</span>
              <span>Supabase SSR Auth</span>
              <span>Zero Vendor Lock-in</span>
            </div>
          </div>
        </div>
      </section>

      {/* ──── FEATURES SECTION ────────────────────────────────────── */}
      <section id="features" className="scroll-mt-20 border-t border-slate-800 bg-slate-900/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Battle-Tested Stack
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Everything You Need to Ship Today
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
              Skip the 40 hours of boilerplate setup. Focus directly on building your core value proposition.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Lock,
                title: 'Supabase Authentication',
                desc: 'Pre-configured email/password signup, login, password recovery, and cookie session refresh with @supabase/ssr.',
              },
              {
                icon: ShieldCheck,
                title: 'Protected App Routes',
                desc: 'Middleware-protected /dashboard routes. Unauthorized visitors are gracefully redirected to the login screen.',
              },
              {
                icon: BarChart3,
                title: 'Metrics & Analytics Dashboard',
                desc: 'Responsive user dashboard with customizable metric stat cards, data tables, and user avatar settings.',
              },
              {
                icon: Layers,
                title: 'Next.js 14 App Router',
                desc: 'Built on Server Components, streaming, nested layouts, and modern SEO-friendly metadata architecture.',
              },
              {
                icon: Code2,
                title: 'Tailwind CSS & Lucide Icons',
                desc: 'Production-ready dark/light theme tokens, fluid responsive grids, and 400+ beautiful SVG vector icons.',
              },
              {
                icon: Database,
                title: 'Instant Database Extensibility',
                desc: 'Connect your PostgreSQL database in seconds with Supabase client libraries and Row-Level Security (RLS).',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-sm transition-all duration-300 hover:border-slate-700 hover:bg-slate-800/60"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── 3-TIER PRICING SECTION ──────────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Simple, Transparent Pricing
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Choose the Right Plan for Your Growth
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400">
              Start for free and scale as your traffic grows. No hidden costs.
            </p>
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-3 items-stretch">
            {/* Hobby Tier */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="mt-1 text-xs text-slate-400">For indie hackers and hobby side-projects.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹0</span>
                  <span className="text-xs text-slate-400">/ month free</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> Up to 500 active users
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> Basic email authentication
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> Community Discord support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> 1 GB cloud database storage
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 block text-center rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier (Popular) */}
            <div className="relative flex flex-col justify-between rounded-2xl border-2 border-brand-500 bg-slate-900 p-8 shadow-2xl shadow-brand-950/60">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3.5 py-1 text-[11px] font-bold text-white shadow-md">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Pro Builder</h3>
                <p className="mt-1 text-xs text-slate-400">For scaling SaaS businesses and creators.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹799</span>
                  <span className="text-xs text-slate-400">/ month billed annually</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> Unlimited active users
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> Role-Based Access Control (RBAC)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> Priority 24/7 email support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> 25 GB cloud database storage
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> Custom domain &amp; SSL included
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 block text-center rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-600/30 hover:bg-brand-500 transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
              <div>
                <h3 className="text-lg font-bold text-white">Team &amp; Scale</h3>
                <p className="mt-1 text-xs text-slate-400">For high-traffic apps and engineering teams.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹1,999</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> Everything in Pro plan
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> Unlimited team seats
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> 99.9% uptime SLA guarantee
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand-400" /> Dedicated account architect
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 block text-center rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
              >
                Contact Enterprise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──── FAQ SECTION ─────────────────────────────────────────── */}
      <section id="faq" className="scroll-mt-20 border-t border-slate-800 bg-slate-900/40 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Clear Answers
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-400">
              Everything you need to know about setting up and deploying your SaaS.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {[
              {
                q: 'How do I connect my own Supabase project?',
                a: 'Simply copy your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY into your local .env file. The starter kit automatically handles the rest through @supabase/ssr.',
              },
              {
                q: 'Are the dashboard routes automatically protected?',
                a: 'Yes. The Next.js middleware in src/middleware.ts verifies user session tokens on all /dashboard routes and redirects unauthenticated visitors to /login.',
              },
              {
                q: 'Can I deploy this starter kit to Vercel?',
                a: 'Yes, it is 100% optimized for zero-config deployment to Vercel. Push your repository to GitHub, import to Vercel, add your Supabase env vars, and deploy.',
              },
              {
                q: 'Can I use this for client or commercial projects?',
                a: 'Yes! The included license gives you complete rights to build and deploy unlimited personal, client, or commercial SaaS applications.',
              },
            ].map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
                <h3 className="text-base font-bold text-white">{faq.q}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-500 text-xs">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2 text-white font-bold">
            <Zap className="h-4 w-4 text-brand-500" /> SaaS Lite
          </div>
          <p>&copy; {new Date().getFullYear()} SaaS Starter Lite. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#features" className="hover:text-slate-300">Features</Link>
            <Link href="#pricing" className="hover:text-slate-300">Pricing</Link>
            <Link href="/login" className="hover:text-slate-300">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
