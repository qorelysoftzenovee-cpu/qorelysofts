import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';

export function PricingSingleFocus() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8 sm:p-12 shadow-2xl">
        <div className="text-center">
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">Lifetime License</span>
          <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">One Payment. Own Forever.</h2>
          <p className="mt-2 text-sm text-slate-400">Zero subscriptions. All source files included.</p>
          <p className="mt-6 text-5xl font-black">₹1,999</p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 text-xs text-slate-300">
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 25 React Tailwind Components</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Complete Interactive Preview</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> Commercial Royalty-Free Rights</div>
          <div className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" /> 1-Click Code Copy</div>
        </div>
        <button className="mt-8 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold hover:bg-blue-500 shadow-lg">Purchase Instant Download</button>
        <p className="mt-3 text-center text-xs text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 30-Day Money-Back Guarantee
        </p>
      </div>
    </section>
  );
}
