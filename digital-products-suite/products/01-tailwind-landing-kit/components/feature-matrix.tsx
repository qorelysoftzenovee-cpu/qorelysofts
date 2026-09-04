import React from 'react';
import { Check, X, HelpCircle, Layers } from 'lucide-react';

/**
 * Single feature comparison row.
 */
export interface MatrixFeatureItem {
  /** Feature title */
  name: string;
  /** Explanatory description or tooltip text */
  description?: string;
  /** Starter tier value: boolean or custom string */
  starter: boolean | string;
  /** Pro tier value: boolean or custom string */
  pro: boolean | string;
  /** Enterprise tier value: boolean or custom string */
  enterprise: boolean | string;
}

/**
 * Feature group category in the matrix.
 */
export interface MatrixCategory {
  /** Category header name */
  category: string;
  /** Features in this category */
  features: MatrixFeatureItem[];
}

/**
 * Props for FeatureMatrix component.
 */
export interface FeatureMatrixProps {
  /** Section badge pill */
  badgeText?: string;
  /** Main section headline */
  title?: string;
  /** Subheadline */
  subtitle?: string;
  /** Categories and their features */
  categories?: MatrixCategory[];
}

const DEFAULT_CATEGORIES: MatrixCategory[] = [
  {
    category: 'Core Capabilities',
    features: [
      {
        name: 'Seat Allocation',
        description: 'Number of active collaborator seats allowed in the organization workspace.',
        starter: 'Up to 3 seats',
        pro: 'Up to 15 seats',
        enterprise: 'Unlimited seats',
      },
      {
        name: 'Monthly Request Quota',
        description: 'Calculated across all endpoints and webhook triggers.',
        starter: '10,000 / mo',
        pro: '500,000 / mo',
        enterprise: 'Unlimited custom SLA',
      },
      {
        name: 'Automated CI/CD Pipelines',
        description: 'Instant zero-downtime deployment triggers upon git push.',
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Custom Domain & Edge SSL',
        description: 'Global TLS termination with automated renewal and DNS management.',
        starter: false,
        pro: true,
        enterprise: true,
      },
    ],
  },
  {
    category: 'Security & Governance',
    features: [
      {
        name: 'Role-Based Access Control (RBAC)',
        description: 'Granular permissions (Admin, Editor, Auditor, Viewer).',
        starter: false,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Audit Log Retention',
        description: 'Searchable tamper-proof compliance logs for all user events.',
        starter: '7 days',
        pro: '90 days',
        enterprise: '7 years (compliant)',
      },
      {
        name: 'SAML SSO & Okta Integration',
        description: 'Single sign-on through enterprise identity providers.',
        starter: false,
        pro: false,
        enterprise: true,
      },
      {
        name: 'Dedicated Private IP & VPC Peering',
        description: 'Isolated network tunnel for database connections and data egress.',
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
  {
    category: 'Support & SLAs',
    features: [
      {
        name: 'Community Discord Support',
        description: 'Access to peer channels and core team public forums.',
        starter: true,
        pro: true,
        enterprise: true,
      },
      {
        name: 'Guaranteed Response Time',
        description: 'Target response SLA from our dedicated engineering staff.',
        starter: 'Best effort',
        pro: '< 4 hours',
        enterprise: '< 15 mins (24/7)',
      },
      {
        name: 'Dedicated Technical Account Manager',
        description: 'Named senior solutions architect embedded in your team Slack.',
        starter: false,
        pro: false,
        enterprise: true,
      },
    ],
  },
];

/**
 * Comprehensive feature comparison matrix table with checkmarks, crosses,
 * and custom values across Starter, Pro, and Enterprise tiers.
 *
 * @example
 * ```tsx
 * import { FeatureMatrix } from './components/feature-matrix';
 *
 * export default function Page() {
 *   return <FeatureMatrix />;
 * }
 * ```
 */
export function FeatureMatrix({
  badgeText = 'Full Feature Breakdown',
  title = 'Compare plans and find the right fit',
  subtitle = 'Evaluate our complete suite of features side-by-side to make the best decision for your team.',
  categories = DEFAULT_CATEGORIES,
}: FeatureMatrixProps): JSX.Element {
  const renderCell = (val: boolean | string, isProTier: boolean = false) => {
    if (typeof val === 'boolean') {
      return val ? (
        <div className="flex justify-center">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full ${
              isProTier ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            <Check className="h-4 w-4" />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-slate-500">
            <X className="h-3.5 w-3.5" />
          </div>
        </div>
      );
    }
    return (
      <span
        className={`text-xs font-semibold ${
          isProTier ? 'text-indigo-300' : 'text-slate-300'
        }`}
      >
        {val}
      </span>
    );
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-slate-100 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          {badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400">
              <Layers className="h-3.5 w-3.5" />
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

        {/* Table Container */}
        <div className="mt-16 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl backdrop-blur-md">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80">
                <th className="w-2/5 p-5 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Feature
                </th>
                <th className="w-1/5 p-5 text-center text-xs font-bold uppercase tracking-wider text-slate-300">
                  Starter
                </th>
                <th className="w-1/5 border-x border-indigo-500/30 bg-indigo-950/20 p-5 text-center text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Pro (Popular)
                </th>
                <th className="w-1/5 p-5 text-center text-xs font-bold uppercase tracking-wider text-slate-300">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, cIdx) => (
                <React.Fragment key={cIdx}>
                  {/* Category Header Row */}
                  <tr className="border-y border-slate-800 bg-slate-900/90">
                    <td
                      colSpan={4}
                      className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-indigo-400"
                    >
                      {cat.category}
                    </td>
                  </tr>

                  {/* Feature Rows */}
                  {cat.features.map((feature, fIdx) => (
                    <tr
                      key={fIdx}
                      className="border-b border-slate-800/60 transition hover:bg-slate-800/30"
                    >
                      <td className="p-5">
                        <div className="flex items-center gap-1.5 font-medium text-slate-200 text-sm">
                          {feature.name}
                          {feature.description && (
                            <span
                              title={feature.description}
                              className="cursor-help text-slate-500 hover:text-slate-300"
                            >
                              <HelpCircle className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        {feature.description && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            {feature.description}
                          </p>
                        )}
                      </td>
                      <td className="p-5 text-center">
                        {renderCell(feature.starter)}
                      </td>
                      <td className="border-x border-indigo-500/20 bg-indigo-950/10 p-5 text-center">
                        {renderCell(feature.pro, true)}
                      </td>
                      <td className="p-5 text-center">
                        {renderCell(feature.enterprise)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
