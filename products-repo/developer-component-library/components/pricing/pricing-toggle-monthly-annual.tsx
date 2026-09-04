import React, { useState } from 'react';
import { Check } from 'lucide-react';

export function PricingToggleMonthlyAnnual() {
  const [annual, setAnnual] = useState(true);

  return (
    <section className="bg-slate-950 px-6 py-20 text-white text-center">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Predictable Pricing for High-Growth Apps</h2>
        <p className="mt-2 text-sm text-slate-400">Switch between monthly and annual billing.</p>
        
        {/* Toggle */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900 p-1.5 text-xs font-semibold">
          <button onClick={() => setAnnual(false)} className={`rounded-full px-4 py-1.5 ${!annual ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Monthly</button>
          <button onClick={() => setAnnual(true)} className={`rounded-full px-4 py-1.5 flex items-center gap-1.5 ${annual ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>
            Annual <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400">Save 20%</span>
          </button>
        </div>

        <div className="mt-12 mx-auto max-w-md rounded-2xl border border-blue-500 bg-slate-900 p-8 shadow-2xl">
          <h3 className="text-lg font-bold">Full Access Pass</h3>
          <p className="mt-4 text-5xl font-black">{annual ? '₹999' : '₹1,299'}<span className="text-xs text-slate-400 font-normal"> / month</span></p>
          <ul className="mt-6 space-y-3 text-left text-xs text-slate-300">
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-400" /> Complete 25 Component Vault</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-400" /> Unlimited Commercial Projects</li>
            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-400" /> Lifetime Updates Included</li>
          </ul>
          <button className="mt-8 w-full rounded-xl bg-blue-600 py-3 text-sm font-bold hover:bg-blue-500">Get Started</button>
        </div>
      </div>
    </section>
  );
}
