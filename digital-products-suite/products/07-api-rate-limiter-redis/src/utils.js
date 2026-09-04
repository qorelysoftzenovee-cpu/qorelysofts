/**
 * @file utils.js
 * @description Network IP parsing, CIDR subnet matching, and rate-limiting calculation utilities.
 * @author QorelySofts
 */

'use strict';

/**
 * Normalizes an IP address string by trimming whitespace and stripping IPv4-mapped IPv6 prefixes.
 *
 * @param {string} rawIp - The raw IP address string.
 * @returns {string} Clean normalized IP address.
 */
function normalizeIP(rawIp) {
  if (!rawIp || typeof rawIp !== 'string') {
    return '127.0.0.1';
  }

  let ip = rawIp.trim();

  // Strip IPv4-mapped IPv6 prefix (e.g., "::ffff:192.168.1.1" -> "192.168.1.1")
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // Handle standard IPv6 loopback
  if (ip === '::1') {
    return '127.0.0.1';
  }

  return ip;
}

/**
 * Extracts and normalizes the client IP address from an Express or Node.js HTTP request object.
 * Checks proxy headers (X-Forwarded-For, CF-Connecting-IP, X-Real-IP) before falling back to socket address.
 *
 * @param {import('http').IncomingMessage | any} req - The incoming request object.
 * @returns {string} The resolved client IP address.
 */
function parseIP(req) {
  if (!req) return '127.0.0.1';

  // 1. Cloudflare header
  const cfConnectingIp = req.headers && req.headers['cf-connecting-ip'];
  if (cfConnectingIp && typeof cfConnectingIp === 'string') {
    return normalizeIP(cfConnectingIp);
  }

  // 2. Standard X-Forwarded-For header (first entry is the client IP)
  const forwardedFor = req.headers && req.headers['x-forwarded-for'];
  if (forwardedFor && typeof forwardedFor === 'string') {
    const clientIp = forwardedFor.split(',')[0].trim();
    if (clientIp) {
      return normalizeIP(clientIp);
    }
  }

  // 3. X-Real-IP header (common with NGINX reverse proxies)
  const realIp = req.headers && req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return normalizeIP(realIp);
  }

  // 4. Express req.ip property
  if (req.ip && typeof req.ip === 'string') {
    return normalizeIP(req.ip);
  }

  // 5. Node.js socket remote address
  const socketAddress =
    (req.socket && req.socket.remoteAddress) ||
    (req.connection && req.connection.remoteAddress);
  if (socketAddress && typeof socketAddress === 'string') {
    return normalizeIP(socketAddress);
  }

  return '127.0.0.1';
}

/**
 * Converts an IPv4 dotted string to a 32-bit unsigned integer.
 *
 * @param {string} ip - Dotted decimal IPv4 string (e.g. "192.168.1.1").
 * @returns {number|null} 32-bit unsigned integer or null if invalid.
 */
function ipv4ToLong(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;

  let long = 0;
  for (let i = 0; i < 4; i++) {
    const octet = Number(parts[i]);
    if (isNaN(octet) || octet < 0 || octet > 255) {
      return null;
    }
    long = ((long << 8) + octet) >>> 0;
  }
  return long;
}

/**
 * Checks if a given IPv4 address belongs to a specified CIDR block.
 * Example CIDRs: "10.0.0.0/8", "192.168.0.0/16", "127.0.0.1/32".
 *
 * @param {string} ip - IPv4 string.
 * @param {string} cidr - CIDR subnet string (e.g., "192.168.0.0/24").
 * @returns {boolean} True if the IP matches the CIDR range.
 */
function isIPv4InCIDR(ip, cidr) {
  const [rangeIp, prefixStr] = cidr.split('/');
  const prefix = prefixStr !== undefined ? parseInt(prefixStr, 10) : 32;

  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    return false;
  }

  const clientLong = ipv4ToLong(ip);
  const rangeLong = ipv4ToLong(rangeIp);

  if (clientLong === null || rangeLong === null) {
    return false;
  }

  if (prefix === 0) {
    return true;
  }

  // Generate bitmask for subnet prefix
  const mask = ((0xffffffff << (32 - prefix)) >>> 0);
  return (clientLong & mask) === (rangeLong & mask);
}

/**
 * Checks if a given IP address is in the whitelist array.
 * Supports exact IP matches and CIDR notation ranges (e.g. 192.168.0.0/16, 10.0.0.0/8).
 *
 * @param {string} clientIp - The client IP to test.
 * @param {string[]} whitelist - Array of whitelisted IPs or CIDR notations.
 * @returns {boolean} True if clientIp is whitelisted.
 */
function isWhitelisted(clientIp, whitelist) {
  if (!Array.isArray(whitelist) || whitelist.length === 0) {
    return false;
  }

  const normalizedClientIp = normalizeIP(clientIp);

  for (const entry of whitelist) {
    if (typeof entry !== 'string') continue;
    const rule = entry.trim();

    // Check CIDR pattern (e.g., 10.0.0.0/8)
    if (rule.includes('/')) {
      if (isIPv4InCIDR(normalizedClientIp, rule)) {
        return true;
      }
    } else {
      // Direct exact match
      const normalizedRule = normalizeIP(rule);
      if (normalizedClientIp === normalizedRule) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculates rate limit window reset time and retry duration.
 *
 * @param {number|null} oldestTimestamp - Unix timestamp in ms of oldest entry in the window.
 * @param {number} windowMs - Window duration in milliseconds.
 * @returns {{ resetMs: number, resetSeconds: number, retryAfter: number }} Reset calculations.
 */
function calculateReset(oldestTimestamp, windowMs) {
  const now = Date.now();
  const resetMs = oldestTimestamp ? oldestTimestamp + windowMs : now + windowMs;
  const resetSeconds = Math.ceil(resetMs / 1000);
  const retryAfter = Math.max(1, Math.ceil((resetMs - now) / 1000));

  return {
    resetMs,
    resetSeconds,
    retryAfter,
  };
}

/**
 * Generates a unique member ID for Redis sorted sets to avoid duplicate collisions.
 *
 * @param {number} timestamp - Current timestamp in ms.
 * @returns {string} Unique sorted set member ID.
 */
function generateMemberId(timestamp) {
  const randomSuffix = Math.random().toString(36).substring(2, 10);
  return `${timestamp}:${randomSuffix}`;
}

module.exports = {
  normalizeIP,
  parseIP,
  ipv4ToLong,
  isIPv4InCIDR,
  isWhitelisted,
  calculateReset,
  generateMemberId,
};
