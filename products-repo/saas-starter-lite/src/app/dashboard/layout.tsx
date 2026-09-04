import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import {
  LayoutDashboard,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Zap,
  Bell,
  Search,
  ChevronRight,
} from 'lucide-react';
import { SignOutButton } from './sign-out-button';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  const userEmail = user.email || 'user@example.com';
  const userName = user.user_metadata?.full_name || userEmail.split('@')[0];
  const initials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 selection:bg-brand-600">
      {/* ──── SIDEBAR ────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-950 p-5">
        <div>
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-3 text-lg font-black text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-md shadow-brand-600/30">
              <Zap className="h-4 w-4" />
            </div>
            <span>SaaS<span className="text-brand-500">Lite</span></span>
          </Link>

          {/* Nav items */}
          <nav className="mt-8 space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl bg-slate-800/80 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm"
            >
              <LayoutDashboard className="h-4 w-4 text-brand-400" />
              <span>Overview</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
            >
              <BarChart2 className="h-4 w-4" />
              <span>Analytics</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Customers</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>

        {/* User Card in Sidebar */}
        <div className="border-t border-slate-800/80 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-xs text-white">
                {initials}
              </div>
              <div className="overflow-hidden">
                <p className="truncate text-xs font-bold text-white">{userName}</p>
                <p className="truncate text-[11px] text-slate-500">{userEmail}</p>
              </div>
            </div>
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* ──── MAIN CONTENT AREA ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/60 px-6 backdrop-blur-md">
          {/* Breadcrumb / Search */}
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search metrics, users..."
                className="rounded-xl border border-slate-800 bg-slate-900 px-8 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-4">
            <button className="relative rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {initials}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-slate-200">
                {userName}
              </span>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-900/90">
          {children}
        </main>
      </div>
    </div>
  );
}
