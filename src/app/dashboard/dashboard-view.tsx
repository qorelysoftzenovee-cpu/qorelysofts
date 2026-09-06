'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Store,
  LayoutGrid,
  Download,
  CreditCard,
  User as UserIcon,
  LogOut,
  HelpCircle,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Package,
  Menu,
  X,
  Mail,
  Zap,
} from 'lucide-react';
import type { Product, OrderWithProduct } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface DashboardViewProps {
  user: SupabaseUser;
  products: Product[];
  orders: OrderWithProduct[];
}

type TabType = 'products' | 'downloads' | 'orders' | 'account' | 'support';

export function DashboardView({ user, products, orders }: DashboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'products';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Map of purchased product IDs for fast O(1) lookup
  const purchasedMap = useMemo(() => {
    const map = new Map<string, OrderWithProduct>();
    for (const order of orders) {
      if (order.product_id) {
        map.set(order.product_id, order);
      }
    }
    return map;
  }, [orders]);

  // Total spent in INR
  const totalSpentInr = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.products?.price_inr || 0), 0);
  }, [orders]);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'owned') return purchasedMap.has(item.id);
      if (selectedCategory === 'scrapers') return item.slug.includes('scraper') || item.slug.includes('seo');
      if (selectedCategory === 'backend') return item.slug.includes('auth') || item.slug.includes('redis') || item.slug.includes('webhook');
      if (selectedCategory === 'ui') return item.slug.includes('kit') || item.slug.includes('component') || item.slug.includes('landing');
      return true;
    });
  }, [products, searchQuery, selectedCategory, purchasedMap]);

  // Handle direct file download via signed URL
  const handleDownload = async (orderId: string) => {
    setDownloadingOrderId(orderId);
    setDownloadError(null);

    try {
      const res = await fetch('/api/orders/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate download URL');
      }

      // Trigger instant browser download
      window.location.href = data.downloadUrl;
    } catch (err: any) {
      setDownloadError(err.message || 'Download failed. Please try again.');
    } finally {
      setDownloadingOrderId(null);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MOBILE TOPBAR */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Store className="h-5 w-5 text-indigo-400" />
          <span>QorelySofts</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* SIDE PANEL / SIDEBAR */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-full md:w-72 bg-slate-950 text-slate-200 shrink-0 border-r border-slate-800 flex flex-col justify-between`}
      >
        <div className="p-6">
          {/* Logo / Brand */}
          <div className="hidden md:flex items-center gap-2.5 font-bold text-xl text-white tracking-tight pb-6 border-b border-slate-800/80">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <span className="block leading-none">QorelySofts</span>
              <span className="text-[11px] font-medium text-slate-400 tracking-normal">Developer Hub</span>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
              {user.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-400">Signed in as</p>
              <p className="text-sm font-semibold text-white truncate" title={user.email}>
                {user.email}
              </p>
              <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Member
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="mt-8 space-y-1.5">
            <button
              onClick={() => {
                setActiveTab('products');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'products'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="h-4 w-4" />
                <span>All Products</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800/90 font-bold text-slate-300">
                {products.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('downloads');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'downloads'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Download className="h-4 w-4" />
                <span>My Downloads</span>
              </div>
              {orders.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 font-bold text-emerald-300">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('orders');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4" />
                <span>Payment History</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">{orders.length}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('account');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'account'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Account Details</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('support');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'support'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Support &amp; FAQ</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer & Quick Stats */}
        <div className="p-6 border-t border-slate-800/80 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex justify-between items-center">
              <span>Purchased Tools:</span>
              <span className="font-semibold text-white">{orders.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Investment:</span>
              <span className="font-semibold text-emerald-400">₹{totalSpentInr.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-red-950/40 border border-slate-800 hover:border-red-800/50 transition-all"
          >
            <LogOut className="h-4 w-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* MAIN CONTENT AREA */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
        {/* Global Download Error Banner */}
        {downloadError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{downloadError}</span>
            <button onClick={() => setDownloadError(null)} className="text-red-500 hover:text-red-700 font-bold text-xs">
              ✕
            </button>
          </div>
        )}

        {/* ──── TAB 1: ALL PRODUCTS ────────────────────────────────────────── */}
        {activeTab === 'products' && (
          <div>
            {/* Header with Search and Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Developer Store &amp; Products
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Browse {products.length} production-grade SaaS templates, automation scrapers, and developer tools.
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Products' },
                { id: 'owned', label: `My Purchases (${orders.length})` },
                { id: 'scrapers', label: 'Scrapers & Automation' },
                { id: 'backend', label: 'Backend & Auth' },
                { id: 'ui', label: 'UI Kits & Components' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const purchasedOrder = purchasedMap.get(product.id);
                const isPurchased = Boolean(purchasedOrder);

                return (
                  <div
                    key={product.id}
                    className={`flex flex-col rounded-2xl bg-white border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md ${
                      isPurchased ? 'border-emerald-300 ring-1 ring-emerald-400/30' : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                      {product.thumbnail_url ? (
                        <Image
                          src={product.thumbnail_url}
                          alt={product.title}
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <Package className="h-10 w-10" />
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        {isPurchased ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Purchased &amp; Owned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
                            <Zap className="h-3 w-3 text-amber-400" /> Instant Access
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base text-slate-900 line-clamp-1" title={product.title}>
                          {product.title}
                        </h3>
                        <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Action Footer */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-base font-extrabold text-slate-900">
                            ₹{product.price_inr.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-slate-400 block">one-time payment</span>
                        </div>

                        {isPurchased && purchasedOrder ? (
                          <button
                            onClick={() => handleDownload(purchasedOrder.id)}
                            disabled={downloadingOrderId === purchasedOrder.id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-600/30 disabled:opacity-50"
                          >
                            {downloadingOrderId === purchasedOrder.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>Preparing...</span>
                              </>
                            ) : (
                              <>
                                <Download className="h-3.5 w-3.5" />
                                <span>Download ZIP</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <Link
                            href={`/products/${product.slug}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/30"
                          >
                            <span>Get Now</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="mt-12 text-center py-16 bg-white rounded-2xl border border-slate-200">
                <Search className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-base font-bold text-slate-900">No matching products found</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try adjusting your search query or switching category filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* ──── TAB 2: MY DOWNLOADS ────────────────────────────────────────── */}
        {activeTab === 'downloads' && (
          <div>
            <div className="pb-6 border-b border-slate-200">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Downloads
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Instant access to re-download all your purchased digital tools, software packages, and bundles.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                  <Download className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">No active downloads yet</h2>
                <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
                  You have not purchased any products under <strong className="text-slate-700">{user.email}</strong> yet. Explore our store to get started!
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Browse All Products</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {orders.map((order) => {
                  const product = order.products;
                  const isDownloading = downloadingOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-5 hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative h-14 w-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {product?.thumbnail_url ? (
                            <Image
                              src={product.thumbnail_url}
                              alt={product.title || 'Product'}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-slate-400">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-base text-slate-900">
                            {product?.title || 'Purchased Package'}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>Purchased: {new Date(order.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-mono">Order: {order.razorpay_order_id.slice(-8)}</span>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">₹{product?.price_inr} Paid</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3">
                        <button
                          onClick={() => handleDownload(order.id)}
                          disabled={isDownloading}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Generating Link...</span>
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4" />
                              <span>Download ZIP</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Helpful instructions */}
                <div className="mt-8 p-6 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-slate-600 leading-relaxed">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600" /> Download Guidelines
                  </h4>
                  <p>
                    All files are packaged as clean <code>.zip</code> archives containing full source code, configurations, and a step-by-step <code>README.md</code>.
                    Download links generated here are cryptographically signed and active for 30 minutes. You can re-generate new links anytime from this dashboard.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──── TAB 3: PAYMENT HISTORY ─────────────────────────────────────── */}
        {activeTab === 'orders' && (
          <div>
            <div className="pb-6 border-b border-slate-200">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Payment History &amp; Receipts
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Complete record of all processed transactions and Razorpay payment identifiers.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <CreditCard className="mx-auto h-12 w-12 text-slate-300" />
                <h2 className="mt-4 text-lg font-bold text-slate-900">No payment history found</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Transactions completed with {user.email} will appear here with downloadable receipts.
                </p>
              </div>
            ) : (
              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Payment Ref</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {order.products?.title || 'Digital Product'}
                          </td>
                          <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                            ₹{order.products?.price_inr}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                              PAID ✓
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                            {order.razorpay_payment_id || order.razorpay_order_id}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDownload(order.id)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ──── TAB 4: ACCOUNT DETAILS ──────────────────────────────────────── */}
        {activeTab === 'account' && (
          <div>
            <div className="pb-6 border-b border-slate-200">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Account Details
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Your authenticated credentials and security overview.
              </p>
            </div>

            <div className="mt-8 max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-2xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{user.email}</h3>
                  <p className="text-xs text-slate-500">Member ID: {user.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Account Status</span>
                  <div className="mt-1 font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Active &amp; Verified
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Joined</span>
                  <div className="mt-1 font-bold text-sm text-slate-900">
                    {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <Link
                  href="/"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Return to Storefront
                </Link>

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ──── TAB 5: SUPPORT & FAQ ────────────────────────────────────────── */}
        {activeTab === 'support' && (
          <div>
            <div className="pb-6 border-b border-slate-200">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Support &amp; Documentation
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Need technical assistance or have inquiries regarding your purchases?
              </p>
            </div>

            <div className="mt-8 max-w-3xl space-y-6">
              {/* Direct Support Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-lg shadow-slate-950/20">
                <h3 className="text-xl font-bold">Direct Customer Support</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-xl">
                  Our development team is on standby to assist with unzipping files, configuring environment variables, or resolving transaction issues.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <a
                    href="mailto:qorelysoftzenovee@gmail.com"
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email Support: qorelysoftzenovee@gmail.com</span>
                  </a>
                </div>
              </div>

              {/* FAQs */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900">Frequently Asked Questions</h3>

                <div className="space-y-4 text-sm">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h4 className="font-semibold text-slate-900">How long do my download links stay active?</h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Download links generated from this dashboard remain active for 30 minutes for security. You can return to this dashboard anytime to generate a fresh link with zero limits.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h4 className="font-semibold text-slate-900">Can I use purchased tools in commercial client projects?</h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Yes! Every digital product in our store includes a commercial developer license allowing unlimited client and personal deployments.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <h4 className="font-semibold text-slate-900">What if I need an updated version of a package?</h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Whenever we patch or upgrade a package, the updated zip file replaces the package in storage. Re-downloading from this dashboard gives you the latest release.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
