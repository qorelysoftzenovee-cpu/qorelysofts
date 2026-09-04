import React from 'react';
import { ArrowRight, Github, Twitter, Linkedin } from 'lucide-react';

export function FooterMultiColumnNewsletter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-16 text-slate-400 text-xs">
      <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h3 className="text-base font-bold text-white">DevComponents</h3>
          <p className="mt-2 text-xs text-slate-400 max-w-sm">
            Curated Tailwind CSS &amp; React components for developers and indie creators.
          </p>
          <div className="mt-4 flex gap-3 text-slate-400">
            <Github className="h-4 w-4 hover:text-white cursor-pointer" />
            <Twitter className="h-4 w-4 hover:text-white cursor-pointer" />
            <Linkedin className="h-4 w-4 hover:text-white cursor-pointer" />
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Components</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">Hero Headers</a></li>
            <li><a href="#" className="hover:text-white">Pricing Tables</a></li>
            <li><a href="#" className="hover:text-white">Feature Grids</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-white">About Us</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Subscribe</h4>
          <div className="flex gap-1.5">
            <input type="email" placeholder="Email" className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none" />
            <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-white font-bold hover:bg-blue-500">→</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
