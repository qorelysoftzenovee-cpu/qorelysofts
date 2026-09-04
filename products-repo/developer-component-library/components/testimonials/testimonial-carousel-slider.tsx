import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export function TestimonialCarouselSlider() {
  const reviews = [
    { quote: 'These components saved our engineering team 3 weeks of work on our latest client redesign.', author: 'Karan Sharma', role: 'CTO, DevScale' },
    { quote: 'The accessibility and responsiveness out of the box are top tier. 10/10 recommendation.', author: 'Sophie Laurent', role: 'Lead Frontend, OrbitApp' },
    { quote: 'Zero bloat, clean Tailwind classes, and instant integration. Exactly what modern devs need.', author: 'Amit Verma', role: 'Founder, QuickShip' }
  ];
  const [curr, setCurr] = useState(0);

  return (
    <section className="bg-slate-950 px-6 py-20 text-white text-center">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-8 sm:p-12">
        <div className="flex justify-center gap-1 text-amber-400 mb-6">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />}
        </div>
        <p className="text-lg sm:text-xl font-medium leading-relaxed italic text-slate-200">
          &ldquo;{reviews[curr].quote}&rdquo;
        </p>
        <h4 className="mt-6 font-bold text-white text-base">{reviews[curr].author}</h4>
        <p className="text-xs text-slate-400">{reviews[curr].role}</p>
        <div className="mt-8 flex justify-center gap-3">
          <button onClick={() => setCurr((c) => (c === 0 ? reviews.length - 1 : c - 1))} className="rounded-full border border-slate-700 p-2 hover:bg-slate-800"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setCurr((c) => (c === reviews.length - 1 ? 0 : c + 1))} className="rounded-full border border-slate-700 p-2 hover:bg-slate-800"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </section>
  );
}
