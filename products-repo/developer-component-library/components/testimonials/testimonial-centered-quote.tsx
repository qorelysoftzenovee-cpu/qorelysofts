import React from 'react';

export function TestimonialCenteredQuote() {
  return (
    <section className="bg-slate-950 px-6 py-24 text-white text-center">
      <div className="mx-auto max-w-4xl">
        <blockquote className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-100 leading-relaxed">
          &ldquo;This library transformed how fast our engineers can ship client web apps. The quality is unmistakably world-class.&rdquo;
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">NL</div>
          <div className="text-left">
            <p className="font-bold text-sm">Nathan Lewis</p>
            <p className="text-xs text-slate-400">Head of Product at Nexus Software</p>
          </div>
        </div>
      </div>
    </section>
  );
}
