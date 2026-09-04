import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Package, ShieldCheck, Zap, Download } from 'lucide-react';
import { CheckoutForm } from './checkout-form';
import type { Product } from '@/types';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createAdminClient();
  const { data: product } = await supabase
    .from('products')
    .select('title, description')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (error || !product) {
    notFound();
  }

  const p = product as Product;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Left: Product Image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-gray-100">
          {p.thumbnail_url ? (
            <Image
              src={p.thumbnail_url}
              alt={p.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <Package className="h-20 w-20" />
            </div>
          )}
        </div>

        {/* Right: Product Details + Checkout */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{p.title}</h1>

          <div className="mt-4 text-3xl font-bold text-brand-600">
            ₹{p.price_inr.toLocaleString('en-IN')}
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed whitespace-pre-line">
            {p.description}
          </p>

          {/* Features */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-brand-500" />
              Instant digital delivery
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Download className="h-4 w-4 text-brand-500" />
              Secure download link (valid for 30 minutes)
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <ShieldCheck className="h-4 w-4 text-brand-500" />
              Safe &amp; secure payment via Razorpay
            </div>
          </div>

          {/* Checkout Form */}
          <div className="mt-8">
            <CheckoutForm productId={p.id} price={p.price_inr} productTitle={p.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
