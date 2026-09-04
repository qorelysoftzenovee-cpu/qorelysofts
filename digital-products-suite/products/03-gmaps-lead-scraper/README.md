# Google Maps Lead Scraper

A production-grade, headless Puppeteer lead extraction tool designed to gather high-value local business data from Google Maps at scale. Engineered with anti-bot evasion techniques, dynamic scroll handling, cookie consent bypass, jitter rate limiting, and RFC 4180 compliant CSV export.

Developed by **QorelySofts**.

---

## Key Features

- **Automated Search & Scroll**: Navigates Google Maps for any niche and location, automatically scrolling the virtual feed container until your requested target limit is met.
- **Deep Listing Extraction**: Clicks into each individual business to extract:
  - Business Name
  - Primary Category / Industry
  - Aggregate Rating (out of 5 stars)
  - Total Review Count
  - Phone Number
  - Physical Street Address
  - Direct Website URL (decoding Google redirects)
  - Google Maps Place URL
- **Stealth & Anti-Detection**:
  - Realistic Chrome Desktop User-Agent string
  - `navigator.webdriver` property removal
  - Chrome runtime mocking (`window.chrome.runtime`)
  - Realistic 1920x1080 viewport and color depth
  - Natural `Accept-Language` headers
  - Configurable jitter delays to break machine behavioral timing patterns
- **Cookie & Consent Handling**: Automatically detects and dismisses Google's GDPR / EU consent prompts.
- **Safe & Resilient**:
  - Graceful interrupt handling (`Ctrl+C` / `SIGINT`): immediately flushes all scraped records to CSV before shutting down the browser.
  - Per-listing error recovery: an issue with one card never crashes the entire batch.
- **RFC 4180 CSV Export**: Complete with UTF-8 Byte Order Mark (BOM) so exported files open flawlessly in Microsoft Excel, Google Sheets, and Numbers without encoding artifacts.

---

## Installation & Prerequisites

Ensure you have **Node.js (v18.0.0 or higher)** installed on your machine.

1. Navigate to the project directory:
   ```bash
   cd c:\Users\abdul\OneDrive\Desktop\Digital products\digital-products-suite\products\03-gmaps-lead-scraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

This will automatically download Puppeteer along with a matching version of the Chromium browser.

---

## Quick Start

Run a quick test scrape for dentists in Austin, TX with default settings (25 leads saved to `leads.csv`):

```bash
npm run scrape
```

Or run directly with custom parameters:

```bash
node scraper.js --query "orthodontist" --city "Austin, TX" --limit 15 --output austin-ortho.csv
```

---

## CLI Options & Reference

| Argument | Short | Type | Default | Description |
|---|---|---|---|---|
| `--query` | `-q` | `string` | `"dentist"` | The business category, service, or keyword to search for. |
| `--city` | `-c` | `string` | `"Austin, TX"` | Target city, region, or neighborhood. |
| `--limit` | `-l` | `number` | `25` | Maximum number of leads to extract. |
| `--output` | `-o` | `string` | `"leads.csv"` | Destination path for the generated CSV file. |
| `--delay` | `-d` | `number` | `2000` | Base delay between listing interactions (in milliseconds). |
| `--jitter` | - | `number` | `500` | Random variance added or subtracted from the base delay (ms). |
| `--headless` | - | `boolean` | `true` | Runs Chromium in headless mode (`true` or `false`). Set to `false` to watch browser live. |
| `--help` | `-h` | - | - | Displays command line manual and exits. |

---

## Usage Examples

### 1. Watch the Scraper Live (Non-Headless)
Setting `--headless false` opens a visual browser window, ideal for verifying layout and debugging:
```bash
node scraper.js --query "plumbers" --city "Phoenix, AZ" --limit 10 --headless false
```

### 2. High-Volume Lead Generation with Safe Delays
To gather 100 leads safely without triggering temporary IP rate limits:
```bash
node scraper.js --query "roofing contractors" --city "Denver, CO" --limit 100 --delay 3000 --jitter 800 --output denver_roofers.csv
```

### 3. Multi-Word Niches & International Cities
```bash
node scraper.js --query "digital marketing agency" --city "London, UK" --limit 50 --output london_agencies.csv
```

---

## CSV Output Schema

The output CSV strictly conforms to the RFC 4180 standard with escaped quotes and UTF-8 encoding:

| Column Name | Sample Value | Description |
|---|---|---|
| `Business Name` | `Austin City Dental` | Official name of the business. |
| `Category` | `Dentist` | Primary category assigned on Google Maps. |
| `Rating` | `4.9` | Star rating out of 5.0. |
| `Review Count` | `384` | Total count of verified customer reviews. |
| `Phone` | `(512) 458-4567` | Public business telephone number. |
| `Address` | `1201 W 38th St #201, Austin, TX 78705` | Full physical address. |
| `Website` | `https://www.austincitydental.com` | Resolved official business website. |
| `Google Maps URL` | `https://www.google.com/maps/place/...` | Direct canonical link to the Google Maps listing. |
| `City` | `Austin, TX` | Target query city. |
| `Search Query` | `dentist` | Term searched. |
| `Extracted At` | `2026-09-04T12:00:00.000Z` | ISO 8601 UTC extraction timestamp. |

Refer to [`sample-output.csv`](./sample-output.csv) for a formatted 3-row reference.

---

## Anti-Ban & Best Practices Guide

Google implements advanced behavioral analysis and request rate detection. To preserve longevity and prevent IP blocks:

1. **Keep Delays Natural**: Do not set `--delay` below `1500ms`. A base delay of `2000ms` with `500ms` jitter mimics human browsing speeds.
2. **Scrape in Sensible Batches**: Rather than scraping 1,000 leads in a single continuous session, break runs into batches of 50–100 leads per city or sub-zipcode.
3. **Use Headless Wisely**: Running `--headless false` during testing helps you identify if Google has presented a CAPTCHA or modified layout in your region.
4. **Proxy Integration**: If scraping continuously on cloud VPS providers (AWS, DigitalOcean, Hetzner), route Puppeteer traffic through residential proxies by passing `--args="--proxy-server=..."` to the browser launcher.

---

## Troubleshooting

### Q: Google Maps shows 0 results or stalls after a few items.
- Ensure your internet connection is stable.
- Check if your IP was temporarily flagged by running with `--headless false`. If a CAPTCHA appears, solve it manually in non-headless mode or pause for 15 minutes.

### Q: Characters appear corrupted in Microsoft Excel.
- The script automatically includes the UTF-8 Byte Order Mark (`\uFEFF`), which forces Excel to interpret characters correctly across all languages. Ensure you open the CSV directly or import as UTF-8.

### Q: Google Maps changed class names.
- The script uses multiple fallback selectors (including ARIA labels, semantic roles, and data attributes like `data-item-id="phone:"`) to guarantee durability against minor Google UI updates.

---

## License

This software is released under the MIT License.
Copyright (c) 2026 **QorelySofts**. All rights reserved.
