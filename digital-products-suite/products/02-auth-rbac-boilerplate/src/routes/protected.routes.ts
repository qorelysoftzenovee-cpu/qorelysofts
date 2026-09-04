import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { authService } from '../services/auth-service';
import { ApiResponse, Role } from '../types';

export const protectedRouter = Router();

// Require valid authentication token for all routes in this router
protectedRouter.use(authenticate);

/**
 * GET /api/protected/user/profile
 * Accessible by any authenticated user (admin, editor, user).
 */
protectedRouter.get('/user/profile', (req: Request, res: Response<ApiResponse>) => {
  const userId = req.user!.sub;
  const user = authService.findById(userId);

  if (!user) {
    res.status(404).json({
      success: false,
      message: 'User profile not found.',
      error: 'USER_NOT_FOUND',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully.',
    data: authService.toSafeUser(user),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/protected/editor/content
 * Accessible by Admin and Editor roles.
 */
protectedRouter.get('/editor/content', authorize(Role.ADMIN, Role.EDITOR), (req: Request, res: Response<ApiResponse>) => {
  res.status(200).json({
    success: true,
    message: 'Content management workspace accessed successfully.',
    data: {
      articlesCount: 42,
      draftsCount: 7,
      authorizedAs: req.user!.role,
      permissions: ['read:articles', 'write:articles', 'publish:articles'],
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/protected/admin/dashboard
 * Accessible strictly by Admin role.
 */
protectedRouter.get('/admin/dashboard', authorize(Role.ADMIN), (req: Request, res: Response<ApiResponse>) => {
  const allUsers = authService.getAllUsers();

  res.status(200).json({
    success: true,
    message: 'Admin metrics retrieved successfully.',
    data: {
      systemStatus: 'healthy',
      totalUsers: allUsers.length,
      usersByRole: {
        admin: allUsers.filter((u) => u.role === Role.ADMIN).length,
        editor: allUsers.filter((u) => u.role === Role.EDITOR).length,
        user: allUsers.filter((u) => u.role === Role.USER).length,
      },
      serverUptimeSeconds: Math.floor(process.uptime()),
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/protected/admin/users
 * Accessible strictly by Admin role.
 */
protectedRouter.get('/admin/users', authorize(Role.ADMIN), (req: Request, res: Response<ApiResponse>) => {
  const users = authService.getAllUsers();

  res.status(200).json({
    success: true,
    message: 'User directory retrieved.',
    data: users,
    timestamp: new Date().toISOString(),
  });
});
