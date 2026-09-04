import React from 'react';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';

/**
 * Single testimonial record.
 */
export interface Testimonial {
  /** Unique id */
  id: string;
  /** Customer or user name */
  name: string;
  /** Professional role or title */
  role: string;
  /** Company or organization */
  company: string;
  /** Avatar image URL */
  avatarUrl: string;
  /** Full testimonial quote text */
  quote: string;
  /** Rating out of 5 stars (1 to 5) */
  rating: number;
  /** Whether the testimonial author is verified */
  verified?: boolean;
}

/**
 * Props for the TestimonialWall component.
 */
export interface TestimonialWallProps {
  /** Section badge pill */
  badgeText?: string;
  /** Main section headline */
  title?: string;
  /** Subheadline */
  subtitle?: string;
  /** Array of testimonials */
  testimonials?: Testimonial[];
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'VP of Engineering',
    company: 'HyperScale Labs',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    quote:
      'We replaced three disjointed developer platforms in a single sprint. The developer ergonomics and deterministic deployment pipelines cut our mean time to production from four days to twenty-five minutes.',
    rating: 5,
    verified: true,
  },
  {
    id: '2',
    name: 'Marcus Vance',
    role: 'Principal Architect',
    company: 'FinTech Cloud',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    quote:
      'The strict TypeScript support, granular RBAC models, and automated compliance logging made our SOC2 audit seamless. Truly enterprise-grade from day one.',
    rating: 5,
    verified: true,
  },
  {
    id: '3',
    name: 'Elena Rostova',
    role: 'Lead Full-Stack Dev',
    company: 'NextGen SaaS',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    quote:
      'Copy-pasteable Tailwind code that is actually modular, accessible, and responsive. We built our entire customer portal in under a week.',
    rating: 5,
    verified: true,
  },
  {
    id: '4',
    name: 'David Kalu',
    role: 'Founder & CTO',
    company: 'DevFlow Systems',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    quote:
      'Reliability is non-negotiable for our payment processing infra. Since integrating this suite, we have sustained 99.999% uptime through Black Friday traffic spikes.',
    rating: 5,
    verified: true,
  },
  {
    id: '5',
    name: 'Aisha Patel',
    role: 'Head of Product',
    company: 'Veloce AI',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    quote:
      'Our product adoption surged 42% after switching to the high-converting landing components. The typography, whitespace balance, and animations feel world-class.',
    rating: 5,
    verified: true,
  },
  {
    id: '6',
    name: 'Liam O’Connor',
    role: 'Staff Infrastructure Engineer',
    company: 'Apex Cloud Services',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80',
    quote:
      'Extremely clean abstractions without bloated dependencies. Everything can be inspected, tested, and customized in pure modern TypeScript.',
    rating: 5,
    verified: true,
  },
];

/**
 * Masonry-style 3-column grid of testimonial cards showcasing customer feedback,
 * ratings, user avatars, and verification badges.
 *
 * @example
 * ```tsx
 * import { TestimonialWall } from './components/testimonial-wall';
 *
 * export default function Page() {
 *   return <TestimonialWall />;
 * }
 * ```
 */
export function TestimonialWall({
  badgeText = 'Loved by 10,000+ Developers',
  title = 'Trusted by engineering leaders worldwide',
  subtitle = 'Discover how leading engineering organizations scale velocity, security, and developer satisfaction.',
  testimonials = DEFAULT_TESTIMONIALS,
}: TestimonialWallProps): JSX.Element {
  // Split into 3 columns for responsive masonry layout
  const col1 = testimonials.filter((_, idx) => idx % 3 === 0);
  const col2 = testimonials.filter((_, idx) => idx % 3 === 1);
  const col3 = testimonials.filter((_, idx) => idx % 3 === 2);

  const renderCard = (item: Testimonial) => (
    <div
      key={item.id}
      className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-indigo-500/5"
    >
      {/* Stars */}
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < item.rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-700 text-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="mt-4 text-sm leading-relaxed text-slate-300">
        &ldquo;{item.quote}&rdquo;
      </p>

      {/* Author details */}
      <div className="mt-6 flex items-center gap-3 border-t border-slate-800/80 pt-4">
        <img
          src={item.avatarUrl}
          alt={item.name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-800"
          loading="lazy"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate text-xs font-bold text-white">{item.name}</h4>
            {item.verified && (
              <CheckCircle className="h-3.5 w-3.5 shrink-0 text-sky-400" />
            )}
          </div>
          <p className="truncate text-[11px] text-slate-400">
            {item.role} &middot; <span className="text-slate-300">{item.company}</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-slate-100 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          {badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400">
              <MessageSquare className="h-3.5 w-3.5" />
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

        {/* 3-Column Masonry Wall */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-6">{col1.map(renderCard)}</div>
          <div className="flex flex-col gap-6">{col2.map(renderCard)}</div>
          <div className="flex flex-col gap-6">{col3.map(renderCard)}</div>
        </div>
      </div>
    </section>
  );
}
