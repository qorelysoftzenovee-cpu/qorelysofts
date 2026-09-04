import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroGradientHeadline() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 py-28 text-white sm:py-36">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
          Designed for builders.{' '}
          <span className="block mt-2 bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Engineered to Convert.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-slate-300">
          Stop writing boilerplates. Drop these pre-built React components straight into your Next.js application.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:opacity-90">
            Get Instant Access <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
