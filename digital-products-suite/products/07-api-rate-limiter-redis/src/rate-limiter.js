/**
 * @file rate-limiter.js
 * @description Sliding-window rate limiter middleware for Express and standalone Node.js applications using Upstash Redis.
 * @author QorelySofts
 */

'use strict';

const { getRedisClient, executeWithRetry } = require('./redis-client');
const { parseIP, isWhitelisted, calculateReset, generateMemberId } = require('./utils');

/**
 * @typedef {Object} RateLimiterConfig
 * @property {number} [windowMs=60000] - Window duration in milliseconds (default: 60,000 = 1 minute).
 * @property {number} [maxRequests=100] - Maximum requests allowed within the window.
 * @property {string} [keyPrefix='ratelimit'] - Redis sorted set key prefix.
 * @property {number} [burstTolerance=0] - Extra fraction of requests tolerated above maxRequests before hard 429 block (e.g. 0.10 = 10%).
 * @property {string[]} [whitelist=[]] - Array of IPs or CIDR blocks that bypass rate limiting.
 * @property {(req: any) => string} [keyGenerator] - Custom function returning client identifier string (defaults to client IP).
 * @property {boolean} [passOnError=true] - Fail-open strategy: allow requests if Redis is unreachable.
 * @property {string} [message='Too Many Requests'] - Custom message returned in 429 response.
 * @property {number} [statusCode=429] - HTTP status code to return when limited.
 * @property {boolean} [skipSuccessfulRequests=false] - Whether to only count failed requests.
 * @property {(req: any, res: any, info: RateLimitInfo) => void} [onLimitReached] - Hook called when rate limit is exceeded.
 * @property {import('@upstash/redis').Redis} [redisClient] - Pre-configured Upstash Redis client instance.
 */

/**
 * @typedef {Object} RateLimitInfo
 * @property {boolean} allowed - Whether the request was permitted.
 * @property {number} limit - The configured maximum request count.
 * @property {number} effectiveLimit - The maximum allowed including burst tolerance.
 * @property {number} remaining - Remaining requests within the current sliding window.
 * @property {number} reset - Unix timestamp (seconds) when window clears/oldest request expires.
 * @property {number} retryAfter - Seconds to wait before retrying.
 * @property {number} current - Current request count in the window.
 * @property {boolean} inBurst - Whether the request fell within the burst tolerance buffer.
 * @property {boolean} whitelisted - Whether the client bypassed limits due to whitelist.
 * @property {boolean} [fallback] - True if Redis failed and request passed open.
 */

/**
 * Creates a sliding-window rate limiter with both Express middleware and standalone check capabilities.
 *
 * @param {RateLimiterConfig} [options={}] - Rate limiter configuration options.
 * @returns {((req: any, res: any, next: (err?: any) => void) => Promise<void>) & { check: (key: string, opts?: { consume?: boolean }) => Promise<RateLimitInfo>, reset: (key: string) => Promise<boolean>, get: (key: string) => Promise<RateLimitInfo> }} Express middleware with attached standalone methods.
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const maxRequests = options.maxRequests || parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
  const burstTolerance = options.burstTolerance !== undefined
    ? Number(options.burstTolerance)
    : parseFloat(process.env.RATE_LIMIT_BURST_TOLERANCE || '0');
  const keyPrefix = options.keyPrefix || process.env.RATE_LIMIT_KEY_PREFIX || 'ratelimit:api';
  const whitelist = Array.isArray(options.whitelist) ? options.whitelist : [];
  const passOnError = options.passOnError !== false;
  const customMessage = options.message || 'Too Many Requests. Rate limit exceeded, please try again later.';
  const statusCode = options.statusCode || 429;
  const onLimitReached = options.onLimitReached;

  // Compute effective maximum allowing for burst tolerance
  const effectiveMax = Math.max(maxRequests, Math.floor(maxRequests * (1 + burstTolerance)));

  let redisInstance = options.redisClient;

  /**
   * Resolves the Redis client lazily.
   * @returns {import('@upstash/redis').Redis}
   */
  function getClient() {
    if (!redisInstance) {
      redisInstance = getRedisClient();
    }
    return redisInstance;
  }

  /**
   * Evaluates the sliding-window rate limit for a specific identifier.
   *
   * @param {string} identifier - Client unique key (IP, user ID, API token).
   * @param {Object} [evalOpts] - Evaluation options.
   * @param {boolean} [evalOpts.consume=true] - Whether to record this request.
   * @returns {Promise<RateLimitInfo>}
   */
  async function check(identifier, evalOpts = {}) {
    const consume = evalOpts.consume !== false;
    const redis = getClient();
    const redisKey = `${keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Step 1: Query window state using Redis pipeline
      const pipeline = redis.pipeline();
      // Remove timestamps outside the sliding window
      pipeline.zremrangebyscore(redisKey, 0, windowStart);
      // Count current requests inside window
      pipeline.zcard(redisKey);
      // Retrieve the oldest timestamp currently in the window to calculate reset
      pipeline.zrange(redisKey, 0, 0, { withScores: true });

      const results = await executeWithRetry(() => pipeline.exec(), 2);
      const currentCount = Number(results[1]) || 0;
      const oldestEntries = results[2];

      let oldestTimestamp = now;
      if (Array.isArray(oldestEntries) && oldestEntries.length > 0) {
        // Handle format from @upstash/redis: [{ score: number, member: string }] or [member, score]
        const first = oldestEntries[0];
        if (typeof first === 'object' && first !== null && 'score' in first) {
          oldestTimestamp = Number(first.score) || now;
        } else if (typeof first === 'number') {
          oldestTimestamp = first;
        } else if (oldestEntries.length >= 2 && typeof oldestEntries[1] === 'number') {
          oldestTimestamp = oldestEntries[1];
        }
      }

      const { resetSeconds, retryAfter } = calculateReset(oldestTimestamp, windowMs);
      const isOverLimit = currentCount >= effectiveMax;

      if (isOverLimit) {
        return {
          allowed: false,
          limit: maxRequests,
          effectiveLimit: effectiveMax,
          remaining: 0,
          reset: resetSeconds,
          retryAfter,
          current: currentCount,
          inBurst: false,
          whitelisted: false,
        };
      }

      // If allowed and consumption requested, register the timestamp
      if (consume) {
        const memberId = generateMemberId(now);
        const addPipeline = redis.pipeline();
        addPipeline.zadd(redisKey, { score: now, member: memberId });
        // Set TTL equal to double the window to prevent orphan keys
        addPipeline.expire(redisKey, Math.ceil((windowMs * 2) / 1000));
        await executeWithRetry(() => addPipeline.exec(), 2);
      }

      const totalAfterAdd = consume ? currentCount + 1 : currentCount;
      const remaining = Math.max(0, maxRequests - totalAfterAdd);
      const inBurst = totalAfterAdd > maxRequests && totalAfterAdd <= effectiveMax;

      return {
        allowed: true,
        limit: maxRequests,
        effectiveLimit: effectiveMax,
        remaining,
        reset: resetSeconds,
        retryAfter,
        current: totalAfterAdd,
        inBurst,
        whitelisted: false,
      };
    } catch (error) {
      if (passOnError) {
        // Fail-open: allow request, set fallback headers
        console.warn(`[api-rate-limiter-redis] Redis error, failing open: ${error.message}`);
        const { resetSeconds, retryAfter } = calculateReset(now, windowMs);
        return {
          allowed: true,
          limit: maxRequests,
          effectiveLimit: effectiveMax,
          remaining: 1,
          reset: resetSeconds,
          retryAfter,
          current: 0,
          inBurst: false,
          whitelisted: false,
          fallback: true,
        };
      }
      throw error;
    }
  }

  /**
   * Resets rate limit data for a specific identifier.
   *
   * @param {string} identifier - Client unique key.
   * @returns {Promise<boolean>} True if cleared successfully.
   */
  async function reset(identifier) {
    try {
      const redis = getClient();
      const redisKey = `${keyPrefix}:${identifier}`;
      await executeWithRetry(() => redis.del(redisKey), 2);
      return true;
    } catch (error) {
      console.error(`[api-rate-limiter-redis] Failed to reset rate limit for ${identifier}:`, error.message);
      return false;
    }
  }

  /**
   * Inspects rate limit state without incrementing the counter.
   *
   * @param {string} identifier - Client unique key.
   * @returns {Promise<RateLimitInfo>}
   */
  async function get(identifier) {
    return check(identifier, { consume: false });
  }

  /**
   * Express middleware implementation.
   *
   * @param {any} req - Express request object.
   * @param {any} res - Express response object.
   * @param {(err?: any) => void} next - Express next function.
   */
  const middleware = async function rateLimiterMiddleware(req, res, next) {
    try {
      const clientIp = parseIP(req);

      // Check IP Whitelist
      if (isWhitelisted(clientIp, whitelist)) {
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests);
        res.setHeader('X-RateLimit-Whitelisted', 'true');
        return next();
      }

      // Determine client identifier: custom key generator or client IP
      const key = typeof options.keyGenerator === 'function'
        ? options.keyGenerator(req)
        : clientIp;

      if (!key) {
        return next();
      }

      const result = await check(key, { consume: true });

      // Apply standard rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.reset);

      if (result.inBurst) {
        res.setHeader('X-RateLimit-Burst', 'true');
      }

      if (result.fallback) {
        res.setHeader('X-RateLimit-Fallback', 'true');
      }

      // If allowed, proceed to next middleware
      if (result.allowed) {
        return next();
      }

      // Over limit: set Retry-After header and trigger response
      res.setHeader('Retry-After', result.retryAfter);

      if (typeof onLimitReached === 'function') {
        try {
          onLimitReached(req, res, result);
        } catch (hookError) {
          console.error('[api-rate-limiter-redis] onLimitReached hook threw error:', hookError);
        }
      }

      // If response was not already closed by the hook
      if (!res.headersSent) {
        res.status(statusCode).json({
          statusCode,
          error: 'Too Many Requests',
          message: customMessage,
          limit: result.limit,
          remaining: 0,
          reset: result.reset,
          retryAfter: result.retryAfter,
        });
      }
    } catch (error) {
      if (passOnError) {
        console.warn('[api-rate-limiter-redis] Unexpected middleware failure, passing request:', error.message);
        res.setHeader('X-RateLimit-Fallback', 'true');
        return next();
      }
      return next(error);
    }
  };

  // Attach standalone methods to middleware function
  middleware.check = check;
  middleware.reset = reset;
  middleware.get = get;
  middleware.options = {
    windowMs,
    maxRequests,
    effectiveMax,
    burstTolerance,
    keyPrefix,
    whitelist,
  };

  return middleware;
}

module.exports = {
  createRateLimiter,
};
