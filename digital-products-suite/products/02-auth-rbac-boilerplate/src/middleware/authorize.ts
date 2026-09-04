import { Request, Response, NextFunction } from 'express';
import { Role, RoleType, ApiResponse } from '../types';

/**
 * Role-Based Access Control (RBAC) authorization middleware factory.
 * Enforces that the authenticated user possesses one of the required authorization tiers.
 *
 * @param allowedRoles List of roles permitted to access the route
 */
export function authorize(...allowedRoles: RoleType[]) {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required prior to role authorization verification.',
        error: 'UNAUTHENTICATED',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const userRole = req.user.role;
    const normalizedAllowed = allowedRoles.map((r) => (typeof r === 'string' ? r.toLowerCase() : r));

    if (!normalizedAllowed.includes(userRole.toLowerCase() as Role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Insufficient privileges. Required role: [${allowedRoles.join(', ')}]. Your role: '${userRole}'.`,
        error: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}
