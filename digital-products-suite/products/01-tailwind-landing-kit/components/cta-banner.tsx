import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

/**
 * Props for CtaBanner component.
 */
export interface CtaBannerProps {
  /** Optional badge text */
  badgeText?: string;
  /** Primary headline */
  headline?: string;
  /** Subheading text */
  subheadline?: string;
  /** Primary CTA button text */
  primaryCtaText?: string;
  /** Primary CTA link */
  primaryCtaLink?: string;
  /** Secondary CTA button text */
  secondaryCtaText?: string;
  /** Secondary CTA link */
  secondaryCtaLink?: string;
  /** List of guarantee bullets */
  guarantees?: string[];
  /** Primary button click handler */
  onPrimaryClick?: () => void;
  /** Secondary button click handler */
  onSecondaryClick?: () => void;
}

/**
 * Full-width gradient Call-To-Action banner with glowing ambient mesh,
 * primary and secondary conversion buttons, and trust guarantees.
 *
 * @example
 * ```tsx
 * import { CtaBanner } from './components/cta-banner';
 *
 * export default function Page() {
 *   return (
 *     <CtaBanner
 *       headline="Ready to modernize your infrastructure?"
 *       subheadline="Join thousands of developers building the future of software."
 *     />
 *   );
 * }
 * ```
 */
export function CtaBanner({
  badgeText = 'Start Building in Minutes',
  headline = 'Accelerate your deployment lifecycle today',
  subheadline = 'Get full access to our developer suite, comprehensive documentation, and pre-built production templates with zero risk.',
  primaryCtaText = 'Start Your 14-Day Free Trial',
  primaryCtaLink = '#signup',
  secondaryCtaText = 'Schedule Live Demo',
  secondaryCtaLink = '#demo',
  guarantees = [
    'No credit card required',
    'Instant cloud provisioning',
    'Cancel or downgrade anytime',
  ],
  onPrimaryClick,
  onSecondaryClick,
}: CtaBannerProps): JSX.Element {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-slate-100 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 px-6 py-16 shadow-2xl shadow-indigo-500/10 sm:px-12 sm:py-20 lg:px-16">
          {/* Ambient lighting inside banner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            {badgeText && (
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>{badgeText}</span>
              </div>
            )}

            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {headline}
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg">
              {subheadline}
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href={primaryCtaLink}
                onClick={(e) => {
                  if (onPrimaryClick) {
                    e.preventDefault();
                    onPrimaryClick();
                  }
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 transition hover:bg-indigo-500 hover:shadow-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto"
              >
                <span>{primaryCtaText}</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href={secondaryCtaLink}
                onClick={(e) => {
                  if (onSecondaryClick) {
                    e.preventDefault();
                    onSecondaryClick();
                  }
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition hover:border-slate-600 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto"
              >
                <span>{secondaryCtaText}</span>
              </a>
            </div>

            {/* Guarantees */}
            {guarantees.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 sm:gap-6">
                {guarantees.map((item, idx) => (
                  <div key={idx} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
