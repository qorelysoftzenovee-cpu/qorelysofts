'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, Download, ShieldCheck, LayoutGrid } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export function AuthNav() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Check active session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="h-8 w-20 animate-pulse rounded-md bg-gray-100" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>

        <Link
          href="/dashboard?tab=downloads"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-brand-600 transition-colors py-1"
        >
          <Download className="h-3.5 w-3.5 text-brand-600" />
          <span>Downloads</span>
        </Link>

        {/* Admin link if user email matches admin */}
        <Link
          href="/admin"
          className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          title="Merchant Admin Portal"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-gray-600" />
          <span className="hidden md:inline">Admin</span>
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors py-1 px-1.5 rounded hover:bg-gray-50"
          title={`Sign out (${user.email})`}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-2 py-1"
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="hidden sm:inline-flex items-center justify-center rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
      >
        Sign Up
      </Link>
    </div>
  );
}
