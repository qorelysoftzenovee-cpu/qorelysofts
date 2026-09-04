import React from 'react';
import { ArrowRight } from 'lucide-react';

export function FeatureAlternatingRows() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white space-y-16">
      <div className="mx-auto max-w-6xl grid items-center gap-10 md:grid-cols-2">
        <div>
          <span className="text-xs font-bold text-blue-400">01. SPEED</span>
          <h3 className="text-2xl font-bold mt-2">Instant Setup in Seconds</h3>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Copy the raw component JSX directly into your React project. Everything works with stock Tailwind CSS utility classes.
          </p>
        </div>
        <div className="aspect-video rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80" alt="Code preview" className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="mx-auto max-w-6xl grid items-center gap-10 md:grid-cols-2">
        <div className="order-2 md:order-1 aspect-video rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Analytics view" className="h-full w-full object-cover" />
        </div>
        <div className="order-1 md:order-2">
          <span className="text-xs font-bold text-emerald-400">02. PERFORMANCE</span>
          <h3 className="text-2xl font-bold mt-2">Zero Bundle Overhead</h3>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            No massive UI framework packages bloating your client bundle. Just pure semantic HTML and Tailwind.
          </p>
        </div>
      </div>
    </section>
  );
}
