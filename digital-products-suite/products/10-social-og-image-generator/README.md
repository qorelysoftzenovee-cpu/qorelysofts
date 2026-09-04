# Social OG Image Generator

A high-performance, automated Open Graph (OG) social card image generator designed for high click-through rates on Twitter / X, LinkedIn, Facebook, Discord, and Slack.

Includes dual runtime implementations:
1. **Vercel Edge Runtime (`@vercel/og`)**: Generates 1200x630 cards at the global edge with minimal latency and automatic CDN caching.
2. **Standalone Node.js (`canvas`)**: A self-hosted HTTP microservice powered by `node-canvas` with built-in LRU caching and resilient SVG vector fallback.

Crafted and maintained by **[QorelySofts](https://qorelysofts.com)**.

---

## Features & Highlights

- 🎨 **1200x630 High-Resolution Social Cards**: Standard optimal dimension recognized across all major social networks and messengers.
- 🌈 **4 Curated Theme Palettes**:
  - `dark`: Deep slate-900 with cyan/sky-400 accents.
  - `light`: Crisp white-to-slate-100 gradient with sapphire blue-600 accents.
  - `blue`: Midnight indigo-950 with radiant neon violet accents.
  - `purple`: Cyberpunk dark purple with vibrant fuchsia highlights.
- 📐 **Dynamic Typography & Layout Engine**:
  - Automatic font sizing based on headline length (prevents awkward breaks or microscopic text).
  - Word wrapping up to 3 lines with graceful ellipsis truncation.
  - Category / tag pill badge with status dot.
  - Dynamic avatar placeholder showing calculated author initials.
  - Customizable site branding and reading time estimates.
- ⚡ **In-Memory LRU Cache (Standalone)**: Automatically caches the last 50 unique cards in memory for instant millisecond responses.
- 🛡️ **Edge & Self-Hosted Ready**: Zero vendor lock-in. Deploy to Vercel Edge, AWS Lambda, Docker, Railway, or standalone VPS.

---

## Project Structure

```
10-social-og-image-generator/
├── src/
│   ├── og-vercel.tsx       # Vercel Edge Runtime handler (@vercel/og ImageResponse)
│   ├── og-standalone.js    # Standalone Node.js Canvas HTTP microservice
│   └── themes.js           # Theme palettes and color token configurations
├── example/
│   └── usage.html          # Interactive card preview studio & HTML meta generator
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # Complete documentation
```

---

## Quick Start (Standalone Node.js Server)

### 1. Prerequisites
- Node.js >= 18.0.0

### 2. Installation
```bash
cd 10-social-og-image-generator
npm install
```

> **Note on `canvas`**: If your system does not have C++ build tools installed for `node-canvas`, the standalone server seamlessly activates its integrated vector SVG engine without crashing!

### 3. Start the Server
```bash
# Start on default port 3001
npm start

# Or with custom port
PORT=8080 npm start
```

### 4. Test the Endpoint
Open your browser or run:
```bash
curl "http://localhost:3001/?title=Building+Scalable+Cloud+Systems&author=Alex+Vance&tag=Architecture&theme=dark"
```

To test the visual preview studio, open `example/usage.html` in your browser.

---

## API & Query Parameters

The standalone server and Vercel edge endpoint share identical query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `"Architecting High-Scale Cloud Systems"` | Main card headline. Auto-sizes font and wraps across 3 lines. |
| `author` | `string` | `"QorelySofts Engineering"` | Author name. Initials are automatically extracted for the avatar circle. |
| `tag` | `string` | `"Architecture"` | Pill badge category label displayed in the top left. |
| `theme` | `string` | `"dark"` | Color theme: `dark`, `light`, `blue`, or `purple`. |
| `site` | `string` | `"qorelysofts.com"` | Brand label displayed in the upper right. |

### Example Request URLs

#### Dark Theme
```
http://localhost:3001/?title=Clean+Architecture+in+Go&author=Robert+Martin&tag=Backend&theme=dark
```

#### Ocean Indigo Theme
```
http://localhost:3001/?title=Mastering+PostgreSQL+Indexes&author=Elena+Rostova&tag=Database&theme=blue
```

#### Neon Cyberpunk Theme
```
http://localhost:3001/?title=Autonomous+AI+Agents+in+Production&author=Sarah+Connor&tag=AI&theme=purple
```

#### Clean Light Theme
```
http://localhost:3001/?title=Modern+Design+Systems&author=Michael+Chang&tag=Design&theme=light
```

---

## Deploying to Vercel

The included `src/og-vercel.tsx` is built for Vercel Edge Functions or Next.js App Router.

### Option A: Next.js App Router (`app/api/og/route.tsx`)
Copy `src/og-vercel.tsx` into your Next.js project:

```typescript
// app/api/og/route.tsx
import handler, { config } from '@/src/og-vercel';

export { config };
export const GET = handler;
```

### Option B: Dynamic Next.js Metadata (`app/blog/[slug]/page.tsx`)
```typescript
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  
  const ogUrl = new URL('https://yourdomain.com/api/og');
  ogUrl.searchParams.set('title', post.title);
  ogUrl.searchParams.set('author', post.author);
  ogUrl.searchParams.set('tag', post.category);
  ogUrl.searchParams.set('theme', 'dark');

  return {
    title: post.title,
    openGraph: {
      title: post.title,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      images: [ogUrl.toString()],
    },
  };
}
```

---

## Integration Examples

### 1. HTML `<head>` Integration
Paste into your static site, Hugo, Jekyll, or WordPress header:

```html
<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="article">
<meta property="og:title" content="How to Scale Node.js Microservices">
<meta property="og:image" content="https://og.yourdomain.com/?title=How+to+Scale+Node.js+Microservices&author=QorelySofts&tag=NodeJS&theme=dark">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter / X -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="How to Scale Node.js Microservices">
<meta name="twitter:image" content="https://og.yourdomain.com/?title=How+to+Scale+Node.js+Microservices&author=QorelySofts&tag=NodeJS&theme=dark">
```

### 2. Astro Integration
```astro
---
// src/layouts/BlogPost.astro
const { title, author, tag } = Astro.props;
const ogImage = `https://og.yourdomain.com/?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&tag=${encodeURIComponent(tag)}&theme=blue`;
---
<head>
  <meta property="og:title" content={title} />
  <meta property="og:image" content={ogImage} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content={ogImage} />
</head>
```

---

## Customizing Themes

Themes are defined in `src/themes.js`. You can easily add custom brand palettes:

```javascript
// Add to themes object in src/themes.js
emerald: {
  name: 'Emerald Forest',
  bgGradientStart: '#022c22',
  bgGradientEnd: '#064e3b',
  titleColor: '#ecfdf5',
  subtextColor: '#a7f3d0',
  accentColor: '#10b981',
  badgeBg: 'rgba(16, 185, 129, 0.2)',
  badgeText: '#34d399',
  cardBorder: 'rgba(16, 185, 129, 0.3)',
  decorColor: 'rgba(16, 185, 129, 0.1)'
}
```

Now request it immediately via `?theme=emerald`!

---

## Standalone Server Management Endpoints

The standalone microservice provides operational endpoints:

- `GET /health`: Returns JSON with server status, active engine (`node-canvas` or `vector-svg-fallback`), uptime, and cache statistics.
- `GET /themes`: Returns JSON configuration of all available theme definitions.
- `GET /clear-cache`: Purges the in-memory LRU cache.

---

## Docker Deployment

A production-ready multi-stage Dockerfile:

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Install native dependencies if compiling node-canvas on Alpine
RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src
COPY .env.example ./.env

EXPOSE 3001
ENV PORT=3001
CMD ["node", "src/og-standalone.js"]
```

Build and run:
```bash
docker build -t og-image-generator .
docker run -d -p 3001:3001 --name og-generator og-image-generator
```

---

## License

This project is licensed under the **MIT License**.

Copyright &copy; 2026 **[QorelySofts](https://qorelysofts.com)**. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files to deal in the Software without restriction.
