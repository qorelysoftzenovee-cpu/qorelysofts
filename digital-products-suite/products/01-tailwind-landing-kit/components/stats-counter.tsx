import React, { useState, useEffect } from 'react';
import { Users, Activity, Globe, Headphones, TrendingUp } from 'lucide-react';

/**
 * Single stat configuration item.
 */
export interface StatMetric {
  id: string;
  value: string;
  numericTarget?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description: string;
  icon: React.ElementType;
  changeBadge?: string;
}

/**
 * Props for the StatsCounter component.
 */
export interface StatsCounterProps {
  badgeText?: string;
  title?: string;
  subtitle?: string;
  stats?: StatMetric[];
}

const DEFAULT_STATS: StatMetric[] = [
  {
    id: 'users',
    value: '10K+',
    numericTarget: 10000,
    suffix: '+',
    label: 'Active Developers',
    description: 'Teams building and shipping production apps every day.',
    icon: Users,
    changeBadge: '+142% YoY',
  },
  {
    id: 'uptime',
    value: '99.99%',
    numericTarget: 99.99,
    suffix: '%',
    label: 'Guaranteed Uptime',
    description: 'Enterprise SLA backed by automated multi-region failover.',
    icon: Activity,
    changeBadge: 'Zero Incident',
  },
  {
    id: 'countries',
    value: '50+',
    numericTarget: 50,
    suffix: '+',
    label: 'Global Regions',
    description: 'Edge nodes delivering sub-30ms latencies worldwide.',
    icon: Globe,
    changeBadge: 'Global CDN',
  },
  {
    id: 'support',
    value: '24/7',
    label: 'Mission-Critical Support',
    description: 'Direct Slack and phone access to our principal engineers.',
    icon: Headphones,
    changeBadge: '< 15m SLA',
  },
];

/**
 * Stats counter section displaying 4 big headline metrics with animated count-up
 * styling, icons, and growth badges.
 *
 * @example
 * ```tsx
 * import { StatsCounter } from './components/stats-counter';
 *
 * export default function Page() {
 *   return <StatsCounter />;
 * }
 * ```
 */
export function StatsCounter({
  badgeText = 'Proven Global Scale',
  title = 'Metrics that reflect operational excellence',
  subtitle = 'Trusted by fast-growing startups and global enterprises to handle mission-critical workloads.',
  stats = DEFAULT_STATS,
}: StatsCounterProps): JSX.Element {
  const [animated, setAnimated] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-slate-100 sm:py-32">
      {/* Background illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 -z-0 h-80 w-[700px] -translate-x-1/2 bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-purple-500/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          {badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400">
              <TrendingUp className="h-3.5 w-3.5" />
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

        {/* 4 Stats Cards Grid */}
        <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    {stat.changeBadge && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                        {stat.changeBadge}
                      </span>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                      <span
                        className={`transition-opacity duration-700 ${
                          animated ? 'opacity-100' : 'opacity-20'
                        }`}
                      >
                        {stat.value}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-slate-200">
                      {stat.label}
                    </h3>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
