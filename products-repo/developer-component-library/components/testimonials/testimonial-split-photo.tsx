import React from 'react';

export function TestimonialSplitPhoto() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-5xl grid items-center gap-8 md:grid-cols-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-12">
        <div className="aspect-square overflow-hidden rounded-2xl bg-slate-800">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
            alt="Customer portrait"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-lg font-medium leading-relaxed italic text-slate-200">
            &ldquo;We replaced our entire frontend design workflow with these components. The code is modular, robust, and effortlessly customizable.&rdquo;
          </p>
          <div className="mt-6">
            <h4 className="font-bold text-base text-white">Maya Lin</h4>
            <p className="text-xs text-slate-400">Co-Founder, Horizon Studio</p>
          </div>
        </div>
      </div>
    </section>
  );
}
