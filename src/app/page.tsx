import { createAdminClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product-card';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Download,
  ShieldCheck,
  Zap,
  CreditCard,
  Headphones,
  Package,
  Code,
  Palette,
  FileText,
  LayoutTemplate,
  Smartphone,
  BarChart3,
  IndianRupee,
  CheckCircle2,
  Lock,
  Sparkles,
  HelpCircle,
  Clock,
} from 'lucide-react';
import type { Product } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* ─── Visual Category Data with Curated Unsplash Photography ──────── */
const categories = [
  {
    title: 'High-Converting Website Templates',
    description: 'Pre-built landing pages and web apps engineered to convert visitors into customers. 100% Next.js & Tailwind.',
    icon: LayoutTemplate,
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    tag: 'Web Templates',
    price: 'From ₹199',
    href: '/#products',
  },
  {
    title: 'Figma UI Kits & Design Systems',
    description: 'Auto-layout 5.0 components, tokens, and dark/light themes. Never design software from a blank canvas again.',
    icon: Palette,
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    tag: 'UI & Design',
    price: 'From ₹149',
    href: '/#products',
  },
  {
    title: 'Full-Stack Source Code & APIs',
    description: 'Production-tested REST APIs, JWT auth, database schemas, and micro-SaaS boilerplates in TypeScript.',
    icon: Code,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    tag: 'Backend & APIs',
    price: 'From ₹299',
    href: '/#products',
  },
  {
    title: 'Mobile App Starters',
    description: 'React Native & Flutter templates with pre-configured auth screens, navigation, and push notifications.',
    icon: Smartphone,
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    tag: 'Mobile Apps',
    price: 'From ₹349',
    href: '/#products',
  },
  {
    title: 'Developer Guides & Blueprints',
    description: 'Step-by-step system architecture playbooks, Docker compose stacks, shell automations, and DevOps configs.',
    icon: FileText,
    image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=800&q=80',
    tag: 'Docs & Guides',
    price: 'From ₹100',
    href: '/#products',
  },
  {
    title: 'Executive Analytics Dashboards',
    description: 'Interactive metric dashboards with chart libraries, financial tables, and real-time filtering widgets.',
    icon: BarChart3,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    tag: 'Dashboards',
    price: 'From ₹249',
    href: '/#products',
  },
];

/* ─── 3-Step Flow ─────────────────────────────────────────────────── */
const steps = [
  {
    step: '01',
    icon: Zap,
    title: 'Pick What You Need',
    description: 'Browse our curated catalog. Every asset is verified, clean, virus-free, and tested for immediate real-world use.',
  },
  {
    step: '02',
    icon: Lock,
    title: 'Secure 10-Second Checkout',
    description: 'Pay safely with UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, or NetBanking via Razorpay 256-bit encryption.',
  },
  {
    step: '03',
    icon: Download,
    title: 'Download & Build Immediately',
    description: 'Your secure download link appears on your screen the second payment completes. Plus, access it anytime in My Orders.',
  },
];

/* ─── Conversational FAQ Data ─────────────────────────────────────── */
const faqs = [
  {
    q: 'Can I use these templates and source code for commercial client work?',
    a: 'Yes, 100%! Every single product purchased on QorelySofts comes with a full royalty-free license. You can use it across unlimited personal projects, client work, or your own commercial SaaS businesses without paying any additional royalties.',
  },
  {
    q: 'How does pricing and licensing work?',
    a: 'All digital products on QorelySofts are available for a transparent one-time purchase with zero recurring monthly subscription fees. Every single purchase includes full source code, documentation, and an official royalty-free commercial license for personal and client projects.',
  },
  {
    q: 'How fast do I get access after I pay?',
    a: 'Instantly. The moment Razorpay confirms your payment, your order confirmation screen generates a secure, signed download button. There is zero waiting time, zero queue, and no email delay.',
  },
  {
    q: 'What payment methods can I use?',
    a: 'We support all major Indian payment methods through Razorpay: UPI (PhonePe, Google Pay, Paytm, BHIM), all Debit & Credit Cards (Visa, Mastercard, RuPay), Net Banking across 50+ banks, and popular digital wallets.',
  },
  {
    q: 'What if I need to re-download my file later?',
    a: 'No problem! If you create a free account or log in with the email you used at checkout, your purchases are permanently stored under your "My Orders" dashboard. You can generate fresh, secure download links whenever you need them.',
  },
  {
    q: 'What if I run into an issue with the code or files?',
    a: 'We stand behind our products. If you experience any issues downloading or extracting your purchase, just shoot an email to qorelysoftzenovee@gmail.com with your Order ID. Our support team will verify your order and resolve it within 24 hours.',
  },
];

/* ═══════════════════════════════════════════════════════════════════ */

export default async function HomePage() {
  const supabase = createAdminClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  const items = (products as Product[]) || [];

  return (
    <div className="relative overflow-hidden bg-white">
      {/* ──── HERO SECTION ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-600/25 blur-[130px]" />
        <div className="pointer-events-none absolute -right-40 top-1/4 h-[550px] w-[550px] rounded-full bg-blue-500/20 blur-[150px]" />

        {/* High-res background photography */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2000&q=80"
            alt="Code on screen background"
            fill
            unoptimized
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Copy */}
            <div className="text-center lg:col-span-7 lg:text-left">
              {/* Highlight Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-500/15 px-4 py-1.5 text-xs font-semibold text-brand-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
                </span>
                <span>Instant Digital Delivery • Production-Ready Software Assets</span>
              </div>

              {/* High-Converting Main Hook */}
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
                Stop Building From Scratch.{' '}
                <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-teal-300 bg-clip-text text-transparent">
                  Ship in Hours.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Production-ready code boilerplates, responsive templates, and Figma UI kits.
                Transparent one-time pricing — pay once, download in 3 seconds, and build your next big thing without recurring subscription traps.
              </p>

              {/* Call-to-action buttons */}
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="#products"
                  className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  Browse Ready-to-Ship Products
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="#categories"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all duration-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                >
                  Explore Categories
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-slate-800/90 pt-6 text-xs text-slate-300 lg:justify-start">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Razorpay PCI-DSS Level 1 Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Instant 1-Click Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-400" />
                  <span>Royalty-Free Commercial License</span>
                </div>
              </div>
            </div>

            {/* Right Visual Graphic Card */}
            <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-2.5 shadow-2xl shadow-brand-950/60 backdrop-blur-xl">
                {/* High-res Image Preview */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900">
                  <Image
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80"
                    alt="Developer coding setup"
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

                  {/* Overlay badge on image */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/15 bg-slate-950/80 p-3.5 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-brand-300">Verified Clean Code</p>
                        <p className="text-sm font-bold text-white">Direct Download Post-Payment</p>
                      </div>
                      <span className="rounded-full bg-brand-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        One-Time Purchase
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Glass Pills */}
                <div className="animate-float absolute -top-5 -right-3 hidden rounded-xl border border-white/20 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md sm:flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Security Verified</p>
                    <p className="text-xs font-bold text-white">Razorpay 256-Bit</p>
                  </div>
                </div>

                <div className="animate-float-reverse absolute -bottom-5 -left-3 hidden rounded-xl border border-white/20 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md sm:flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Delivery Guarantee</p>
                    <p className="text-xs font-bold text-white">Instant 1-Click File</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider transition */}
        <div className="h-10 w-full bg-gradient-to-b from-transparent to-slate-50" />
      </section>

      {/* ──── VALUE ASSURANCE STRIP ─────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-slate-50 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-400 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <IndianRupee className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">One-Time Payment</h3>
              <p className="mt-1 text-xs text-slate-500">Pay once, own forever. No recurring monthly subscriptions.</p>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Instant Access</h3>
              <p className="mt-1 text-xs text-slate-500">Download starts the second payment clears.</p>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-400 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Razorpay Protected</h3>
              <p className="mt-1 text-xs text-slate-500">UPI, Cards, and NetBanking with 256-bit SSL.</p>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                <Headphones className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Guaranteed Support</h3>
              <p className="mt-1 text-xs text-slate-500">Direct founder email support within 24h.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── BROWSE CATEGORIES WITH BRIGHT HIGH-RES PHOTOGRAPHY ───── */}
      <section id="categories" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:text-left sm:flex-row">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-brand-600">
                <Sparkles className="h-3.5 w-3.5" /> Curated Assets
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Browse by Category
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Handpicked developer toolkits, ready-to-deploy templates, and design assets engineered for velocity.
              </p>
            </div>
            <Link
              href="#products"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              View all products ({items.length}) <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-xl hover:shadow-brand-500/10"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  
                  {/* Category Pill */}
                  <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-white shadow-sm backdrop-blur-md">
                    {cat.tag}
                  </span>

                  <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    {cat.price}
                  </span>

                  {/* Icon badge */}
                  <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-600 shadow-md">
                    <cat.icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-brand-600">
                    {cat.title}
                  </h3>
                  <p className="mt-1.5 flex-1 text-xs text-slate-500 leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-brand-600">
                    <span>Explore Collection</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Zero Friction Process
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Buy in 10 Seconds. Build Forever.
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Here is exactly what happens when you purchase on QorelySofts.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-200">{item.step}</span>
                </div>
                <h3 className="mt-5 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── OUR PRODUCTS (LIVE SUPABASE PRODUCTS) ─────────────────── */}
      <section id="products" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:text-left sm:flex-row">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Ready-to-Download Catalog
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Featured Digital Products
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Instantly accessible after checkout. Full source code, virus-scanned, with commercial use rights.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-700">
              <Zap className="h-3.5 w-3.5" /> Instant Electronic Delivery
            </span>
          </div>

          {/* Product Grid */}
          {items.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-12 text-center sm:p-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 shadow-sm">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Catalog Launching Soon
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
                We are actively uploading our initial suite of website starters, UI components, and boilerplates.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-brand-500"
                >
                  Request a Product <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
                >
                  Learn About Us
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ──── DEEP DIVE / WHY CHOOSE QORELYSOFTS ─────────────────────── */}
      <section className="border-t border-slate-800 bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Photo Showcase */}
            <div className="relative lg:col-span-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern development analytics dashboard"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Floating feature note */}
              <div className="absolute -bottom-5 right-4 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/30 text-brand-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Instant Electronic Delivery</p>
                    <p className="text-[11px] text-slate-400">Download In Seconds Post-Payment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Feature Checklist */}
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Built for High-Velocity Teams
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Why Developers Choose QorelySofts
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Building boilerplate features from scratch burns 40+ hours per project. We give you clean, tested, production-ready digital codebases so you can focus on building what matters.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: 'Transparent One-Time Pricing',
                    desc: 'Pay once and own your code forever. Zero subscription traps, recurring memberships, or hidden fees.',
                  },
                  {
                    title: 'Instant Download & Signed Token Security',
                    desc: 'Immediate access on-screen post-payment plus 30-minute signed download URLs anytime in My Orders.',
                  },
                  {
                    title: 'Virus-Free & Manually Inspected Files',
                    desc: 'Zero adware, telemetry, or malicious scripts. Every archive is tested and clean.',
                  },
                  {
                    title: 'Full Commercial & Personal Use License',
                    desc: 'Deploy code across unlimited client deliverables, personal projects, and commercial SaaS products.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-400 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      <p className="mt-0.5 text-xs text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── HONEST FAQ SECTION ────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 mb-3">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Clear, transparent answers about orders, payment security, and digital downloads.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <h3 className="text-base font-bold text-slate-900">{faq.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CALL TO ACTION ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-blue-800 py-20 text-white">
        {/* Glow orb */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> Start Shipping Today
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Stop Wasting Time on Boilerplate.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base">
            Grab a production-ready digital asset today.
            Pay securely with Razorpay and launch your project in minutes.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#products"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand-700 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-2xl"
            >
              Browse Products Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
