const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, '..', 'products-repo', 'developer-component-library');

// Read all 25 components
const categories = [
  { id: 'heroes', title: 'Hero Headers', folder: 'heroes' },
  { id: 'pricing', title: 'Pricing Tables', folder: 'pricing' },
  { id: 'testimonials', title: 'Testimonials', folder: 'testimonials' },
  { id: 'features', title: 'Feature Grids', folder: 'features' },
  { id: 'footers', title: 'Footers', folder: 'footers' },
];

const componentList = [];

for (const cat of categories) {
  const catFolder = path.join(libDir, 'components', cat.folder);
  if (fs.existsSync(catFolder)) {
    const files = fs.readdirSync(catFolder).filter(f => f.endsWith('.tsx'));
    for (const file of files) {
      const filePath = path.join(catFolder, file);
      const code = fs.readFileSync(filePath, 'utf8');
      const baseName = path.basename(file, '.tsx');
      // Format human-readable name
      const title = baseName
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      componentList.push({
        id: baseName,
        category: cat.id,
        categoryLabel: cat.title,
        filename: file,
        relPath: `components/${cat.folder}/${file}`,
        title,
        code
      });
    }
  }
}

console.log(`Found ${componentList.length} components.`);

// 1. Generate preview.html
const cardsHtml = componentList.map((comp, idx) => {
  const escapedCode = comp.code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  return `
    <div class="comp-card rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-sm overflow-hidden shadow-2xl transition-all hover:border-slate-700" data-cat="${comp.category}">
      <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-6 py-4 border-b border-slate-800">
        <div class="flex items-center gap-3">
          <span class="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-blue-600/20 text-xs font-black text-blue-400 border border-blue-500/30">
            ${idx + 1}
          </span>
          <div>
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-400 uppercase tracking-wider">${comp.categoryLabel}</span>
              <span class="text-xs font-mono text-slate-500">${comp.filename}</span>
            </div>
            <h2 class="text-base font-bold text-white mt-1">${comp.title}</h2>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="copyCode('${comp.id}')" class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 hover:shadow-xl transition-all cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
            <span>Copy Code</span>
          </button>
        </div>
      </div>
      <div class="p-6">
        <div class="rounded-xl border border-slate-800/80 bg-slate-950 p-4 relative group">
          <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-900 text-[11px] font-mono text-slate-400">
            <span>// Location: <code>${comp.relPath}</code></span>
            <span>TypeScript + Tailwind CSS</span>
          </div>
          <pre class="overflow-x-auto text-xs text-emerald-400 font-mono leading-relaxed max-h-72 p-2 select-all"><code id="${comp.id}">${escapedCode}</code></pre>
        </div>
      </div>
    </div>
  `;
}).join('\n');

const previewHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>25 Modern React + Tailwind Component Vault — Interactive Showcase & 1-Click Code Copy</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
    pre { scrollbar-width: thin; }
    .toast {
      position: fixed; bottom: 28px; right: 28px;
      background: #10b981; color: white; padding: 14px 24px;
      border-radius: 14px; font-weight: 700; font-size: 14px;
      box-shadow: 0 15px 35px rgba(16, 185, 129, 0.4);
      opacity: 0; transform: translateY(12px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none; z-index: 999;
      display: flex; align-items: center; gap: 8px;
    }
    .toast.show { opacity: 1; transform: translateY(0); }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white min-h-screen">
  <!-- Sticky Top Navigation Bar -->
  <header class="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl px-6 py-4 shadow-lg">
    <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center justify-center h-6 w-6 rounded bg-blue-600 text-white font-black text-xs">Q</span>
          <h1 class="text-lg font-black text-white tracking-tight">React + Tailwind Component Vault</h1>
          <span class="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">25 Components</span>
        </div>
        <p class="text-xs text-slate-400 mt-0.5">Click "Copy Code" on any card below to paste directly into your React / Next.js app.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2" id="filter-container">
        <button onclick="filterCat('all', this)" class="cat-btn active rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-600/30">All (25)</button>
        <button onclick="filterCat('heroes', this)" class="cat-btn rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700">Heroes (5)</button>
        <button onclick="filterCat('pricing', this)" class="cat-btn rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700">Pricing (5)</button>
        <button onclick="filterCat('testimonials', this)" class="cat-btn rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700">Testimonials (5)</button>
        <button onclick="filterCat('features', this)" class="cat-btn rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700">Features (5)</button>
        <button onclick="filterCat('footers', this)" class="cat-btn rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700">Footers (5)</button>
      </div>
    </div>
  </header>

  <!-- Hero Intro Banner -->
  <section class="border-b border-slate-800/80 bg-gradient-to-b from-blue-950/20 to-transparent px-6 py-12 text-center">
    <div class="mx-auto max-w-3xl">
      <span class="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">⚡ Production Ready & Animated</span>
      <h2 class="mt-4 text-3xl font-black text-white sm:text-4xl tracking-tight">
        25 Modern React + Tailwind CSS Components
      </h2>
      <p class="mt-3 text-sm text-slate-400 leading-relaxed">
        Engineered for speed, high conversion, and seamless integration. Zero configuration required—simply install <code class="text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded">lucide-react</code>, copy any component, and paste it into your Next.js or React codebase.
      </p>
    </div>
  </section>

  <!-- Main Content Showcase -->
  <main class="mx-auto max-w-7xl px-6 py-10 space-y-8">
${cardsHtml}
  </main>

  <!-- Toast Notification -->
  <div id="toast" class="toast">
    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
    <span>Code copied to clipboard!</span>
  </div>

  <footer class="border-t border-slate-800 bg-slate-950 px-6 py-8 text-center text-xs text-slate-500">
    <p>© QorelySofts Component Vault. Licensed for unlimited commercial and personal projects.</p>
  </footer>

  <script>
    function copyCode(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const code = el.innerText;
      navigator.clipboard.writeText(code).then(() => {
        const toast = document.getElementById('toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
      });
    }

    function filterCat(cat, btn) {
      document.querySelectorAll('.cat-btn').forEach(b => {
        b.className = 'cat-btn rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700';
      });
      if (btn) {
        btn.className = 'cat-btn active rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-600/30';
      }

      document.querySelectorAll('.comp-card').forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(libDir, 'preview.html'), previewHtml, 'utf8');
console.log('Generated preview.html');

// 2. Generate package.json
const packageJson = {
  name: "react-tailwind-component-vault",
  version: "1.0.0",
  description: "A curated collection of 25 production-ready, fully responsive, and animated React components styled with Tailwind CSS and Lucide React icons.",
  main: "index.ts",
  author: "QorelySofts (https://www.qorelysofts.co.in)",
  license: "Commercial",
  peerDependencies: {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0",
    "lucide-react": ">=0.400.0",
    "tailwindcss": ">=3.0.0"
  },
  devDependencies: {
    "typescript": "^5.0.0"
  }
};
fs.writeFileSync(path.join(libDir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf8');
console.log('Generated package.json');

// 3. Generate tailwind.config.js
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './preview.html'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    }
  },
  plugins: []
};
`;
fs.writeFileSync(path.join(libDir, 'tailwind.config.js'), tailwindConfig, 'utf8');
console.log('Generated tailwind.config.js');

// 4. Generate README.md
const readme = `# 25 Modern React + Tailwind CSS Component Vault 🚀

A hand-crafted developer collection of **25 production-ready, fully responsive, and animated React components** styled with Tailwind CSS and Lucide React icons.

---

## 📦 What's Included (25 Total Components):

### 1. 5 Hero Headers (\`/components/heroes/\`)
- \`hero-simple-centered.tsx\` — Clean, high-converting centered hero with pill badge and dual CTAs.
- \`hero-split-image.tsx\` — Left-aligned copy with right-side screenshot/mockup preview.
- \`hero-with-code-preview.tsx\` — Developer-focused layout with terminal command copy button and code preview.
- \`hero-with-mockup.tsx\` — Perspective-tilt dashboard preview mockup with radial gradient glow.
- \`hero-gradient-headline.tsx\` — Bold animated gradient headline with social proof badges.

### 2. 5 Pricing Tables (\`/components/pricing/\`)
- \`pricing-three-tier.tsx\` — Starter, Pro Builder (Popular), and Enterprise 3-tier card layout.
- \`pricing-comparison-table.tsx\` — Matrix comparing feature checkmarks and crosses side-by-side.
- \`pricing-toggle-monthly-annual.tsx\` — Dynamic monthly/annual billing switcher with "Save 20%" pill.
- \`pricing-single-focus.tsx\` — High-converting single lifetime license focus card with 30-day guarantee.
- \`pricing-enterprise-cards.tsx\` — Cloud Hosted vs. Self-Hosted Enterprise comparison.

### 3. 5 Testimonial Layouts (\`/components/testimonials/\`)
- \`testimonial-carousel-slider.tsx\` — Interactive slider with previous/next controls and star ratings.
- \`testimonial-grid-wall.tsx\` — 3-column review card masonry wall.
- \`testimonial-centered-quote.tsx\` — Editorial large quote hero with founder avatar.
- \`testimonial-metrics-cards.tsx\` — Stat-backed review cards (e.g., "340% Growth", "15 hrs saved").
- \`testimonial-split-photo.tsx\` — Side-by-side founder case study layout.

### 4. 5 Feature Grids (\`/components/features/\`)
- \`feature-bento-grid.tsx\` — Modern asymmetric Bento box grid layout.
- \`feature-alternating-rows.tsx\` — Zig-zag alternating image & copy rows.
- \`feature-grid-with-icons.tsx\` — 3x2 grid of clean cards with icon containers.
- \`feature-card-hover-effects.tsx\` — Interactive hover elevation and glow effects.
- \`feature-comparison-matrix.tsx\` — "Old Way vs Modern Way" comparative grid.

### 5. 5 Footers (\`/components/footers/\`)
- \`footer-multi-column-newsletter.tsx\` — 5-column layout with inline email subscribe form.
- \`footer-minimal-centered.tsx\` — Clean horizontal link bar with copyright.
- \`footer-dark-enterprise.tsx\` — Dark footer with live operational system status indicator.
- \`footer-with-cta-banner.tsx\` — Pre-footer gradient call-to-action banner.
- \`footer-badges-socials.tsx\` — Tech stack badges, GitHub stars, and community links.

---

## 🖥️ Interactive Preview Showcase (\`preview.html\`)

Double-click or open \`preview.html\` in any web browser to:
- Filter components by category (Heroes, Pricing, Testimonials, Features, Footers).
- View formatted code blocks for each component.
- **Copy code in 1 click** using the "Copy Code" button with instant clipboard confirmation.

---

## ⚡ Quick Start: How to Use in Your Project

### Step 1: Install Dependencies
Ensure you have \`lucide-react\` installed in your Next.js or React project:
\`\`\`bash
npm install lucide-react
\`\`\`

### Step 2: Copy Any Component
Copy any component file from \`/components/*\` directly into your app's \`components/\` folder.

### Step 3: Import and Render
\`\`\`tsx
import { HeroSimpleCentered } from '@/components/heroes/hero-simple-centered';

export default function LandingPage() {
  return (
    <main>
      <HeroSimpleCentered />
    </main>
  );
}
\`\`\`

---

## 📄 Commercial License
Purchased from **QorelySofts** (https://www.qorelysofts.co.in).
Licensed for unlimited personal and client commercial projects. Zero attribution required.
Support: \`qorelysoftzenovee@gmail.com\`
`;
fs.writeFileSync(path.join(libDir, 'README.md'), readme, 'utf8');
console.log('Generated README.md');

// Clean up temporary script
if (fs.existsSync(path.join(__dirname, 'fix-build.js'))) {
  fs.unlinkSync(path.join(__dirname, 'fix-build.js'));
}
if (fs.existsSync(path.join(__dirname, 'build-components-only.js'))) {
  fs.unlinkSync(path.join(__dirname, 'build-components-only.js'));
}
console.log('All files generated successfully!');
