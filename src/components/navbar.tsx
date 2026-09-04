import Link from 'next/link';
import { Store } from 'lucide-react';
import { AuthNav } from '@/components/auth-nav';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-brand-600 transition-colors"
        >
          <Store className="h-5 w-5 text-brand-600" />
          <span>QorelySofts</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden sm:flex items-center gap-4 sm:gap-5">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </nav>

          <div className="h-4 w-px bg-gray-200 hidden sm:block" />

          {/* User Auth state & actions */}
          <AuthNav />
        </div>
      </div>
    </header>
  );
}
