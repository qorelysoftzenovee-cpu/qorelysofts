import React from 'react';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export function HeroSimpleCentered() {
  return (
    <section className="relative overflow-hidden bg-slate-950 px-6 py-24 text-center text-white sm:py-32">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[450px] w-[600px] rounded-full bg-blue-600/20 blur-[130px]" />

      <div className="relative mx-auto max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" /> Next-Gen Development Platform
        </div>

        <h1 className="mt-8 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
          Build Smarter Applications{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Without the Friction.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg leading-relaxed">
          The all-in-one component architecture engineered for speed, conversion, and effortless maintainability.
          Ship production apps in minutes instead of months.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/40">
            Get Started Free <ArrowRight className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            Book Live Demo
          </button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Free 14-day trial</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No credit card required</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}
