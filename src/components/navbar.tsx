import Link from 'next/link';
import { Store, ShieldCheck } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-brand-600 transition-colors">
          <Store className="h-5 w-5" />
          Digital Store
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Products
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
