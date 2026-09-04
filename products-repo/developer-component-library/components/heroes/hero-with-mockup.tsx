import React from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function HeroWithMockup() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white sm:py-32">
      <div className="mx-auto max-w-5xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
          Supercharge Your Dev Team&apos;s Velocity
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm sm:text-base text-slate-300">
          Clean components with built-in accessibility, responsive layouts, and zero heavy dependencies.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-500">
            Explore All 25 Components
          </button>
        </div>

        {/* Perspective Mockup */}
        <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-2xl">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-950">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
              alt="Application view"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
