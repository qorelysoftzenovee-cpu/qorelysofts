import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Package, Zap } from 'lucide-react';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const usdApprox = (product.price_inr / 83).toFixed(1);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-xl hover:shadow-brand-500/10"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {product.thumbnail_url ? (
          <Image
            src={product.thumbnail_url}
            alt={product.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Package className="h-12 w-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Instant delivery badge */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm backdrop-blur-md">
          <Zap className="h-3 w-3 text-amber-400" /> Instant Access
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-brand-600 line-clamp-1">
          {product.title}
        </h3>
        <p className="mt-2 flex-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <span className="text-lg font-extrabold text-slate-900">
              ₹{product.price_inr.toLocaleString('en-IN')}
            </span>
            <span className="ml-1.5 text-xs font-medium text-slate-400">
              (~${usdApprox} USD)
            </span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-all duration-300 group-hover:bg-brand-600 group-hover:text-white">
            Get Now <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
