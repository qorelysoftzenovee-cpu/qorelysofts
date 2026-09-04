# Growth Scrapers Pack 🚀
### Production-Grade Web Automation, Lead Extraction & SEO Intelligence Tools

A battle-tested collection of production-ready Node.js automation scripts engineered for growth marketers, agencies, developers, and lead generation professionals. 

Includes anti-bot evasion headers, human interaction jitter, rate-limiting to protect host servers and prevent IP bans, RFC 4180 CSV formatting, and comprehensive technical SEO diagnostics with structured JSON reporting.

---

## 📦 What's Inside the Pack

| Script | Engine | Output | Purpose |
|---|---|---|---|
| [`gmaps-lead-extractor.js`](./gmaps-lead-extractor.js) | Puppeteer (Stealth) | `.csv` (RFC 4180) | Extracts local business names, categories, websites, phone numbers, ratings, review counts, and addresses from Google Maps without getting blocked. |
| [`site-seo-auditor.js`](./site-seo-auditor.js) | Node HTTP(S) + Cheerio | Terminal UI + `.json` | Audits any URL for Title/Meta descriptions, OpenGraph social cards, H1/H2 hierarchy, broken images/alt tags, and Core Web Vitals readiness (TTFB, Compression, Payload size). |

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js**: Version 18.0.0 or higher ([Download Node.js](https://nodejs.org))
- Compatible with Windows (PowerShell/CMD), macOS (Terminal), and Linux (Bash)

### 1. Install Dependencies
Open your terminal inside the `growth-scrapers-pack` folder and run:

```bash
npm install
```

> **Note**: This will install `puppeteer` (which includes an automated, isolated Chromium browser binary) and `cheerio` (for lightning-fast server-side HTML parsing).

---

## 🛠️ Tool 1: Google Maps Lead Extractor (`gmaps-lead-extractor.js`)

Automate high-intent local B2B lead generation. Perfect for digital marketing agencies, SEO consultants, cold outreach teams, and directory builders.

### 🌟 Key Features
- **Anti-Bot Stealth Profile**: Spoofs real user agents, masking `navigator.webdriver`, setting natural language headers, and bypassing standard bot challenges.
- **Intelligent Rate-Limiting & Jitter**: Introduces randomized delays between page interactions to avoid triggering Google rate limits or CAPTCHAs.
- **RFC 4180 CSV Export**: Generates clean spreadsheets that open perfectly in Microsoft Excel, Google Sheets, Notion, or CRM import tools.
- **Automatic Consent Bypass**: Handles European/global cookie consent dialogs seamlessly.

### 💻 Non-Technical Usage Examples

#### 1. Quick Search (Extract 20 Leads)
```bash
node gmaps-lead-extractor.js --query "dentists in Austin TX"
```

#### 2. Extract Specific Number of Leads & Custom Output File
```bash
node gmaps-lead-extractor.js -q "roofing contractors in Dallas" -l 50 -o dallas-roofers.csv
```

#### 3. Watch the Browser Live (Non-Headless)
If you want to see the browser click and scroll in real-time:
```bash
node gmaps-lead-extractor.js --query "digital marketing agencies Miami" --limit 25 --headless false
```

#### 4. Custom Delay for Extra Cautious Scraping (e.g., 3.5 seconds)
```bash
node gmaps-lead-extractor.js --query "lawyers in Chicago" --delay 3500 -o chicago-lawyers.csv
```

### 📋 CSV Output Columns
Each extracted row includes:
- `Business Name`: Official name on Google Maps
- `Category`: Primary industry category (e.g., *Dental clinic*, *Law firm*)
- `Rating`: Numerical average star rating (e.g., *4.9*)
- `Reviews Count`: Total verified customer reviews (e.g., *148*)
- `Phone`: Formatted direct contact phone number
- `Website`: Canonical business website URL
- `Address`: Full physical street address
- `Google Maps URL`: Direct permanent link to the place on Maps

---

## 🔍 Tool 2: Technical Site SEO Auditor (`site-seo-auditor.js`)

Instantly analyze any web page for on-page SEO defects, accessibility issues, and performance bottlenecks.

### 🌟 Key Features
- **Overall Health Score (0 - 100)**: Transparent weighted score penalizing critical blockers and highlighting quick wins.
- **Title & Description Linter**: Flags missing, too short (< 30 chars), or excessively long (> 65 chars) titles and meta descriptions.
- **Social Graph Inspector**: Verifies OpenGraph (`og:title`, `og:image`, `og:description`) and Twitter Card tags.
- **Heading Hierarchy Validator**: Checks single `<h1>` semantic convention and counts `<h2>`/`<h3>` subheadings.
- **Rate-Limited Image Audit**: Detects missing `alt` attributes and performs asynchronous `HEAD` requests to verify image links are not broken (404).
- **Core Web Vitals & Server Readiness**: Measures real-world TTFB (Time to First Byte), verifies Gzip/Brotli text compression, checks HTTPS encryption, and inspects HTML payload size.
- **Dual Output**: Colorful terminal summary dashboard + full machine-readable JSON report.

### 💻 Non-Technical Usage Examples

#### 1. Basic Audit
```bash
node site-seo-auditor.js --url https://example.com
```

#### 2. Audit with Custom JSON Report Name
```bash
node site-seo-auditor.js -u https://news.ycombinator.com -o yc-report.json
```

#### 3. Fast Audit (Skip Image HTTP Checks)
For large pages with hundreds of images where you only want meta tag and heading analysis:
```bash
node site-seo-auditor.js --url https://yourclientwebsite.com --skip-images
```

### 📊 Sample Terminal Output
```
╔════════════════════════════════════════════════════════════════════╗
║                   SITE SEO AUDITOR v1.0.0                          ║
║      On-Page Technical SEO & Core Web Vitals Readiness Linter      ║
╚════════════════════════════════════════════════════════════════════╝

🎯 Auditing Target URL : https://example.com
📁 JSON Report Output : seo-audit-report.json
⏱️ Timeout Limit      : 15000ms

✓ Server responded with HTTP 200 (TTFB: 142ms)

════════════════════════════════════════════════════════════════════
📊 OVERALL SEO HEALTH SCORE: 92 / 100
   ✅ Passed Checks : 8
   ⚠️  Warnings      : 2
   ❌ Critical Issues: 0
════════════════════════════════════════════════════════════════════
```

---

## 🛡️ Anti-Ban & Rate-Limiting Best Practices

1. **Keep `--delay` at 2000ms or higher**: Google and high-traffic targets track request velocities. The built-in jitter adds natural 10-35% variance to mimic human navigation.
2. **Use Batching**: When auditing client sites, `site-seo-auditor.js` automatically throttles external image verification to 5 concurrent requests with 250ms pauses to avoid overwhelming host servers.
3. **Residential Proxies (Optional)**: If extracting thousands of leads daily, pass proxy flags to Puppeteer args in `gmaps-lead-extractor.js`:
   ```javascript
   args: ['--proxy-server=http://YOUR_PROXY_IP:PORT']
   ```

---

## 📄 Commercial & Client License

Licensed by **QorelySofts** (https://www.qorelysofts.co.in) for:
- ✅ Unlimited personal lead generation & audits
- ✅ Unlimited client deliverables & agency services
- ✅ Integration into internal tools and commercial workflows
- ❌ Reselling or redistributing the raw source files as a competing template pack is prohibited.

For technical assistance or custom scraper requests:
📧 **Email Support**: `qorelysoftzenovee@gmail.com`
🌐 **Store**: [https://www.qorelysofts.co.in](https://www.qorelysofts.co.in)
