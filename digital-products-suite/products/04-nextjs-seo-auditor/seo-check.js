#!/usr/bin/env node
/**
 * @file seo-check.js
 * @description Production-grade CLI SEO Auditor for Next.js and modern web applications.
 * Performs deep audits including meta tags, OpenGraph, Twitter Cards, heading hierarchy,
 * broken images, JSON-LD Schema, and performance metrics (TTFB, compression, HTML size).
 * Supports Cheerio with automatic Regex fallback, and outputs colored terminal dashboards,
 * JSON reports, and Markdown summaries.
 * @author QorelySofts
 * @license MIT
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import zlib from 'zlib';
import { URL } from 'url';

// ============================================================================
// ANSI Styling Helpers
// ============================================================================
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgYellow: '\x1b[43m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m',
  bgCyan: '\x1b[46m\x1b[30m',
  bgBlue: '\x1b[44m\x1b[37m',
  white: '\x1b[37m',
};

const symbols = {
  pass: `${colors.green}✔ PASS${colors.reset}`,
  warn: `${colors.yellow}⚠ WARN${colors.reset}`,
  fail: `${colors.red}✖ FAIL${colors.reset}`,
  info: `${colors.cyan}ℹ INFO${colors.reset}`,
};

// ============================================================================
// CLI Arguments Parsing & Documentation
// ============================================================================
/**
 * Displays command-line help documentation and exits.
 */
function printHelp() {
  console.log(`
${colors.cyan}${colors.bold}===================================================================
               NEXT.JS SEO AUDITOR - CLI REFERENCE
                     Created by QorelySofts
===================================================================${colors.reset}

${colors.bold}USAGE:${colors.reset}
  node seo-check.js --url <target-url> [OPTIONS]
  npm run audit -- --url <target-url> [OPTIONS]

${colors.bold}OPTIONS:${colors.reset}
  ${colors.green}--url, -u${colors.reset} <string>         Target URL to audit (e.g. "https://example.com")
                               [Required]
  ${colors.green}--output, -o${colors.reset} <path>        Base file path for output reports
                               [Default: "report.json"]
  ${colors.green}--format, -f${colors.reset} <list>        Output formats: "json", "markdown", or "json,markdown"
                               [Default: "json"]
  ${colors.green}--timeout, -t${colors.reset} <ms>         HTTP request timeout in milliseconds
                               [Default: 15000]
  ${colors.green}--skip-images${colors.reset}              Skip network HEAD checks for broken images
                               [Default: false]
  ${colors.green}--help, -h${colors.reset}                 Show this help manual and exit

${colors.bold}EXAMPLES:${colors.reset}
  node seo-check.js --url "https://nextjs.org"
  node seo-check.js -u "https://my-app.vercel.app" --format json,markdown --output ./audits/seo
  node seo-check.js --url "https://store.example.com" --skip-images --timeout 20000

${colors.bold}FEATURES & CHECKS:${colors.reset}
  • Core Metadata       : Title (30-60 chars), Description (120-160 chars), Canonical, Viewport, Robots
  • Social Sharing      : Complete OpenGraph (og:*) and Twitter Card (twitter:*) protocol tags
  • Heading Hierarchy   : Single H1 check, H2/H3 distribution, heading text extraction
  • Image Optimization  : Missing alt tags detection & concurrent HEAD requests for broken images
  • Performance & Tech  : Real-time TTFB measurement, gzip/brotli decompression, HTML size, HTTPS
  • Schema.org (JSON-LD): Extraction, syntax validation, and structured entity type detection
  • Transparent Scoring : 100-point weighted rating scale with clear actionable fixes
`);
  process.exit(0);
}

/**
 * Parses process command-line arguments.
 * @returns {object} Options object
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: '',
    output: 'report.json',
    format: 'json',
    timeout: 15000,
    skipImages: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--help' || arg === '-h') {
      printHelp();
    } else if ((arg === '--url' || arg === '-u') && nextArg) {
      config.url = nextArg;
      i++;
    } else if ((arg === '--output' || arg === '-o') && nextArg) {
      config.output = nextArg;
      i++;
    } else if ((arg === '--format' || arg === '-f') && nextArg) {
      config.format = nextArg.toLowerCase();
      i++;
    } else if ((arg === '--timeout' || arg === '-t') && nextArg) {
      config.timeout = parseInt(nextArg, 10) || 15000;
      i++;
    } else if (arg === '--skip-images') {
      config.skipImages = true;
    } else if (arg.startsWith('--url=')) {
      config.url = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      config.output = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      config.format = arg.split('=')[1].toLowerCase();
    } else if (arg.startsWith('--timeout=')) {
      config.timeout = parseInt(arg.split('=')[1], 10) || 15000;
    }
  }

  if (!config.url) {
    console.error(`\n${colors.red}${colors.bold}Error: Missing required argument --url <target-url>${colors.reset}`);
    console.log(`Run ${colors.cyan}node seo-check.js --help${colors.reset} for full usage instructions.\n`);
    process.exit(1);
  }

  // Ensure protocol
  if (!/^https?:\/\//i.test(config.url)) {
    config.url = 'https://' + config.url;
  }

  return config;
}

// ============================================================================
// Network Fetching with Redirect Following & Decompression
// ============================================================================
/**
 * Fetches target URL with redirect handling, TTFB measurement, and decompression.
 * @param {string} targetUrl - URL to fetch
 * @param {number} timeoutMs - Timeout in ms
 * @param {number} maxRedirects - Max redirects allowed
 * @param {string[]} redirectChain - Chain accumulator
 * @returns {Promise<object>} Response details
 */
async function fetchWithDecompression(targetUrl, timeoutMs = 15000, maxRedirects = 5, redirectChain = []) {
  if (redirectChain.length > maxRedirects) {
    throw new Error(`Exceeded maximum redirect limit of ${maxRedirects} hops`);
  }

  redirectChain.push(targetUrl);
  const parsedUrl = new URL(targetUrl);
  const isHttps = parsedUrl.protocol === 'https:';
  const client = isHttps ? https : http;

  const headers = {
    'User-Agent': 'NextJs-SEO-Auditor/1.0 (+https://github.com/QorelySofts/nextjs-seo-auditor)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'close',
  };

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (isHttps ? 443 : 80),
    path: parsedUrl.pathname + parsedUrl.search,
    method: 'GET',
    headers,
    timeout: timeoutMs,
  };

  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let ttfb = null;

    const req = client.request(options, (res) => {
      ttfb = Date.now() - startTime;
      const statusCode = res.statusCode || 200;

      // Handle 3xx redirects
      if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, targetUrl).href;
        res.resume(); // consume response data to free up memory
        return fetchWithDecompression(nextUrl, timeoutMs, maxRedirects, redirectChain)
          .then(resolve)
          .catch(reject);
      }

      // Check content encoding
      const encoding = (res.headers['content-encoding'] || '').toLowerCase();
      let stream = res;

      if (encoding === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress());
      } else if (encoding === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      }

      const chunks = [];
      let rawBytes = 0;

      res.on('data', (c) => {
        rawBytes += c.length;
      });

      stream.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });

      stream.on('end', () => {
        const bodyBuffer = Buffer.concat(chunks);
        const html = bodyBuffer.toString('utf-8');
        resolve({
          finalUrl: targetUrl,
          statusCode,
          headers: res.headers,
          ttfb,
          compression: encoding || 'none',
          html,
          sizeBytes: rawBytes || bodyBuffer.length,
          uncompressedBytes: bodyBuffer.length,
          redirectChain,
          isHttps,
        });
      });

      stream.on('error', (err) => {
        reject(new Error(`Decompression error: ${err.message}`));
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Connection timed out after ${timeoutMs}ms`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

/**
 * Sends a HEAD request to verify an image URL's status code.
 * @param {string} imageUrl - Absolute image URL
 * @param {number} timeoutMs - Timeout in ms
 * @returns {Promise<{url: string, status: number, ok: boolean}>}
 */
function checkImageStatus(imageUrl, timeoutMs = 6000) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(imageUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (isHttps ? 443 : 80),
          path: parsed.pathname + parsed.search,
          method: 'HEAD',
          headers: {
            'User-Agent': 'NextJs-SEO-Auditor/1.0 (+https://github.com/QorelySofts/nextjs-seo-auditor)',
          },
          timeout: timeoutMs,
        },
        (res) => {
          const status = res.statusCode || 0;
          resolve({
            url: imageUrl,
            status,
            ok: status >= 200 && status < 400,
          });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        resolve({ url: imageUrl, status: 408, ok: false, error: 'Timeout' });
      });

      req.on('error', (err) => {
        resolve({ url: imageUrl, status: 0, ok: false, error: err.message });
      });

      req.end();
    } catch (err) {
      resolve({ url: imageUrl, status: 0, ok: false, error: err.message });
    }
  });
}

/**
 * Checks image URLs in batches with rate-limiting.
 * @param {string[]} urls - Image URLs
 * @param {number} batchSize - Concurrent batch size
 * @returns {Promise<Array<object>>}
 */
async function auditImagesInBatches(urls, batchSize = 5) {
  const results = [];
  const uniqueUrls = Array.from(new Set(urls)).slice(0, 30); // Test up to 30 unique images

  for (let i = 0; i < uniqueUrls.length; i += batchSize) {
    const batch = uniqueUrls.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map((u) => checkImageStatus(u)));
    results.push(...batchResults);
  }

  return results;
}

// ============================================================================
// HTML Parsing Engine (Cheerio with Regex Fallback)
// ============================================================================
/**
 * Parses HTML document using Cheerio or fallback regular expressions.
 * @param {string} html - Raw HTML document
 * @param {string} baseUrl - Final URL
 * @returns {Promise<object>} Parsed DOM data
 */
async function parseHtml(html, baseUrl) {
  let cheerio = null;
  try {
    const cheerioModule = await import('cheerio');
    cheerio = cheerioModule.default || cheerioModule;
  } catch {
    // Cheerio not installed, fallback gracefully to Regex parser
  }

  if (cheerio) {
    return parseWithCheerio(html, baseUrl, cheerio);
  } else {
    return parseWithRegex(html, baseUrl);
  }
}

/**
 * Parses HTML using Cheerio.
 * @param {string} html
 * @param {string} baseUrl
 * @param {object} cheerio
 * @returns {object}
 */
function parseWithCheerio(html, baseUrl, cheerio) {
  const $ = cheerio.load(html);

  // Titles
  const titles = [];
  $('title').each((_, el) => {
    titles.push($(el).text().trim());
  });

  // Meta Tags
  const meta = {
    description: '',
    viewport: '',
    robots: '',
    og: {},
    twitter: {},
    raw: [],
  };

  $('meta').each((_, el) => {
    const name = ($(el).attr('name') || '').toLowerCase();
    const property = ($(el).attr('property') || '').toLowerCase();
    const content = $(el).attr('content') || '';

    meta.raw.push({ name, property, content });

    if (name === 'description') meta.description = content.trim();
    if (name === 'viewport') meta.viewport = content.trim();
    if (name === 'robots') meta.robots = content.trim();

    if (property.startsWith('og:')) {
      const key = property.replace('og:', '');
      meta.og[key] = content.trim();
    }

    if (name.startsWith('twitter:') || property.startsWith('twitter:')) {
      const key = (name || property).replace('twitter:', '');
      meta.twitter[key] = content.trim();
    }
  });

  // Canonical Link
  let canonical = $('link[rel="canonical"]').attr('href') || '';
  if (canonical) canonical = canonical.trim();

  // Headings
  const headings = {
    h1: [],
    h2: [],
    h3: [],
  };

  $('h1').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) headings.h1.push(text);
  });
  $('h2').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) headings.h2.push(text);
  });
  $('h3').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    if (text) headings.h3.push(text);
  });

  // Images
  const images = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || '';
    const alt = $(el).attr('alt');
    if (src) {
      let absoluteSrc = src;
      try {
        absoluteSrc = new URL(src, baseUrl).href;
      } catch {
        // Leave as is
      }
      images.push({
        src: absoluteSrc,
        rawSrc: src,
        hasAlt: alt !== undefined && alt !== null,
        alt: alt || '',
      });
    }
  });

  // JSON-LD Schemas
  const jsonLd = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html() || '';
    try {
      const parsed = JSON.parse(raw);
      jsonLd.push({ valid: true, data: parsed, raw });
    } catch (err) {
      jsonLd.push({ valid: false, error: err.message, raw });
    }
  });

  return {
    engine: 'cheerio',
    titles,
    meta,
    canonical,
    headings,
    images,
    jsonLd,
  };
}

/**
 * Regex-based DOM fallback parser if Cheerio is unavailable.
 * @param {string} html
 * @param {string} baseUrl
 * @returns {object}
 */
function parseWithRegex(html, baseUrl) {
  // Title
  const titles = [];
  const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/gi;
  let match;
  while ((match = titleRegex.exec(html)) !== null) {
    titles.push(match[1].replace(/\s+/g, ' ').trim());
  }

  // Meta Tags
  const meta = {
    description: '',
    viewport: '',
    robots: '',
    og: {},
    twitter: {},
    raw: [],
  };

  const metaRegex = /<meta\s+([^>]*?)>/gi;
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = match[1];
    const nameMatch = attrs.match(/name=["']([^"']*)["']/i);
    const propMatch = attrs.match(/property=["']([^"']*)["']/i);
    const contentMatch = attrs.match(/content=["']([^"']*)["']/i);

    const name = (nameMatch ? nameMatch[1] : '').toLowerCase();
    const property = (propMatch ? propMatch[1] : '').toLowerCase();
    const content = contentMatch ? contentMatch[1] : '';

    meta.raw.push({ name, property, content });

    if (name === 'description') meta.description = content.trim();
    if (name === 'viewport') meta.viewport = content.trim();
    if (name === 'robots') meta.robots = content.trim();

    if (property.startsWith('og:')) {
      const key = property.replace('og:', '');
      meta.og[key] = content.trim();
    }

    if (name.startsWith('twitter:') || property.startsWith('twitter:')) {
      const key = (name || property).replace('twitter:', '');
      meta.twitter[key] = content.trim();
    }
  }

  // Canonical
  let canonical = '';
  const canonicalMatch = html.match(/<link\s+[^>]*rel=["']?canonical["']?[^>]*href=["']?([^"'>\s]+)["']?[^>]*>/i);
  if (canonicalMatch) {
    canonical = canonicalMatch[1].trim();
  }

  // Headings
  const headings = { h1: [], h2: [], h3: [] };
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  while ((match = h1Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (text) headings.h1.push(text);
  }
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  while ((match = h2Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (text) headings.h2.push(text);
  }
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  while ((match = h3Regex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    if (text) headings.h3.push(text);
  }

  // Images
  const images = [];
  const imgRegex = /<img\s+([^>]*?)>/gi;
  while ((match = imgRegex.exec(html)) !== null) {
    const attrs = match[1];
    const srcMatch = attrs.match(/src=["']([^"']*)["']/i);
    const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
    const hasAlt = /alt=/i.test(attrs);

    if (srcMatch && srcMatch[1]) {
      const rawSrc = srcMatch[1];
      let absoluteSrc = rawSrc;
      try {
        absoluteSrc = new URL(rawSrc, baseUrl).href;
      } catch {
        // keep as is
      }
      images.push({
        src: absoluteSrc,
        rawSrc,
        hasAlt,
        alt: altMatch ? altMatch[1] : '',
      });
    }
  }

  // JSON-LD
  const jsonLd = [];
  const jsonLdRegex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    const raw = match[1].trim();
    try {
      const parsed = JSON.parse(raw);
      jsonLd.push({ valid: true, data: parsed, raw });
    } catch (err) {
      jsonLd.push({ valid: false, error: err.message, raw });
    }
  }

  return {
    engine: 'regex-fallback',
    titles,
    meta,
    canonical,
    headings,
    images,
    jsonLd,
  };
}

// ============================================================================
// SEO Audit & Scoring Methodology
// ============================================================================
/**
 * Executes rules and computes weighted score out of 100.
 * @param {object} parsed - Parsed DOM structure
 * @param {object} network - Network telemetry
 * @param {Array<object>} brokenImages - Image verification results
 * @returns {object} Audit findings & scores
 */
function auditPage(parsed, network, brokenImages = []) {
  const issues = [];
  const passes = [];
  const warnings = [];

  let score = 0;
  const maxScore = 100;

  // --------------------------------------------------------------------------
  // 1. Title Tag Audit (15 Points Max)
  // --------------------------------------------------------------------------
  const title = parsed.titles[0] || '';
  const titleCount = parsed.titles.length;

  if (titleCount === 0 || !title) {
    issues.push({
      category: 'Metadata',
      item: 'Title Tag',
      status: 'FAIL',
      message: 'Missing <title> tag. Search engines cannot index page relevance accurately.',
      fix: 'Add a descriptive <title> tag inside the Next.js <Head> or generateMetadata() function.',
    });
  } else {
    let titlePts = 10;
    if (titleCount > 1) {
      warnings.push({
        category: 'Metadata',
        item: 'Title Tag',
        status: 'WARN',
        message: `Found ${titleCount} <title> tags. Duplicate titles may confuse search crawlers.`,
        fix: 'Ensure only a single primary <title> is rendered per page.',
      });
    }

    const len = title.length;
    if (len >= 30 && len <= 60) {
      titlePts += 5;
      passes.push({
        category: 'Metadata',
        item: 'Title Tag Length',
        status: 'PASS',
        message: `Optimal title length (${len} chars): "${title}"`,
      });
    } else if (len < 30) {
      warnings.push({
        category: 'Metadata',
        item: 'Title Tag Length',
        status: 'WARN',
        message: `Title is too brief (${len} characters): "${title}". Recommended range: 30-60 characters.`,
        fix: 'Expand your title tag with primary keywords and brand identity.',
      });
      titlePts += 2;
    } else {
      warnings.push({
        category: 'Metadata',
        item: 'Title Tag Length',
        status: 'WARN',
        message: `Title is long (${len} characters): "${title}". May be truncated in search results (>60 chars).`,
        fix: 'Trim title to 50-60 characters to avoid snippet ellipsis.',
      });
      titlePts += 3;
    }
    score += titlePts;
  }

  // --------------------------------------------------------------------------
  // 2. Meta Description Audit (10 Points Max)
  // --------------------------------------------------------------------------
  const desc = parsed.meta.description;
  if (!desc) {
    issues.push({
      category: 'Metadata',
      item: 'Meta Description',
      status: 'FAIL',
      message: 'Missing meta description. Search engines will generate an automated snippet.',
      fix: 'Add <meta name="description" content="..."> with 120-160 characters describing page content.',
    });
  } else {
    let descPts = 6;
    const len = desc.length;
    if (len >= 120 && len <= 160) {
      descPts += 4;
      passes.push({
        category: 'Metadata',
        item: 'Meta Description Length',
        status: 'PASS',
        message: `Optimal meta description length (${len} chars).`,
      });
    } else if (len < 120) {
      warnings.push({
        category: 'Metadata',
        item: 'Meta Description Length',
        status: 'WARN',
        message: `Meta description is short (${len} chars). Recommended range: 120-160 characters.`,
        fix: 'Provide a richer, more engaging summary to maximize click-through rate.',
      });
      descPts += 2;
    } else {
      warnings.push({
        category: 'Metadata',
        item: 'Meta Description Length',
        status: 'WARN',
        message: `Meta description is lengthy (${len} chars). It will likely be truncated on mobile (>160 chars).`,
        fix: 'Condense description to under 160 characters.',
      });
      descPts += 2;
    }
    score += descPts;
  }

  // --------------------------------------------------------------------------
  // 3. Heading Hierarchy Audit (15 Points Max)
  // --------------------------------------------------------------------------
  const h1Count = parsed.headings.h1.length;
  let headingPts = 0;

  if (h1Count === 1) {
    headingPts += 10;
    passes.push({
      category: 'Headings',
      item: 'Single H1 Tag',
      status: 'PASS',
      message: `Found exactly 1 primary H1 tag: "${parsed.headings.h1[0]}"`,
    });
  } else if (h1Count === 0) {
    issues.push({
      category: 'Headings',
      item: 'H1 Tag Missing',
      status: 'FAIL',
      message: 'No <h1> heading tag was detected on this page.',
      fix: 'Include exactly one prominent <h1> tag communicating the core subject of the page.',
    });
  } else {
    warnings.push({
      category: 'Headings',
      item: 'Multiple H1 Tags',
      status: 'WARN',
      message: `Found ${h1Count} <h1> tags. Best SEO practice is to have a single authoritative H1.`,
      fix: 'Downgrade secondary H1 tags to H2 or H3.',
    });
    headingPts += 5;
  }

  if (parsed.headings.h2.length > 0 || parsed.headings.h3.length > 0) {
    headingPts += 5;
    passes.push({
      category: 'Headings',
      item: 'Subheading Hierarchy',
      status: 'PASS',
      message: `Good content hierarchy: ${parsed.headings.h2.length} H2 tags, ${parsed.headings.h3.length} H3 tags.`,
    });
  } else {
    warnings.push({
      category: 'Headings',
      item: 'Subheading Hierarchy',
      status: 'WARN',
      message: 'No H2 or H3 subheadings found. Content structure may be thin.',
      fix: 'Break content into logical sections with H2 and H3 tags.',
    });
  }
  score += headingPts;

  // --------------------------------------------------------------------------
  // 4. Canonical Link Audit (10 Points Max)
  // --------------------------------------------------------------------------
  const canonical = parsed.canonical;
  if (!canonical) {
    issues.push({
      category: 'Indexing',
      item: 'Canonical Tag',
      status: 'FAIL',
      message: 'No canonical <link rel="canonical"> tag declared.',
      fix: 'Add a self-referential canonical URL tag to avoid duplicate content penalties.',
    });
  } else {
    let canonicalPts = 7;
    if (/^https?:\/\//i.test(canonical)) {
      canonicalPts += 3;
      passes.push({
        category: 'Indexing',
        item: 'Canonical Tag',
        status: 'PASS',
        message: `Valid absolute canonical link specified: ${canonical}`,
      });
    } else {
      warnings.push({
        category: 'Indexing',
        item: 'Canonical Tag Relative',
        status: 'WARN',
        message: `Canonical link is relative ("${canonical}"). Canonical URLs should always be absolute.`,
        fix: 'Update canonical href to include the full protocol and domain name.',
      });
      canonicalPts += 1;
    }
    score += canonicalPts;
  }

  // --------------------------------------------------------------------------
  // 5. Mobile Viewport Audit (5 Points Max)
  // --------------------------------------------------------------------------
  const viewport = parsed.meta.viewport;
  if (!viewport) {
    issues.push({
      category: 'Mobile',
      item: 'Viewport Tag',
      status: 'FAIL',
      message: 'Missing <meta name="viewport"> tag. Page may render improperly on mobile devices.',
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to document head.',
    });
  } else if (viewport.includes('width=device-width')) {
    score += 5;
    passes.push({
      category: 'Mobile',
      item: 'Viewport Tag',
      status: 'PASS',
      message: `Mobile-friendly viewport defined: "${viewport}"`,
    });
  } else {
    warnings.push({
      category: 'Mobile',
      item: 'Viewport Configuration',
      status: 'WARN',
      message: `Viewport tag missing width=device-width: "${viewport}"`,
      fix: 'Set viewport content to "width=device-width, initial-scale=1".',
    });
    score += 3;
  }

  // --------------------------------------------------------------------------
  // 6. Robots Meta Directives (5 Points Max)
  // --------------------------------------------------------------------------
  const robots = parsed.meta.robots.toLowerCase();
  if (robots.includes('noindex')) {
    issues.push({
      category: 'Indexing',
      item: 'Robots Noindex',
      status: 'FAIL',
      message: `Robots meta tag contains "noindex". This stops search engines from indexing the page!`,
      fix: 'Remove "noindex" from your robots meta tag if you want this page to rank organically.',
    });
  } else {
    score += 5;
    passes.push({
      category: 'Indexing',
      item: 'Robots Directives',
      status: 'PASS',
      message: robots ? `Robots directive configured: "${robots}"` : 'Page allows indexation (default open).',
    });
  }

  // --------------------------------------------------------------------------
  // 7. OpenGraph Social Sharing Audit (15 Points Max - 3 pts each)
  // --------------------------------------------------------------------------
  let ogPts = 0;
  const ogRequired = [
    { key: 'title', label: 'og:title' },
    { key: 'description', label: 'og:description' },
    { key: 'image', label: 'og:image' },
    { key: 'url', label: 'og:url' },
    { key: 'type', label: 'og:type' },
  ];

  const missingOg = [];
  ogRequired.forEach(({ key, label }) => {
    if (parsed.meta.og[key]) {
      ogPts += 3;
    } else {
      missingOg.push(label);
    }
  });

  if (missingOg.length === 0) {
    passes.push({
      category: 'Social',
      item: 'OpenGraph Tags',
      status: 'PASS',
      message: 'All core OpenGraph tags (title, description, image, url, type) are present.',
    });
  } else if (missingOg.length <= 2) {
    warnings.push({
      category: 'Social',
      item: 'OpenGraph Tags',
      status: 'WARN',
      message: `Missing OpenGraph tags: ${missingOg.join(', ')}`,
      fix: `Define meta property="${missingOg[0]}" for rich social sharing cards.`,
    });
  } else {
    issues.push({
      category: 'Social',
      item: 'OpenGraph Incomplete',
      status: 'FAIL',
      message: `Missing multiple OpenGraph tags: ${missingOg.join(', ')}`,
      fix: 'Implement OpenGraph metadata (og:title, og:description, og:image, og:url, og:type).',
    });
  }
  score += ogPts;

  // --------------------------------------------------------------------------
  // 8. Twitter Card Audit (10 Points Max)
  // --------------------------------------------------------------------------
  let twitterPts = 0;
  if (parsed.meta.twitter.card) {
    twitterPts += 4;
  }
  if (parsed.meta.twitter.title || parsed.meta.og.title) {
    twitterPts += 3;
  }
  if (parsed.meta.twitter.image || parsed.meta.og.image) {
    twitterPts += 3;
  }

  if (twitterPts === 10) {
    passes.push({
      category: 'Social',
      item: 'Twitter Cards',
      status: 'PASS',
      message: `Twitter Card verified: card="${parsed.meta.twitter.card || 'inherited'}"`,
    });
  } else {
    warnings.push({
      category: 'Social',
      item: 'Twitter Card Tags',
      status: 'WARN',
      message: 'Incomplete Twitter Card configuration. Missing twitter:card or twitter:image.',
      fix: 'Specify <meta name="twitter:card" content="summary_large_image"> and twitter:image.',
    });
  }
  score += twitterPts;

  // --------------------------------------------------------------------------
  // 9. Image Optimization & Broken Images (10 Points Max)
  // --------------------------------------------------------------------------
  const totalImages = parsed.images.length;
  const missingAlt = parsed.images.filter((img) => !img.hasAlt || !img.alt.trim());
  let imagePts = 0;

  if (totalImages === 0) {
    imagePts += 10;
    passes.push({
      category: 'Images',
      item: 'Image Tags',
      status: 'PASS',
      message: 'No images present on page.',
    });
  } else {
    // Alt tags (6 pts)
    if (missingAlt.length === 0) {
      imagePts += 6;
      passes.push({
        category: 'Images',
        item: 'Image Alt Attributes',
        status: 'PASS',
        message: `All ${totalImages} image(s) have descriptive alt attributes.`,
      });
    } else {
      const altPct = Math.round(((totalImages - missingAlt.length) / totalImages) * 6);
      imagePts += altPct;
      warnings.push({
        category: 'Images',
        item: 'Missing Alt Attributes',
        status: 'WARN',
        message: `${missingAlt.length} of ${totalImages} image(s) lack alt text. Degrades accessibility and image SEO.`,
        fix: 'Add descriptive alt="..." tags to all decorative/informative <img> tags.',
      });
    }

    // Broken image check (4 pts)
    const brokenList = brokenImages.filter((b) => !b.ok);
    if (brokenList.length === 0) {
      imagePts += 4;
      if (brokenImages.length > 0) {
        passes.push({
          category: 'Images',
          item: 'Image Availability',
          status: 'PASS',
          message: `All ${brokenImages.length} checked images returned HTTP 200/300.`,
        });
      }
    } else {
      issues.push({
        category: 'Images',
        item: 'Broken Images',
        status: 'FAIL',
        message: `Detected ${brokenList.length} broken or inaccessible image(s).`,
        fix: `Fix or remove broken image links: ${brokenList.map((b) => b.url).slice(0, 3).join(', ')}`,
      });
    }
  }
  score += imagePts;

  // --------------------------------------------------------------------------
  // 10. Performance, Security & Technical (10 Points Max)
  // --------------------------------------------------------------------------
  let techPts = 0;

  // HTTPS (4 pts)
  if (network.isHttps) {
    techPts += 4;
    passes.push({
      category: 'Technical',
      item: 'HTTPS Encryption',
      status: 'PASS',
      message: 'Page served securely over HTTPS protocol.',
    });
  } else {
    issues.push({
      category: 'Technical',
      item: 'Insecure HTTP',
      status: 'FAIL',
      message: 'Page is served over insecure HTTP.',
      fix: 'Enforce SSL/TLS and redirect all HTTP traffic to HTTPS.',
    });
  }

  // TTFB (3 pts)
  if (network.ttfb < 300) {
    techPts += 3;
    passes.push({
      category: 'Performance',
      item: 'Time to First Byte (TTFB)',
      status: 'PASS',
      message: `Excellent server responsiveness (TTFB: ${network.ttfb}ms).`,
    });
  } else if (network.ttfb <= 800) {
    techPts += 2;
    warnings.push({
      category: 'Performance',
      item: 'Time to First Byte (TTFB)',
      status: 'WARN',
      message: `Moderate TTFB (${network.ttfb}ms). Target <300ms for optimal Web Vitals.`,
      fix: 'Leverage edge caching, SSR streaming, or CDN caching for dynamic routes.',
    });
  } else {
    issues.push({
      category: 'Performance',
      item: 'Slow TTFB',
      status: 'FAIL',
      message: `High TTFB latency (${network.ttfb}ms). Can harm Core Web Vitals and crawl budget.`,
      fix: 'Optimize database queries, enable incremental static regeneration (ISR), or use a CDN.',
    });
  }

  // Compression (3 pts)
  if (['gzip', 'br', 'deflate'].includes(network.compression)) {
    techPts += 3;
    passes.push({
      category: 'Performance',
      item: 'HTTP Compression',
      status: 'PASS',
      message: `Modern compression detected (${network.compression.toUpperCase()}).`,
    });
  } else {
    warnings.push({
      category: 'Performance',
      item: 'No HTTP Compression',
      status: 'WARN',
      message: 'Text payload is not compressed (Content-Encoding not set to gzip/br).',
      fix: 'Enable Gzip or Brotli compression on your web server or reverse proxy.',
    });
  }
  score += techPts;

  // --------------------------------------------------------------------------
  // Schema.org Structured Data Detection (Informational)
  // --------------------------------------------------------------------------
  const validSchemas = parsed.jsonLd.filter((s) => s.valid);
  const detectedTypes = [];
  validSchemas.forEach((s) => {
    const data = s.data;
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item['@type']) detectedTypes.push(item['@type']);
      });
    } else if (data && data['@type']) {
      detectedTypes.push(data['@type']);
    }
  });

  if (detectedTypes.length > 0) {
    passes.push({
      category: 'Structured Data',
      item: 'Schema.org JSON-LD',
      status: 'PASS',
      message: `Found ${detectedTypes.length} schema entity type(s): ${detectedTypes.join(', ')}`,
    });
  } else {
    warnings.push({
      category: 'Structured Data',
      item: 'Schema.org JSON-LD',
      status: 'WARN',
      message: 'No Schema.org JSON-LD structured data detected on page.',
      fix: 'Add JSON-LD (e.g. WebSite, Organization, Article, Product) to enhance rich snippets in SERPs.',
    });
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    maxScore,
    grade: getGrade(score),
    passes,
    warnings,
    issues,
    summary: {
      totalChecks: passes.length + warnings.length + issues.length,
      passedCount: passes.length,
      warningCount: warnings.length,
      issueCount: issues.length,
    },
  };
}

/**
 * Maps numerical score to letter grade.
 * @param {number} score
 * @returns {string} Grade
 */
function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

// ============================================================================
// Terminal Dashboard Display
// ============================================================================
/**
 * Renders an ANSI-colored audit report to stdout.
 * @param {object} audit - Audit results
 * @param {object} network - Network metrics
 * @param {object} parsed - Parsed data
 */
function renderTerminalDashboard(audit, network, parsed) {
  console.log(`
${colors.cyan}${colors.bold}┌─────────────────────────────────────────────────────────────────┐
│               NEXT.JS SEO AUDITOR DASHBOARD                     │
│                  Powered by QorelySofts                         │
└─────────────────────────────────────────────────────────────────┘${colors.reset}
`);

  const gradeColor =
    audit.score >= 90
      ? colors.bgGreen
      : audit.score >= 75
      ? colors.bgYellow
      : colors.bgRed;

  console.log(`  ${colors.bold}AUDIT TARGET:${colors.reset}   ${network.finalUrl}`);
  console.log(`  ${colors.bold}PARSER ENGINE:${colors.reset}  ${parsed.engine}`);
  console.log(`  ${colors.bold}HTTP STATUS:${colors.reset}    ${network.statusCode}`);
  console.log(`  ${colors.bold}TIME TO 1st BYTE:${colors.reset} ${network.ttfb}ms`);
  console.log(`  ${colors.bold}COMPRESSION:${colors.reset}    ${network.compression.toUpperCase()}`);
  console.log(`  ${colors.bold}HTML PAYLOAD:${colors.reset}   ${(network.sizeBytes / 1024).toFixed(1)} KB`);
  if (network.redirectChain.length > 1) {
    console.log(`  ${colors.bold}REDIRECTS:${colors.reset}      ${network.redirectChain.join(' -> ')}`);
  }

  console.log(`
  ${colors.bold}OVERALL SEO SCORE:${colors.reset}
  ┌───────────────────────────────────────────────┐
  │  ${gradeColor} GRADE ${audit.grade} ${colors.reset}  ${colors.bold}${colors.cyan}${audit.score} / ${audit.maxScore} POINTS${colors.reset}                      │
  └───────────────────────────────────────────────┘
  ${colors.green}Passed:${colors.reset} ${audit.summary.passedCount}  |  ${colors.yellow}Warnings:${colors.reset} ${audit.summary.warningCount}  |  ${colors.red}Critical:${colors.reset} ${audit.summary.issueCount}
`);

  // Section 1: Critical Issues
  if (audit.issues.length > 0) {
    console.log(`${colors.red}${colors.bold}── [ CRITICAL ISSUES ] ───────────────────────────────────────────${colors.reset}`);
    audit.issues.forEach((issue) => {
      console.log(`  ${symbols.fail} ${colors.bold}[${issue.category}] ${issue.item}${colors.reset}`);
      console.log(`    ${colors.gray}Problem:${colors.reset} ${issue.message}`);
      if (issue.fix) {
        console.log(`    ${colors.cyan}Action :${colors.reset} ${issue.fix}`);
      }
      console.log('');
    });
  }

  // Section 2: Warnings & Improvements
  if (audit.warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}── [ WARNINGS & IMPROVEMENTS ] ──────────────────────────────────${colors.reset}`);
    audit.warnings.forEach((warn) => {
      console.log(`  ${symbols.warn} ${colors.bold}[${warn.category}] ${warn.item}${colors.reset}`);
      console.log(`    ${colors.gray}Context:${colors.reset} ${warn.message}`);
      if (warn.fix) {
        console.log(`    ${colors.cyan}Action :${colors.reset} ${warn.fix}`);
      }
      console.log('');
    });
  }

  // Section 3: Verified Passes
  console.log(`${colors.green}${colors.bold}── [ VERIFIED PASSES ] ──────────────────────────────────────────${colors.reset}`);
  audit.passes.forEach((pass) => {
    console.log(`  ${symbols.pass} ${colors.bold}[${pass.category}] ${pass.item}:${colors.reset} ${colors.dim}${pass.message}${colors.reset}`);
  });

  console.log(`
${colors.cyan}${colors.bold}===================================================================${colors.reset}
`);
}

// ============================================================================
// Report Exporters (JSON & Markdown)
// ============================================================================
/**
 * Writes full audit report to JSON.
 * @param {object} data - Full audit payload
 * @param {string} filePath - Target file path
 */
function exportJson(data, filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(resolved, JSON.stringify(data, null, 2), 'utf-8');
  return resolved;
}

/**
 * Generates an attractive Markdown report.
 * @param {object} data - Audit payload
 * @param {string} filePath - Target file path
 */
function exportMarkdown(data, filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const { audit, network, parsed } = data;
  const auditTarget = data.finalUrl || data.targetUrl || network.finalUrl || 'Unknown URL';

  let md = `# SEO Audit Report

Audited URL: \`${auditTarget}\`  
Generated At: **${new Date().toISOString()}**  
Auditor: **Next.js SEO Auditor by QorelySofts**  

---

## Executive Summary

| Metric | Result |
|---|---|
| **SEO Score** | **${audit.score} / 100 (Grade ${audit.grade})** |
| **HTTP Status** | \`${network.statusCode}\` |
| **Time to First Byte (TTFB)** | \`${network.ttfb} ms\` |
| **Compression** | \`${network.compression.toUpperCase()}\` |
| **HTML Size** | \`${(network.sizeBytes / 1024).toFixed(1)} KB\` |
| **HTTPS** | \`${network.isHttps ? 'Yes (Secure)' : 'No (Insecure)'}\` |
| **Parser Engine** | \`${parsed.engine}\` |
| **Checks Passed** | \`${audit.summary.passedCount}\` |
| **Warnings** | \`${audit.summary.warningCount}\` |
| **Critical Issues** | \`${audit.summary.issueCount}\` |

---

## Critical Issues (${audit.issues.length})

${
  audit.issues.length === 0
    ? '*No critical issues detected! Excellent work.*'
    : audit.issues
        .map(
          (issue, idx) => `### ${idx + 1}. [${issue.category}] ${issue.item}
- **Problem**: ${issue.message}
- **Recommended Action**: \`${issue.fix}\``
        )
        .join('\n\n')
}

---

## Warnings & Recommendations (${audit.warnings.length})

${
  audit.warnings.length === 0
    ? '*No warnings detected.*'
    : audit.warnings
        .map(
          (warn, idx) => `### ${idx + 1}. [${warn.category}] ${warn.item}
- **Details**: ${warn.message}
- **Suggested Fix**: \`${warn.fix}\``
        )
        .join('\n\n')
}

---

## Page Elements Breakdown

### Headings Structure
- **H1 Count**: ${parsed.headings.h1.length}
  ${parsed.headings.h1.map((h) => `  - \`${h}\``).join('\n')}
- **H2 Count**: ${parsed.headings.h2.length}
- **H3 Count**: ${parsed.headings.h3.length}

### OpenGraph & Social Metadata
- **og:title**: \`${parsed.meta.og.title || 'Not specified'}\`
- **og:description**: \`${parsed.meta.og.description || 'Not specified'}\`
- **og:image**: \`${parsed.meta.og.image || 'Not specified'}\`
- **og:url**: \`${parsed.meta.og.url || 'Not specified'}\`
- **og:type**: \`${parsed.meta.og.type || 'Not specified'}\`
- **twitter:card**: \`${parsed.meta.twitter.card || 'Not specified'}\`

### Structured Data (Schema.org JSON-LD)
Found **${parsed.jsonLd.length}** JSON-LD block(s).
${
  parsed.jsonLd.length === 0
    ? '*None present.*'
    : parsed.jsonLd
        .map((s, i) => `- Schema #${i + 1}: Valid = \`${s.valid}\`, Type = \`${s.data?.['@type'] || 'Unknown'}\``)
        .join('\n')
}

---
*Report generated automatically by QorelySofts Next.js SEO Auditor.*
`;

  fs.writeFileSync(resolved, md, 'utf-8');
  return resolved;
}

// ============================================================================
// Main Auditor Execution
// ============================================================================
async function runAudit() {
  const config = parseArgs();

  console.log(`\n${colors.cyan}[INIT]${colors.reset} Starting SEO audit for: ${colors.bold}${config.url}${colors.reset}`);

  try {
    // 1. Fetch page with redirects & decompression
    const network = await fetchWithDecompression(config.url, config.timeout);

    // 2. Parse HTML
    const parsed = await parseHtml(network.html, network.finalUrl);

    // 3. Image audit
    let imageChecks = [];
    if (!config.skipImages && parsed.images.length > 0) {
      console.log(`${colors.cyan}[AUDIT]${colors.reset} Verifying ${Math.min(30, parsed.images.length)} images via concurrent HEAD requests...`);
      const imageUrls = parsed.images.map((img) => img.src);
      imageChecks = await auditImagesInBatches(imageUrls, 5);
    }

    // 4. Run Audit rules
    const auditResults = auditPage(parsed, network, imageChecks);

    // 5. Render dashboard
    renderTerminalDashboard(auditResults, network, parsed);

    // 6. Output Reports
    const fullPayload = {
      timestamp: new Date().toISOString(),
      targetUrl: config.url,
      finalUrl: network.finalUrl,
      network: {
        finalUrl: network.finalUrl,
        statusCode: network.statusCode,
        ttfb: network.ttfb,
        compression: network.compression,
        sizeBytes: network.sizeBytes,
        uncompressedBytes: network.uncompressedBytes,
        redirectChain: network.redirectChain,
        isHttps: network.isHttps,
      },
      audit: auditResults,
      parsed: {
        engine: parsed.engine,
        titles: parsed.titles,
        canonical: parsed.canonical,
        meta: parsed.meta,
        headings: parsed.headings,
        imagesCount: parsed.images.length,
        missingAltCount: parsed.images.filter((img) => !img.hasAlt).length,
        jsonLdCount: parsed.jsonLd.length,
        jsonLd: parsed.jsonLd,
      },
      imagesChecked: imageChecks,
    };

    const formats = config.format.split(',').map((f) => f.trim().toLowerCase());

    if (formats.includes('json')) {
      const jsonFile = config.output.endsWith('.json') ? config.output : config.output + '.json';
      const savedPath = exportJson(fullPayload, jsonFile);
      console.log(`  ${colors.green}✔ JSON Report Saved:${colors.reset}     ${savedPath}`);
    }

    if (formats.includes('markdown') || formats.includes('md') || config.output.endsWith('.md')) {
      let mdFile = config.output;
      if (mdFile.endsWith('.json')) {
        mdFile = mdFile.replace(/\.json$/, '.md');
      } else if (!mdFile.endsWith('.md')) {
        mdFile = mdFile + '.md';
      }
      const savedMd = exportMarkdown(fullPayload, mdFile);
      console.log(`  ${colors.green}✔ Markdown Report Saved:${colors.reset} ${savedMd}`);
    }

    console.log('');
  } catch (err) {
    console.error(`\n${colors.red}${colors.bold}[ERROR] SEO Audit Failed:${colors.reset} ${err.message}\n`);
    process.exit(1);
  }
}

runAudit();
