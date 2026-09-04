import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User, SafeUser, Role, TokenPair } from '../types';
import { tokenService } from './token-service';

/**
 * Service managing user persistence, registration, cryptographic password verification,
 * and account recovery lifecycle.
 */
export class AuthService {
  /** In-memory store for users. In production, this would interface with PostgreSQL/Prisma/MongoDB */
  private readonly users: Map<string, User> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  /**
   * Seeds demo users for immediate out-of-the-box development and testing.
   */
  private seedDefaultUsers(): void {
    // Salt rounds for demo seed
    const salt = bcrypt.genSaltSync(10);

    const defaultAdmin: User = {
      id: 'usr_admin_001',
      email: 'admin@qorelysofts.com',
      passwordHash: bcrypt.hashSync('Admin123!', salt),
      name: 'System Administrator',
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
    };

    const defaultEditor: User = {
      id: 'usr_editor_001',
      email: 'editor@qorelysofts.com',
      passwordHash: bcrypt.hashSync('Editor123!', salt),
      name: 'Content Editor',
      role: Role.EDITOR,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
    };

    const defaultUser: User = {
      id: 'usr_user_001',
      email: 'user@qorelysofts.com',
      passwordHash: bcrypt.hashSync('User123!', salt),
      name: 'Standard User',
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: true,
    };

    this.users.set(defaultAdmin.email.toLowerCase(), defaultAdmin);
    this.users.set(defaultEditor.email.toLowerCase(), defaultEditor);
    this.users.set(defaultUser.email.toLowerCase(), defaultUser);
  }

  /**
   * Converts full User object to safe serialization DTO without sensitive hashes.
   */
  public toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isVerified: user.isVerified,
    };
  }

  /**
   * Registers a new user with bcrypt password hashing and token generation.
   */
  public async register(params: {
    email: string;
    password: string;
    name: string;
    role?: Role;
  }): Promise<{ user: SafeUser; tokens: TokenPair }> {
    const { email, password, name, role = Role.USER } = params;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error('VALIDATION_ERROR: A valid email address is required');
    }

    // Validate password strength (at least 8 characters)
    if (!password || password.length < 8) {
      throw new Error('VALIDATION_ERROR: Password must be at least 8 characters long');
    }

    if (!name || name.trim().length === 0) {
      throw new Error('VALIDATION_ERROR: User name is required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (this.users.has(normalizedEmail)) {
      throw new Error('CONFLICT_ERROR: An account with this email address already exists');
    }

    // Cryptographically hash the password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `usr_${crypto.randomUUID()}`,
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
    };

    this.users.set(normalizedEmail, newUser);

    // Issue token pair
    const tokens = tokenService.generateTokenPair({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: this.toSafeUser(newUser),
      tokens,
    };
  }

  /**
   * Authenticates user credentials and returns tokens.
   */
  public async login(params: {
    email: string;
    password: string;
  }): Promise<{ user: SafeUser; tokens: TokenPair }> {
    const { email, password } = params;

    if (!email || !password) {
      throw new Error('VALIDATION_ERROR: Email and password must be provided');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = this.users.get(normalizedEmail);

    if (!user) {
      throw new Error('UNAUTHORIZED: Invalid email or password combination');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new Error('UNAUTHORIZED: Invalid email or password combination');
    }

    const tokens = tokenService.generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.toSafeUser(user),
      tokens,
    };
  }

  /**
   * Initiates a password reset workflow by generating an expirable reset token.
   */
  public requestPasswordReset(email: string): { resetToken: string; expiresAt: Date } {
    const normalizedEmail = email.toLowerCase().trim();
    const user = this.users.get(normalizedEmail);

    if (!user) {
      // Return a simulated response to prevent email enumeration attacks
      const simulated = tokenService.generatePasswordResetToken();
      return { resetToken: simulated.token, expiresAt: simulated.expiresAt };
    }

    const { token, expiresAt } = tokenService.generatePasswordResetToken();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiresAt;
    user.updatedAt = new Date();

    return { resetToken: token, expiresAt };
  }

  /**
   * Completes a password reset using a previously issued reset token.
   */
  public async resetPassword(token: string, newPassword: string): Promise<boolean> {
    if (!token || !newPassword || newPassword.length < 8) {
      throw new Error('VALIDATION_ERROR: Valid token and new password (min 8 chars) required');
    }

    let targetUser: User | undefined;
    for (const user of this.users.values()) {
      if (user.resetPasswordToken === token) {
        targetUser = user;
        break;
      }
    }

    if (!targetUser || !targetUser.resetPasswordExpires) {
      throw new Error('INVALID_TOKEN: Password reset token is invalid or has expired');
    }

    if (targetUser.resetPasswordExpires.getTime() < Date.now()) {
      targetUser.resetPasswordToken = undefined;
      targetUser.resetPasswordExpires = undefined;
      throw new Error('EXPIRED_TOKEN: Password reset token has expired');
    }

    const salt = await bcrypt.genSalt(12);
    targetUser.passwordHash = await bcrypt.hash(newPassword, salt);
    targetUser.resetPasswordToken = undefined;
    targetUser.resetPasswordExpires = undefined;
    targetUser.updatedAt = new Date();

    return true;
  }

  /**
   * Finds a user by their unique ID.
   */
  public findById(id: string): User | undefined {
    for (const user of this.users.values()) {
      if (user.id === id) return user;
    }
    return undefined;
  }

  /**
   * Finds a user by their registered email address.
   */
  public findByEmail(email: string): User | undefined {
    return this.users.get(email.toLowerCase().trim());
  }

  /**
   * Retrieves all users (for administrative dashboards).
   */
  public getAllUsers(): SafeUser[] {
    return Array.from(this.users.values()).map(this.toSafeUser);
  }
}

/** Singleton instance for authentication service */
export const authService = new AuthService();
