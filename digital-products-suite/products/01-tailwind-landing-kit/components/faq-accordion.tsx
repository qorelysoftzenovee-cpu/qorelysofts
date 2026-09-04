import React, { useState } from 'react';
import { Plus, Minus, HelpCircle, ArrowRight } from 'lucide-react';

/**
 * FAQ item structure.
 */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * Props for the FaqAccordion component.
 */
export interface FaqAccordionProps {
  /** Section badge */
  badgeText?: string;
  /** Section title */
  title?: string;
  /** Section description */
  subtitle?: string;
  /** FAQ question items */
  items?: FaqItem[];
  /** Allow multiple accordions open simultaneously (default: false) */
  allowMultiple?: boolean;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How fast can our team get up and running?',
    answer:
      'Most engineering teams integrate our SDKs and drop-in components in less than 30 minutes. All packages feature copy-pasteable TypeScript, fully typed prop contracts, and zero external stylesheet requirements beyond Tailwind CSS.',
  },
  {
    id: 'faq-2',
    question: 'Are there any hidden recurring fees or request overages?',
    answer:
      'None whatsoever. Our billing is completely transparent. If your service approaches tier thresholds, we notify your workspace admins well in advance, and requests are gracefully rate-limited or softly buffered without service interruptions.',
  },
  {
    id: 'faq-3',
    question: 'Can I customize the components to match our brand guidelines?',
    answer:
      'Yes, 100%. Every single component is written with standard Tailwind utility classes. You can override color palettes, border radiuses, typography scales, or inject custom SVG icons directly without fighting CSS specificity.',
  },
  {
    id: 'faq-4',
    question: 'What kind of support is included with the Pro and Enterprise plans?',
    answer:
      'Pro plan subscribers receive dedicated priority email and Slack ticketing with a guaranteed 4-hour response SLA. Enterprise plans include a dedicated Solutions Architect in a shared Slack/Discord channel and 24/7 emergency incident coverage with under 15-minute response times.',
  },
  {
    id: 'faq-5',
    question: 'Is this architecture compliant with SOC2, GDPR, and HIPAA standards?',
    answer:
      'Yes. Our reference architectures enforce zero-trust isolation, continuous audit logging, AES-256-GCM encryption at rest, and TLS 1.3 in transit. Enterprise tier deployments support dedicated VPC peering and BAA agreements.',
  },
  {
    id: 'faq-6',
    question: 'Can we self-host or deploy these components on air-gapped infrastructure?',
    answer:
      'Absolutely. Because the digital suite provides clean, dependency-free TypeScript source code, you can compile and deploy artifacts inside your own AWS VPC, Azure tenant, Google Cloud, or on-premise Kubernetes cluster with no phone-home telemetry.',
  },
];

/**
 * Collapsible FAQ Accordion component with smooth transitions, interactive
 * toggle states, and plus/minus icons.
 *
 * @example
 * ```tsx
 * import { FaqAccordion } from './components/faq-accordion';
 *
 * export default function Page() {
 *   return <FaqAccordion allowMultiple={false} />;
 * }
 * ```
 */
export function FaqAccordion({
  badgeText = 'Got Questions?',
  title = 'Frequently Asked Questions',
  subtitle = 'Find answers to common questions regarding architecture, licensing, security, and team integration.',
  items = DEFAULT_FAQS,
  allowMultiple = false,
}: FaqAccordionProps): JSX.Element {
  // Store open IDs as a set for multi-open or single-open support
  const [openIds, setOpenIds] = useState<string[]>(['faq-1']);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-slate-100 sm:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          {badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{badgeText}</span>
            </div>
          )}
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            {subtitle}
          </p>
        </div>

        {/* Accordion List */}
        <div className="mt-12 space-y-4">
          {items.map((item) => {
            const isOpen = openIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-2xl border transition duration-200 ${
                  isOpen
                    ? 'border-indigo-500/40 bg-slate-900/80 shadow-lg shadow-indigo-500/5'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <span className="text-base font-semibold text-white sm:text-lg">
                    {item.question}
                  </span>
                  <span
                    className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-200 ${
                      isOpen
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-800/80 px-6 pt-2 pb-6">
                    <p className="text-sm leading-relaxed text-slate-300">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Contact Callout */}
        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center backdrop-blur-sm sm:p-8">
          <h4 className="text-base font-bold text-white">Still have questions?</h4>
          <p className="mt-2 text-xs text-slate-400">
            Can&apos;t find the answer you&apos;re looking for? Chat directly with our engineering team.
          </p>
          <div className="mt-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Get in touch with support</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
