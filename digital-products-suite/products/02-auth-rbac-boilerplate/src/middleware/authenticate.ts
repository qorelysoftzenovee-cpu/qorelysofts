import { Request, Response, NextFunction } from 'express';
import { tokenService } from '../services/token-service';
import { ApiResponse } from '../types';

/**
 * Authentication middleware that extracts and validates the Bearer JWT access token
 * from the standard Authorization request header.
 */
export function authenticate(req: Request, res: Response<ApiResponse>, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'Authorization header is missing. Please provide a Bearer token.',
      error: 'UNAUTHORIZED_NO_HEADER',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    res.status(401).json({
      success: false,
      message: 'Invalid Authorization format. Must be "Bearer <token>".',
      error: 'UNAUTHORIZED_MALFORMED_HEADER',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const token = parts[1];

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    const isExpired = err?.name === 'TokenExpiredError';
    const isRevoked = err?.message?.includes('TOKEN_REVOKED');

    res.status(401).json({
      success: false,
      message: isExpired
        ? 'Access token has expired. Please refresh your session.'
        : isRevoked
        ? 'Access token has been revoked. Please log in again.'
        : 'Invalid access token.',
      error: isExpired ? 'TOKEN_EXPIRED' : isRevoked ? 'TOKEN_REVOKED' : 'TOKEN_INVALID',
      timestamp: new Date().toISOString(),
    });
  }
}
