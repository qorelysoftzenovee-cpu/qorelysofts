import { createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CheckCircle2, Download, Clock, AlertTriangle } from 'lucide-react';
import type { OrderWithProduct } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Purchase Successful',
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

  if (error || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-amber-500" />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Invalid or Expired Link</h1>
        <p className="mt-3 text-gray-600">
          This download link is invalid, has already been used, or the payment was not completed.
        </p>
      </div>
    );
  }

  const o = order as OrderWithProduct;

  // Generate a 30-minute signed URL for the digital file
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from('digital-assets')
    .createSignedUrl(o.products.file_path, 30 * 60, { download: true });

  if (urlError || !signedUrlData) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Download Error</h1>
        <p className="mt-3 text-gray-600">
          We couldn&apos;t generate your download link. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="mt-3 text-gray-600">
          Thank you for purchasing <span className="font-semibold">{o.products.title}</span>.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-500">Product</dt>
            <dd className="font-medium text-gray-900">{o.products.title}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Amount Paid</dt>
            <dd className="font-medium text-gray-900">₹{o.products.price_inr.toLocaleString('en-IN')}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-500">Email</dt>
            <dd className="font-medium text-gray-900">{o.customer_email}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6">
        <a
          href={signedUrlData.signedUrl}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download Your File
        </a>
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          This link expires in 30 minutes
        </div>
      </div>
    </div>
  );
}
