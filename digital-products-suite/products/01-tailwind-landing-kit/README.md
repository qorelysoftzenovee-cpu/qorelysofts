# Tailwind Landing Kit

> Production-ready, copy-pasteable Tailwind CSS + React landing page components with TypeScript. Built for high-velocity developers, SaaS founders, and design engineers.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4+-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)](https://react.dev/)

---

## 🚀 Overview

**Tailwind Landing Kit** is a developer component library containing 10 drop-in Tailwind CSS + React landing page components. Every component is self-contained in a single `.tsx` file, requires zero external stylesheets, and works out-of-the-box with sensible defaults or fully typed props.

Whether you're scaffolding an MVP or redesigning a flagship developer platform, these components provide accessible, responsive, dark-mode ready UI patterns that convert visitors into active users.

---

## 📦 Component Catalog

| # | Component | File | Description |
|---|-----------|------|-------------|
| 1 | **HeroVideoModal** | [`components/hero-video-modal.tsx`](./components/hero-video-modal.tsx) | Hero section with announcement pill, headlines, CTAs, and an animated video modal overlay. |
| 2 | **PricingTable** | [`components/pricing-table.tsx`](./components/pricing-table.tsx) | 3-tier pricing (Starter/Pro/Enterprise) with monthly/annual billing cycle toggle and popular tier callout. |
| 3 | **TestimonialWall** | [`components/testimonial-wall.tsx`](./components/testimonial-wall.tsx) | Masonry-style 3-column grid of verified customer reviews with star ratings and avatar badges. |
| 4 | **FeatureMatrix** | [`components/feature-matrix.tsx`](./components/feature-matrix.tsx) | Deep comparison table with checkmarks, crosses, and spec details across 3 subscription tiers. |
| 5 | **BentoGrid** | [`components/bento-grid.tsx`](./components/bento-grid.tsx) | Asymmetric 2x3 CSS grid showcasing key pillars with terminal mocks, telemetry charts, and security pills. |
| 6 | **FaqAccordion** | [`components/faq-accordion.tsx`](./components/faq-accordion.tsx) | Collapsible FAQ accordion with plus/minus toggles, accessible keyboard interactions, and help desk CTA. |
| 7 | **StatsCounter** | [`components/stats-counter.tsx`](./components/stats-counter.tsx) | High-impact 4-metric counter grid displaying active users, uptime SLA, regions, and 24/7 support. |
| 8 | **CtaBanner** | [`components/cta-banner.tsx`](./components/cta-banner.tsx) | Full-width gradient conversion banner with primary/secondary action buttons and risk-free guarantees. |
| 9 | **HeaderNav** | [`components/header-nav.tsx`](./components/header-nav.tsx) | Sticky responsive navigation bar with brand icon, desktop links, CTA triggers, and mobile drawer. |
| 10 | **FooterColumns** | [`components/footer-columns.tsx`](./components/footer-columns.tsx) | 4-column footer layout with newsletter subscription form, link directory, social links, and copyright. |

---

## 🛠️ Installation & Setup

### 1. Install Peer Dependencies

Inside your React or Next.js project:

```bash
npm install lucide-react
# Ensure React 18+ and Tailwind CSS 3.4+ are installed
npm install -D tailwindcss postcss autoprefixer
```

### 2. Configure Tailwind CSS

Ensure your `tailwind.config.js` scans the component paths:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 3. Copy or Import Components

You can copy individual `.tsx` files directly into your project's `components/` directory, or import them directly:

```tsx
import {
  HeaderNav,
  HeroVideoModal,
  StatsCounter,
  BentoGrid,
  FeatureMatrix,
  PricingTable,
  TestimonialWall,
  FaqAccordion,
  CtaBanner,
  FooterColumns,
} from 'tailwind-landing-kit';
```

---

## 💻 Complete Landing Page Example

Combine all 10 components in minutes to build a high-converting developer marketing page:

```tsx
import React from 'react';
import {
  HeaderNav,
  HeroVideoModal,
  StatsCounter,
  BentoGrid,
  FeatureMatrix,
  PricingTable,
  TestimonialWall,
  FaqAccordion,
  CtaBanner,
  FooterColumns,
} from 'tailwind-landing-kit';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. Header Navigation */}
      <HeaderNav
        brandName="QorelyUI"
        brandLogoText="QU"
        ctaText="Deploy Free"
        onCtaClick={() => console.log('Deploy clicked')}
      />

      {/* 2. Hero Section with Video Modal */}
      <HeroVideoModal
        badgeText="Version 3.0 Live • Distributed Compute"
        headline="Accelerate developer workflows with"
        headlineHighlight="deterministic edge deployment"
        videoUrl="https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1"
      />

      {/* 3. Proof & Key Metrics */}
      <StatsCounter />

      {/* 4. Asymmetric Bento Grid Showcase */}
      <BentoGrid />

      {/* 5. Comprehensive Feature Matrix */}
      <FeatureMatrix />

      {/* 6. Pricing Plans */}
      <PricingTable
        annualDiscountPercent={20}
        onSelectPlan={(planId, billingCycle) => {
          console.log(`Selected plan ${planId} on ${billingCycle} billing`);
        }}
      />

      {/* 7. Testimonials & Social Proof */}
      <TestimonialWall />

      {/* 8. Frequently Asked Questions */}
      <FaqAccordion allowMultiple={false} />

      {/* 9. High-Conversion Call To Action */}
      <CtaBanner
        headline="Ready to modernize your infrastructure?"
        subheadline="Launch in minutes with zero upfront commitment. Full refund guarantee."
        primaryCtaText="Claim Your Free Workspace"
      />

      {/* 10. Multi-Column Footer */}
      <FooterColumns
        brandName="QorelySofts"
        onNewsletterSubmit={(email) => console.log('Newsletter sub:', email)}
      />
    </div>
  );
}
```

---

## 📖 Component API Reference

### `HeroVideoModal`
- `badgeText?: string` — Top announcement badge text.
- `headline?: string` — Primary hero title text.
- `headlineHighlight?: string` — Gradient-styled emphasis text.
- `subheadline?: string` — Lead summary description.
- `primaryCtaText?: string` — Primary button label.
- `primaryCtaLink?: string` — Primary button href.
- `secondaryCtaText?: string` — Secondary button label.
- `secondaryCtaLink?: string` — Secondary button href.
- `videoUrl?: string` — Embed URL for the modal iframe.
- `thumbnailUrl?: string` — Video preview thumbnail image.
- `videoDurationText?: string` — Duration badge (e.g. "2 min tour").
- `trustBadges?: string[]` — Trust badges list below CTAs.
- `onPrimaryCtaClick?: () => void` — Primary CTA callback.
- `onSecondaryCtaClick?: () => void` — Secondary CTA callback.

### `PricingTable`
- `badgeText?: string` — Top pill text.
- `title?: string` — Headline title.
- `subtitle?: string` — Descriptive subtitle.
- `annualDiscountPercent?: number` — Discount percentage displayed on toggle (default: 20).
- `tiers?: PricingTier[]` — Custom array of pricing tiers.
- `onSelectPlan?: (tierId: string, billingCycle: 'monthly' | 'annual') => void` — Plan selection callback.

### `TestimonialWall`
- `badgeText?: string` — Top pill text.
- `title?: string` — Headline title.
- `subtitle?: string` — Subtitle.
- `testimonials?: Testimonial[]` — Custom testimonials list.

### `FeatureMatrix`
- `badgeText?: string` — Top pill text.
- `title?: string` — Headline title.
- `subtitle?: string` — Subtitle.
- `categories?: MatrixCategory[]` — Feature categories and comparison items.

### `BentoGrid`
- `badgeText?: string` — Top pill text.
- `title?: string` — Section title.
- `subtitle?: string` — Section subtitle.

### `FaqAccordion`
- `badgeText?: string` — Top pill text.
- `title?: string` — Section title.
- `subtitle?: string` — Section subtitle.
- `items?: FaqItem[]` — Custom list of questions & answers.
- `allowMultiple?: boolean` — Whether multiple accordions can be open simultaneously.

### `StatsCounter`
- `badgeText?: string` — Top pill text.
- `title?: string` — Section title.
- `subtitle?: string` — Section subtitle.
- `stats?: StatMetric[]` — Array of 4 stat items with icons, values, and badges.

### `CtaBanner`
- `badgeText?: string` — Top pill text.
- `headline?: string` — Headline.
- `subheadline?: string` — Subheadline.
- `primaryCtaText?: string` — Primary button text.
- `primaryCtaLink?: string` — Primary button href.
- `secondaryCtaText?: string` — Secondary button text.
- `secondaryCtaLink?: string` — Secondary button href.
- `guarantees?: string[]` — Bullet points below buttons.
- `onPrimaryClick?: () => void` — Primary click handler.
- `onSecondaryClick?: () => void` — Secondary click handler.

### `HeaderNav`
- `brandName?: string` — Text brand title.
- `brandLogoText?: string` — Logo icon text (e.g. "QU").
- `navItems?: NavItem[]` — Navigation links list.
- `loginText?: string` — Secondary button text.
- `loginHref?: string` — Secondary button href.
- `ctaText?: string` — Primary button text.
- `ctaHref?: string` — Primary button href.
- `onLoginClick?: () => void` — Secondary button callback.
- `onCtaClick?: () => void` — Primary button callback.

### `FooterColumns`
- `brandName?: string` — Company or product brand name.
- `brandDescription?: string` — Short company mission bio.
- `columns?: FooterColumnSection[]` — Organized columns of links.
- `onNewsletterSubmit?: (email: string) => void` — Newsletter form handler.
- `copyrightYear?: number` — Copyright year display.

---

## 📄 License

MIT © [QorelySofts](https://www.qorelysofts.co.in). Built with precision for the modern web engineering community.
