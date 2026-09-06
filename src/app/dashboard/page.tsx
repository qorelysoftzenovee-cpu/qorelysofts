import { Suspense } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { DashboardView } from './dashboard-view';
import type { Product, OrderWithProduct } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Dashboard | QorelySofts',
  description: 'Browse all developer products, manage downloads, and access transaction history.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect('/login?redirect=/dashboard');
  }

  const supabaseAdmin = createAdminClient();

  // Fetch all published products
  const { data: productsData, error: productsError } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (productsError) {
    console.error('Dashboard products error:', productsError);
  }

  // Fetch user's paid purchases
  const { data: ordersData, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('*, products(*)')
    .eq('customer_email', user.email)
    .eq('status', 'paid')
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Dashboard orders error:', ordersError);
  }

  const products = (productsData as Product[]) || [];
  const orders = (ordersData as OrderWithProduct[]) || [];

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">Loading dashboard...</div>}>
      <DashboardView user={user} products={products} orders={orders} />
    </Suspense>
  );
}
