import React from 'react';
import { Layout, Palette, Code, Smartphone, Database, Lock } from 'lucide-react';

export function FeatureGridWithIcons() {
  const list = [
    { icon: Layout, title: 'Responsive Grids', desc: 'Fluid breakpoints from mobile to 4K displays.' },
    { icon: Palette, title: 'Tailwind Tokens', desc: 'Pre-configured color palettes and typography.' },
    { icon: Code, title: 'Clean Architecture', desc: 'Modular components ready to extract and modify.' },
    { icon: Smartphone, title: 'Mobile First', desc: 'Tested on real iOS and Android devices.' },
    { icon: Database, title: 'State-Ready', desc: 'Ready to connect to Supabase or Prisma backends.' },
    { icon: Lock, title: 'Enterprise Secure', desc: 'Safe from XSS, zero dangerouslySetInnerHTML.' }
  ];

  return (
    <section className="bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-extrabold text-center mb-12">Core Capabilities</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((it) => (
            <div key={it.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 hover:border-slate-700 transition-colors">
              <it.icon className="h-5 w-5 text-blue-400 mb-3" />
              <h3 className="text-base font-bold">{it.title}</h3>
              <p className="mt-1 text-xs text-slate-400">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
