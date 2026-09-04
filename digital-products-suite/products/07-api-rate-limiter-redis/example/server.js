/**
 * @file server.js
 * @description Comprehensive Express example showcasing global, per-route, API-key, and whitelisted rate limiting.
 * @author QorelySofts
 */

'use strict';

const express = require('express');
const { createRateLimiter, ping } = require('../src/index');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ============================================================================
// 1. IP Whitelist Configuration
// ============================================================================
// Allows local developers and trusted private network ranges to bypass limits
const TRUSTED_WHITELIST = [
  '127.0.0.1',
  '::1',
  '10.0.0.0/8',
  '192.168.0.0/16',
  '172.16.0.0/12',
];

// ============================================================================
// 2. Global Rate Limiter (60 requests per 1 minute, with 10% burst tolerance)
// ============================================================================
const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  burstTolerance: 0.1, // allows up to 66 requests before hard 429
  keyPrefix: 'ratelimit:global',
  whitelist: TRUSTED_WHITELIST,
  passOnError: true,
  onLimitReached: (req, res, info) => {
    console.warn(`[ALERT] Global limit exceeded for IP: ${req.ip} | Reset in ${info.retryAfter}s`);
  },
});

// Apply global rate limiting to all incoming /api/ routes
app.use('/api/', globalLimiter);

// ============================================================================
// 3. Strict Per-Route Rate Limiter (e.g. Login / Auth endpoints: 5 attempts per 15 mins)
// ============================================================================
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  burstTolerance: 0, // strict: zero burst tolerance
  keyPrefix: 'ratelimit:auth:login',
  message: 'Too many authentication attempts. Account temporarily locked for 15 minutes.',
  onLimitReached: (req) => {
    console.error(`[SECURITY] Brute-force attempt detected from IP: ${req.ip}`);
  },
});

// ============================================================================
// 4. Custom API Key Rate Limiter (Key-based extraction instead of IP)
// ============================================================================
const apiKeyLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100, // standard tier limit
  keyPrefix: 'ratelimit:apikey',
  keyGenerator: (req) => {
    // Extract key from header or query parameter
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    return apiKey ? `apikey:${apiKey}` : req.ip;
  },
  onLimitReached: (req, res, info) => {
    console.warn(`[BILLING] API key quota exhausted: ${req.headers['x-api-key']}`);
  },
});

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * Health check & Redis connectivity endpoint (not rate-limited)
 */
app.get('/health', async (req, res) => {
  const redisStatus = await ping();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    redis: redisStatus,
  });
});

/**
 * Public route protected by global rate limiter
 */
app.get('/api/public', (req, res) => {
  res.json({
    message: 'Welcome to the public API!',
    documentation: 'https://github.com/qorelysofts/api-rate-limiter-redis',
    clientIp: req.ip,
  });
});

/**
 * High-security route with strict login limit
 */
app.post('/api/auth/login', loginLimiter, (req, res) => {
  const { username } = req.body || {};
  res.json({
    success: true,
    message: `Authentication challenge processed for ${username || 'anonymous'}.`,
  });
});

/**
 * Developer route with API-key rate limiting
 */
app.get('/api/developer/data', apiKeyLimiter, (req, res) => {
  const apiKey = req.headers['x-api-key'] || 'anonymous';
  res.json({
    apiKey,
    dataset: [
      { id: 101, metric: 'latency_ms', value: 12.4 },
      { id: 102, metric: 'active_sessions', value: 894 },
    ],
  });
});

/**
 * Standalone manual rate check demonstration (useful for WebSockets, gRPC, or custom flows)
 */
app.get('/api/manual-check', async (req, res) => {
  const customKey = req.query.user || req.ip;
  const status = await globalLimiter.check(customKey, { consume: false });

  res.json({
    message: 'Inspected rate limit without consuming quota',
    target: customKey,
    currentUsage: status.current,
    limit: status.limit,
    remaining: status.remaining,
    resetsInSeconds: status.retryAfter,
  });
});

// Start Express server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  Upstash Redis Rate Limiter Demo Server`);
    console.log(`  Listening on: http://localhost:${PORT}`);
    console.log(`======================================================`);
    console.log(`\nTest routes:`);
    console.log(`  1. Health:       curl -i http://localhost:${PORT}/health`);
    console.log(`  2. Public API:   curl -i http://localhost:${PORT}/api/public`);
    console.log(`  3. Strict Login: curl -i -X POST http://localhost:${PORT}/api/auth/login`);
    console.log(`  4. API Key:      curl -i -H "x-api-key: dev_secret_123" http://localhost:${PORT}/api/developer/data`);
    console.log(`  5. Check Quota:  curl -i http://localhost:${PORT}/api/manual-check?user=john_doe`);
    console.log(`\n======================================================\n`);
  });
}

module.exports = app;
