import React from 'react';
import { ArrowRight, Play, Star, ShieldCheck } from 'lucide-react';

export function HeroSplitImage() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-6xl grid items-center gap-12 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
            ))}
            <span className="ml-2 text-slate-300">Rated 4.9/5 by 1,200+ engineers</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Transform Your Customer Workflow{' '}
            <span className="text-blue-500">Effortlessly.</span>
          </h1>

          <p className="mt-6 text-base text-slate-300 leading-relaxed">
            Automate data pipelines, streamline team handoffs, and deliver real-time insights with intuitive modular design.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-blue-500 transition-colors">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-colors">
              <Play className="h-3.5 w-3.5 fill-current" /> Watch Video
            </button>
          </div>

          <div className="mt-10 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>SOC2 Type II Certified &amp; GDPR Compliant</span>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80"
              alt="Dashboard visualization"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
