import React from 'react';

export function FeatureCardHoverEffects() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-3">
        {['Figma to Code', 'High Conversion', 'Dark Mode Default'].map((title, i) => (
          <div
            key={title}
            className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10"
          >
            <div className="text-4xl font-black text-slate-800 group-hover:text-blue-500/30 transition-colors">0{i + 1}</div>
            <h3 className="mt-4 text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{title}</h3>
            <p className="mt-2 text-xs text-slate-400">Interactive micro-interactions designed to elevate user engagement.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
