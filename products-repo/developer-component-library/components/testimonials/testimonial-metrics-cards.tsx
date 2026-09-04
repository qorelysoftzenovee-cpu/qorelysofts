import React from 'react';

export function TestimonialMetricsCards() {
  const stats = [
    { metric: '340%', label: 'Revenue Growth', quote: 'Our new landing page converted visitors 3x better.' },
    { metric: '15 hrs', label: 'Saved per Sprint', quote: 'Design-to-code handoffs are completely seamless.' },
    { metric: '99.9%', label: 'Lighthouse Score', quote: 'Zero bloat means perfect performance scores on mobile.' }
  ];

  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <p className="text-4xl font-black text-blue-400">{s.metric}</p>
            <p className="text-xs font-bold text-white mt-1">{s.label}</p>
            <p className="mt-3 text-xs text-slate-400">&ldquo;{s.quote}&rdquo;</p>
          </div>
        ))}
      </div>
    </section>
  );
}
