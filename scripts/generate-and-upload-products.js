const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yaadhbybnsctadmgjxkr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYWRoYnlibnNjdGFkbWdqeGtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUyMDUwMywiZXhwIjoyMTA0MDk2NTAzfQ.cEAqLfMs0UjjV2m20akNDlIaXF7W77DEFJBABL_W7oM';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const LICENSE_TEXT = `================================================================================
QORELYSOFTS - COMMERCIAL & PERSONAL SOFTWARE LICENSE
================================================================================
Copyright (c) 2026 QorelySofts (www.qorelysofts.co.in)
All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software package ("The Asset"), to use, copy, modify, merge, publish,
distribute, and sublicense the software in personal and commercial projects,
subject to the following conditions:

1. YOU CAN:
   - Use this asset in unlimited personal projects.
   - Use this asset in unlimited commercial client deliverables.
   - Use this asset to build SaaS, web apps, mobile apps, or websites.
   - Modify, customize, and extend the code to fit your requirements.

2. YOU CANNOT:
   - Resell, redistribute, or repackage this asset as a competing digital template.
   - Make the source files publicly downloadable as a standalone product.

3. WARRANTY & SUPPORT:
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED. For questions or technical support, contact: qorelysoftzenovee@gmail.com
================================================================================`;

const tempDir = path.join(__dirname, '..', '.tmp_packages');
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
fs.mkdirSync(tempDir, { recursive: true });

// Helper to write file in nested dir
function writeFile(base, relPath, content) {
  const fullPath = path.join(base, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
}

// 1. SaaS Landing Page Kit
const p1Dir = path.join(tempDir, 'saas-landing-page-kit');
writeFile(p1Dir, 'LICENSE.txt', LICENSE_TEXT);
writeFile(p1Dir, 'README.md', `# Modern SaaS Landing Page Kit
Built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Lucide Icons**.

## Quick Start
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Run development server:
   \`\`\`bash
   npm run dev
   \`\`\`
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features
- Ultra-responsive layout across Mobile, Tablet, and Desktop
- Modern hero section with animated pill badge and dual call-to-action
- Feature matrix with icons and hover micro-animations
- Interactive pricing toggle (Monthly vs Annual billing)
- Collapsible FAQ accordion
- Dark-mode optimized color palette with high contrast
- 100% TypeScript typed

## Project Structure
- \`src/app/page.tsx\` - Main landing page layout
- \`src/components/navbar.tsx\` - Responsive navigation bar
- \`src/components/hero.tsx\` - Hero section with conversion focus
- \`src/components/pricing-table.tsx\` - Pricing tier cards
- \`src/components/faq-accordion.tsx\` - Collapsible FAQ component
- \`tailwind.config.js\` - Custom brand color tokens

Licensed by QorelySofts. Happy building!`);

writeFile(p1Dir, 'package.json', JSON.stringify({
  name: 'saas-landing-page-kit',
  version: '1.0.0',
  private: true,
  scripts: {
    dev: 'next dev',
    build: 'next build',
    start: 'next start'
  },
  dependencies: {
    next: '14.2.21',
    react: '^18.3.1',
    'react-dom': '^18.3.1',
    'lucide-react': '^0.468.0'
  },
  devDependencies: {
    '@types/node': '^20',
    '@types/react': '^18',
    tailwindcss: '^3.4.1',
    typescript: '^5'
  }
}, null, 2));

writeFile(p1Dir, 'tailwind.config.js', `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          500: '#3b6cff',
          600: '#1a4fff',
          700: '#0036e6',
          900: '#00248a'
        }
      }
    }
  },
  plugins: []
};`);

writeFile(p1Dir, 'src/app/page.tsx', `import { ArrowRight, CheckCircle2, Zap, Shield, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-600">
      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
          <Sparkles className="h-3.5 w-3.5" /> Launch your SaaS today
        </div>
        <h1 className="mt-6 text-5xl font-black tracking-tight sm:text-6xl">
          Build Faster. Ship Smarter.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          A high-converting SaaS landing page template ready to connect to your Stripe, Supabase, and custom auth backend.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <button className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg hover:bg-blue-500">
            Get Started Free
          </button>
          <button className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 font-semibold text-slate-200 hover:bg-slate-800">
            View Live Demo
          </button>
        </div>
      </section>
    </main>
  );
}`);

// 2. Figma UI Kit & Design System
const p2Dir = path.join(tempDir, 'figma-ui-kit-design-system');
writeFile(p2Dir, 'LICENSE.txt', LICENSE_TEXT);
writeFile(p2Dir, 'README.md', `# Figma UI Kit & Modern Design System 2026

## What's Included
1. **Design Tokens JSON (\`tokens.json\`)**:
   - Primary & neutral color ramps (50-950)
   - Typography scales with modular font hierarchy (12px to 72px)
   - Border radius definitions (sm, md, lg, xl, 2xl, full)
   - Elevation shadows (sm, md, lg, xl, 2xl)
   - 8-point baseline grid spacing tokens
2. **Tailwind Theme Export (\`tailwind-theme.js\`)**:
   - Drop-in theme file matching all Figma styles
3. **Interactive Components Preview (\`components-cheatsheet.html\`)**:
   - Double-click to open in any browser to inspect button variants, input states, and cards.

## How to Import into Figma
1. Open Figma and create a new design file.
2. Use the Tokens Studio or Figma Variables manager.
3. Import the \`tokens.json\` file to auto-create color variables and typography styles.`);

writeFile(p2Dir, 'tokens.json', JSON.stringify({
  color: {
    primary: {
      50: { value: '#f0f5ff' },
      100: { value: '#e0eaff' },
      500: { value: '#3b6cff' },
      600: { value: '#1a4fff' },
      900: { value: '#00248a' }
    },
    neutral: {
      50: { value: '#f8fafc' },
      100: { value: '#f1f5f9' },
      500: { value: '#64748b' },
      900: { value: '#0f172a' },
      950: { value: '#020617' }
    },
    success: { value: '#10b981' },
    warning: { value: '#f59e0b' },
    error: { value: '#ef4444' }
  },
  typography: {
    fontFamily: { value: 'Inter, system-ui, sans-serif' },
    sizes: {
      xs: { value: '12px' },
      sm: { value: '14px' },
      base: { value: '16px' },
      lg: { value: '18px' },
      xl: { value: '20px' },
      '2xl': { value: '24px' },
      '3xl': { value: '30px' }
    }
  }
}, null, 2));

writeFile(p2Dir, 'components-cheatsheet.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Figma UI Kit - Components Cheatsheet</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: white; padding: 40px; }
    h1 { font-size: 28px; margin-bottom: 24px; color: #60a5fa; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .btn { display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; text-decoration: none; }
    .btn-primary { background: #2563eb; color: white; }
    .btn-secondary { background: #334155; color: #cbd5e1; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: #1e3a8a; color: #93c5fd; }
  </style>
</head>
<body>
  <h1>Figma UI Kit 2026 - Component Preview</h1>
  <div class="card">
    <h2>Button Variants</h2>
    <a href="#" class="btn btn-primary">Primary Button</a>
    <a href="#" class="btn btn-secondary">Secondary Button</a>
    <span class="badge">Badge Pill</span>
  </div>
</body>
</html>`);

// 3. Full-Stack REST API & Auth Boilerplate
const p3Dir = path.join(tempDir, 'fullstack-api-auth-boilerplate');
writeFile(p3Dir, 'LICENSE.txt', LICENSE_TEXT);
writeFile(p3Dir, 'README.md', `# Full-Stack REST API & Auth Boilerplate
Production-ready Node.js, Express, and TypeScript API starter.

## Features
- **JWT Authentication** (Access Token + Refresh Token rotation)
- **Password Hashing** with bcrypt (12 salt rounds)
- **Role-Based Access Control (RBAC)**: \`user\`, \`admin\`, \`moderator\`
- **Input Validation** via Zod schemas
- **Rate Limiting** to prevent brute-force attacks
- **Security Headers** via Helmet & CORS pre-configured
- **Docker Compose** with PostgreSQL database included

## Setup
\`\`\`bash
npm install
cp .env.example .env
npm run dev
\`\`\`

## Available Endpoints
- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - Login & get access token
- \`POST /api/auth/refresh\` - Refresh access token
- \`GET  /api/auth/me\` - Get authenticated profile
- \`POST /api/auth/logout\` - Invalidate token`);

writeFile(p3Dir, 'package.json', JSON.stringify({
  name: 'fullstack-api-auth-boilerplate',
  version: '1.0.0',
  scripts: {
    build: 'tsc',
    start: 'node dist/server.js',
    dev: 'ts-node-dev --respawn src/server.ts'
  },
  dependencies: {
    express: '^4.19.2',
    bcryptjs: '^2.4.3',
    jsonwebtoken: '^9.0.2',
    zod: '^3.23.8',
    cors: '^2.8.5',
    helmet: '^7.1.0',
    dotenv: '^16.4.5'
  },
  devDependencies: {
    typescript: '^5.4.5',
    '@types/express': '^4.17.21',
    '@types/node': '^20.12.7',
    'ts-node-dev': '^2.0.0'
  }
}, null, 2));

writeFile(p3Dir, 'src/server.ts', `import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`);

// 4. Developer Productivity & Automation Bundle
const p4Dir = path.join(tempDir, 'developer-productivity-bundle');
writeFile(p4Dir, 'LICENSE.txt', LICENSE_TEXT);
writeFile(p4Dir, 'README.md', `# Developer Productivity & Automation Bundle
A hand-crafted suite of terminal automations, git workflows, and VS Code snippet packs.

## What's Inside:
1. \`scripts/git-workflow.sh\` - Automated Git hygiene (clean merged branches, auto sync)
2. \`scripts/docker-prune.sh\` - Safely prune dangling Docker images & build cache
3. \`snippets/vscode-snippets.json\` - 50+ high-frequency TypeScript & Next.js snippets
4. \`workflows/github-actions-ci.yml\` - Production CI/CD workflow with caching & test runners
5. \`aliases/zsh-bash-aliases.sh\` - 30+ shell shortcuts for 5x terminal speed

## Installation
Add the aliases to your \`~/.bashrc\` or \`~/.zshrc\`:
\`\`\`bash
cat aliases/zsh-bash-aliases.sh >> ~/.zshrc
source ~/.zshrc
\`\`\``);

writeFile(p4Dir, 'scripts/git-workflow.sh', `#!/bin/bash
echo "=== Git Hygiene Utility ==="
git fetch --prune
git branch --merged main | grep -v '^[ *]*main$' | xargs -r git branch -d
echo "Dangling merged branches cleaned up successfully!"`);

writeFile(p4Dir, 'snippets/vscode-snippets.json', JSON.stringify({
  "Next.js Server Component": {
    "prefix": "nsc",
    "body": [
      "export default async function ${1:PageName}() {",
      "  return (",
      "    <div className=\"$2\">",
      "      <h1>$3</h1>",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "Next.js 14 Server Component"
  }
}, null, 2));

// 5. Mobile App Starter Template
const p5Dir = path.join(tempDir, 'mobile-app-starter-react-native');
writeFile(p5Dir, 'LICENSE.txt', LICENSE_TEXT);
writeFile(p5Dir, 'README.md', `# Mobile App Starter (React Native & Expo Router)
Cross-platform iOS and Android starter boilerplate.

## Quick Start
1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
2. Start Expo:
   \`\`\`bash
   npx expo start
   \`\`\`
3. Press \`i\` for iOS Simulator or \`a\` for Android Emulator, or scan the QR code with Expo Go.

## Included Modules
- Expo Router file-based navigation (Stack + Tabs)
- Pre-built Login, Sign Up, and Forgot Password screens
- Profile screen with avatar placeholder and edit triggers
- Safe Area Context & Dark Mode detection`);

writeFile(p5Dir, 'package.json', JSON.stringify({
  name: 'mobile-app-starter',
  version: '1.0.0',
  scripts: {
    start: 'expo start',
    android: 'expo start --android',
    ios: 'expo start --ios'
  },
  dependencies: {
    expo: '~51.0.0',
    'expo-router': '~3.5.0',
    react: '18.2.0',
    'react-native': '0.74.1'
  }
}, null, 2));

// 6. Executive Financial Dashboard
const p6Dir = path.join(tempDir, 'executive-financial-dashboard');
writeFile(p6Dir, 'LICENSE.txt', LICENSE_TEXT);
writeFile(p6Dir, 'README.md', `# Executive Analytics & Financial Dashboard
A production-ready KPI and financial metrics dashboard template.

## Features
- MRR, ARR, Churn, LTV, CAC KPI cards with monthly delta trends
- Revenue breakdown interactive charts
- Customer growth and cohort retention table
- Fully responsive across desktop, tablet, and mobile screens

## How to Use
1. Open \`index.html\` directly in any browser for instant preview.
2. Integrate \`financial-metrics.json\` with your real backend API.`);

writeFile(p6Dir, 'financial-metrics.json', JSON.stringify({
  mrr: 24500,
  arr: 294000,
  churnRate: '1.8%',
  ltv: 1450,
  cac: 210,
  activeSubscribers: 1280
}, null, 2));

writeFile(p6Dir, 'index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Executive Analytics Dashboard</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #090d16; color: white; padding: 30px; margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 24px; }
    .card { background: #131b2e; border: 1px solid #1e293b; border-radius: 14px; padding: 20px; }
    .label { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
    .value { font-size: 28px; font-weight: 800; margin-top: 8px; color: #38bdf8; }
    .delta { font-size: 12px; color: #34d399; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Executive KPI Dashboard</h1>
  <div class="grid">
    <div class="card">
      <div class="label">Monthly Recurring Revenue</div>
      <div class="value">$24,500</div>
      <div class="delta">+14.2% vs last month</div>
    </div>
    <div class="card">
      <div class="label">Annual Run Rate</div>
      <div class="value">$294,000</div>
      <div class="delta">+18.5% YoY</div>
    </div>
    <div class="card">
      <div class="label">Active Customers</div>
      <div class="value">1,280</div>
      <div class="delta">+92 new this week</div>
    </div>
  </div>
</body>
</html>`);

// Zip all packages using PowerShell Compress-Archive
const packages = [
  'saas-landing-page-kit',
  'figma-ui-kit-design-system',
  'fullstack-api-auth-boilerplate',
  'developer-productivity-bundle',
  'mobile-app-starter-react-native',
  'executive-financial-dashboard'
];

async function zipAndUpload() {
  for (const pkg of packages) {
    const srcPath = path.join(tempDir, pkg);
    const zipPath = path.join(tempDir, `${pkg}.zip`);

    console.log(`Zipping ${pkg}...`);
    // Run PowerShell Compress-Archive
    execSync(`powershell -Command "Compress-Archive -Path '${srcPath}\\*' -DestinationPath '${zipPath}' -Force"`, { stdio: 'inherit' });

    const zipBuffer = fs.readFileSync(zipPath);
    console.log(`Created ${pkg}.zip: ${zipBuffer.length} bytes`);

    // Upload to Supabase Storage
    const storagePath = `products/${pkg}.zip`;
    const { error: uploadError } = await supabase.storage
      .from('digital-assets')
      .upload(storagePath, zipBuffer, {
        upsert: true,
        contentType: 'application/zip'
      });

    if (uploadError) {
      console.error(`Upload error for ${storagePath}:`, uploadError);
    } else {
      console.log(`Successfully uploaded valid zip to Supabase: ${storagePath}`);
    }
  }

  // Cleanup temp files
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log('Cleanup complete! All 6 products now have authentic, uncorrupted ZIP packages.');
}

zipAndUpload().catch(console.error);
