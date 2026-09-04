import { createAdminClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product-card';
import { Package } from 'lucide-react';
import type { Product } from '@/types';

export const dynamic = 'force-dynamic';

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
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Premium Digital Products
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          High-quality digital assets — instant download after purchase.
        </p>
      </div>

      {/* Product Grid */}
      {items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Package className="h-16 w-16 mb-4" />
          <p className="text-lg font-medium">No products available yet.</p>
          <p className="mt-1 text-sm">Check back soon!</p>
        </div>
      )}
    </div>
  );
}
