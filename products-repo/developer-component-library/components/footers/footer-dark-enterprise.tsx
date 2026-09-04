import React from 'react';

export function FooterDarkEnterprise() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-12 text-xs text-slate-400">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-300">All systems operational (99.98%)</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white">Security</a>
          <a href="#" className="hover:text-white">SOC 2 Report</a>
          <a href="#" className="hover:text-white">Status</a>
        </div>
      </div>
    </footer>
  );
}
