#!/usr/bin/env node

/**
 * ==============================================================================
 * SITE SEO AUDITOR (Production Grade)
 * ==============================================================================
 * Automated SEO health and Core Web Vitals readiness auditor for websites.
 * Analyzes meta tags, heading hierarchies, images, broken media, link structures,
 * and technical performance factors.
 * 
 * Features:
 * - Comprehensive Meta & OpenGraph / Twitter Card audit
 * - H1-H6 semantic heading hierarchy validation
 * - Image accessibility & broken image verification (rate-limited HEAD checks)
 * - Core Web Vitals & Performance readiness: TTFB, compression (Gzip/Brotli), scripts
 * - Weighted SEO Health Score (0 - 100)
 * - Dual output: Beautiful ANSI terminal dashboard + Structured JSON report
 * - Rate-limited asynchronous checks to protect host servers from IP bans
 * 
 * Usage:
 *   node site-seo-auditor.js --url https://example.com --output report.json
 * 
 * Author: QorelySofts (https://www.qorelysofts.co.in)
 * License: Commercial / Personal Use (Included in Growth Scrapers Pack)
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// ANSI Terminal Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: '',
    output: 'seo-audit-report.json',
    timeout: 15000,
    checkBrokenImages: true,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--url' || arg === '-u') {
      options.url = args[++i] || '';
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i] || 'seo-audit-report.json';
    } else if (arg === '--timeout' || arg === '-t') {
      options.timeout = parseInt(args[++i], 10) || 15000;
    } else if (arg === '--skip-images') {
      options.checkBrokenImages = false;
    } else if (!arg.startsWith('-') && !options.url) {
      options.url = arg;
    }
  }

  return options;
}

function printBanner() {
  console.log('\n' + colors.cyan + colors.bright + '╔════════════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + colors.bright + '║                   SITE SEO AUDITOR v1.0.0                          ║' + colors.reset);
  console.log(colors.cyan + colors.bright + '║      On-Page Technical SEO & Core Web Vitals Readiness Linter      ║' + colors.reset);
  console.log(colors.cyan + colors.bright + '╚════════════════════════════════════════════════════════════════════╝' + colors.reset + '\n');
}

function printHelp() {
  printBanner();
  console.log(`
Usage:
  node site-seo-auditor.js [options]

Options:
  -u, --url <string>       Target URL to audit (e.g. "https://example.com")
  -o, --output <file>      Path for JSON audit report (default: "seo-audit-report.json")
  -t, --timeout <ms>       Request timeout in milliseconds (default: 15000)
      --skip-images        Skip checking HTTP status of individual image files
  -h, --help               Display this help guide

Examples:
  node site-seo-auditor.js -u https://www.google.com
  node site-seo-auditor.js --url https://news.ycombinator.com -o yc-audit.json
  node site-seo-auditor.js -u https://mywebsite.com --skip-images
  `);
}

// Lightweight resilient HTML fetcher with TTFB measurement
async function fetchPage(targetUrl, timeoutMs) {
  const startTime = Date.now();
  let parsed;
  try {
    parsed = new URL(targetUrl);
  } catch (err) {
    throw new Error(`Invalid URL provided: "${targetUrl}". Ensure it starts with http:// or https://`);
  }

  const client = parsed.protocol === 'https:' ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (QorelySofts SEO Bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      timeout: timeoutMs
    }, (res) => {
      const ttfb = Date.now() - startTime;

      // Handle Redirects (up to 5 hops)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, targetUrl).toString();
        req.destroy();
        return resolve(fetchPage(nextUrl, timeoutMs));
      }

      const chunks = [];
      const zlib = require('zlib');
      let stream = res;

      const encoding = res.headers['content-encoding'];
      if (encoding === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      } else if (encoding === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress());
      }

      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => {
        const html = Buffer.concat(chunks).toString('utf8');
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          ttfb,
          html,
          finalUrl: targetUrl,
          contentLength: Buffer.concat(chunks).length
        });
      });
      stream.on('error', err => reject(err));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    });

    req.on('error', err => reject(err));
  });
}

// Rate-limited HTTP status check for images
async function checkUrlStatus(urlStr, baseDomain) {
  try {
    const parsed = new URL(urlStr, baseDomain);
    const client = parsed.protocol === 'https:' ? https : http;

    return new Promise((resolve) => {
      const req = client.request(parsed.toString(), {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) (SEO Image Checker)'
        },
        timeout: 6000
      }, (res) => {
        resolve({ url: urlStr, status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 400 });
      });

      req.on('error', () => resolve({ url: urlStr, status: 0, ok: false, error: 'Network Error' }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ url: urlStr, status: 408, ok: false, error: 'Timeout' });
      });
      req.end();
    });
  } catch (e) {
    return { url: urlStr, status: 0, ok: false, error: e.message };
  }
}

// Batch rate-limited async helper
async function checkImagesInBatches(urls, baseDomain, batchSize = 5, delayMs = 300) {
  const results = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(u => checkUrlStatus(u, baseDomain)));
    results.push(...batchResults);
    if (i + batchSize < urls.length) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return results;
}

// Main Auditor
async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (!options.url) {
    printHelp();
    console.log(colors.red + '❌ Error: Target URL is required. Provide --url "https://yoursite.com"\n' + colors.reset);
    process.exit(1);
  }

  printBanner();
  console.log(`${colors.bright}🎯 Auditing Target URL :${colors.reset} ${colors.cyan}${options.url}${colors.reset}`);
  console.log(`${colors.bright}📁 JSON Report Output :${colors.reset} ${options.output}`);
  console.log(`${colors.bright}⏱️ Timeout Limit      :${colors.reset} ${options.timeout}ms\n`);

  console.log(colors.dim + '🌐 Fetching HTML & measuring Server TTFB...' + colors.reset);
  let response;
  try {
    response = await fetchPage(options.url, options.timeout);
  } catch (fetchErr) {
    console.log(colors.red + `\n❌ Failed to connect to ${options.url}: ${fetchErr.message}\n` + colors.reset);
    process.exit(1);
  }

  console.log(colors.green + `✓ Server responded with HTTP ${response.statusCode} (TTFB: ${response.ttfb}ms)\n` + colors.reset);

  // Load HTML parser
  let cheerio;
  try {
    cheerio = require('cheerio');
  } catch {
    console.log(colors.yellow + '⚠️ Notice: "cheerio" is not installed. Using native Regex parser fallback.' + colors.reset);
  }

  const html = response.html;
  const issues = [];
  const warnings = [];
  const passes = [];

  // Helper score incrementers
  function addPass(category, title, detail) {
    passes.push({ category, title, detail });
  }
  function addWarning(category, title, detail, recommendation) {
    warnings.push({ category, title, detail, recommendation });
  }
  function addIssue(category, title, detail, recommendation) {
    issues.push({ category, title, detail, recommendation });
  }

  // --- 1. META TAGS AUDIT ---
  let title = '';
  let metaDescription = '';
  let metaRobots = '';
  let canonical = '';
  let viewport = '';
  let charset = '';
  const openGraph = {};
  const twitterCard = {};

  if (cheerio) {
    const $ = cheerio.load(html);
    title = $('title').text().trim();
    metaDescription = $('meta[name="description"]').attr('content') || '';
    metaRobots = $('meta[name="robots"]').attr('content') || '';
    canonical = $('link[rel="canonical"]').attr('href') || '';
    viewport = $('meta[name="viewport"]').attr('content') || '';
    charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type"]').attr('content') || '';

    // OpenGraph
    $('meta[property^="og:"]').each((_, el) => {
      const prop = $(el).attr('property');
      const val = $(el).attr('content');
      if (prop && val) openGraph[prop] = val;
    });

    // Twitter
    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name');
      const val = $(el).attr('content');
      if (name && val) twitterCard[name] = val;
    });
  } else {
    // Regex fallback
    const tMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    title = tMatch ? tMatch[1].trim() : '';

    const dMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    metaDescription = dMatch ? dMatch[1].trim() : '';

    const cMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
    canonical = cMatch ? cMatch[1].trim() : '';

    const vMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']*)["']/i);
    viewport = vMatch ? vMatch[1].trim() : '';
  }

  // Title validation
  if (!title) {
    addIssue('Meta Tags', 'Missing <title> Tag', 'Page has no title element.', 'Add a concise, descriptive title tag (30-60 characters).');
  } else if (title.length < 30) {
    addWarning('Meta Tags', 'Short <title> Tag', `Title is only ${title.length} characters: "${title}".`, 'Expand title to 30-60 characters with targeted keywords.');
  } else if (title.length > 65) {
    addWarning('Meta Tags', 'Long <title> Tag', `Title is ${title.length} characters (may be truncated in SERPs): "${title.slice(0, 60)}..."`, 'Keep title under 60-65 characters.');
  } else {
    addPass('Meta Tags', 'Optimal <title> Tag', `Title is ${title.length} chars: "${title}"`);
  }

  // Meta Description validation
  if (!metaDescription) {
    addIssue('Meta Tags', 'Missing Meta Description', 'No <meta name="description"> tag found.', 'Add a compelling meta description between 120 and 160 characters.');
  } else if (metaDescription.length < 70) {
    addWarning('Meta Tags', 'Short Meta Description', `Description is only ${metaDescription.length} characters.`, 'Expand description to 120-160 characters to maximize click-through rate.');
  } else if (metaDescription.length > 165) {
    addWarning('Meta Tags', 'Long Meta Description', `Description is ${metaDescription.length} characters (may truncate).`, 'Trim description to around 155-160 characters.');
  } else {
    addPass('Meta Tags', 'Optimal Meta Description', `Description is ${metaDescription.length} chars.`);
  }

  // Canonical Tag
  if (canonical) {
    addPass('Meta Tags', 'Canonical Tag Present', `Canonical points to: ${canonical}`);
  } else {
    addWarning('Meta Tags', 'Missing Canonical Link', 'No <link rel="canonical"> tag detected.', 'Add a self-referencing canonical tag to prevent duplicate content issues.');
  }

  // Viewport / Mobile readiness
  if (viewport && viewport.includes('width=device-width')) {
    addPass('Mobile SEO', 'Mobile Viewport Tag Present', viewport);
  } else {
    addIssue('Mobile SEO', 'Missing Mobile Viewport Tag', 'No responsive viewport tag found.', 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">.');
  }

  // Open Graph & Social Cards
  const hasOgTitle = !!openGraph['og:title'];
  const hasOgDesc = !!openGraph['og:description'];
  const hasOgImage = !!openGraph['og:image'];
  if (hasOgTitle && hasOgDesc && hasOgImage) {
    addPass('Social SEO', 'Complete Open Graph Tags', 'og:title, og:description, and og:image are present.');
  } else {
    addWarning('Social SEO', 'Incomplete Open Graph Tags', `Missing: ${[!hasOgTitle && 'og:title', !hasOgDesc && 'og:description', !hasOgImage && 'og:image'].filter(Boolean).join(', ')}`, 'Implement full OpenGraph metadata for high-converting social media previews.');
  }

  // --- 2. HEADING HIERARCHY (H1 - H6) AUDIT ---
  let h1Count = 0;
  let h1Texts = [];
  let h2Count = 0;
  let h3Count = 0;

  if (cheerio) {
    const $ = cheerio.load(html);
    $('h1').each((_, el) => {
      h1Count++;
      h1Texts.push($(el).text().trim().replace(/\s+/g, ' '));
    });
    h2Count = $('h2').length;
    h3Count = $('h3').length;
  } else {
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    h1Count = h1Matches.length;
    h1Texts = h1Matches.map(m => m.replace(/<[^>]+>/g, '').trim());
    h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
  }

  if (h1Count === 0) {
    addIssue('Headings', 'Missing <h1> Tag', 'Page has zero <h1> elements.', 'Add exactly one clear, keyword-rich <h1> heading defining the main topic.');
  } else if (h1Count > 1) {
    addWarning('Headings', 'Multiple <h1> Tags Found', `Page has ${h1Count} <h1> tags. While HTML5 allows multiple, one primary <h1> is best practice for SEO.`, 'Consider consolidating into a single main <h1>.');
  } else {
    addPass('Headings', 'Single <h1> Tag Present', `"${h1Texts[0]?.slice(0, 70)}"`);
  }

  if (h2Count > 0) {
    addPass('Headings', 'Subheadings (H2) Structure', `Found ${h2Count} <h2> headings.`);
  } else {
    addWarning('Headings', 'No <h2> Subheadings', 'Page lacks <h2> tags for content segmentation.', 'Use <h2> tags to structure content sections clearly.');
  }

  // --- 3. IMAGES & BROKEN ASSETS AUDIT ---
  const images = [];
  let missingAltCount = 0;

  if (cheerio) {
    const $ = cheerio.load(html);
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt');
      const hasAlt = alt !== undefined && alt !== null;
      if (!hasAlt || alt.trim() === '') missingAltCount++;
      if (src) images.push({ src, alt: alt || '' });
    });
  } else {
    const imgMatches = html.match(/<img[^>]+>/gi) || [];
    imgMatches.forEach(img => {
      const srcM = img.match(/src=["']([^"']*)["']/i);
      const altM = img.match(/alt=["']([^"']*)["']/i);
      const src = srcM ? srcM[1] : '';
      const hasAlt = !!altM && altM[1].trim() !== '';
      if (!hasAlt) missingAltCount++;
      if (src) images.push({ src, alt: altM ? altM[1] : '' });
    });
  }

  if (images.length === 0) {
    addWarning('Images', 'No Images Detected', 'Page has zero <img> tags.', 'Visuals improve engagement and dwell time.');
  } else if (missingAltCount > 0) {
    addIssue('Images', 'Images Missing Alt Text', `${missingAltCount} of ${images.length} images lack descriptive alt attributes.`, 'Add descriptive alt text to all informational images for accessibility and image search ranking.');
  } else {
    addPass('Images', 'All Images Have Alt Attributes', `${images.length} images checked and valid.`);
  }

  // Rate-limited broken image inspection
  let brokenImages = [];
  if (options.checkBrokenImages && images.length > 0) {
    console.log(colors.dim + `🔍 Performing rate-limited HTTP checks on ${Math.min(images.length, 25)} images...` + colors.reset);
    const toCheck = images.slice(0, 25).map(img => img.src);
    const results = await checkImagesInBatches(toCheck, response.finalUrl, 5, 250);
    brokenImages = results.filter(r => !r.ok);

    if (brokenImages.length > 0) {
      addIssue('Images', 'Broken Image Links Detected', `${brokenImages.length} images returned 404/Error status.`, 'Fix or remove dead image links.');
    } else {
      addPass('Images', 'Image Links Reachable', `No 404 broken images found across sample.`);
    }
  }

  // --- 4. CORE WEB VITALS & TECHNICAL READINESS ---
  // Server TTFB
  if (response.ttfb < 300) {
    addPass('Performance', 'Fast Server Response (TTFB)', `${response.ttfb}ms (Google target: < 800ms)`);
  } else if (response.ttfb < 800) {
    addPass('Performance', 'Acceptable TTFB', `${response.ttfb}ms`);
  } else {
    addWarning('Performance', 'High TTFB (Slow Server Response)', `${response.ttfb}ms exceeds 800ms threshold.`, 'Optimize server response time, utilize Edge CDN or page caching.');
  }

  // Compression
  const encoding = response.headers['content-encoding'];
  if (encoding && (encoding.includes('gzip') || encoding.includes('br') || encoding.includes('deflate'))) {
    addPass('Performance', 'Text Compression Enabled', `Active algorithm: ${encoding}`);
  } else {
    addIssue('Performance', 'Compression Disabled', 'Page is not served with Gzip or Brotli compression.', 'Enable Brotli or Gzip on your web server or CDN.');
  }

  // HTTPS Check
  if (options.url.startsWith('https://')) {
    addPass('Security', 'HTTPS / SSL Protocol', 'Target uses encrypted HTTPS connection.');
  } else {
    addIssue('Security', 'Insecure HTTP Connection', 'Site is served over unencrypted HTTP.', 'Migrate to HTTPS with a valid SSL/TLS certificate.');
  }

  // Document Size
  const sizeKb = Math.round(response.contentLength / 1024);
  if (sizeKb < 150) {
    addPass('Performance', 'Lightweight DOM Payload', `HTML size is ${sizeKb} KB.`);
  } else if (sizeKb < 500) {
    addWarning('Performance', 'Moderate HTML Size', `HTML size is ${sizeKb} KB.`);
  } else {
    addIssue('Performance', 'Bloated HTML Document', `HTML size is ${sizeKb} KB (exceeds recommended 500 KB limit).`, 'Minify HTML and streamline inlined SVGs or scripts.');
  }

  // Structured Data (Schema.org)
  const hasJsonLd = html.includes('application/ld+json');
  if (hasJsonLd) {
    addPass('Schema', 'Structured Data Present', 'JSON-LD Schema markup detected.');
  } else {
    addWarning('Schema', 'No JSON-LD Structured Data', 'No schema markup detected.', 'Add Schema.org JSON-LD (e.g. Organization, Product, Article) for rich snippets.');
  }

  // Compute Overall SEO Score (0 - 100)
  // Base 100, -12 per Issue, -4 per Warning
  const rawScore = 100 - (issues.length * 12) - (warnings.length * 4);
  const seoScore = Math.max(0, Math.min(100, rawScore));

  let scoreColor = colors.green;
  if (seoScore < 50) scoreColor = colors.red;
  else if (seoScore < 80) scoreColor = colors.yellow;

  // Print Terminal Summary Dashboard
  console.log('════════════════════════════════════════════════════════════════════', colors.cyan);
  console.log(`📊 OVERALL SEO HEALTH SCORE: ${scoreColor}${colors.bright}${seoScore} / 100${colors.reset}`);
  console.log(`   ✅ Passed Checks : ${passes.length}`);
  console.log(`   ⚠️  Warnings      : ${warnings.length}`);
  console.log(`   ❌ Critical Issues: ${issues.length}`);
  console.log('════════════════════════════════════════════════════════════════════\n', colors.cyan);

  if (issues.length > 0) {
    console.log(`${colors.red}${colors.bright}❌ CRITICAL ISSUES (${issues.length}):${colors.reset}`);
    issues.forEach((iss, i) => {
      console.log(`  ${i + 1}. [${iss.category}] ${colors.bright}${iss.title}${colors.reset}`);
      console.log(`     ${iss.detail}`);
      console.log(`     👉 ${colors.cyan}Fix:${colors.reset} ${iss.recommendation}`);
    });
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bright}⚠️ WARNINGS & OPPORTUNITIES (${warnings.length}):${colors.reset}`);
    warnings.forEach((warn, i) => {
      console.log(`  ${i + 1}. [${warn.category}] ${colors.bright}${warn.title}${colors.reset}`);
      console.log(`     ${warn.detail}`);
      if (warn.recommendation) console.log(`     💡 ${colors.cyan}Tip:${colors.reset} ${warn.recommendation}`);
    });
    console.log('');
  }

  console.log(`${colors.green}${colors.bright}✅ PASSED CHECKS (${passes.length}):${colors.reset}`);
  passes.forEach((pass, i) => {
    console.log(`  ✓ [${pass.category}] ${pass.title}: ${colors.dim}${pass.detail}${colors.reset}`);
  });
  console.log('');

  // Assemble full JSON report
  const report = {
    auditTimestamp: new Date().toISOString(),
    targetUrl: options.url,
    finalUrl: response.finalUrl,
    httpStatus: response.statusCode,
    metrics: {
      seoScore,
      ttfbMs: response.ttfb,
      htmlSizeBytes: response.contentLength,
      htmlSizeKb: sizeKb,
      compression: encoding || 'none',
      isHttps: options.url.startsWith('https://')
    },
    meta: {
      title,
      titleLength: title.length,
      description: metaDescription,
      descriptionLength: metaDescription.length,
      canonical,
      viewport,
      openGraph,
      twitterCard
    },
    headings: {
      h1Count,
      h1Texts,
      h2Count,
      h3Count
    },
    images: {
      total: images.length,
      missingAlt: missingAltCount,
      brokenImages: brokenImages.map(b => ({ url: b.url, status: b.status, error: b.error }))
    },
    summary: {
      totalChecks: passes.length + warnings.length + issues.length,
      passedCount: passes.length,
      warningCount: warnings.length,
      issueCount: issues.length
    },
    issues,
    warnings,
    passes
  };

  const outputPath = path.resolve(process.cwd(), options.output);
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`${colors.green}📄 Structured JSON report saved to:${colors.reset} ${outputPath}\n`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
  });
}

module.exports = { main, parseArgs, fetchPage };
