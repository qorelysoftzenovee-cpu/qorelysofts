import React from 'react';
import { ArrowRight } from 'lucide-react';

export function FooterWithCtaBanner() {
  return (
    <div className="bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 pt-16">
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 sm:p-12 text-center">
          <h3 className="text-2xl sm:text-3xl font-extrabold">Ready to ship your next application?</h3>
          <p className="mt-2 text-xs sm:text-sm text-blue-100">Get all 25 components with royalty-free license.</p>
          <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-bold text-blue-700 shadow-lg hover:bg-slate-100">
            Download Now <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <footer className="mt-16 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} DevComponents. Built for developers.
      </footer>
    </div>
  );
}
