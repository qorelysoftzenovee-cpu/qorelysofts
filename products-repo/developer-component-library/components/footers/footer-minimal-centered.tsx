import React from 'react';

export function FooterMinimalCentered() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-12 text-center text-xs text-slate-500">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex justify-center gap-6 text-slate-400 font-medium">
          <a href="#" className="hover:text-white">Docs</a>
          <a href="#" className="hover:text-white">Components</a>
          <a href="#" className="hover:text-white">Pricing</a>
          <a href="#" className="hover:text-white">Support</a>
        </div>
        <p>&copy; {new Date().getFullYear()} DevComponents UI. Clean React + Tailwind Assets.</p>
      </div>
    </footer>
  );
}
