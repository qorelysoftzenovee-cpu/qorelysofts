import { Request } from 'express';

/**
 * Role enumeration defining system authorization tiers.
 */
export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  USER = 'user',
}

/**
 * Type representing allowed role strings or Role enum values.
 */
export type RoleType = Role | 'admin' | 'editor' | 'user';

/**
 * Full user entity in data store.
 */
export interface User {
  /** Unique user identifier (UUID) */
  id: string;
  /** Primary contact and login email */
  email: string;
  /** Cryptographic bcrypt password hash */
  passwordHash: string;
  /** User display name */
  name: string;
  /** Assigned system authorization role */
  role: Role;
  /** Timestamp when user account was created */
  createdAt: Date;
  /** Timestamp when user account was last updated */
  updatedAt: Date;
  /** Whether the user email has been verified */
  isVerified?: boolean;
  /** Optional temporary token for password reset workflow */
  resetPasswordToken?: string;
  /** Expiration timestamp for password reset token */
  resetPasswordExpires?: Date;
}

/**
 * User representation safe for serialization (omits sensitive password hash).
 */
export type SafeUser = Omit<User, 'passwordHash' | 'resetPasswordToken' | 'resetPasswordExpires'>;

/**
 * Dual JWT token pair returned upon successful authentication or rotation.
 */
export interface TokenPair {
  /** Short-lived signed JWT access token (e.g. 15 minutes) */
  accessToken: string;
  /** Long-lived signed JWT refresh token (e.g. 7 days) */
  refreshToken: string;
  /** Access token lifetime in seconds */
  expiresIn: number;
  /** Token scheme identifier */
  tokenType: 'Bearer';
}

/**
 * Decoded payload stored inside the JWT token.
 */
export interface JwtPayload {
  /** Subject identifier: User ID */
  sub: string;
  /** User email */
  email: string;
  /** Assigned role */
  role: Role;
  /** Token category ('access' or 'refresh') */
  type?: 'access' | 'refresh';
  /** Issued at timestamp (seconds since epoch) */
  iat?: number;
  /** Expiration timestamp (seconds since epoch) */
  exp?: number;
}

/**
 * Standardized API response format for all JSON responses.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Express Request augmentation to strongly type req.user.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
