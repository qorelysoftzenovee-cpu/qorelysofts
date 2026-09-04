import React, { useState } from 'react';
import { Copy, Check, Terminal, ArrowRight } from 'lucide-react';

export function HeroWithCodePreview() {
  const [copied, setCopied] = useState(false);
  const command = 'npx create-rapid-app@latest my-saas';

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-slate-950 px-6 py-20 text-white sm:py-28">
      <div className="mx-auto max-w-6xl grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
            // Developer First Architecture
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            The CLI that launches SaaS projects in 60 seconds.
          </h1>
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            One single terminal command configures authentication, database models, Stripe billing, and TypeScript types automatically.
          </p>

          <div className="mt-8 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 p-2 font-mono text-xs text-slate-200">
            <Terminal className="h-4 w-4 ml-2 text-slate-400" />
            <span className="flex-1 select-all font-semibold text-emerald-400">{command}</span>
            <button
              onClick={handleCopy}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 font-mono text-xs shadow-2xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-slate-500 text-[11px]">server.ts</span>
          </div>
          <pre className="mt-4 overflow-x-auto text-slate-300 leading-relaxed">
            <code>{`import { createSaaS } from '@starter/core';

export default createSaaS({
  auth: 'supabase',
  billing: 'stripe',
  analytics: 'posthog',
  theme: 'dark'
});`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
