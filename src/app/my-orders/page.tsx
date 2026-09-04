import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Package, ShoppingBag, ArrowRight } from 'lucide-react';
import { DownloadButton } from './download-button';
import type { OrderWithProduct } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Orders & Downloads | QorelySofts',
  description: 'Access and re-download your purchased digital software, tools, and assets.',
};

export const dynamic = 'force-dynamic';

export default async function MyOrdersPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect('/login?redirect=/my-orders');
  }

  const supabaseAdmin = createAdminClient();

  // Fetch orders purchased by this user's email
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('*, products(*)')
    .eq('customer_email', user.email)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user orders:', error);
  }

  const userOrders = (orders as OrderWithProduct[]) || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            My Downloads &amp; Purchases
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Logged in as <span className="font-semibold text-gray-900">{user.email}</span>
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          Explore More Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Orders List */}
      <div className="mt-8">
        {userOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No purchases found for this account
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
              If you used a different email address during checkout, purchases will be linked to that specific email.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
              >
                Browse Store Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {userOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-gray-300"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-brand-50 p-3 text-brand-600 shrink-0">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">
                      {order.products?.title || 'Digital Product'}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                      <span>Order #{order.razorpay_order_id.slice(-8)}</span>
                      <span>•</span>
                      <span>
                        Purchased on {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span>•</span>
                      <span className="font-medium text-gray-900">
                        ₹{order.products?.price_inr?.toLocaleString('en-IN') || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 flex sm:justify-end">
                  <DownloadButton
                    orderId={order.id}
                    productTitle={order.products?.title || 'Digital Product'}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
