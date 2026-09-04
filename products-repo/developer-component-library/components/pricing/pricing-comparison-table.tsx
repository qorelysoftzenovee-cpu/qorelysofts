import React from 'react';
import { Check, X } from 'lucide-react';

export function PricingComparisonTable() {
  const rows = [
    { feature: 'Next.js 14 App Router', free: true, pro: true, team: true },
    { feature: 'TypeScript Support', free: true, pro: true, team: true },
    { feature: 'Supabase Authentication', free: false, pro: true, team: true },
    { feature: 'Stripe & Razorpay Integration', free: false, pro: true, team: true },
    { feature: 'Role-Based Access Control', free: false, pro: false, team: true },
    { feature: 'Dedicated Support SLA', free: false, pro: false, team: true }
  ];

  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-2xl font-bold mb-6">Detailed Feature Comparison</h2>
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-4 font-semibold">Features</th>
              <th className="pb-4 font-semibold">Free</th>
              <th className="pb-4 font-semibold text-blue-400">Pro (₹1,499)</th>
              <th className="pb-4 font-semibold">Team (₹3,999)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((r) => (
              <tr key={r.feature}>
                <td className="py-3.5 font-medium">{r.feature}</td>
                <td className="py-3.5">{r.free ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-slate-600" />}</td>
                <td className="py-3.5">{r.pro ? <Check className="h-4 w-4 text-blue-400" /> : <X className="h-4 w-4 text-slate-600" />}</td>
                <td className="py-3.5">{r.team ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-slate-600" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
