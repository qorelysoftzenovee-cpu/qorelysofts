import { createClient } from '@/lib/supabase/server';
import {
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  UserPlus,
  Download,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Builder';

  const metrics = [
    {
      title: 'Monthly Recurring Revenue (MRR)',
      value: '₹1,24,500',
      delta: '+18.2%',
      positive: true,
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      title: 'Total Active Subscribers',
      value: '1,420',
      delta: '+12.5%',
      positive: true,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      title: 'Checkout Conversion Rate',
      value: '4.85%',
      delta: '+0.6%',
      positive: true,
      icon: Activity,
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      title: 'Monthly Churn Rate',
      value: '1.2%',
      delta: '-0.3%',
      positive: true,
      icon: TrendingUp,
      color: 'bg-amber-500/10 text-amber-400',
    },
  ];

  const recentSignups = [
    { name: 'Alex Rivera', email: 'alex.r@cloudflow.io', plan: 'Pro Builder', amount: '₹799', date: 'Just now' },
    { name: 'Priya Patel', email: 'priya@devlaunch.in', plan: 'Team & Scale', amount: '₹1,999', date: '12m ago' },
    { name: 'Marcus Chen', email: 'marcus@nextech.co', plan: 'Pro Builder', amount: '₹799', date: '1h ago' },
    { name: 'Elena Rostova', email: 'elena@datapulse.ai', plan: 'Starter', amount: '₹0', date: '3h ago' },
    { name: 'David Kim', email: 'david@zenithpay.com', plan: 'Pro Builder', amount: '₹799', date: '5h ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Greeting banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Good to see you, {userName} 👋
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Here is what&apos;s happening with your SaaS metrics today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            <Download className="h-3.5 w-3.5" /> Export Data
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-600/30 hover:bg-brand-500 transition-colors">
            <UserPlus className="h-3.5 w-3.5" /> Invite Team
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.title}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 truncate">{m.title}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{m.value}</span>
              <span
                className={`inline-flex items-center text-xs font-bold ${
                  m.positive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {m.positive ? (
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                )}
                {m.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Activity Table & Quick Setup checklist */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Customers Table */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Recent Customer Signups</h2>
              <p className="text-[11px] text-slate-400">Live feed from Supabase auth &amp; Stripe events</p>
            </div>
            <button className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800/80">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Plan</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentSignups.map((s) => (
                  <tr key={s.email} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5">
                      <p className="font-bold text-white">{s.name}</p>
                      <p className="text-[11px] text-slate-400">{s.email}</p>
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                        {s.plan}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-emerald-400">{s.amount}</td>
                    <td className="py-3.5 text-right text-slate-500 text-[11px]">{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Launch Checklist */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white">Quick Launch Checklist</h2>
          <p className="text-[11px] text-slate-400">Step-by-step tasks to connect production integrations:</p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-400" />
              <div>
                <p className="font-bold text-white">Supabase Auth Connected</p>
                <p className="text-[11px] text-slate-400">Cookie session validation active.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-brand-400" />
              <div>
                <p className="font-bold text-white">Connect Payment Gateway</p>
                <p className="text-[11px] text-slate-400">Add Stripe or Razorpay webhook secrets.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-400" />
              <div>
                <p className="font-bold text-white">Configure Custom Domain</p>
                <p className="text-[11px] text-slate-400">Add CNAME records in Vercel settings.</p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/settings"
            className="block text-center rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            Manage Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
