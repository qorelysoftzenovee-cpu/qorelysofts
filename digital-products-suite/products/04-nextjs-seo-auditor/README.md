# Next.js SEO Auditor

A fast, production-ready CLI SEO auditing tool built specifically for Next.js, Vercel, and modern web applications. Evaluates metadata, social graphs, heading structures, image accessibility, structured data, and server telemetry with zero-configuration required.

Engineered with dual parsing modes (**Cheerio** with an autonomous **Regex fallback**), live **Time to First Byte (TTFB)** measurements, stream decompression (**gzip**, **brotli**, **deflate**), and rate-limited image availability checking.

Developed by **QorelySofts**.

---

## Features

- **Deep HTML & Metadata Audit**:
  - **Title Tag**: Validates presence, length against optimal SERP limits (30–60 characters), and detects duplicate tags.
  - **Meta Description**: Checks presence, length (120–160 characters), and snippet readiness.
  - **Canonical URL**: Validates canonical presence and warns against invalid relative paths.
  - **Mobile Viewport**: Verifies responsive mobile configuration (`width=device-width, initial-scale=1`).
  - **Robots Directives**: Guards against accidental `noindex` or `nofollow` directives in production.
- **Social Graph Audit**:
  - **OpenGraph Protocol**: Complete verification of `og:title`, `og:description`, `og:image`, `og:url`, and `og:type`.
  - **Twitter Cards**: Inspects `twitter:card` (`summary_large_image`), `twitter:title`, and `twitter:image`.
- **Content & Heading Hierarchy**:
  - Validates the single `<h1>` standard rule.
  - Computes counts for `<h2>` and `<h3>` tags with extracted text logs.
- **Image Optimization & Accessibility**:
  - Scans all `<img>` tags for descriptive `alt` attributes.
  - Concurrently verifies remote image URLs via non-intrusive `HEAD` requests (batches of 5) to flag broken 404/500 assets.
  - `--skip-images` flag for ultra-fast text-only audits.
- **Server Telemetry & Performance**:
  - Exact Time to First Byte (**TTFB**) measurement.
  - Compression detection (`gzip`, `br` / Brotli, `deflate`).
  - Raw vs. uncompressed HTML document payload sizes.
  - Enforced SSL/HTTPS protocol verification.
  - Full redirect chain tracking (up to 5 hops).
- **Structured Data Detection**:
  - Identifies and parses `<script type="application/ld+json">`.
  - Validates JSON formatting and detects Schema.org entity `@type` (e.g. `Organization`, `WebSite`, `Product`, `Article`).
- **Dual Exporters & Dashboard**:
  - High-visibility ANSI-colored terminal dashboard.
  - Machine-readable JSON report output.
  - GitHub-flavored Markdown report output.

---

## Installation & Prerequisites

Requires **Node.js v18.0.0 or higher**.

1. Navigate to the auditor directory:
   ```bash
   cd c:\Users\abdul\OneDrive\Desktop\Digital products\digital-products-suite\products\04-nextjs-seo-auditor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

> [!NOTE]
> Even if `npm install` has not been run, the auditor features a built-in Regex DOM fallback engine, allowing full functionality immediately!

---

## Quick Start

Audit any website in seconds:

```bash
npm run audit -- --url "https://nextjs.org"
```

Or run directly with Node:

```bash
node seo-check.js --url "https://example.com"
```

To generate both a JSON and a Markdown audit report:

```bash
node seo-check.js --url "https://my-site.com" --format json,markdown --output ./audit-results
```

---

## CLI Options Reference

| Option | Short | Type | Default | Description |
|---|---|---|---|---|
| `--url` | `-u` | `string` | *Required* | Absolute target URL to audit (protocol prepended if omitted). |
| `--output` | `-o` | `string` | `"report.json"` | Destination path/filename for exported reports. |
| `--format` | `-f` | `string` | `"json"` | Output format: `"json"`, `"markdown"`, or `"json,markdown"`. |
| `--timeout` | `-t` | `number` | `15000` | HTTP request timeout in milliseconds. |
| `--skip-images` | - | `boolean` | `false` | Skips HEAD requests to verify image availability. |
| `--help` | `-h` | - | - | Displays usage instructions and exits. |

---

## Scoring Methodology (0–100 Scale)

The overall SEO score is computed using a balanced 100-point weighted rating formula:

| Category | Max Pts | Criteria & Evaluation |
|---|---|---|
| **Title Tag** | **15 pts** | Tag present (10 pts), length between 30–60 characters (5 pts). |
| **Meta Description** | **10 pts** | Tag present (6 pts), length between 120–160 characters (4 pts). |
| **Heading Hierarchy** | **15 pts** | Exactly one authoritative `<h1>` (10 pts), structured `<h2>`/`<h3>` subheadings (5 pts). |
| **Canonical Link** | **10 pts** | Canonical declared (7 pts), formatted as an absolute URL (3 pts). |
| **Mobile Viewport** | **5 pts** | Viewport tag declared with `width=device-width` (5 pts). |
| **Robots Directives** | **5 pts** | Crawlers permitted; no accidental `noindex` flags (5 pts). |
| **OpenGraph Metadata** | **15 pts** | 3 pts each for `og:title`, `og:description`, `og:image`, `og:url`, and `og:type`. |
| **Twitter Cards** | **10 pts** | `twitter:card` declared (4 pts), title defined (3 pts), image defined (3 pts). |
| **Image Optimization** | **10 pts** | `alt` tags on all images (6 pts), zero broken 404 images (4 pts). |
| **Performance & Tech** | **10 pts** | HTTPS secure protocol (4 pts), TTFB < 300ms (3 pts), Brotli/Gzip compression (3 pts). |
| **Total Available** | **100 pts** | **Grade A (90–100) \| Grade B (80–89) \| Grade C (70–79) \| Grade D (50–69) \| Grade F (<50)** |

---

## Sample Terminal Output

```text
[INIT] Starting SEO audit for: https://example.com

┌─────────────────────────────────────────────────────────────────┐
│               NEXT.JS SEO AUDITOR DASHBOARD                     │
│                  Powered by QorelySofts                         │
└─────────────────────────────────────────────────────────────────┘

  AUDIT TARGET:   https://example.com
  PARSER ENGINE:  cheerio
  HTTP STATUS:    200
  TIME TO 1st BYTE: 210ms
  COMPRESSION:    BR
  HTML PAYLOAD:   14.2 KB

  OVERALL SEO SCORE:
  ┌───────────────────────────────────────────────┐
  │   GRADE A   94 / 100 POINTS                   │
  └───────────────────────────────────────────────┘
  Passed: 10  |  Warnings: 2  |  Critical: 0

── [ WARNINGS & IMPROVEMENTS ] ──────────────────────────────────
  ⚠ WARN [Metadata] Title Tag Length
    Context: Title is 28 characters. Recommended range: 30-60 characters.
    Action : Expand your title tag with primary keywords and brand identity.

── [ VERIFIED PASSES ] ──────────────────────────────────────────
  ✔ PASS [Headings] Single H1 Tag: Found exactly 1 primary H1 tag.
  ✔ PASS [Metadata] Meta Description Length: Optimal meta description length (148 chars).
  ✔ PASS [Indexing] Canonical Tag: Valid absolute canonical link specified.
  ✔ PASS [Mobile] Viewport Tag: Mobile-friendly viewport defined.
  ✔ PASS [Social] OpenGraph Tags: All core OpenGraph tags are present.
  ✔ PASS [Social] Twitter Cards: Twitter Card verified: card="summary_large_image".
  ✔ PASS [Images] Image Alt Attributes: All 8 image(s) have descriptive alt attributes.
  ✔ PASS [Technical] HTTPS Encryption: Page served securely over HTTPS protocol.
  ✔ PASS [Performance] HTTP Compression: Modern compression detected (BR).
  ✔ PASS [Structured Data] Schema.org JSON-LD: Found 2 schema entity type(s): WebSite, Organization.
```

---

## Next.js Best Practices for Perfect Scores

To achieve a 100/100 score in Next.js (App Router `app/layout.tsx` or `app/page.tsx`), use the built-in `Metadata` API:

```typescript
// app/page.tsx or app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next.js SEO Auditor | Comprehensive Web Diagnostics',
  description:
    'Audit metadata, OpenGraph tags, heading structures, and server performance for your modern Next.js web applications.',
  metadataBase: new URL('https://example.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Next.js SEO Auditor | Comprehensive Web Diagnostics',
    description:
      'Audit metadata, OpenGraph tags, heading structures, and server performance for modern Next.js apps.',
    url: 'https://example.com',
    siteName: 'Next.js SEO Auditor',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SEO Auditor Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Next.js SEO Auditor | Comprehensive Web Diagnostics',
    description: 'Audit metadata, OpenGraph tags, and performance.',
    images: ['https://example.com/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

---

## Troubleshooting

### Q: Why is my TTFB high?
- High TTFB (> 600ms) typically indicates cold starts in serverless functions, lack of caching headers, or blocking database operations during Server-Side Rendering (SSR). Consider using Incremental Static Regeneration (ISR) or static page generation where feasible.

### Q: Why are image checks timing out?
- Some third-party CDNs block rapid `HEAD` requests. You can pass `--skip-images` to bypass image availability checks while still auditing `alt` attribute presence.

---

## License

This software is licensed under the MIT License.  
Copyright (c) 2026 **QorelySofts**. All rights reserved.
