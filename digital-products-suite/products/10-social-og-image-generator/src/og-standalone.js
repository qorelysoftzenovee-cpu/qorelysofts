/**
 * Social OG Image Generator - Standalone Node.js Server
 * 
 * Generates high-fidelity 1200x630 Open Graph (OG) social card PNG images
 * using Canvas (node-canvas) with built-in LRU caching and robust fallback support.
 * 
 * @author QorelySofts
 * @license MIT
 */

const http = require('node:http');
const { URL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const { themes, getTheme } = require('./themes');

// Try importing node-canvas with graceful fallback if native bindings are pending
let canvasLib = null;
try {
  canvasLib = require('canvas');
} catch (err) {
  console.warn(`[OG Standalone] Note: 'canvas' module is not currently compiled/installed (${err.message}). Activating integrated SVG vector generator mode.`);
}

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const PORT = parseInt(process.env.PORT || '3001', 10);
const DEFAULT_THEME = process.env.DEFAULT_THEME || 'dark';
const DEFAULT_SITE = process.env.SITE_NAME || 'qorelysofts.com';
const MAX_CACHE_ITEMS = parseInt(process.env.CACHE_MAX_ITEMS || '50', 10);

const WIDTH = 1200;
const HEIGHT = 630;

// ==========================================
// LRU CACHE IMPLEMENTATION
// ==========================================

class LRUCache {
  /**
   * @param {number} capacity - Maximum entries to store.
   */
  constructor(capacity = 50) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  /**
   * Generates a deterministic cache key from parameters.
   * @param {object} params
   * @returns {string}
   */
  static generateKey(params) {
    return [
      (params.title || '').trim().toLowerCase(),
      (params.author || '').trim().toLowerCase(),
      (params.tag || '').trim().toLowerCase(),
      (params.theme || 'dark').trim().toLowerCase(),
      (params.site || '').trim().toLowerCase()
    ].join('::');
  }

  /**
   * Gets an item from cache, promoting it to most recently used.
   * @param {string} key
   * @returns {{buffer: Buffer, contentType: string} | null}
   */
  get(key) {
    if (!this.cache.has(key)) return null;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Puts an item in cache, evicting the least recently used if full.
   * @param {string} key
   * @param {{buffer: Buffer, contentType: string}} value
   */
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest entry (first key in iteration order)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  /**
   * Clears the entire cache.
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Returns current cache size.
   * @returns {number}
   */
  get size() {
    return this.cache.size;
  }
}

const lruCache = new LRUCache(MAX_CACHE_ITEMS);

// ==========================================
// TEXT & RENDERING HELPERS
// ==========================================

/**
 * Calculates optimal font size according to title length.
 * @param {number} length
 * @returns {number}
 */
function getOptimalFontSize(length) {
  if (length <= 35) return 56;
  if (length <= 65) return 48;
  if (length <= 95) return 40;
  return 34;
}

/**
 * Extracts initials from author name.
 * @param {string} author
 * @returns {string}
 */
function getAuthorInitials(author) {
  if (!author) return 'QS';
  const parts = author.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Wraps text into lines using Canvas 2D context measurement.
 * Truncates at maxLines with ellipsis.
 * @param {any} ctx
 * @param {string} text
 * @param {number} maxWidth
 * @param {number} maxLines
 * @returns {string[]}
 */
function wrapCanvasText(ctx, text, maxWidth, maxLines = 3) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const width = ctx.measureText(testLine).width;

    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
      if (lines.length === maxLines - 1) {
        // Last allowed line: gather remaining words and truncate if needed
        const remaining = words.slice(i).join(' ');
        let lastLine = remaining;
        while (ctx.measureText(lastLine + '...').width > maxWidth && lastLine.length > 0) {
          lastLine = lastLine.slice(0, -1).trim();
        }
        lines.push(lastLine ? `${lastLine}...` : '...');
        return lines;
      }
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Draws a rounded rectangle path on canvas.
 * @param {any} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} radius
 */
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// ==========================================
// CANVAS RENDERER (node-canvas)
// ==========================================

/**
 * Renders an OG image using node-canvas.
 * @param {object} params
 * @returns {Buffer} PNG image buffer.
 */
function renderWithCanvas(params) {
  const { createCanvas } = canvasLib;
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  const theme = getTheme(params.theme);
  const title = params.title || 'Architecting High-Scale Cloud Systems';
  const author = params.author || 'QorelySofts Engineering';
  const tag = (params.tag || 'Architecture').toUpperCase();
  const site = params.site || DEFAULT_SITE;
  const initials = getAuthorInitials(author);

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bgGrad.addColorStop(0, theme.bgGradientStart);
  bgGrad.addColorStop(1, theme.bgGradientEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 2. Decorative Ambient Radial Glows
  const glowTop = ctx.createRadialGradient(WIDTH - 150, 80, 20, WIDTH - 150, 80, 380);
  glowTop.addColorStop(0, theme.accentColor);
  glowTop.addColorStop(1, 'transparent');
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = glowTop;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.restore();

  const glowBottom = ctx.createRadialGradient(150, HEIGHT - 80, 20, 150, HEIGHT - 80, 350);
  glowBottom.addColorStop(0, theme.accentColor);
  glowBottom.addColorStop(1, 'transparent');
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = glowBottom;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.restore();

  // 3. Subtle Outer Card Border
  ctx.strokeStyle = theme.cardBorder || 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 30, 30, WIDTH - 60, HEIGHT - 60, 24);
  ctx.stroke();

  // 4. Decorative Geometric Elements in corner
  ctx.fillStyle = theme.accentColor;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(WIDTH - 120, 75, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(WIDTH - 100, 75, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(WIDTH - 80, 75, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // 5. Header: Tag Badge
  ctx.font = 'bold 18px "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
  const tagTextWidth = ctx.measureText(tag).width;
  const badgeWidth = tagTextWidth + 46;
  const badgeHeight = 42;
  const badgeX = 80;
  const badgeY = 70;

  // Badge background & border
  ctx.fillStyle = theme.badgeBg || 'rgba(56, 189, 248, 0.15)';
  drawRoundedRect(ctx, badgeX, badgeY, badgeWidth, badgeHeight, 21);
  ctx.fill();

  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Badge status dot
  ctx.fillStyle = theme.accentColor;
  ctx.beginPath();
  ctx.arc(badgeX + 20, badgeY + badgeHeight / 2, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Badge text
  ctx.fillStyle = theme.badgeText || theme.accentColor;
  ctx.fillText(tag, badgeX + 34, badgeY + 27);

  // 6. Header: Site Branding
  const brandX = WIDTH - 280;
  const brandY = 74;

  // Site icon glyph
  ctx.fillStyle = theme.accentColor;
  drawRoundedRect(ctx, brandX, brandY, 34, 34, 9);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Q', brandX + 9, brandY + 25);

  // Site domain
  ctx.fillStyle = theme.subtextColor;
  ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
  ctx.fillText(site, brandX + 46, brandY + 24);

  // 7. Title Heading
  const fontSize = getOptimalFontSize(title.length);
  ctx.font = `800 ${fontSize}px "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
  ctx.fillStyle = theme.titleColor;

  const maxTitleWidth = 1040;
  const lines = wrapCanvasText(ctx, title, maxTitleWidth, 3);
  const lineHeight = fontSize * 1.25;
  const totalTitleHeight = lines.length * lineHeight;
  const startY = 240 - (totalTitleHeight / 4);

  lines.forEach((line, index) => {
    ctx.fillText(line, 80, startY + (index * lineHeight));
  });

  // 8. Divider Line above Footer
  const footerY = HEIGHT - 135;
  ctx.strokeStyle = theme.cardBorder || 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, footerY);
  ctx.lineTo(WIDTH - 80, footerY);
  ctx.stroke();

  // 9. Footer: Author Profile
  const avatarY = footerY + 28;
  const avatarRadius = 26;
  const avatarCenterX = 80 + avatarRadius;
  const avatarCenterY = avatarY + avatarRadius;

  // Avatar circular background
  const avatarGrad = ctx.createLinearGradient(80, avatarY, 80 + avatarRadius * 2, avatarY + avatarRadius * 2);
  avatarGrad.addColorStop(0, theme.accentColor);
  avatarGrad.addColorStop(1, '#3b82f6');
  ctx.fillStyle = avatarGrad;
  ctx.beginPath();
  ctx.arc(avatarCenterX, avatarCenterY, avatarRadius, 0, Math.PI * 2);
  ctx.fill();

  // Avatar Initials
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(initials, avatarCenterX, avatarCenterY + 7);
  ctx.textAlign = 'left';

  // Author Name
  ctx.font = 'bold 22px "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = theme.titleColor;
  ctx.fillText(author, 145, avatarCenterY - 2);

  // Subtitle
  ctx.font = '500 16px "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = theme.subtextColor;
  ctx.fillText('Author \u2022 Verified Publication', 145, avatarCenterY + 20);

  // 10. Footer: Reading indicator / Arrow
  ctx.font = '600 18px "Segoe UI", Roboto, sans-serif';
  ctx.fillStyle = theme.subtextColor;
  ctx.fillText('5 min read  \u2192', WIDTH - 200, avatarCenterY + 8);

  return canvas.toBuffer('image/png');
}

// ==========================================
// FALLBACK VECTOR SVG RENDERER
// ==========================================

/**
 * Escapes XML special characters for safe SVG insertion.
 * @param {string} str
 * @returns {string}
 */
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wraps text into lines using character estimation for pure SVG fallback.
 * @param {string} text
 * @param {number} charsPerLine
 * @param {number} maxLines
 * @returns {string[]}
 */
function wrapSvgText(text, charsPerLine = 38, maxLines = 3) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';

  for (let i = 0; i < words.length; i++) {
    const test = current ? `${current} ${words[i]}` : words[i];
    if (test.length > charsPerLine && current) {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines - 1) {
        const rest = words.slice(i).join(' ');
        lines.push(rest.length > charsPerLine ? rest.slice(0, charsPerLine - 3) + '...' : rest);
        return lines;
      }
    } else {
      current = test;
    }
  }
  if (current && lines.length < maxLines) {
    lines.push(current);
  }
  return lines;
}

/**
 * Generates an SVG vector graphic buffer matching the 1200x630 card.
 * @param {object} params
 * @returns {Buffer}
 */
function renderWithSvg(params) {
  const theme = getTheme(params.theme);
  const title = params.title || 'Architecting High-Scale Cloud Systems';
  const author = params.author || 'QorelySofts Engineering';
  const tag = (params.tag || 'Architecture').toUpperCase();
  const site = params.site || DEFAULT_SITE;
  const initials = getAuthorInitials(author);

  const fontSize = getOptimalFontSize(title.length);
  const lines = wrapSvgText(title, Math.floor(1100 / (fontSize * 0.58)), 3);
  const lineHeight = Math.round(fontSize * 1.25);
  const startY = 240 - ((lines.length * lineHeight) / 4);

  const titleTspans = lines.map((line, idx) => 
    `<tspan x="80" y="${startY + (idx * lineHeight)}">${escapeXml(line)}</tspan>`
  ).join('\n');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.bgGradientStart}" />
      <stop offset="100%" stop-color="${theme.bgGradientEnd}" />
    </linearGradient>
    <radialGradient id="glowTop" cx="80%" cy="20%" r="60%">
      <stop offset="0%" stop-color="${theme.accentColor}" stop-opacity="0.22" />
      <stop offset="100%" stop-color="${theme.accentColor}" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowBottom" cx="20%" cy="85%" r="50%">
      <stop offset="0%" stop-color="${theme.accentColor}" stop-opacity="0.14" />
      <stop offset="100%" stop-color="${theme.accentColor}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.accentColor}" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>

  <!-- Background Base -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />

  <!-- Ambient Glow Overlays -->
  <rect width="100%" height="100%" fill="url(#glowTop)" />
  <rect width="100%" height="100%" fill="url(#glowBottom)" />

  <!-- Outer Card Frame -->
  <rect x="30" y="30" width="${WIDTH - 60}" height="${HEIGHT - 60}" rx="24" fill="none" stroke="${theme.cardBorder || 'rgba(255,255,255,0.08)'}" stroke-width="1.5" />

  <!-- Top Decorative Dots -->
  <circle cx="${WIDTH - 120}" cy="75" r="5" fill="${theme.accentColor}" opacity="0.6" />
  <circle cx="${WIDTH - 100}" cy="75" r="5" fill="${theme.subtextColor}" opacity="0.35" />
  <circle cx="${WIDTH - 80}" cy="75" r="5" fill="${theme.subtextColor}" opacity="0.15" />

  <!-- Category Tag Badge -->
  <g transform="translate(80, 70)">
    <rect width="${tag.length * 11 + 48}" height="42" rx="21" fill="${theme.badgeBg || 'rgba(56,189,248,0.15)'}" stroke="${theme.accentColor}" stroke-width="1.5" />
    <circle cx="20" cy="21" r="4.5" fill="${theme.accentColor}" />
    <text x="34" y="27" fill="${theme.badgeText || theme.accentColor}" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" letter-spacing="0.06em">${escapeXml(tag)}</text>
  </g>

  <!-- Site Branding -->
  <g transform="translate(${WIDTH - 280}, 74)">
    <rect width="34" height="34" rx="9" fill="${theme.accentColor}" />
    <text x="10" y="25" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800">Q</text>
    <text x="46" y="24" fill="${theme.subtextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700">${escapeXml(site)}</text>
  </g>

  <!-- Main Title Text -->
  <text font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="${fontSize}" font-weight="800" fill="${theme.titleColor}" letter-spacing="-0.025em">
    ${titleTspans}
  </text>

  <!-- Footer Divider Line -->
  <line x1="80" y1="${HEIGHT - 135}" x2="${WIDTH - 80}" y2="${HEIGHT - 135}" stroke="${theme.cardBorder || 'rgba(255,255,255,0.1)'}" stroke-width="1" />

  <!-- Footer: Author Profile -->
  <g transform="translate(80, ${HEIGHT - 105})">
    <circle cx="26" cy="26" r="26" fill="url(#avatarGrad)" />
    <text x="26" y="33" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700">${escapeXml(initials)}</text>
    <text x="70" y="24" fill="${theme.titleColor}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">${escapeXml(author)}</text>
    <text x="70" y="46" fill="${theme.subtextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="500">Author • Verified Publication</text>
  </g>

  <!-- Reading Time Pill -->
  <text x="${WIDTH - 180}" y="${HEIGHT - 75}" fill="${theme.subtextColor}" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600">5 min read  →</text>
</svg>`;

  return Buffer.from(svg, 'utf8');
}

/**
 * High-level image generator: uses node-canvas if available, otherwise vector SVG.
 * @param {object} params
 * @returns {{buffer: Buffer, contentType: string}}
 */
function generateOgImage(params) {
  if (canvasLib) {
    return {
      buffer: renderWithCanvas(params),
      contentType: 'image/png'
    };
  }

  // Fallback vector SVG
  return {
    buffer: renderWithSvg(params),
    contentType: 'image/svg+xml'
  };
}

// ==========================================
// HTTP SERVER & ROUTING
// ==========================================

const server = http.createServer((req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  // Health Endpoint
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'ok',
      engine: canvasLib ? 'node-canvas' : 'vector-svg-fallback',
      cachedImages: lruCache.size,
      maxCacheCapacity: MAX_CACHE_ITEMS,
      uptime: process.uptime()
    }));
  }

  // Available Themes Endpoint
  if (pathname === '/themes') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(themes, null, 2));
  }

  // Cache Clear Endpoint
  if (pathname === '/clear-cache') {
    lruCache.clear();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ message: 'Cache cleared successfully' }));
  }

  // OG Image Generation Endpoint (matches / or /og or /api/og)
  if (pathname === '/' || pathname === '/og' || pathname === '/api/og') {
    try {
      const queryParams = {
        title: parsedUrl.searchParams.get('title') || 'Architecting High-Scale Cloud Systems',
        author: parsedUrl.searchParams.get('author') || 'QorelySofts Engineering',
        tag: parsedUrl.searchParams.get('tag') || 'Architecture',
        theme: parsedUrl.searchParams.get('theme') || DEFAULT_THEME,
        site: parsedUrl.searchParams.get('site') || DEFAULT_SITE
      };

      const cacheKey = LRUCache.generateKey(queryParams);
      const cached = lruCache.get(cacheKey);

      if (cached) {
        res.writeHead(200, {
          'Content-Type': cached.contentType,
          'Content-Length': cached.buffer.length,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'X-Cache': 'HIT'
        });
        return res.end(cached.buffer);
      }

      // Generate Image
      const generated = generateOgImage(queryParams);
      lruCache.put(cacheKey, generated);

      res.writeHead(200, {
        'Content-Type': generated.contentType,
        'Content-Length': generated.buffer.length,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-Cache': 'MISS'
      });
      return res.end(generated.buffer);
    } catch (err) {
      console.error('[OG Generation Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        error: 'Failed to generate OG image',
        details: err.message
      }));
    }
  }

  // 404 Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint Not Found', pathname }));
});

// ==========================================
// GRACEFUL SHUTDOWN & BOOTSTRAP
// ==========================================

function shutdown(signal) {
  console.log(`\n[Shutdown] Received ${signal}. Stopping Social OG Image Generator...`);
  server.close(() => {
    console.log('[Shutdown] Server stopped.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 4000).unref();
}

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  SOCIAL OG IMAGE GENERATOR - QorelySofts`);
    console.log(`======================================================`);
    console.log(`  Server URL     : http://localhost:${PORT}/`);
    console.log(`  Engine Mode    : ${canvasLib ? 'node-canvas (PNG)' : 'SVG Vector Engine'}`);
    console.log(`  LRU Cache Cap  : ${MAX_CACHE_ITEMS} images`);
    console.log(`  Sample URL     : http://localhost:${PORT}/?title=My+First+Post&author=Jane+Doe&tag=Tech&theme=dark`);
    console.log(`======================================================\n`);
  });

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = {
  server,
  LRUCache,
  lruCache,
  generateOgImage,
  renderWithCanvas,
  renderWithSvg
};
