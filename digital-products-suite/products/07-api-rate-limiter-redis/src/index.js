/**
 * @file index.js
 * @description Main entry point for api-rate-limiter-redis package.
 * @author QorelySofts
 */

'use strict';

const { createRateLimiter } = require('./rate-limiter');
const { getRedisClient, ping, executeWithRetry, resetClientPool } = require('./redis-client');
const utils = require('./utils');

module.exports = {
  createRateLimiter,
  getRedisClient,
  ping,
  executeWithRetry,
  resetClientPool,
  utils,
};
