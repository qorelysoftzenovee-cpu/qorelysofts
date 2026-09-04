import Link from 'next/link';
import { Store, ShieldCheck, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50 text-gray-600">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-brand-600 transition-colors"
            >
              <Store className="h-5 w-5 text-brand-600" />
              QorelySofts
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Curated, production-ready digital products, development kits, and software templates with instant electronic delivery.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              Secured payments via Razorpay
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
              Store
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-gray-900 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gray-900 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-900 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gray-900 transition-colors">
                  Merchant Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Razorpay Compliance */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
              Policies &amp; Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="hover:text-gray-900 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-gray-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-gray-900 transition-colors">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-gray-900 transition-colors">
                  Shipping &amp; Delivery Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Info */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 mb-3">
              Contact Us
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-500">
                Email support for orders, downloads, and general inquiries:
              </p>
              <a
                href="mailto:qorelysoftzenovee@gmail.com"
                className="inline-flex items-center gap-1.5 text-brand-600 font-medium hover:underline break-all"
              >
                <Mail className="h-4 w-4 shrink-0" />
                qorelysoftzenovee@gmail.com
              </a>
              <p className="text-xs text-gray-400 pt-1">
                Hours: Mon – Sat, 9:00 AM – 7:00 PM IST<br />
                Response time: 24–48 hours
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {currentYear} QorelySofts. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/terms" className="hover:text-gray-700">Terms</Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-gray-700">Privacy</Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-gray-700">Refunds</Link>
            <span>•</span>
            <Link href="/shipping-policy" className="hover:text-gray-700">Delivery</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-gray-700">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
