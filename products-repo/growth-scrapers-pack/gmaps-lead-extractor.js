#!/usr/bin/env node

/**
 * ==============================================================================
 * GMAPS LEAD EXTRACTOR (Production Grade)
 * ==============================================================================
 * Extracts local business names, categories, websites, phone numbers, addresses,
 * and review ratings from Google Maps for any search query.
 * 
 * Features:
 * - Anti-bot detection stealth profile (evades Cloudflare / Google bot checks)
 * - Randomized human jitter delays and rate-limiting to prevent IP throttling
 * - RFC 4180 compliant CSV export with automatic quotes & escaping
 * - Resilient selector fallbacks for changing Google Maps DOM layouts
 * - Graceful error handling and progress reporting
 * 
 * Usage:
 *   node gmaps-lead-extractor.js --query "dentists in Austin TX" --limit 20 --output dentists.csv
 * 
 * Author: QorelySofts (https://www.qorelysofts.co.in)
 * License: Commercial / Personal Use (Included in Growth Scrapers Pack)
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

// CLI Argument Parser (zero-dependency)
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    query: '',
    limit: 20,
    output: 'gmaps-leads.csv',
    headless: true,
    delay: 2000,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--query' || arg === '-q') {
      options.query = args[++i] || '';
    } else if (arg === '--limit' || arg === '-l') {
      options.limit = parseInt(args[++i], 10) || 20;
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i] || 'gmaps-leads.csv';
    } else if (arg === '--headless') {
      const val = args[++i];
      options.headless = val === 'false' ? false : true;
    } else if (arg === '--delay' || arg === '-d') {
      options.delay = parseInt(args[++i], 10) || 2000;
    } else if (!arg.startsWith('-') && !options.query) {
      options.query = arg;
    }
  }

  return options;
}

// ANSI Colors for clean terminal logging
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

function log(msg, color = colors.reset) {
  console.log(`${color}${msg}${colors.reset}`);
}

function printBanner() {
  console.log('\n' + colors.cyan + colors.bright + '╔════════════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + colors.bright + '║                GMAPS LEAD EXTRACTOR v1.0.0                         ║' + colors.reset);
  console.log(colors.cyan + colors.bright + '║          Automated Local B2B Lead Generation & Scraping            ║' + colors.reset);
  console.log(colors.cyan + colors.bright + '╚════════════════════════════════════════════════════════════════════╝' + colors.reset + '\n');
}

function printHelp() {
  printBanner();
  console.log(`
Usage:
  node gmaps-lead-extractor.js [options]

Options:
  -q, --query <string>     Search query (e.g. "software companies in Chicago", "cafes in London")
  -l, --limit <number>     Target number of leads to extract (default: 20, max: 200)
  -o, --output <file>      Path for output CSV file (default: "gmaps-leads.csv")
  -d, --delay <ms>         Base delay between requests in ms for rate-limiting (default: 2000)
      --headless <boolean> Run browser in headless mode: "true" or "false" (default: "true")
  -h, --help               Display this help guide

Examples:
  node gmaps-lead-extractor.js -q "digital agencies in Miami" -l 25 -o miami-agencies.csv
  node gmaps-lead-extractor.js --query "roofing contractors Dallas" --limit 50
  node gmaps-lead-extractor.js --query "italian restaurants NYC" --headless false
  `);
}

// RFC 4180 CSV Row Formatter
function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/\r?\n|\r/g, ' ').trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomJitter(baseDelay) {
  // Add 10% to 35% random jitter to mimic natural human interactions
  const jitter = Math.floor(Math.random() * (baseDelay * 0.35));
  return baseDelay + jitter;
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (!options.query) {
    printHelp();
    log('❌ Error: Search query is required. Provide --query "your search term"', colors.red);
    process.exit(1);
  }

  printBanner();
  log(`🎯 Target Query : "${options.query}"`, colors.bright);
  log(`📊 Lead Target  : ${options.limit} listings`, colors.bright);
  log(`📁 Output File  : ${options.output}`, colors.bright);
  log(`⏱️ Rate Limiting: ~${options.delay}ms jittered delay`, colors.dim);
  log(`🖥️ Headless Mode: ${options.headless}\n`, colors.dim);

  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (err) {
    log('❌ Error: puppeteer is not installed in this environment.', colors.red);
    log('👉 Run: npm install puppeteer\n', colors.yellow);
    process.exit(1);
  }

  log('🚀 Launching stealth browser instance...', colors.cyan);
  const browser = await puppeteer.launch({
    headless: options.headless ? 'new' : false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--lang=en-US,en',
      '--window-size=1920,1080'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Anti-Detection Stealth Configuration
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
  );

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"'
  });

  // Mask automated navigator variables
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
  });

  const leads = [];
  const visitedUrls = new Set();

  try {
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(options.query)}?hl=en`;
    log(`🔍 Navigating to Google Maps search...`, colors.cyan);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 45000 });

    // Handle Cookie Consent modal if shown (e.g. European IPs)
    try {
      const consentButton = await page.$('button[aria-label*="Reject all"], button[aria-label*="Accept all"], form[action*="consent"] button');
      if (consentButton) {
        log('🛡️ Dismissed consent prompt', colors.dim);
        await consentButton.click();
        await sleep(1500);
      }
    } catch {
      // Consent prompt not present, proceed
    }

    log('⏳ Waiting for listings feed to load...', colors.cyan);
    const feedSelector = 'div[role="feed"]';
    try {
      await page.waitForSelector(feedSelector, { timeout: 15000 });
    } catch (e) {
      log('⚠️ Could not find feed selector. The query might have returned a single direct place or 0 results.', colors.yellow);
    }

    // Progressively scroll down the feed to load target number of results
    log(`📜 Scrolling feed to discover at least ${options.limit} listings...`, colors.cyan);
    let previousCount = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 35;

    while (scrollAttempts < maxScrollAttempts) {
      // Find all place link elements
      const placeLinks = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'));
        return anchors
          .map(a => a.href)
          .filter((href, idx, self) => self.indexOf(href) === idx);
      });

      if (placeLinks.length >= options.limit) {
        log(`✓ Discovered ${placeLinks.length} listings (target: ${options.limit})`, colors.green);
        break;
      }

      if (placeLinks.length === previousCount) {
        scrollAttempts++;
      } else {
        scrollAttempts = 0;
        previousCount = placeLinks.length;
      }

      // Scroll the feed container
      await page.evaluate((sel) => {
        const feed = document.querySelector(sel);
        if (feed) {
          feed.scrollBy(0, 1000);
        } else {
          window.scrollBy(0, 800);
        }
      }, feedSelector);

      await sleep(getRandomJitter(options.delay));

      // Check if end of list reached
      const endReached = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes("You've reached the end of the list") || text.includes("No more results");
      });

      if (endReached) {
        log(`ℹ️ Reached end of Google Maps results.`, colors.yellow);
        break;
      }
    }

    // Re-evaluate place cards
    const placeHrefs = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'));
      return anchors
        .map(a => a.href)
        .filter((href, idx, self) => self.indexOf(href) === idx);
    });

    const targetHrefs = placeHrefs.slice(0, options.limit);
    log(`\n📋 Extracting granular details from ${targetHrefs.length} businesses...\n`, colors.bright);

    for (let i = 0; i < targetHrefs.length; i++) {
      const href = targetHrefs[i];
      if (visitedUrls.has(href)) continue;
      visitedUrls.add(href);

      const progress = `[${i + 1}/${targetHrefs.length}]`;

      try {
        log(`${progress} Loading: ${href.split('/place/')[1]?.split('/')[0] || 'Business Place'}...`, colors.cyan);
        await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await sleep(getRandomJitter(options.delay));

        const business = await page.evaluate((placeUrl) => {
          // Helper to get text by selector
          const getText = (selectors) => {
            for (const s of selectors) {
              const el = document.querySelector(s);
              if (el && el.innerText && el.innerText.trim()) return el.innerText.trim();
            }
            return '';
          };

          // Business Name
          const name = getText([
            'h1.DUwDvf',
            'h1.fontHeadlineLarge',
            'h1',
            'div.fontHeadlineSmall'
          ]);

          // Rating
          let rating = '';
          const ratingEl = document.querySelector('span.ceNzKf, span.fontDisplayLarge, span[aria-label*="stars"]');
          if (ratingEl) {
            const raw = ratingEl.getAttribute('aria-label') || ratingEl.innerText;
            const match = raw.match(/([0-9]+(?:\.[0-9]+)?)/);
            if (match) rating = match[1];
          }

          // Review count
          let reviewsCount = '';
          const reviewsEl = document.querySelector('span[aria-label*="reviews"], span[aria-label*="review"]');
          if (reviewsEl) {
            const raw = reviewsEl.getAttribute('aria-label') || reviewsEl.innerText;
            const match = raw.match(/([0-9,]+)/);
            if (match) reviewsCount = match[1].replace(/,/g, '');
          }

          // Category
          const category = getText([
            'button.DkEaL',
            'span.fontBodyMedium > button',
            'span[jsaction*="category"]'
          ]);

          // Address
          let address = '';
          const addressBtn = document.querySelector('button[data-item-id*="address"], button[aria-label*="Address"]');
          if (addressBtn) {
            address = addressBtn.innerText.replace(/^Address:\s*/i, '').trim();
          }

          // Website
          let website = '';
          const webBtn = document.querySelector('a[data-item-id="authority"], a[aria-label*="Website"]');
          if (webBtn && webBtn.href) {
            website = webBtn.href;
          }

          // Phone
          let phone = '';
          const phoneBtn = document.querySelector('button[data-item-id*="phone:"], button[aria-label*="Phone"]');
          if (phoneBtn) {
            phone = phoneBtn.innerText.replace(/^Phone:\s*/i, '').trim();
          }

          return {
            name,
            category,
            rating,
            reviewsCount,
            phone,
            website,
            address,
            googleMapsUrl: placeUrl
          };
        }, href);

        if (business.name) {
          leads.push(business);
          log(`  ✓ ${business.name} | 📞 ${business.phone || 'N/A'} | 🌐 ${business.website || 'N/A'} | ⭐ ${business.rating || 'N/A'}`, colors.green);
        } else {
          log(`  ⚠️ Skipped empty card`, colors.yellow);
        }

      } catch (itemErr) {
        log(`  ❌ Failed extracting details: ${itemErr.message}`, colors.red);
      }
    }

  } catch (error) {
    log(`\n❌ Scraping session interrupted: ${error.message}`, colors.red);
  } finally {
    log('\n🛑 Closing browser...', colors.dim);
    await browser.close();
  }

  // Export results to CSV
  if (leads.length > 0) {
    const headers = [
      'Business Name',
      'Category',
      'Rating',
      'Reviews Count',
      'Phone',
      'Website',
      'Address',
      'Google Maps URL'
    ];

    const rows = leads.map(l => [
      escapeCsv(l.name),
      escapeCsv(l.category),
      escapeCsv(l.rating),
      escapeCsv(l.reviewsCount),
      escapeCsv(l.phone),
      escapeCsv(l.website),
      escapeCsv(l.address),
      escapeCsv(l.googleMapsUrl)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const outputPath = path.resolve(process.cwd(), options.output);
    fs.writeFileSync(outputPath, csvContent, 'utf8');

    log('════════════════════════════════════════════════════════════════════', colors.cyan);
    log(`🎉 SUCCESS: Extracted ${leads.length} leads!`, colors.green + colors.bright);
    log(`📄 CSV exported to: ${outputPath}`, colors.bright);
    log('════════════════════════════════════════════════════════════════════\n', colors.cyan);
  } else {
    log('⚠️ No leads were successfully extracted. Try broadening your query or increasing the delay.', colors.yellow);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal Error:', err);
    process.exit(1);
  });
}

module.exports = { main, parseArgs };
