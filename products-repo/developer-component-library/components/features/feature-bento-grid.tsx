import React from 'react';
import { Zap, Shield, Sparkles, Terminal } from 'lucide-react';

export function FeatureBentoGrid() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-extrabold text-center mb-12">Engineered for Rapid Development</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
            <Zap className="h-6 w-6 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold">Lightning Fast Micro-Transitions</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Every button, accordion, and carousel includes GPU-accelerated Tailwind transitions for silky smooth 60fps animations.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
            <Shield className="h-6 w-6 text-emerald-400 mb-4" />
            <h3 className="text-lg font-bold">Full Accessibility</h3>
            <p className="mt-2 text-xs text-slate-400">ARIA tags and keyboard navigation pre-configured.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
            <Sparkles className="h-6 w-6 text-purple-400 mb-4" />
            <h3 className="text-lg font-bold">Copy-Paste Simplicity</h3>
            <p className="mt-2 text-xs text-slate-400">Zero external npm dependencies except lucide-react.</p>
          </div>
          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-8">
            <Terminal className="h-6 w-6 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold">100% Strict TypeScript</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Full prop type safety so your IDE provides autocomplete out of the box.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
