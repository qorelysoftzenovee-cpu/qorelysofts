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
  Star,
  Code,
  Palette,
  FileText,
  LayoutTemplate,
  Smartphone,
  BarChart3,
} from 'lucide-react';
import type { Product } from '@/types';

export const dynamic = 'force-dynamic';

/* ─── Category data ────────────────────────────────────────────── */
const categories = [
  {
    title: 'Website Templates',
    description: 'Production-ready HTML, React & Next.js templates',
    icon: LayoutTemplate,
    color: 'bg-blue-50 text-blue-600',
    href: '/#products',
  },
  {
    title: 'UI Kits & Design',
    description: 'Figma & Tailwind component kits for rapid prototyping',
    icon: Palette,
    color: 'bg-purple-50 text-purple-600',
    href: '/#products',
  },
  {
    title: 'Source Code',
    description: 'Full-stack boilerplates, APIs & micro-SaaS starters',
    icon: Code,
    color: 'bg-green-50 text-green-600',
    href: '/#products',
  },
  {
    title: 'Mobile Apps',
    description: 'React Native & Flutter app templates with backends',
    icon: Smartphone,
    color: 'bg-orange-50 text-orange-600',
    href: '/#products',
  },
  {
    title: 'Documents & eBooks',
    description: 'Technical guides, checklists & digital workbooks',
    icon: FileText,
    color: 'bg-pink-50 text-pink-600',
    href: '/#products',
  },
  {
    title: 'Analytics & Tools',
    description: 'Dashboards, spreadsheets & data-analysis kits',
    icon: BarChart3,
    color: 'bg-teal-50 text-teal-600',
    href: '/#products',
  },
];

/* ─── How-it-works steps ───────────────────────────────────────── */
const steps = [
  {
    icon: Zap,
    title: 'Browse & Choose',
    description: 'Explore our curated catalog of premium digital products, each vetted for quality.',
  },
  {
    icon: CreditCard,
    title: 'Secure Checkout',
    description: 'Pay safely with UPI, cards, or net banking via Razorpay — 100 % encrypted.',
  },
  {
    icon: Download,
    title: 'Instant Download',
    description: 'Get immediate access. Download your product right after payment — no waiting.',
  },
];

/* ─── Trust stats ──────────────────────────────────────────────── */
const stats = [
  { label: 'Digital Products', value: '50+' },
  { label: 'Happy Customers', value: '1,200+' },
  { label: 'Instant Downloads', value: '100%' },
  { label: 'Secure Payments', value: '256-bit' },
];

/* ─── Testimonials ─────────────────────────────────────────────── */
const testimonials = [
  {
    name: 'Arjun Mehta',
    role: 'Full-Stack Developer',
    text: 'The Next.js boilerplate saved me weeks of setup. Clean code, well-documented, and production-ready out of the box.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'UI/UX Designer',
    text: 'Fantastic design kits! The Figma components are pixel-perfect and the Tailwind integration is seamless.',
    rating: 5,
  },
  {
    name: 'Rahul Verma',
    role: 'Startup Founder',
    text: 'Downloaded the SaaS starter kit and launched our MVP in under a week. Best investment for our startup.',
    rating: 5,
  },
];

/* ═══════════════════════════════════════════════════════════════ */

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
    <>
      {/* ──── HERO SECTION ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-brand-900">
        {/* Background image overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1920&q=80"
            alt="Digital workspace background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/60" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — Copy */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-600/20 px-3 py-1 text-xs font-semibold text-brand-300 ring-1 ring-brand-500/30 backdrop-blur-sm">
                <Zap className="h-3 w-3" /> Instant Digital Delivery
              </span>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Premium Digital{' '}
                <span className="bg-gradient-to-r from-brand-400 to-blue-400 bg-clip-text text-transparent">
                  Products
                </span>{' '}
                for Creators &amp; Developers
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-300 lg:max-w-xl">
                Discover high-quality templates, source code, UI kits, and development tools.
                Download instantly after secure checkout — start building today.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="#products"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all hover:bg-brand-500 hover:shadow-xl hover:shadow-brand-500/30 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  Explore Products <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-6 py-3.5 text-sm font-semibold text-gray-300 transition-all hover:border-gray-400 hover:text-white"
                >
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right — Hero image */}
            <div className="relative mx-auto hidden lg:block">
              <div className="relative h-[420px] w-[480px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=960&q=80"
                  alt="Digital products dashboard preview"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent" />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 rounded-xl border border-white/10 bg-gray-900/80 p-4 shadow-xl backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                    <ShieldCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Payments Secured by</p>
                    <p className="text-sm font-semibold text-white">Razorpay</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 30C840 40 960 50 1080 45C1200 40 1320 20 1380 10L1440 0V60H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ──── TRUST STATS BAR ───────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CATEGORIES ────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Browse by Category
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              From ready-to-deploy templates to full source-code projects — find exactly what you need.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${cat.color}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ──── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              Three simple steps from browsing to building.
            </p>
          </div>

          <div className="relative mt-14">
            {/* Connecting line */}
            <div className="absolute left-1/2 top-12 hidden h-px w-[60%] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-200 to-transparent lg:block" />

            <div className="grid gap-10 sm:grid-cols-3">
              {steps.map((step, i) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-4 ring-white shadow-sm">
                    <step.icon className="h-7 w-7" />
                  </div>
                  <span className="mt-4 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──── FEATURED PRODUCTS ─────────────────────────────────── */}
      <section id="products" className="scroll-mt-20 bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Our Products
              </h2>
              <p className="mt-2 text-gray-500">
                Handpicked digital assets ready for your next project.
              </p>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            /* Showcase grid when DB is empty */
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'SaaS Dashboard Template',
                  desc: 'Complete admin dashboard with analytics, user management, and billing modules.',
                  image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
                  price: '₹1,499',
                },
                {
                  title: 'E-Commerce Starter Kit',
                  desc: 'Full-stack e-commerce solution with cart, payments, and inventory management.',
                  image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
                  price: '₹2,499',
                },
                {
                  title: 'Mobile App UI Kit',
                  desc: '200+ screens in Figma with dark/light mode and design tokens.',
                  image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
                  price: '₹999',
                },
                {
                  title: 'API Boilerplate',
                  desc: 'Node.js + TypeScript REST API with auth, rate limiting, and auto-docs.',
                  image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=600&q=80',
                  price: '₹1,999',
                },
                {
                  title: 'Landing Page Bundle',
                  desc: '12 high-converting landing page templates with A/B test variants.',
                  image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=600&q=80',
                  price: '₹799',
                },
                {
                  title: 'Dev Productivity Toolkit',
                  desc: 'VS Code snippets, shell scripts, Git hooks, and CI/CD templates.',
                  image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
                  price: '₹599',
                },
              ].map((showcase) => (
                <div
                  key={showcase.title}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-gray-300"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={showcase.image}
                      alt={showcase.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      Coming Soon
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                      {showcase.title}
                    </h3>
                    <p className="mt-1.5 flex-1 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                      {showcase.desc}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">{showcase.price}</span>
                      <span className="flex items-center gap-1 text-sm font-medium text-brand-600">
                        View Details <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ──── TRUST & SECURITY ──────────────────────────────────── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative">
              <div className="relative h-[360px] overflow-hidden rounded-2xl shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80"
                  alt="Secure digital transactions"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/30 to-transparent" />
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Trusted by Developers &amp; Creators
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                We take quality and security seriously. Every product is reviewed before listing, and every transaction is protected with bank-grade encryption.
              </p>

              <div className="mt-8 space-y-5">
                {[
                  {
                    icon: ShieldCheck,
                    title: 'Razorpay-Secured Payments',
                    desc: '256-bit SSL encryption with PCI-DSS compliant payment processing.',
                  },
                  {
                    icon: Download,
                    title: 'Instant Digital Delivery',
                    desc: 'No waiting — download your purchase immediately after payment confirmation.',
                  },
                  {
                    icon: Headphones,
                    title: 'Dedicated Support',
                    desc: 'Get help within 24 hours via email for any order or product questions.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-0.5 text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── TESTIMONIALS ──────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-gray-500">
              Join thousands of satisfied developers and creators.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm text-gray-600 leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── CTA BANNER ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-r from-brand-600 to-brand-700">
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Build Something Amazing?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            Get instant access to premium digital products and start your next project today.
            No subscriptions — pay once, download forever.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="#products"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-brand-700 shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-700"
            >
              Browse All Products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
