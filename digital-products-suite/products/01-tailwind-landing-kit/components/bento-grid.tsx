import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Globe2,
  Zap,
  BarChart3,
  Terminal,
  Activity,
  Lock,
} from 'lucide-react';

/**
 * Single bento item configuration.
 */
export interface BentoItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tag?: string;
  className?: string;
}

/**
 * Props for the BentoGrid component.
 */
export interface BentoGridProps {
  /** Section badge */
  badgeText?: string;
  /** Section headline */
  title?: string;
  /** Section subheadline */
  subtitle?: string;
}

/**
 * Asymmetric Bento Grid layout showcasing core product pillars with interactive-style
 * UI mockups, terminal previews, status badges, and telemetry visuals.
 *
 * @example
 * ```tsx
 * import { BentoGrid } from './components/bento-grid';
 *
 * export default function Page() {
 *   return <BentoGrid />;
 * }
 * ```
 */
export function BentoGrid({
  badgeText = 'Architecture & Power',
  title = 'Engineered for extreme developer velocity',
  subtitle = 'Everything your modern development stack needs, tightly architected into a lightning-fast, highly resilient platform.',
}: BentoGridProps): JSX.Element {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-slate-100 sm:py-32">
      {/* Subtle ambient lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/3 -z-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          {badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400">
              <Zap className="h-3.5 w-3.5" />
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

        {/* Asymmetric Bento Grid Layout (2x3 with key items spanning columns/rows) */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1: Wide 2-column feature card with Code/Terminal UI mock */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 transition duration-300 hover:border-slate-700 hover:bg-slate-900/90 md:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400">
                  <Terminal className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
                  Zero Config CLI
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-white sm:text-2xl">
                Instant Declarative Deployments
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                Ship to edge nodes in under 2 seconds. Automatically synthesize runtime configs, environment variables, and branch preview URLs without managing complex CI runner infrastructure.
              </p>
            </div>

            {/* Visual preview: Terminal mock */}
            <div className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 shadow-inner">
              <div className="flex items-center gap-1.5 border-b border-slate-800/80 pb-3">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-[10px] text-slate-500">bash &mdash; deploy.sh</span>
              </div>
              <div className="mt-3 space-y-1 text-[11px]">
                <p className="text-slate-400">
                  <span className="text-indigo-400">$</span> npx qorely-deploy --production --verify
                </p>
                <p className="text-emerald-400">
                  &check; Bundling artifacts (32 modules, 1.4s)
                </p>
                <p className="text-sky-400">
                  &rarr; Propagating 42 edge PoPs globally...
                </p>
                <p className="text-slate-200">
                  🚀 <span className="font-semibold text-white">Live:</span> https://app.production.edge.network (38ms TTFB)
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: 1-column Security & Cryptography card */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 transition duration-300 hover:border-slate-700 hover:bg-slate-900/90">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">
                Zero-Trust Security
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                End-to-end cryptographic payload verification with hardware-backed key storage and automated audit tracking.
              </p>
            </div>

            {/* Visual preview: Lock badge */}
            <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-emerald-300">mTLS & AES-256-GCM</p>
                  <p className="text-[10px] text-emerald-400/80">Continuous payload integrity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: 1-column Global Edge Mesh */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 transition duration-300 hover:border-slate-700 hover:bg-slate-900/90">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400">
                <Globe2 className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">
                Global Edge Network
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Ultra-low latency edge compute stationed across 50+ tier-4 data centers with automated failover routing.
              </p>
            </div>

            {/* Visual preview: Latency metric */}
            <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">Global Average</span>
                <p className="text-xl font-extrabold text-sky-400">18ms</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-300">
                <Activity className="h-3 w-3 animate-pulse" />
                Active CDN
              </span>
            </div>
          </div>

          {/* Card 4: Wide 2-column feature card with Real-time Telemetry Graph UI */}
          <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-8 transition duration-300 hover:border-slate-700 hover:bg-slate-900/90 md:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                  Real-Time Streaming
                </span>
              </div>
              <h3 className="mt-6 text-xl font-bold text-white sm:text-2xl">
                High-Fidelity Telemetry & Observability
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
                Track p99 latency spikes, memory allocations, and request bottlenecks with sub-millisecond precision. Seamlessly pipe OpenTelemetry traces to Datadog, Prometheus, or Grafana.
              </p>
            </div>

            {/* Visual preview: Simulated analytics bar graph */}
            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between pb-3 text-xs text-slate-400">
                <span>Throughput (RPS)</span>
                <span className="font-semibold text-purple-400">94,200 req/sec</span>
              </div>
              <div className="flex items-end gap-2 h-16 pt-2">
                {[40, 65, 50, 80, 75, 95, 85, 92, 100, 88, 96, 90, 84, 98].map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 rounded-t bg-gradient-to-t from-indigo-600/40 to-purple-500 transition-all duration-300 hover:brightness-125"
                    style={{ height: `${val}%` }}
                    title={`Bucket ${idx + 1}: ${val}%`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
