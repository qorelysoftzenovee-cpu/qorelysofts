import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export function PricingEnterpriseCards() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <h3 className="text-xl font-bold">Standard Cloud</h3>
          <p className="mt-1 text-xs text-slate-400">For indie startups and fast-moving teams.</p>
          <p className="mt-6 text-4xl font-extrabold">₹1,499<span className="text-xs text-slate-400"> / mo</span></p>
          <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-400" /> Hosted Infrastructure</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-400" /> Automated Daily Backups</li>
          </ul>
          <button className="mt-8 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold hover:bg-slate-700">Choose Cloud</button>
        </div>

        <div className="rounded-2xl border border-blue-500 bg-slate-900 p-8 shadow-2xl">
          <h3 className="text-xl font-bold">Self-Hosted Enterprise</h3>
          <p className="mt-1 text-xs text-slate-400">Deploy on your own private cloud or VPC.</p>
          <p className="mt-6 text-4xl font-extrabold">Custom</p>
          <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Complete Docker/Helm manifests</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Custom Security Audits</li>
          </ul>
          <button className="mt-8 w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold hover:bg-blue-500 flex items-center justify-center gap-1.5">
            Talk to Enterprise <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
