#!/usr/bin/env node
/**
 * @file scraper.js
 * @description Production-grade Google Maps Lead Scraper using Puppeteer.
 * Extracts business leads with anti-detection, intelligent scrolling,
 * consent handling, jitter delays, and RFC 4180 CSV export.
 * @author QorelySofts
 * @license MIT
 */

import fs from 'fs';
import path from 'path';

// puppeteer will be dynamically imported during runScraper to allow --help without dependencies installed

// ============================================================================
// ANSI Styling Helpers
// ============================================================================
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
  white: '\x1b[37m',
};

/**
 * Formats a message with color and timestamp.
 * @param {string} tag - Log level tag
 * @param {string} colorCode - ANSI color string
 * @param {string} message - Message body
 */
function log(tag, colorCode, message) {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${colorCode}[${tag}]${colors.reset} ${message}`);
}

const logger = {
  info: (msg) => log('INFO', colors.cyan, msg),
  success: (msg) => log('SUCCESS', colors.green, msg),
  warn: (msg) => log('WARN', colors.yellow, msg),
  error: (msg) => log('ERROR', colors.red, msg),
  step: (msg) => log('STEP', colors.magenta, msg),
  lead: (idx, total, name, rating, reviews, phone) => {
    const counter = `${colors.bold}${colors.cyan}[${idx}/${total}]${colors.reset}`;
    const nameStr = `${colors.bold}${colors.green}${name}${colors.reset}`;
    const meta = `${colors.gray}(★ ${rating || 'N/A'} | ${reviews || '0'} reviews | 📞 ${phone || 'N/A'})${colors.reset}`;
    console.log(`  ${counter} ${nameStr} ${meta}`);
  }
};

// ============================================================================
// CLI Arguments Parsing & Validation
// ============================================================================
/**
 * Displays command-line help documentation and exits.
 */
function printHelp() {
  console.log(`
${colors.cyan}${colors.bold}===================================================================
               GMAPS LEAD SCRAPER - CLI REFERENCE
                     Created by QorelySofts
===================================================================${colors.reset}

${colors.bold}USAGE:${colors.reset}
  node scraper.js [OPTIONS]
  npm run scrape -- [OPTIONS]

${colors.bold}OPTIONS:${colors.reset}
  ${colors.green}--query, -q${colors.reset} <string>     Search term (e.g. "dentist", "roofing contractor")
                             [Default: "dentist"]
  ${colors.green}--city, -c${colors.reset} <string>      Target city or location (e.g. "Austin, TX", "London")
                             [Default: "Austin, TX"]
  ${colors.green}--limit, -l${colors.reset} <number>     Maximum number of leads to extract
                             [Default: 25]
  ${colors.green}--output, -o${colors.reset} <path>     Destination CSV filename or path
                             [Default: "leads.csv"]
  ${colors.green}--delay, -d${colors.reset} <ms>        Base delay between actions in milliseconds
                             [Default: 2000]
  ${colors.green}--jitter${colors.reset} <ms>          Random jitter added/subtracted from delay (ms)
                             [Default: 500]
  ${colors.green}--headless${colors.reset} <boolean>   Run browser in headless mode ("true" or "false")
                             [Default: true]
  ${colors.green}--help, -h${colors.reset}              Show this detailed help manual and exit

${colors.bold}EXAMPLES:${colors.reset}
  node scraper.js --query "orthodontist" --city "Dallas, TX" --limit 50
  node scraper.js -q "italian restaurants" -c "Chicago, IL" -o chicago_food.csv --delay 1500
  node scraper.js --query "digital agency" --city "Miami, FL" --headless false --limit 10

${colors.bold}ANTI-DETECTION FEATURES:${colors.reset}
  • Custom realistic Desktop Chrome User-Agent
  • Overridden navigator.webdriver flag
  • Preconfigured realistic 1920x1080 viewport & color depth
  • Accept-Language headers configured for English queries
  • Randomized jitter delay between result clicks to avoid behavioral heuristics
`);
  process.exit(0);
}

/**
 * Parses process arguments into a configuration object.
 * @returns {object} Scraper configuration
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    query: 'dentist',
    city: 'Austin, TX',
    limit: 25,
    output: 'leads.csv',
    delay: 2000,
    jitter: 500,
    headless: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--help' || arg === '-h') {
      printHelp();
    } else if ((arg === '--query' || arg === '-q') && nextArg) {
      config.query = nextArg;
      i++;
    } else if ((arg === '--city' || arg === '-c') && nextArg) {
      config.city = nextArg;
      i++;
    } else if ((arg === '--limit' || arg === '-l') && nextArg) {
      const parsed = parseInt(nextArg, 10);
      config.limit = isNaN(parsed) || parsed < 1 ? 25 : parsed;
      i++;
    } else if ((arg === '--output' || arg === '-o') && nextArg) {
      config.output = nextArg;
      i++;
    } else if ((arg === '--delay' || arg === '-d') && nextArg) {
      const parsed = parseInt(nextArg, 10);
      config.delay = isNaN(parsed) || parsed < 0 ? 2000 : parsed;
      i++;
    } else if (arg === '--jitter' && nextArg) {
      const parsed = parseInt(nextArg, 10);
      config.jitter = isNaN(parsed) || parsed < 0 ? 500 : parsed;
      i++;
    } else if (arg === '--headless') {
      if (nextArg && (nextArg.toLowerCase() === 'false' || nextArg === '0')) {
        config.headless = false;
        i++;
      } else if (nextArg && (nextArg.toLowerCase() === 'true' || nextArg === '1')) {
        config.headless = true;
        i++;
      } else {
        config.headless = true;
      }
    } else if (arg.startsWith('--query=')) {
      config.query = arg.split('=')[1];
    } else if (arg.startsWith('--city=')) {
      config.city = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      config.limit = parseInt(arg.split('=')[1], 10) || 25;
    } else if (arg.startsWith('--output=')) {
      config.output = arg.split('=')[1];
    } else if (arg.startsWith('--delay=')) {
      config.delay = parseInt(arg.split('=')[1], 10) || 2000;
    } else if (arg.startsWith('--jitter=')) {
      config.jitter = parseInt(arg.split('=')[1], 10) || 500;
    } else if (arg.startsWith('--headless=')) {
      config.headless = arg.split('=')[1].toLowerCase() !== 'false';
    }
  }

  return config;
}

// ============================================================================
// Utilities: Delays & CSV Export
// ============================================================================
/**
 * Asynchronous sleep with jitter.
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} jitter - Jitter range in milliseconds
 * @returns {Promise<void>}
 */
function waitWithJitter(baseDelay, jitter = 0) {
  const randomDelta = jitter > 0 ? (Math.random() * 2 - 1) * jitter : 0;
  const total = Math.max(200, Math.floor(baseDelay + randomDelta));
  return new Promise((resolve) => setTimeout(resolve, total));
}

/**
 * Escapes a value according to RFC 4180 CSV specifications.
 * @param {any} value - Field value to format
 * @returns {string} Escaped CSV string
 */
function escapeCsv(value) {
  if (value === null || value === undefined) return '""';
  const str = String(value).trim();
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Writes an array of lead objects into an RFC 4180 compliant CSV file.
 * @param {Array<object>} leads - Extracted leads
 * @param {string} filePath - Destination file path
 */
function exportToCsv(leads, filePath) {
  const headers = [
    'Business Name',
    'Category',
    'Rating',
    'Review Count',
    'Phone',
    'Address',
    'Website',
    'Google Maps URL',
    'City',
    'Search Query',
    'Extracted At',
  ];

  const headerRow = headers.map(escapeCsv).join(',');
  const dataRows = leads.map((item) => {
    return [
      escapeCsv(item.name),
      escapeCsv(item.category),
      escapeCsv(item.rating),
      escapeCsv(item.reviewCount),
      escapeCsv(item.phone),
      escapeCsv(item.address),
      escapeCsv(item.website),
      escapeCsv(item.url),
      escapeCsv(item.city),
      escapeCsv(item.query),
      escapeCsv(item.extractedAt),
    ].join(',');
  });

  const content = [headerRow, ...dataRows].join('\r\n') + '\r\n';
  const resolvedPath = path.resolve(process.cwd(), filePath);
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Prepend UTF-8 BOM so Microsoft Excel cleanly identifies UTF-8 characters
  fs.writeFileSync(resolvedPath, '\uFEFF' + content, 'utf-8');
  return resolvedPath;
}

// ============================================================================
// Scraper Core Logic
// ============================================================================
/**
 * Dismisses Google consent dialog if presented.
 * @param {import('puppeteer').Page} page - Active Puppeteer page
 */
async function handleConsentDialog(page) {
  try {
    const consentSelectors = [
      'button[aria-label*="Accept all"]',
      'button[aria-label*="Agree"]',
      'button[aria-label*="I agree"]',
      'form[action*="consent"] button',
      'button:has-text("Accept all")',
      'button:has-text("I agree")',
      'button:has-text("Tout accepter")',
      'button:has-text("Alle akzeptieren")',
    ];

    for (const selector of consentSelectors) {
      try {
        const btn = await page.$(selector);
        if (btn) {
          logger.info('Dismissing Google consent modal...');
          await btn.click();
          await waitWithJitter(1500, 300);
          return;
        }
      } catch {
        // Continue checking other candidates
      }
    }

    // Check inside iframes if any
    const frames = page.frames();
    for (const frame of frames) {
      try {
        const frameBtn = await frame.$(
          'button[aria-label*="Accept all"], button[aria-label*="Agree"], button'
        );
        if (frameBtn) {
          const text = await frame.evaluate((el) => el.innerText || '', frameBtn);
          if (/accept all|agree|i agree/i.test(text)) {
            logger.info('Dismissing consent inside iframe dialog...');
            await frameBtn.click();
            await waitWithJitter(1500, 300);
            return;
          }
        }
      } catch {
        // Frame might have navigated or be cross-origin
      }
    }
  } catch (err) {
    // Non-fatal, Google Maps may not show consent dialog
  }
}

/**
 * Extracts structured listing details from the open place view.
 * @param {import('puppeteer').Page} page - Active Puppeteer page
 * @param {string} fallbackUrl - Current place URL
 * @returns {Promise<object>}
 */
async function extractBusinessDetails(page, fallbackUrl) {
  return await page.evaluate((url) => {
    /**
     * Helper to find text by selector list
     */
    const getText = (selectors) => {
      for (const sel of selectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText && el.innerText.trim()) {
          return el.innerText.trim();
        }
      }
      return '';
    };

    // 1. Business Name
    const nameSelectors = [
      'h1.DUwDvf',
      'h1.fontHeadlineLarge',
      'h1[class*="header"]',
      'div[role="main"] h1',
      'h1',
    ];
    let name = getText(nameSelectors);

    // 2. Category / Industry
    const categorySelectors = [
      'button.DkEaL',
      'button[jsaction*="category"]',
      'span.fontBodyMedium button',
      'div.fontBodyMedium button',
    ];
    let category = getText(categorySelectors);

    // 3. Rating & Reviews
    let rating = '';
    let reviewCount = '';

    const ratingEl = document.querySelector('span.ceNzKf, div.F7nice span[aria-hidden="true"]');
    if (ratingEl && ratingEl.innerText) {
      rating = ratingEl.innerText.trim();
    } else {
      const starSpan = document.querySelector('span[aria-label*="stars"], span[aria-label*="star"]');
      if (starSpan) {
        const match = starSpan.getAttribute('aria-label')?.match(/([\d.]+)\s*star/i);
        if (match) rating = match[1];
      }
    }

    const reviewsEl = document.querySelector('div.F7nice span:last-child, span[aria-label*="reviews"]');
    if (reviewsEl) {
      const text = reviewsEl.getAttribute('aria-label') || reviewsEl.innerText || '';
      const match = text.replace(/,/g, '').match(/(\d+)/);
      if (match) reviewCount = match[1];
    }

    // 4. Address
    let address = '';
    const addressBtn = document.querySelector(
      'button[data-item-id="address"], button[aria-label*="Address:"], [data-tooltip*="Copy address"]'
    );
    if (addressBtn) {
      address = addressBtn.innerText || addressBtn.getAttribute('aria-label') || '';
      address = address.replace(/^Address:\s*/i, '').trim();
    }

    // 5. Phone Number
    let phone = '';
    const phoneBtn = document.querySelector(
      'button[data-item-id^="phone:"], button[aria-label*="Phone:"], [data-tooltip*="Copy phone number"]'
    );
    if (phoneBtn) {
      phone = phoneBtn.innerText || phoneBtn.getAttribute('aria-label') || '';
      phone = phone.replace(/^Phone:\s*/i, '').trim();
    }

    // 6. Website URL
    let website = '';
    const websiteEl = document.querySelector(
      'a[data-item-id="authority"], a[aria-label*="Website:"], [data-tooltip*="Open website"]'
    );
    if (websiteEl) {
      website = websiteEl.href || websiteEl.getAttribute('href') || '';
      // Clean Google redirect wrapping if present
      if (website.includes('google.com/url?q=')) {
        try {
          const parsed = new URL(website);
          website = parsed.searchParams.get('q') || website;
        } catch {
          // Keep raw if URL parsing fails
        }
      }
    }

    return {
      name: name || 'Unknown Business',
      category: category || 'Uncategorized',
      rating: rating || 'N/A',
      reviewCount: reviewCount || '0',
      phone: phone || 'N/A',
      address: address || 'N/A',
      website: website || 'N/A',
      url: window.location.href.includes('/place/') ? window.location.href : url,
    };
  }, fallbackUrl);
}

/**
 * Main scraper coordinator.
 * @param {object} config - Scraper arguments
 */
async function runScraper(config) {
  const startTime = Date.now();
  const collectedLeads = [];
  let browser = null;

  // Graceful shutdown handling on SIGINT/SIGTERM
  const handleExit = async (signal) => {
    console.log('\n');
    logger.warn(`Interrupted by ${signal}. Performing graceful cleanup...`);
    if (collectedLeads.length > 0) {
      try {
        const savedPath = exportToCsv(collectedLeads, config.output);
        logger.success(`Saved ${collectedLeads.length} leads extracted so far to: ${savedPath}`);
      } catch (err) {
        logger.error(`Failed to emergency save CSV: ${err.message}`);
      }
    }
    if (browser) {
      try {
        await browser.close();
        logger.info('Browser closed.');
      } catch {
        // Silent
      }
    }
    process.exit(1);
  };

  process.on('SIGINT', () => handleExit('SIGINT'));
  process.on('SIGTERM', () => handleExit('SIGTERM'));

  console.log(`
${colors.cyan}${colors.bold}┌─────────────────────────────────────────────────────────────────┐
│              Google Maps Lead Scraper v1.0                      │
│                  Powered by QorelySofts                         │
└─────────────────────────────────────────────────────────────────┘${colors.reset}
`);
  logger.info(`Target Query : "${config.query}"`);
  logger.info(`Target City  : "${config.city}"`);
  logger.info(`Target Limit : ${config.limit} leads`);
  logger.info(`Base Delay   : ${config.delay}ms (±${config.jitter}ms jitter)`);
  logger.info(`Headless     : ${config.headless}`);
  logger.info(`Output File  : ${config.output}`);

  let puppeteer;
  try {
    const puppeteerModule = await import('puppeteer');
    puppeteer = puppeteerModule.default || puppeteerModule;
  } catch (importErr) {
    logger.error('Puppeteer is not installed in this directory.');
    console.log(`\n${colors.yellow}Please run the following command to install dependencies:${colors.reset}`);
    console.log(`  ${colors.bold}npm install${colors.reset}\n`);
    process.exit(1);
  }

  try {
    logger.step('Launching Chromium with stealth configuration...');
    browser = await puppeteer.launch({
      headless: config.headless ? 'new' : false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--window-size=1920,1080',
        '--lang=en-US,en',
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
      },
    });

    const page = await browser.newPage();

    // Anti-detection overrides
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    await page.evaluateOnNewDocument(() => {
      // Overwrite navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Provide realistic Chrome runtime object
      window.chrome = {
        runtime: {},
        loadTimes: function () {},
        csi: function () {},
        app: {},
      };

      // Mock languages & plugins
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
    });

    const searchQuery = `${config.query} in ${config.city}`;
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}?hl=en`;

    logger.step(`Navigating to Google Maps search: "${searchQuery}"`);
    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
      timeout: 45000,
    });

    // Check & dismiss consent modal
    await handleConsentDialog(page);

    logger.step('Locating search results feed container...');
    // Wait for feed container or results listing
    const feedSelector = 'div[role="feed"]';
    try {
      await page.waitForSelector(feedSelector, { timeout: 15000 });
    } catch {
      logger.warn('Role="feed" container not found directly. Checking alternate listings...');
    }

    // Scroll feed until enough listing elements are in DOM
    logger.step(`Scrolling results feed to discover up to ${config.limit} listings...`);
    let previousCount = 0;
    let stagnationCounter = 0;

    while (true) {
      // Extract links to individual listings
      const itemUrls = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'));
        return Array.from(new Set(anchors.map((a) => a.href)));
      });

      if (itemUrls.length >= config.limit) {
        logger.info(`Discovered ${itemUrls.length} listings (target limit of ${config.limit} reached).`);
        break;
      }

      if (itemUrls.length === previousCount) {
        stagnationCounter++;
        if (stagnationCounter >= 5) {
          logger.warn(`No new listings appeared after multiple scroll attempts. Found ${itemUrls.length} total.`);
          break;
        }
      } else {
        stagnationCounter = 0;
        previousCount = itemUrls.length;
        logger.info(`Discovered ${itemUrls.length} listings so far...`);
      }

      // Check if end of list was reached
      const isEnd = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes("You've reached the end of the list") || text.includes('No more results');
      });

      if (isEnd) {
        logger.info('Reached the end of Google Maps results.');
        break;
      }

      // Scroll inside feed container
      await page.evaluate((sel) => {
        const feed = document.querySelector(sel);
        if (feed) {
          feed.scrollTop += 1800;
        } else {
          window.scrollBy(0, 1800);
        }
      }, feedSelector);

      await waitWithJitter(1200, 300);
    }

    // Get all unique place links found
    const allLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="/maps/place/"]'));
      return Array.from(new Set(anchors.map((a) => a.href)));
    });

    const targetLinks = allLinks.slice(0, config.limit);
    logger.step(`Beginning detailed extraction of ${targetLinks.length} listings...`);

    for (let i = 0; i < targetLinks.length; i++) {
      const itemUrl = targetLinks[i];
      const indexNum = i + 1;

      try {
        // Click or navigate directly to listing
        await page.goto(itemUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 25000,
        });

        // Wait for business title heading to settle
        try {
          await page.waitForSelector('h1', { timeout: 6000 });
        } catch {
          // Continue if selector takes longer
        }

        // Slight jitter delay to let dynamic panels hydrate
        await waitWithJitter(config.delay, config.jitter);

        const details = await extractBusinessDetails(page, itemUrl);
        const leadRecord = {
          ...details,
          city: config.city,
          query: config.query,
          extractedAt: new Date().toISOString(),
        };

        collectedLeads.push(leadRecord);
        logger.lead(
          indexNum,
          targetLinks.length,
          leadRecord.name,
          leadRecord.rating,
          leadRecord.reviewCount,
          leadRecord.phone
        );
      } catch (err) {
        logger.warn(`Failed extracting item #${indexNum} (${itemUrl}): ${err.message}`);
        // Add a stub with URL to maintain consistency
        collectedLeads.push({
          name: 'Error extracting business',
          category: 'N/A',
          rating: 'N/A',
          reviewCount: '0',
          phone: 'N/A',
          address: 'N/A',
          website: 'N/A',
          url: itemUrl,
          city: config.city,
          query: config.query,
          extractedAt: new Date().toISOString(),
        });
      }
    }

    // Export results to CSV
    logger.step(`Writing ${collectedLeads.length} leads to CSV...`);
    const savedFile = exportToCsv(collectedLeads, config.output);
    const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`
${colors.green}${colors.bold}===================================================================
                     EXTRACTION COMPLETE!
===================================================================${colors.reset}
${colors.bold}Total Leads Extracted :${colors.reset} ${collectedLeads.length}
${colors.bold}Output CSV Location   :${colors.reset} ${savedFile}
${colors.bold}Time Elapsed          :${colors.reset} ${durationSec}s
${colors.bold}Author / Credit       :${colors.reset} QorelySofts
===================================================================
`);
  } catch (fatalError) {
    logger.error(`Fatal scraping error: ${fatalError.message}`);
    if (collectedLeads.length > 0) {
      const emergencyPath = exportToCsv(collectedLeads, config.output);
      logger.info(`Emergency backup of ${collectedLeads.length} leads saved to: ${emergencyPath}`);
    }
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
      logger.info('Browser session closed cleanly.');
    }
  }
}

// ============================================================================
// Script Execution Entrypoint
// ============================================================================
const config = parseArgs();
runScraper(config);
