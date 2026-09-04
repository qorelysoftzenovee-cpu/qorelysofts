import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../types';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 minutes default
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100', 10); // 100 requests per window

/**
 * Standard application-wide rate limiter.
 */
export const apiLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again later.',
    error: 'TOO_MANY_REQUESTS',
    timestamp: new Date().toISOString(),
  } as ApiResponse,
});

/**
 * Strict rate limiter for authentication routes (login, register, reset-password).
 * Mitigates brute-force credential stuffing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Account access is temporarily throttled.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
  } as ApiResponse,
});
