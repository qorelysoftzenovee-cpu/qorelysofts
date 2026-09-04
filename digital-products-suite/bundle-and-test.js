#!/usr/bin/env node

/**
 * ==============================================================================
 * BUNDLE & TEST — Digital Products Suite Verification & Packaging Script
 * ==============================================================================
 * Iterates through all 10 product folders, verifies required files exist,
 * runs a quick syntax/dry-run test, and packages each folder into
 * /dist/product-01.zip through /dist/product-10.zip.
 *
 * Usage:
 *   node bundle-and-test.js              # Full verify + zip
 *   node bundle-and-test.js --verify     # Verify only, no zip
 *   node bundle-and-test.js --zip-only   # Skip verification, just zip
 *
 * Author: QorelySofts (https://www.qorelysofts.co.in)
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI Colors
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', magenta: '\x1b[35m'
};

const PRODUCTS_DIR = path.join(__dirname, 'products');
const DIST_DIR = path.join(__dirname, 'dist');

/** Product manifest: folder name, display name, required files */
const PRODUCTS = [
  {
    folder: '01-tailwind-landing-kit',
    name: 'Tailwind Landing Kit',
    requiredFiles: ['package.json', 'README.md', 'index.ts'],
    syntaxFiles: ['index.ts']
  },
  {
    folder: '02-auth-rbac-boilerplate',
    name: 'Auth RBAC Boilerplate',
    requiredFiles: ['package.json', 'README.md', 'tsconfig.json', 'src/index.ts'],
    syntaxFiles: []
  },
  {
    folder: '03-gmaps-lead-scraper',
    name: 'GMaps Lead Scraper',
    requiredFiles: ['package.json', 'README.md', 'scraper.js'],
    syntaxFiles: ['scraper.js']
  },
  {
    folder: '04-nextjs-seo-auditor',
    name: 'Next.js SEO Auditor',
    requiredFiles: ['package.json', 'README.md', 'seo-check.js'],
    syntaxFiles: ['seo-check.js']
  },
  {
    folder: '05-stripe-razorpay-webhooks-handler',
    name: 'Stripe & Razorpay Webhooks Handler',
    requiredFiles: ['package.json', 'README.md', 'src/webhooks/stripe-handler.ts', 'src/webhooks/razorpay-handler.ts'],
    syntaxFiles: []
  },
  {
    folder: '06-csv-to-sqlite-converter',
    name: 'CSV to SQLite Converter',
    requiredFiles: ['package.json', 'README.md', 'converter.js'],
    syntaxFiles: ['converter.js']
  },
  {
    folder: '07-api-rate-limiter-redis',
    name: 'API Rate Limiter (Redis)',
    requiredFiles: ['package.json', 'README.md', 'src/rate-limiter.js'],
    syntaxFiles: ['src/rate-limiter.js']
  },
  {
    folder: '08-markdown-docs-generator',
    name: 'Markdown Docs Generator',
    requiredFiles: ['package.json', 'README.md', 'generator.js'],
    syntaxFiles: ['generator.js']
  },
  {
    folder: '09-system-health-monitor',
    name: 'System Health Monitor',
    requiredFiles: ['package.json', 'README.md', 'monitor.js'],
    syntaxFiles: ['monitor.js']
  },
  {
    folder: '10-social-og-image-generator',
    name: 'Social OG Image Generator',
    requiredFiles: ['package.json', 'README.md'],
    syntaxFiles: []
  }
];

// CLI args
const args = process.argv.slice(2);
const verifyOnly = args.includes('--verify');
const zipOnly = args.includes('--zip-only');

function printBanner() {
  console.log('\n' + C.cyan + C.bold);
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║       DIGITAL PRODUCTS SUITE — BUNDLE & TEST RUNNER v1.0.0           ║');
  console.log('║            Verify, Syntax Check, and Package All 10 Products         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');
  console.log(C.reset + '\n');
}

function fileExists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

function dirExists(dirPath) {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

function syntaxCheckJS(filePath) {
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    return { ok: true };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString().trim() : 'Unknown syntax error';
    return { ok: false, error: stderr };
  }
}

function countFiles(dirPath) {
  let count = 0;
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else count++;
    }
  }
  walk(dirPath);
  return count;
}

function zipFolder(srcDir, destZip) {
  try {
    if (fs.existsSync(destZip)) fs.unlinkSync(destZip);
    const srcContents = srcDir + '\\*';
    execSync(
      `powershell -Command "Compress-Archive -Path '${srcContents}' -DestinationPath '${destZip}' -Force"`,
      { stdio: 'pipe' }
    );
    const stat = fs.statSync(destZip);
    // Verify ZIP header
    const fd = fs.openSync(destZip, 'r');
    const buf = Buffer.alloc(4);
    fs.readSync(fd, buf, 0, 4, 0);
    fs.closeSync(fd);
    const valid = buf.toString('hex') === '504b0304';
    return { ok: true, size: stat.size, validZip: valid };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function verifyProduct(product) {
  const dir = path.join(PRODUCTS_DIR, product.folder);
  const result = {
    name: product.name,
    folder: product.folder,
    exists: false,
    missingFiles: [],
    syntaxErrors: [],
    fileCount: 0,
    passed: false
  };

  // 1. Check directory exists
  if (!dirExists(dir)) {
    result.missingFiles.push('[ENTIRE FOLDER MISSING]');
    return result;
  }
  result.exists = true;
  result.fileCount = countFiles(dir);

  // 2. Check required files
  for (const req of product.requiredFiles) {
    const fullPath = path.join(dir, req);
    if (!fileExists(fullPath)) {
      result.missingFiles.push(req);
    }
  }

  // 3. Syntax check JS files
  for (const jsFile of product.syntaxFiles) {
    const fullPath = path.join(dir, jsFile);
    if (fileExists(fullPath)) {
      const check = syntaxCheckJS(fullPath);
      if (!check.ok) {
        result.syntaxErrors.push({ file: jsFile, error: check.error });
      }
    }
  }

  // 4. Validate package.json is valid JSON
  const pkgPath = path.join(dir, 'package.json');
  if (fileExists(pkgPath)) {
    try {
      const pkgContent = fs.readFileSync(pkgPath, 'utf8');
      JSON.parse(pkgContent);
    } catch (e) {
      result.syntaxErrors.push({ file: 'package.json', error: 'Invalid JSON: ' + e.message });
    }
  }

  result.passed = result.missingFiles.length === 0 && result.syntaxErrors.length === 0;
  return result;
}

function main() {
  printBanner();

  const totalStart = Date.now();
  let passCount = 0;
  let failCount = 0;
  const results = [];
  const zipResults = [];

  // ─── VERIFICATION PHASE ───
  if (!zipOnly) {
    console.log(C.bold + '━━━ PHASE 1: VERIFICATION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' + C.reset);

    for (let i = 0; i < PRODUCTS.length; i++) {
      const product = PRODUCTS[i];
      const num = String(i + 1).padStart(2, '0');
      process.stdout.write(`  [${num}/10] ${product.name.padEnd(38)} `);

      const result = verifyProduct(product);
      results.push(result);

      if (result.passed) {
        passCount++;
        console.log(C.green + `✅ PASSED  (${result.fileCount} files)` + C.reset);
      } else {
        failCount++;
        console.log(C.red + `❌ FAILED` + C.reset);
        if (result.missingFiles.length > 0) {
          console.log(C.red + `     Missing: ${result.missingFiles.join(', ')}` + C.reset);
        }
        for (const se of result.syntaxErrors) {
          console.log(C.red + `     Syntax Error in ${se.file}: ${se.error.split('\n')[0]}` + C.reset);
        }
      }
    }

    console.log('\n' + C.bold + '─────────────────────────────────────────────────────────────────────────' + C.reset);
    console.log(`  ${C.green}✅ Passed: ${passCount}${C.reset}    ${failCount > 0 ? C.red : C.dim}❌ Failed: ${failCount}${C.reset}    Total: ${PRODUCTS.length}`);
    console.log(C.bold + '─────────────────────────────────────────────────────────────────────────\n' + C.reset);
  }

  // ─── PACKAGING PHASE ───
  if (!verifyOnly) {
    console.log(C.bold + '━━━ PHASE 2: PACKAGING (.zip) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' + C.reset);

    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
    }

    for (let i = 0; i < PRODUCTS.length; i++) {
      const product = PRODUCTS[i];
      const num = String(i + 1).padStart(2, '0');
      const srcDir = path.join(PRODUCTS_DIR, product.folder);
      const destZip = path.join(DIST_DIR, `product-${num}.zip`);

      process.stdout.write(`  [${num}/10] Packaging ${product.name.padEnd(35)} `);

      if (!dirExists(srcDir)) {
        console.log(C.yellow + `⚠️ SKIPPED (folder missing)` + C.reset);
        zipResults.push({ name: product.name, ok: false });
        continue;
      }

      const zipResult = zipFolder(srcDir, destZip);
      zipResults.push(zipResult);

      if (zipResult.ok && zipResult.validZip) {
        const sizeKb = (zipResult.size / 1024).toFixed(1);
        console.log(C.green + `📦 ${sizeKb} KB  ✓ Valid ZIP` + C.reset);
      } else if (zipResult.ok && !zipResult.validZip) {
        console.log(C.yellow + `⚠️ Zipped but invalid PK header` + C.reset);
      } else {
        console.log(C.red + `❌ ${zipResult.error}` + C.reset);
      }
    }

    console.log('\n' + C.bold + '─────────────────────────────────────────────────────────────────────────' + C.reset);
    const zippedOk = zipResults.filter(z => z.ok).length;
    console.log(`  📦 Successfully packaged: ${zippedOk}/${PRODUCTS.length} products`);
    console.log(`  📂 Output directory: ${DIST_DIR}`);
    console.log(C.bold + '─────────────────────────────────────────────────────────────────────────\n' + C.reset);
  }

  // ─── SUMMARY ───
  const elapsed = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log(C.cyan + C.bold + `🎉 Complete! Total time: ${elapsed}s` + C.reset + '\n');

  if (failCount > 0 && !zipOnly) {
    process.exit(1);
  }
}

main();
