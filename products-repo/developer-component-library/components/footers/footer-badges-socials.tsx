import React from 'react';
import { Github, Star } from 'lucide-react';

export function FooterBadgesSocials() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-10 text-xs text-slate-400">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono">React 18 • Next.js 14 • Tailwind CSS 3.4</p>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-slate-300">
            <Github className="h-3.5 w-3.5" />
            <span className="font-semibold">Star on GitHub</span>
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          </div>
        </div>
      </div>
    </footer>
  );
}
