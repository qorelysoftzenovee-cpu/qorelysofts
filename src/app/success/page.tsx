import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Download, Clock, AlertTriangle, ShieldCheck, ArrowRight, Package, FileCode } from 'lucide-react';
import type { OrderWithProduct } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed - Download Your Digital Product | QorelySofts',
  description: 'Your purchase has been verified. Download your digital product and source code package immediately.',
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: { token?: string };
}

export default async function SuccessPage({ searchParams }: Props) {
  const { token } = searchParams;

  if (!token) {
    redirect('/');
  }

  const supabase = createAdminClient();

  // Look up order by download token
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, products(*)')
    .eq('download_token', token)
    .eq('status', 'paid')
    .single();

  if (error || !order || !order.products) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Order Verification Pending</h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          We couldn&apos;t locate a completed order for this link, or the download token has expired.
          If your payment was deducted, please check your email or contact support with your payment receipt.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/contact"
            className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Contact Support
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  const o = order as OrderWithProduct;

  // Generate a 30-minute signed URL for the digital file with download trigger
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from('digital-assets')
    .createSignedUrl(o.products.file_path, 30 * 60, { download: true });

  if (urlError || !signedUrlData) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Download Link Generation Failed</h1>
        <p className="mt-3 text-sm text-slate-600">
          We couldn&apos;t generate your secure download link at this moment. Please email our support at{' '}
          <strong className="text-slate-900">qorelysoftzenovee@gmail.com</strong> with Order ID #{o.razorpay_order_id.slice(-8)}.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {/* Top Banner */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-sm">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" /> Payment Verified
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Thank You for Your Order!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your digital product is ready for instant download below.
        </p>
      </div>

      {/* Main Delivery Card */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
        <div className="border-b border-slate-100 bg-slate-50/70 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <FileCode className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600">
                Digital Product Delivery
              </span>
              <h2 className="text-lg font-bold text-slate-900">{o.products.title}</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                ZIP Archive • Full Source Code • Setup Instructions &amp; Commercial License Included
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <dl className="grid grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-slate-500">Order Reference</dt>
              <dd className="mt-1 font-mono font-bold text-slate-900">
                #{o.razorpay_order_id.slice(-10)}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-slate-500">Amount Paid</dt>
              <dd className="mt-1 font-bold text-emerald-600">
                ₹{o.products.price_inr.toLocaleString('en-IN')}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 col-span-2">
              <dt className="text-slate-500">Delivered To</dt>
              <dd className="mt-1 font-medium text-slate-900">{o.customer_email}</dd>
            </div>
          </dl>

          {/* Primary Download Action */}
          <div className="mt-6">
            <a
              href={signedUrlData.signedUrl}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition-all duration-300 hover:bg-emerald-500 hover:shadow-xl hover:shadow-emerald-500/40"
            >
              <Download className="h-4 w-4" />
              Download Package (.ZIP)
            </a>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Signed link active for 30 minutes. You can re-generate anytime from your account.</span>
            </div>
          </div>
        </div>

        {/* Re-download & Account info footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-5 text-center text-xs text-slate-500">
          <p>
            Need to access this file in the future? Log in with{' '}
            <strong className="text-slate-800">{o.customer_email}</strong> under{' '}
            <Link href="/my-orders" className="font-semibold text-brand-600 hover:underline">
              My Orders &amp; Downloads
            </Link>{' '}
            anytime.
          </p>
        </div>
      </div>

      {/* Additional navigation */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-brand-600 transition-colors"
        >
          <Package className="h-4 w-4" /> Browse More Products
        </Link>
        <Link
          href="/contact"
          className="text-xs text-slate-500 hover:text-slate-800"
        >
          Questions about this order? Contact Support <ArrowRight className="inline h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
