import type { Metadata } from 'next';
import Link from 'next/link';
import { Package, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | QorelySofts Digital Store',
  description: 'Learn more about QorelySofts, our mission, and high-quality digital products and software assets.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          About QorelySofts
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Empowering creators, developers, and businesses with curated, production-ready digital products.
        </p>
      </div>

      <div className="mt-12 space-y-8 text-gray-600 leading-relaxed">
        <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Who We Are</h2>
          <p className="mt-4">
            QorelySofts is a specialized digital marketplace dedicated to providing developers, designers, entrepreneurs, and students with premium, production-tested digital assets. From software toolkits, templates, and UI frameworks to educational guides and digital utilities, each product is crafted to save you countless hours of development time.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="rounded-lg bg-blue-50 p-2.5 w-fit text-brand-600 mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Instant Delivery</h3>
            <p className="mt-2 text-sm text-gray-500">
              Zero waiting time. Once your payment is verified via Razorpay, your secure download link is generated immediately.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="rounded-lg bg-green-50 p-2.5 w-fit text-green-600 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Verified Quality</h3>
            <p className="mt-2 text-sm text-gray-500">
              All digital products are reviewed, virus-scanned, and packaged with clear setup documentation.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="rounded-lg bg-purple-50 p-2.5 w-fit text-purple-600 mb-4">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Direct Support</h3>
            <p className="mt-2 text-sm text-gray-500">
              Need assistance with your purchased product? Our support team is available via email to help you get started.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">Explore Our Catalog</h2>
          <p className="mt-2 text-sm text-gray-600">
            Discover our collection of digital software, templates, and developer kits.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
            >
              Browse Products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
