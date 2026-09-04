import React, { useState } from 'react';
import { Menu, X, Terminal, ChevronDown, ArrowRight } from 'lucide-react';

/**
 * Navigation item link model.
 */
export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

/**
 * Props for HeaderNav component.
 */
export interface HeaderNavProps {
  brandName?: string;
  brandLogoText?: string;
  navItems?: NavItem[];
  loginText?: string;
  loginHref?: string;
  ctaText?: string;
  ctaHref?: string;
  onLoginClick?: () => void;
  onCtaClick?: () => void;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'Products', href: '#products' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing', badge: 'New' },
  { label: 'Docs', href: '#docs' },
  { label: 'Company', href: '#company' },
];

/**
 * Responsive sticky header navigation bar with brand icon, navigation links,
 * mobile drawer toggle via useState, and conversion action buttons.
 *
 * @example
 * ```tsx
 * import { HeaderNav } from './components/header-nav';
 *
 * export default function Page() {
 *   return <HeaderNav brandName="QorelySofts" />;
 * }
 * ```
 */
export function HeaderNav({
  brandName = 'QorelyUI',
  brandLogoText = 'QU',
  navItems = DEFAULT_NAV_ITEMS,
  loginText = 'Sign In',
  loginHref = '#login',
  ctaText = 'Get Started Free',
  ctaHref = '#signup',
  onLoginClick,
  onCtaClick,
}: HeaderNavProps): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <a href="#" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 font-black text-sm text-white shadow-md shadow-indigo-600/30">
            {brandLogoText}
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            {brandName}
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-300 transition duration-150 hover:text-white"
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-300">
                  {item.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <a
            href={loginHref}
            onClick={(e) => {
              if (onLoginClick) {
                e.preventDefault();
                onLoginClick();
              }
            }}
            className="rounded-lg px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            {loginText}
          </a>
          <a
            href={ctaHref}
            onClick={(e) => {
              if (onCtaClick) {
                e.preventDefault();
                onCtaClick();
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <span>{ctaText}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle mobile menu"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:text-white md:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-6 sm:px-6 md:hidden">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900 hover:text-white"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-xs font-bold text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          <div className="mt-5 flex flex-col gap-2.5 border-t border-slate-800 pt-4">
            <a
              href={loginHref}
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (onLoginClick) {
                  e.preventDefault();
                  onLoginClick();
                }
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 text-center text-xs font-semibold text-slate-200"
            >
              {loginText}
            </a>
            <a
              href={ctaHref}
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (onCtaClick) {
                  e.preventDefault();
                  onCtaClick();
                }
              }}
              className="w-full rounded-xl bg-indigo-600 py-2.5 text-center text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
            >
              {ctaText}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
