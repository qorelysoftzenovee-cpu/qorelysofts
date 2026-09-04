import React, { useState } from 'react';
import { Check, Zap, Sparkles, HelpCircle } from 'lucide-react';

/**
 * Interface defining a single feature item in a pricing tier.
 */
export interface PricingFeature {
  /** Feature description text */
  text: string;
  /** Whether this feature is included in the tier */
  included: boolean;
  /** Optional badge or highlighted tag next to the feature */
  tag?: string;
}

/**
 * Interface defining a pricing plan tier.
 */
export interface PricingTier {
  /** Identifier */
  id: string;
  /** Plan display name (e.g. Starter, Pro, Enterprise) */
  name: string;
  /** Short summary of ideal customer persona */
  description: string;
  /** Price when billed monthly in USD */
  priceMonthly: number;
  /** Price per month when billed annually in USD */
  priceAnnual: number;
  /** Billing currency symbol */
  currency?: string;
  /** Whether to highlight this plan as the most popular */
  isPopular?: boolean;
  /** Label for the call to action button */
  ctaText: string;
  /** Link or target URL for the CTA button */
  ctaLink?: string;
  /** List of features included or excluded */
  features: PricingFeature[];
}

/**
 * Props for the PricingTable component.
 */
export interface PricingTableProps {
  /** Section badge or pill text */
  badgeText?: string;
  /** Main section headline */
  title?: string;
  /** Explanatory subheadline */
  subtitle?: string;
  /** Percentage discount advertised on the annual billing switch */
  annualDiscountPercent?: number;
  /** Optional override for the 3 pricing tiers */
  tiers?: PricingTier[];
  /** Callback fired when a plan CTA is clicked */
  onSelectPlan?: (tierId: string, billingCycle: 'monthly' | 'annual') => void;
}

const DEFAULT_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for solo developers, indie hackers, and weekend side-projects.',
    priceMonthly: 19,
    priceAnnual: 15,
    isPopular: false,
    ctaText: 'Start 14-day Free Trial',
    ctaLink: '#start-starter',
    features: [
      { text: 'Up to 3 team seats', included: true },
      { text: '10,000 monthly API requests', included: true },
      { text: 'Standard telemetry & analytics', included: true },
      { text: 'Community Discord support', included: true },
      { text: 'Custom domains & SSL', included: false },
      { text: 'Automated hourly backups', included: false },
      { text: 'Dedicated account manager', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Engineered for scaling teams requiring high velocity and robust infra.',
    priceMonthly: 59,
    priceAnnual: 47,
    isPopular: true,
    ctaText: 'Upgrade to Pro Now',
    ctaLink: '#start-pro',
    features: [
      { text: 'Up to 15 team seats', included: true },
      { text: '500,000 monthly API requests', included: true },
      { text: 'Real-time telemetry & log streaming', included: true },
      { text: 'Priority email & Slack support', included: true, tag: 'Fast' },
      { text: 'Custom domains & automated SSL', included: true },
      { text: 'Automated hourly backups', included: true },
      { text: 'Dedicated account manager', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Tailored for regulated organizations needing customized SLAs and governance.',
    priceMonthly: 199,
    priceAnnual: 159,
    isPopular: false,
    ctaText: 'Contact Enterprise Sales',
    ctaLink: '#contact-sales',
    features: [
      { text: 'Unlimited team members', included: true },
      { text: 'Unlimited monthly requests', included: true },
      { text: 'Custom audit logs & RBAC policies', included: true },
      { text: '24/7 Phone & private Slack channel', included: true, tag: '24/7' },
      { text: 'Custom domains with multi-region CDN', included: true },
      { text: 'Minute-by-minute continuous backup', included: true },
      { text: 'Dedicated technical account manager', included: true },
    ],
  },
];

/**
 * Three-tier pricing comparison component with an interactive monthly/annual
 * billing switch and popular plan highlighting.
 *
 * @example
 * ```tsx
 * import { PricingTable } from './components/pricing-table';
 *
 * export default function Page() {
 *   return (
 *     <PricingTable
 *       annualDiscountPercent={20}
 *       onSelectPlan={(id, cycle) => console.log(id, cycle)}
 *     />
 *   );
 * }
 * ```
 */
export function PricingTable({
  badgeText = 'Predictable, Transparent Pricing',
  title = 'Pick the plan that accelerates your workflow',
  subtitle = 'Transparent pricing with no surprise overage fees. Change or cancel your subscription at any time.',
  annualDiscountPercent = 20,
  tiers = DEFAULT_TIERS,
  onSelectPlan,
}: PricingTableProps): JSX.Element {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-slate-100 sm:py-32">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -z-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-indigo-500/10 blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          {badgeText && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              {badgeText}
            </span>
          )}
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            {subtitle}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                !isAnnual
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                isAnnual
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual billing</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                Save {annualDiscountPercent}%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3 lg:items-stretch">
          {tiers.map((tier) => {
            const price = isAnnual ? tier.priceAnnual : tier.priceMonthly;
            const currency = tier.currency || '$';

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition-all duration-300 ${
                  tier.isPopular
                    ? 'border-2 border-indigo-500 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 shadow-2xl shadow-indigo-500/20 lg:-translate-y-2'
                    : 'border border-slate-800 bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                {/* Popular Ribbon */}
                {tier.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-500/30">
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {tier.description}
                  </p>

                  {/* Price display */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                      {currency}{price}
                    </span>
                    <span className="text-sm font-medium text-slate-400">
                      / month
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {isAnnual ? 'Billed annually ($' + price * 12 + '/yr)' : 'Billed on a monthly basis'}
                  </p>

                  <hr className="my-6 border-slate-800" />

                  {/* Feature list */}
                  <ul className="space-y-3.5 text-xs text-slate-300">
                    {tier.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            feature.included
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-600'
                          }`}
                        >
                          <Check
                            className={`h-3 w-3 ${
                              feature.included ? 'opacity-100' : 'opacity-30'
                            }`}
                          />
                        </div>
                        <span
                          className={
                            feature.included ? 'text-slate-200' : 'text-slate-500 line-through'
                          }
                        >
                          {feature.text}
                        </span>
                        {feature.tag && (
                          <span className="ml-auto rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                            {feature.tag}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA */}
                <div className="mt-8">
                  <a
                    href={tier.ctaLink || '#'}
                    onClick={(e) => {
                      if (onSelectPlan) {
                        e.preventDefault();
                        onSelectPlan(tier.id, isAnnual ? 'annual' : 'monthly');
                      }
                    }}
                    className={`inline-flex w-full items-center justify-center rounded-xl py-3 px-4 text-xs font-bold tracking-wide transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      tier.isPopular
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 focus-visible:ring-indigo-400'
                        : 'border border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white focus-visible:ring-slate-400'
                    }`}
                  >
                    {tier.ctaText}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Extra guarantee note */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-400">
          <HelpCircle className="h-4 w-4 text-slate-500" />
          <span>Need custom high-volume pricing or on-premise deployments?</span>
          <a href="#contact" className="font-semibold text-indigo-400 hover:underline">
            Talk to our engineering architects &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
