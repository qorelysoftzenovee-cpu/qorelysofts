import React from 'react';

export function FeatureComparisonMatrix() {
  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Building from Scratch vs. Component Vault</h2>
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5 space-y-2">
            <h4 className="font-bold text-red-400">Building From Scratch</h4>
            <p className="text-slate-400">• 40+ hours writing CSS</p>
            <p className="text-slate-400">• Inconsistent spacing &amp; tokens</p>
            <p className="text-slate-400">• Mobile responsiveness bugs</p>
          </div>
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 space-y-2">
            <h4 className="font-bold text-emerald-400">With This Component Pack</h4>
            <p className="text-slate-300">• 1-click copy into project</p>
            <p className="text-slate-300">• Cohesive modern design system</p>
            <p className="text-slate-300">• Tested across all screen sizes</p>
          </div>
        </div>
      </div>
    </section>
  );
}
