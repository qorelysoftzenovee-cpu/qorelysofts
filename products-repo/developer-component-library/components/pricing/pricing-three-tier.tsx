import React from 'react';
import { Check } from 'lucide-react';

export function PricingThreeTier() {
  const tiers = [
    { name: 'Starter', price: '₹499', desc: 'For single projects and indie makers.', features: ['5 Projects', 'Community Support', 'Basic Analytics', '1 GB Storage'] },
    { name: 'Pro Builder', price: '₹1,499', desc: 'Our most popular plan for professionals.', features: ['Unlimited Projects', 'Priority Support', 'Full Analytics Suite', '25 GB Storage', 'Custom Domains'], popular: true },
    { name: 'Enterprise', price: '₹3,999', desc: 'For scale-ups and established dev agencies.', features: ['Unlimited Everything', 'Dedicated Engineer', '99.9% SLA', 'Custom Billing', 'SSO & Audit Logs'] }
  ];

  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-2 text-sm text-slate-400">Pick the plan that suits your application.</p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {tiers.map((t) => (
            <div key={t.name} className={`relative flex flex-col justify-between rounded-2xl border p-8 ${t.popular ? 'border-blue-500 bg-slate-900 shadow-2xl' : 'border-slate-800 bg-slate-900/50'}`}>
              {t.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-bold">Most Popular</span>}
              <div>
                <h3 className="text-lg font-bold">{t.name}</h3>
                <p className="mt-1 text-xs text-slate-400">{t.desc}</p>
                <p className="mt-6 text-4xl font-black">{t.price}<span className="text-xs text-slate-400 font-normal"> / month</span></p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-blue-400" /> {f}</li>
                  ))}
                </ul>
              </div>
              <button className={`mt-8 w-full rounded-xl py-3 text-xs font-bold transition-colors ${t.popular ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'border border-slate-700 bg-slate-800 hover:bg-slate-700'}`}>
                Choose {t.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
