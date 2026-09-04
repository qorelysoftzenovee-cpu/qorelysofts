import React, { useState } from 'react';
import { Send, CheckCircle2, Github, Twitter, Linkedin, Disc as Discord, Heart } from 'lucide-react';

/**
 * Footer link item.
 */
export interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}

/**
 * Footer column containing related links.
 */
export interface FooterColumnSection {
  title: string;
  links: FooterLink[];
}

/**
 * Props for FooterColumns component.
 */
export interface FooterColumnsProps {
  brandName?: string;
  brandDescription?: string;
  columns?: FooterColumnSection[];
  onNewsletterSubmit?: (email: string) => void;
  copyrightYear?: number;
}

const DEFAULT_COLUMNS: FooterColumnSection[] = [
  {
    title: 'Product',
    links: [
      { label: 'Components Kit', href: '#components' },
      { label: 'RBAC Auth Boilerplate', href: '#rbac', badge: 'Popular' },
      { label: 'Cloud Scraper CLI', href: '#scraper' },
      { label: 'Next.js SEO Auditor', href: '#seo' },
      { label: 'Webhook Handlers', href: '#webhooks' },
      { label: 'Release Notes', href: '#changelog' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#docs' },
      { label: 'API Reference', href: '#api' },
      { label: 'TypeScript Starters', href: '#starters' },
      { label: 'System Status', href: '#status' },
      { label: 'Community Forum', href: '#forum' },
      { label: 'Design System', href: '#design' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#about' },
      { label: 'Engineering Blog', href: '#blog' },
      { label: 'Careers', href: '#careers', badge: 'Hiring' },
      { label: 'Customers', href: '#customers' },
      { label: 'Contact Us', href: '#contact' },
      { label: 'Privacy Policy', href: '#privacy' },
    ],
  },
];

/**
 * 4-column footer component with brand summary, organized link sections,
 * interactive newsletter signup with confirmation state, and social links.
 *
 * @example
 * ```tsx
 * import { FooterColumns } from './components/footer-columns';
 *
 * export default function Page() {
 *   return <FooterColumns brandName="QorelySofts" />;
 * }
 * ```
 */
export function FooterColumns({
  brandName = 'QorelySofts',
  brandDescription = 'Architecting high-performance digital products, full-stack SDKs, and developer tools for the modern internet.',
  columns = DEFAULT_COLUMNS,
  onNewsletterSubmit,
  copyrightYear = new Date().getFullYear(),
}: FooterColumnsProps): JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    if (onNewsletterSubmit) {
      onNewsletterSubmit(email);
    }
    setIsSubmitted(true);
    setEmail('');
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
        {/* Main 4-column layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-8">
          {/* Brand & Newsletter Column (spans 2 columns on desktop) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 font-bold text-white shadow-md shadow-indigo-600/30 text-sm">
                QS
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                {brandName}
              </span>
            </div>

            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-400">
              {brandDescription}
            </p>

            {/* Newsletter Form */}
            <div className="mt-6 max-w-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Subscribe to our Engineering Dispatch
              </h4>
              <p className="mt-1 text-[11px] text-slate-400">
                Get monthly deep-dives on systems architecture and product releases.
              </p>

              {isSubmitted ? (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Thanks for subscribing! Check your inbox soon.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@company.com"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to newsletter"
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* 3 Link Columns */}
          {columns.map((col, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-1.5 transition hover:text-white"
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[9px] font-bold text-indigo-300">
                          {link.badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar: Copyright & Social Links */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {copyrightYear} {brandName}. All rights reserved. Crafted by{' '}
            <a
              href="https://www.qorelysofts.co.in"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-slate-400 hover:text-indigo-400"
            >
              QorelySofts
            </a>
            .
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://github.com/qorelysofts"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub repository"
              className="transition hover:text-white"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://twitter.com/qorelysofts"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter profile"
              className="transition hover:text-white"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noreferrer"
              aria-label="Community Discord"
              className="transition hover:text-white"
            >
              <Discord className="h-4 w-4" />
            </a>
            <a
              href="https://linkedin.com/company/qorelysofts"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn profile"
              className="transition hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
