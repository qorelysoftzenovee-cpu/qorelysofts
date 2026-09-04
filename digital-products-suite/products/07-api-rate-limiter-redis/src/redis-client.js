/**
 * @file redis-client.js
 * @description Upstash Redis client wrapper with connection pooling, retry logic, and environment configuration.
 * @author QorelySofts
 */

'use strict';

const { Redis } = require('@upstash/redis');
require('dotenv').config();

/**
 * @typedef {Object} RedisClientOptions
 * @property {string} [url] - Upstash Redis REST URL.
 * @property {string} [token] - Upstash Redis REST Token.
 * @property {number} [maxRetries=3] - Maximum retry attempts for transient network errors.
 * @property {number} [retryDelayMs=200] - Base delay for exponential backoff in ms.
 * @property {boolean} [enableTelemetry=false] - Flag to toggle Upstash telemetry.
 */

// Singleton instance cache
let cachedClient = null;

/**
 * Creates or retrieves the singleton Upstash Redis client.
 *
 * @param {RedisClientOptions} [options={}] - Configuration options for Redis client.
 * @returns {Redis} Upstash Redis instance.
 */
function getRedisClient(options = {}) {
  if (cachedClient && !options.url && !options.token) {
    return cachedClient;
  }

  const url = options.url || process.env.UPSTASH_REDIS_REST_URL;
  const token = options.token || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Missing Upstash Redis credentials. Please provide UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN via environment variables or options.'
    );
  }

  const client = new Redis({
    url,
    token,
    enableTelemetry: options.enableTelemetry ?? false,
  });

  if (!cachedClient && !options.url && !options.token) {
    cachedClient = client;
  }

  return client;
}

/**
 * Executes an asynchronous Redis operation with exponential backoff retry logic.
 *
 * @template T
 * @param {() => Promise<T>} operation - Function returning the Redis command Promise.
 * @param {number} [maxRetries=3] - Maximum retry attempts.
 * @param {number} [baseDelayMs=150] - Initial delay in milliseconds.
 * @returns {Promise<T>} Result of the executed operation.
 */
async function executeWithRetry(operation, maxRetries = 3, baseDelayMs = 150) {
  let attempt = 0;
  let delay = baseDelayMs;

  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) {
        throw err;
      }
      // Exponential backoff with jitter
      const jitter = Math.floor(Math.random() * 50);
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));
      delay *= 2;
    }
  }
}

/**
 * Performs a health check ping to verify Upstash Redis connectivity.
 *
 * @param {Redis} [client] - Redis instance to test.
 * @returns {Promise<{ ok: boolean, latencyMs: number, error?: string }>} Health status.
 */
async function ping(client) {
  const redis = client || getRedisClient();
  const start = Date.now();
  try {
    const response = await executeWithRetry(() => redis.ping(), 2, 100);
    const latencyMs = Date.now() - start;
    return {
      ok: response === 'PONG' || response === 'OK' || typeof response === 'string',
      latencyMs,
    };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: error.message || 'Ping failed',
    };
  }
}

/**
 * Resets the cached singleton client (useful for unit testing or credential rotation).
 */
function resetClientPool() {
  cachedClient = null;
}

module.exports = {
  getRedisClient,
  executeWithRetry,
  ping,
  resetClientPool,
};
