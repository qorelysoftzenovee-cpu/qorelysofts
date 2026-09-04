import React from 'react';
import { Star } from 'lucide-react';

export function TestimonialGridWall() {
  const items = [
    { text: 'Unmatched speed. We copy-pasted the hero and pricing cards and had our landing page live in 20 minutes.', name: 'Rohan Gupta', company: 'Inflow AI' },
    { text: 'Tailwind transitions feel buttery smooth on mobile. Our conversion rate increased by 28%.', name: 'Emily Vance', company: 'Starlight SaaS' },
    { text: 'Best component pack I have purchased this year. Completely clean TypeScript code.', name: 'Devon Miles', company: 'CloudBase' }
  ];

  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.name} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">&ldquo;{it.text}&rdquo;</p>
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="font-bold text-xs text-white">{it.name}</p>
              <p className="text-[11px] text-slate-500">{it.company}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
