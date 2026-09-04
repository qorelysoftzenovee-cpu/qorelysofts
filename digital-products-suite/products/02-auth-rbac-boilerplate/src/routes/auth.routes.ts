import { Router, Request, Response } from 'express';
import { authService } from '../services/auth-service';
import { tokenService } from '../services/token-service';
import { authLimiter } from '../middleware/rate-limiter';
import { authenticate } from '../middleware/authenticate';
import { ApiResponse, Role } from '../types';

export const authRouter = Router();

// Apply auth rate limiter to all authentication endpoints
authRouter.use(authLimiter);

/**
 * POST /api/auth/register
 * Register a new user account.
 */
authRouter.post('/register', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { email, password, name, role } = req.body;

    const validatedRole = role && Object.values(Role).includes(role) ? role : Role.USER;

    const result = await authService.register({
      email,
      password,
      name,
      role: validatedRole,
    });

    res.status(201).json({
      success: true,
      message: 'User account registered successfully.',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    const isConflict = err?.message?.includes('CONFLICT_ERROR');
    res.status(isConflict ? 409 : 400).json({
      success: false,
      message: err.message || 'Registration failed',
      error: isConflict ? 'ACCOUNT_CONFLICT' : 'REGISTRATION_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate with email and password.
 */
authRouter.post('/login', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: err.message || 'Authentication failed',
      error: 'INVALID_CREDENTIALS',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/auth/refresh-token
 * Rotates an existing refresh token and returns a fresh token pair.
 */
authRouter.post('/refresh-token', (req: Request, res: Response<ApiResponse>) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: 'Refresh token must be provided in request body.',
        error: 'MISSING_REFRESH_TOKEN',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const newTokens = tokenService.rotateTokens(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Tokens rotated successfully.',
      data: newTokens,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: err.message || 'Failed to rotate refresh token.',
      error: 'INVALID_REFRESH_TOKEN',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/auth/logout
 * Revokes current tokens (invalidates access token and refresh token).
 */
authRouter.post('/logout', authenticate, (req: Request, res: Response<ApiResponse>) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      tokenService.blacklistToken(token);
    }

    const { refreshToken } = req.body;
    if (refreshToken) {
      tokenService.blacklistToken(refreshToken);
    }

    res.status(200).json({
      success: true,
      message: 'Successfully logged out. Tokens have been revoked.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout.',
      error: 'LOGOUT_FAILED',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Requests a secure password reset token.
 */
authRouter.post('/forgot-password', (req: Request, res: Response<ApiResponse>) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Email address is required.',
        error: 'MISSING_EMAIL',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { resetToken, expiresAt } = authService.requestPasswordReset(email);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset token has been dispatched.',
      data: { resetToken, expiresAt },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Could not process password reset request.',
      error: 'SERVER_ERROR',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Sets a new password using a reset token.
 */
authRouter.post('/reset-password', async (req: Request, res: Response<ApiResponse>) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password has been updated successfully. Please log in with your new password.',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message || 'Password reset failed.',
      error: 'RESET_FAILED',
      timestamp: new Date().toISOString(),
    });
  }
});
