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
} from 'lucide-react';
import type { Product } from '@/types';

export const dynamic = 'force-dynamic';

/* ─── Visual Category Data with Curated Unsplash Photography ──────── */
const categories = [
  {
    title: 'Website Templates',
    description: 'Production-ready Next.js, React, and Tailwind CSS responsive templates.',
    icon: LayoutTemplate,
    image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    tag: 'Frontend',
    href: '/#products',
  },
  {
    title: 'UI Kits & Design Systems',
    description: 'Figma component systems and modern UI assets for rapid prototyping.',
    icon: Palette,
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    tag: 'Design',
    href: '/#products',
  },
  {
    title: 'Source Code & Starters',
    description: 'Full-stack boilerplates, REST APIs, and micro-SaaS starter repositories.',
    icon: Code,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    tag: 'Full-Stack',
    href: '/#products',
  },
  {
    title: 'Mobile App Templates',
    description: 'Cross-platform React Native & Flutter starters with backend integration.',
    icon: Smartphone,
    image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=800&q=80',
    tag: 'Mobile',
    href: '/#products',
  },
  {
    title: 'Developer Guides & Docs',
    description: 'Handcrafted architecture blueprints, checklists, and technical eBooks.',
    icon: FileText,
    image: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=800&q=80',
    tag: 'Docs',
    href: '/#products',
  },
  {
    title: 'Dashboards & Analytics',
    description: 'Interactive admin control panels, data tables, and charting components.',
    icon: BarChart3,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    tag: 'Analytics',
    href: '/#products',
  },
];

/* ─── 3-Step Flow ─────────────────────────────────────────────────── */
const steps = [
  {
    step: '01',
    icon: Zap,
    title: 'Browse & Choose',
    description: 'Pick from verified, production-ready software assets crafted specifically for creators & developers.',
  },
  {
    step: '02',
    icon: Lock,
    title: 'Secure Razorpay Checkout',
    description: 'Pay instantly via UPI (GPay, PhonePe, Paytm), credit/debit cards, or net banking with 256-bit encryption.',
  },
  {
    step: '03',
    icon: Download,
    title: 'Immediate File Access',
    description: 'Your secure download link is generated on-screen immediately, plus accessible anytime under My Orders.',
  },
];

/* ─── Honest FAQ Data ─────────────────────────────────────────────── */
const faqs = [
  {
    q: 'How do I receive my digital purchase?',
    a: 'Instantly! Once your Razorpay payment completes, you are automatically shown a secure download link on the order confirmation screen. If you have an account, it also appears under your "My Orders" dashboard.',
  },
  {
    q: 'What is the pricing range of products on QorelySofts?',
    a: 'Every single product is strictly priced between ₹100 and ₹1,000 INR (approximately $1 to $10 USD). We believe premium developer assets should be accessible to everyone without expensive monthly subscriptions.',
  },
  {
    q: 'What payment options are supported?',
    a: 'We process all payments through Razorpay, supporting Indian UPI (Google Pay, PhonePe, Paytm, BHIM), all major Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and digital wallets.',
  },
  {
    q: 'Are the products licensed for commercial projects?',
    a: 'Yes! All digital templates, boilerplates, and UI kits purchased on QorelySofts include a royalty-free license allowing you to build both personal and commercial client applications.',
  },
  {
    q: 'What if I encounter an issue with a download?',
    a: 'Our support team is ready to assist. You can reach out directly to qorelysoftzenovee@gmail.com with your Order ID, and we will verify your purchase and re-issue fresh download links within 24 hours.',
  },
  {
    q: 'Are the files virus-scanned and verified?',
    a: 'Absolutely. Every uploaded digital package is screened, tested for code integrity, and stored in secure cloud storage before being listed on the platform.',
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
    <div className="relative overflow-hidden">
      {/* ──── HERO SECTION ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Background ambient lighting glows */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-600/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 top-1/4 h-[550px] w-[550px] rounded-full bg-blue-500/15 blur-[140px]" />

        {/* Subtle photo overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80"
            alt="Software team collaboration"
            fill
            className="object-cover opacity-10"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Content */}
            <div className="text-center lg:col-span-7 lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
                </span>
                <span className="tracking-wide">Instant Digital Downloads • ₹100 – ₹1,000 Max</span>
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Premium Software &amp;{' '}
                <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-teal-300 bg-clip-text text-transparent">
                  Digital Assets
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                Curated code boilerplates, UI kits, templates, and developer toolkits.
                All priced affordably from <strong className="text-white font-semibold">₹100 to ₹1,000</strong> ($1 to $10 USD).
                No recurring subscriptions — purchase once, own forever.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="#products"
                  className="group inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-500/40 focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  Browse Products
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="#categories"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all duration-300 hover:border-slate-500 hover:bg-slate-800/80 hover:text-white"
                >
                  Explore Categories
                </Link>
              </div>

              {/* Security Pill Strip */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-slate-800/80 pt-6 text-xs text-slate-400 lg:justify-start">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-green-400" />
                  <span>Razorpay 256-Bit SSL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Instant Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <IndianRupee className="h-4 w-4 text-blue-400" />
                  <span>₹100 – ₹1,000 Price Cap</span>
                </div>
              </div>
            </div>

            {/* Right Visual Graphic */}
            <div className="relative mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-2 shadow-2xl shadow-brand-950/50 backdrop-blur-xl">
                {/* Main Screen Preview */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900">
                  <Image
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80"
                    alt="Developer coding setup"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Overlay text on image */}
                  <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-slate-950/70 p-3.5 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-brand-300">Production-Ready Assets</p>
                        <p className="text-sm font-bold text-white">Direct Download Post-Payment</p>
                      </div>
                      <span className="rounded-full bg-brand-600/30 px-2.5 py-1 text-[11px] font-semibold text-brand-300 ring-1 ring-brand-500/30">
                        ₹100 - ₹1,000
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Glass Badges */}
                <div className="animate-float absolute -top-5 -right-3 hidden rounded-xl border border-white/15 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-md sm:flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Security Verified</p>
                    <p className="text-xs font-bold text-white">Razorpay Protected</p>
                  </div>
                </div>

                <div className="animate-float-reverse absolute -bottom-5 -left-3 hidden rounded-xl border border-white/15 bg-slate-900/90 p-3 shadow-2xl backdrop-blur-md sm:flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Delivery Speed</p>
                    <p className="text-xs font-bold text-white">Instant 1-Click Access</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sleek bottom gradient divider */}
        <div className="h-8 w-full bg-gradient-to-b from-transparent to-slate-50" />
      </section>

      {/* ──── VALUE ASSURANCE STRIP ─────────────────────────────────── */}
      <section className="border-b border-slate-200/80 bg-slate-50 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <IndianRupee className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">₹100 to ₹1,000</h3>
              <p className="mt-1 text-xs text-slate-500">$1 – $10 USD Fair Pricing</p>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Instant Download</h3>
              <p className="mt-1 text-xs text-slate-500">Zero waiting or queue time</p>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Razorpay Encrypted</h3>
              <p className="mt-1 text-xs text-slate-500">UPI, Cards &amp; NetBanking</p>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                <Headphones className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Direct Support</h3>
              <p className="mt-1 text-xs text-slate-500">Email reply within 24h</p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── BROWSE CATEGORIES WITH RICH PHOTOGRAPHY ───────────────── */}
      <section id="categories" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:text-left sm:flex-row">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-600">
                <Sparkles className="h-3.5 w-3.5" /> Curated Collections
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Browse by Category
              </h2>
              <p className="mt-2 text-sm text-slate-500 max-w-xl">
                Explore handpicked developer toolkits, ready-to-deploy templates, and design assets.
              </p>
            </div>
            <Link
              href="#products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  
                  {/* Category Pill */}
                  <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                    {cat.tag}
                  </span>

                  {/* Icon badge */}
                  <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-brand-600 shadow-md backdrop-blur-sm">
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
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-brand-600">
                    <span>Explore Assets</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="border-y border-slate-200/80 bg-slate-50/70 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Simple &amp; Frictionless
            </span>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Get immediate access to your files in three effortless steps.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
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

      {/* ──── OUR PRODUCTS (LIVE DB / CLEAN EMPTY STATE) ─────────────── */}
      <section id="products" className="scroll-mt-20 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:text-left sm:flex-row">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Direct Storefront
              </span>
              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Published Digital Products
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                All items packaged with full instructions, virus-scanned, and ready for instant electronic delivery.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50/80 px-4 py-1.5 text-xs font-semibold text-brand-700">
              <IndianRupee className="h-3.5 w-3.5" /> ₹100 – ₹1,000 ($1 – $10 USD)
            </span>
          </div>

          {items.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-12 text-center sm:p-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100/80 text-brand-600 shadow-sm">
                <Package className="h-8 w-8" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900">
                Catalog Launching Soon
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
                We are actively uploading our initial suite of website starters, UI components, and boilerplates priced strictly between ₹100 and ₹1,000.
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

      {/* ──── DEEP DIVE / WHY QORELYSOFTS ────────────────────────────── */}
      <section className="border-t border-slate-200/80 bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            {/* Left Photo Showcase */}
            <div className="relative lg:col-span-6">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
                  alt="Modern development analytics dashboard"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Floating feature note */}
              <div className="absolute -bottom-5 right-4 rounded-xl border border-slate-700 bg-slate-950/90 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600/30 text-brand-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Instant Electronic Delivery</p>
                    <p className="text-[11px] text-slate-400">Direct Download Post-Payment</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Feature Checklist */}
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                Built for Creators &amp; Developers
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Why Developers Choose QorelySofts
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Building software from scratch takes unnecessary time. We provide clean, tested, and production-ready digital foundations so you can ship projects faster.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: 'Strict ₹100 – ₹1,000 Budget Pricing',
                    desc: 'Every item stays between $1 and $10 USD. No predatory pricing or hidden fees.',
                  },
                  {
                    title: 'Instant Download & Signed Token Security',
                    desc: 'Instant delivery after Razorpay payment plus secure 30-minute signed download URLs.',
                  },
                  {
                    title: 'Virus-Free & Manually Inspected Files',
                    desc: 'Zero adware or malicious scripts. Every zip archive is thoroughly reviewed.',
                  },
                  {
                    title: 'Full Commercial & Personal Use License',
                    desc: 'Use templates and assets across unlimited personal and client software projects.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4 backdrop-blur-sm">
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
              Clear answers to common questions about orders, downloads, and payments.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 transition-colors hover:border-slate-300 hover:bg-slate-50"
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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" /> Start Building Today
          </span>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Accelerate Your Development?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base">
            Get instant access to digital products priced from ₹100 to ₹1,000 ($1 to $10 USD).
            Pay securely with Razorpay and download your files in seconds.
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
