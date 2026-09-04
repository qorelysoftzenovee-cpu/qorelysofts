import React, { useState, useEffect, useCallback } from 'react';
import { Play, X, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * Props for configuring the HeroVideoModal component.
 */
export interface HeroVideoModalProps {
  /** Optional badge text displayed above the main heading */
  badgeText?: string;
  /** Primary headline for the hero section */
  headline?: string;
  /** Accent phrase highlighted inside the headline */
  headlineHighlight?: string;
  /** Subheading or descriptive text */
  subheadline?: string;
  /** Primary CTA button label */
  primaryCtaText?: string;
  /** Primary CTA button URL or action */
  primaryCtaLink?: string;
  /** Secondary CTA button label */
  secondaryCtaText?: string;
  /** Secondary CTA button URL or action */
  secondaryCtaLink?: string;
  /** URL of the video embed (YouTube, Vimeo, or direct MP4) */
  videoUrl?: string;
  /** Poster thumbnail image URL displayed before playing */
  thumbnailUrl?: string;
  /** Video duration badge or label displayed over thumbnail */
  videoDurationText?: string;
  /** Trust badges or bullet points below CTAs */
  trustBadges?: string[];
  /** Optional callback when primary CTA is clicked */
  onPrimaryCtaClick?: () => void;
  /** Optional callback when secondary CTA is clicked */
  onSecondaryCtaClick?: () => void;
}

/**
 * Hero section component featuring an interactive video thumbnail that opens
 * a high-resolution video modal overlay with smooth backdrop blur.
 *
 * @example
 * ```tsx
 * import { HeroVideoModal } from './components/hero-video-modal';
 *
 * export default function Page() {
 *   return (
 *     <HeroVideoModal
 *       headline="Ship modern web apps at"
 *       headlineHighlight="10x developer velocity"
 *       videoUrl="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
 *     />
 *   );
 * }
 * ```
 */
export function HeroVideoModal({
  badgeText = 'Announcing Version 3.0 • Next-Gen Architecture',
  headline = 'Supercharge your engineering workflow with',
  headlineHighlight = 'autonomous intelligent tools',
  subheadline = 'Eliminate repetitive setup, unify team operations, and deploy production-grade software with deterministic reliability and complete enterprise compliance.',
  primaryCtaText = 'Get Started Free',
  primaryCtaLink = '#get-started',
  secondaryCtaText = 'Explore Documentation',
  secondaryCtaLink = '#docs',
  videoUrl = 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1',
  thumbnailUrl = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
  videoDurationText = '2 min product tour',
  trustBadges = ['No credit card required', 'SOC2 Type II Certified', '14-day free trial'],
  onPrimaryCtaClick,
  onSecondaryCtaClick,
}: HeroVideoModalProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close modal when pressing Escape key and lock body scroll
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleCloseModal]);

  return (
    <section className="relative overflow-hidden bg-slate-950 py-20 text-slate-100 sm:py-28 lg:py-32">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-0 h-[600px] w-[900px] -translate-x-1/2 bg-gradient-to-tr from-indigo-600/20 via-sky-500/15 to-transparent blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Text and CTAs header */}
        <div className="mx-auto max-w-3xl text-center">
          {badgeText && (
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>{badgeText}</span>
            </div>
          )}

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {headline}{' '}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              {headlineHighlight}
            </span>
          </h1>

          <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
            {subheadline}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href={primaryCtaLink}
              onClick={(e) => {
                if (onPrimaryCtaClick) {
                  e.preventDefault();
                  onPrimaryCtaClick();
                }
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition duration-150 hover:bg-indigo-500 hover:shadow-indigo-500/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto"
            >
              <span>{primaryCtaText}</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href={secondaryCtaLink}
              onClick={(e) => {
                if (onSecondaryCtaClick) {
                  e.preventDefault();
                  onSecondaryCtaClick();
                }
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-sm transition duration-150 hover:border-slate-600 hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto"
            >
              <span>{secondaryCtaText}</span>
            </a>
          </div>

          {trustBadges.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 sm:gap-6">
              {trustBadges.map((badge, idx) => (
                <div key={idx} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video preview container */}
        <div className="mx-auto mt-14 max-w-5xl">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl transition duration-300 hover:border-slate-700">
            {/* Aspect ratio frame */}
            <div className="relative aspect-video w-full">
              <img
                src={thumbnailUrl}
                alt="Product video overview thumbnail"
                className="h-full w-full object-cover brightness-75 transition duration-500 group-hover:scale-105 group-hover:brightness-90"
                loading="lazy"
              />

              {/* Dark overlay with interactive play trigger */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-6 text-center">
                <button
                  type="button"
                  onClick={handleOpenModal}
                  aria-label="Play product video"
                  className="group/btn relative flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-xl shadow-indigo-600/50 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-indigo-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400"
                >
                  <span className="absolute -inset-2 rounded-full border border-indigo-400/40 animate-ping" />
                  <Play className="h-8 w-8 translate-x-0.5 fill-white text-white" />
                </button>

                {videoDurationText && (
                  <span className="mt-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-md">
                    {videoDurationText}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product demonstration video"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity duration-300"
            onClick={handleCloseModal}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Product Walkthrough
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close video modal"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video iFrame responsive container */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={videoUrl}
                title="Product video demonstration"
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
