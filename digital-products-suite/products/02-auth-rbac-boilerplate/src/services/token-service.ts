import jwt from 'jsonwebtoken';
import { JwtPayload, TokenPair, Role } from '../types';

/**
 * Token Blacklist Entry with expiration timestamp.
 */
interface BlacklistEntry {
  expiresAt: number; // Unix timestamp in seconds
}

/**
 * Service responsible for minting, verifying, rotating, and revoking
 * JSON Web Tokens (JWT) for authentication.
 */
export class TokenService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly accessExpiration: string;
  private readonly refreshExpiration: string;
  private readonly accessExpirationSeconds: number;

  /** In-memory blacklist store mapping token string to expiration time */
  private readonly blacklist: Map<string, BlacklistEntry> = new Map();

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_dev_key_do_not_use_in_production_12345';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_dev_key_do_not_use_in_production_12345';
    this.accessExpiration = process.env.JWT_ACCESS_EXPIRATION || '15m';
    this.refreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d';

    // Parse access expiration into seconds (default 15m = 900s)
    this.accessExpirationSeconds = this.parseDurationToSeconds(this.accessExpiration);

    // Periodically evict expired tokens from the blacklist every 10 minutes
    setInterval(() => this.cleanBlacklist(), 10 * 60 * 1000).unref();
  }

  /**
   * Generates a paired Access Token and Refresh Token for an authenticated user.
   *
   * @param payload User identity information
   * @returns Complete TokenPair object
   */
  public generateTokenPair(payload: { sub: string; email: string; role: Role }): TokenPair {
    const accessClaims: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      type: 'access',
    };

    const refreshClaims: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      type: 'refresh',
    };

    const accessToken = jwt.sign(accessClaims, this.jwtSecret, {
      expiresIn: this.accessExpiration as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(refreshClaims, this.jwtRefreshSecret, {
      expiresIn: this.refreshExpiration as jwt.SignOptions['expiresIn'],
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpirationSeconds,
      tokenType: 'Bearer',
    };
  }

  /**
   * Verifies an access token and returns its decoded claims.
   *
   * @param token Signed JWT access token string
   * @returns Decoded JwtPayload
   * @throws Error if token is invalid, expired, revoked, or wrong token type
   */
  public verifyAccessToken(token: string): JwtPayload {
    if (this.isBlacklisted(token)) {
      throw new Error('TOKEN_REVOKED: This access token has been explicitly invalidated');
    }

    const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;

    if (decoded.type && decoded.type !== 'access') {
      throw new Error('TOKEN_TYPE_INVALID: Expected access token but received refresh token');
    }

    return decoded;
  }

  /**
   * Verifies a refresh token and returns its decoded claims.
   *
   * @param token Signed JWT refresh token string
   * @returns Decoded JwtPayload
   * @throws Error if token is invalid, expired, revoked, or wrong token type
   */
  public verifyRefreshToken(token: string): JwtPayload {
    if (this.isBlacklisted(token)) {
      throw new Error('TOKEN_REVOKED: This refresh token has been explicitly invalidated');
    }

    const decoded = jwt.verify(token, this.jwtRefreshSecret) as JwtPayload;

    if (decoded.type && decoded.type !== 'refresh') {
      throw new Error('TOKEN_TYPE_INVALID: Expected refresh token but received access token');
    }

    return decoded;
  }

  /**
   * Rotates a refresh token: invalidates the old refresh token and issues a fresh TokenPair.
   *
   * @param oldRefreshToken The refresh token presented by the client
   * @returns Fresh TokenPair
   */
  public rotateTokens(oldRefreshToken: string): TokenPair {
    const claims = this.verifyRefreshToken(oldRefreshToken);

    // Invalidate the old refresh token immediately to prevent reuse attacks
    this.blacklistToken(oldRefreshToken, claims.exp);

    // Mint a new token pair
    return this.generateTokenPair({
      sub: claims.sub,
      email: claims.email,
      role: claims.role,
    });
  }

  /**
   * Adds a token to the blacklist so it can never be used again.
   *
   * @param token The token string to revoke
   * @param expiresAt Optional expiration timestamp (seconds). Defaults to 7 days from now.
   */
  public blacklistToken(token: string, expiresAt?: number): void {
    const defaultExp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    this.blacklist.set(token, { expiresAt: expiresAt || defaultExp });
  }

  /**
   * Checks whether a token has been revoked.
   *
   * @param token The token string to check
   */
  public isBlacklisted(token: string): boolean {
    const entry = this.blacklist.get(token);
    if (!entry) return false;

    // If entry has already expired in the real world, remove it and consider not blacklisted
    const now = Math.floor(Date.now() / 1000);
    if (entry.expiresAt <= now) {
      this.blacklist.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Removes expired entries from the blacklist to prevent unbounded memory growth.
   */
  public cleanBlacklist(): void {
    const now = Math.floor(Date.now() / 1000);
    for (const [token, entry] of this.blacklist.entries()) {
      if (entry.expiresAt <= now) {
        this.blacklist.delete(token);
      }
    }
  }

  /**
   * Generates a secure random 64-character hex token for password reset flows.
   */
  public generatePasswordResetToken(): { token: string; expiresAt: Date } {
    const chars = '0123456789abcdef';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars[Math.floor(Math.random() * chars.length)];
    }
    // Expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    return { token, expiresAt };
  }

  /**
   * Parses duration strings like '15m', '7d', '1h' into seconds.
   */
  private parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15 minutes
    const val = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return val;
      case 'm':
        return val * 60;
      case 'h':
        return val * 3600;
      case 'd':
        return val * 86400;
      default:
        return 900;
    }
  }
}

/** Singleton instance for application-wide token management */
export const tokenService = new TokenService();
