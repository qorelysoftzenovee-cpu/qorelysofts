# Auth & RBAC Boilerplate — Express + TypeScript

Production-grade Role-Based Access Control (RBAC) authentication suite built with Express and TypeScript. Features dual-token JWT access and refresh token rotation, bcrypt password hashing, token blacklisting, role-based authorization gates, brute-force rate limiting, and out-of-the-box protected route patterns.

---

## Features

- 🔐 **Dual-Token JWT Lifecycle**: Short-lived Access Tokens (15m) + Long-lived Refresh Tokens (7d) with automatic rotation.
- 🛡️ **Role-Based Access Control (RBAC)**: Hierarchical roles (`admin`, `editor`, `user`) with expressive middleware (`authorize(Role.ADMIN, Role.EDITOR)`).
- 🚫 **Token Revocation & Blacklisting**: In-memory token blacklist with automated periodic cleanup of expired entries.
- 🔒 **Cryptographic Password Hashing**: Adaptive salted bcrypt hashing with minimum password complexity enforcement.
- ⏱️ **Brute-Force & Denial-of-Service Protection**: Multi-tiered rate limiters via `express-rate-limit` (strict for `/auth`, standard for API).
- 🧩 **TypeScript First**: Full static typing for request user contexts (`req.user`), JWT payloads, and standardized API responses.
- ⚡ **Zero External DB Dependency for Dev**: Includes an in-memory seed datastore with 3 pre-configured demo users for instant prototyping.

---

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and customize your secrets:

```bash
cp .env.example .env
```

Default `.env` configuration:
```env
PORT=4000
NODE_ENV=development

JWT_SECRET=your_super_secret_access_jwt_signing_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_signing_key_min_32_chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 3. Build & Run

```bash
# Development mode with auto-reloading
npm run dev

# Compile TypeScript to JavaScript
npm run build

# Start production build
npm start
```

---

## Pre-Configured Demo Accounts

For immediate testing, the server boots with the following credentials seeded:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@qorelysofts.com` | `Admin123!` |
| **Editor** | `editor@qorelysofts.com` | `Editor123!` |
| **User** | `user@qorelysofts.com` | `User123!` |

---

## API Reference

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new account (`email`, `password`, `name`, optional `role`) | No |
| `POST` | `/api/auth/login` | Authenticate with credentials, returns `TokenPair` | No |
| `POST` | `/api/auth/refresh-token`| Exchange valid refresh token for a fresh `TokenPair` | No |
| `POST` | `/api/auth/logout` | Revoke current access token & refresh token | Bearer Token |
| `POST` | `/api/auth/forgot-password` | Generate a 1-hour single-use password reset token | No |
| `POST` | `/api/auth/reset-password` | Set new password using reset token | No |

### Protected Endpoints (`/api/protected`)

| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/api/protected/user/profile` | Any (`admin`, `editor`, `user`) | Get current authenticated user profile |
| `GET` | `/api/protected/editor/content` | `admin`, `editor` | Access content management dashboard |
| `GET` | `/api/protected/admin/dashboard` | `admin` only | View high-level system metrics |
| `GET` | `/api/protected/admin/users` | `admin` only | View full registered user directory |

---

## Middleware Usage in Your Own Routes

```typescript
import { Router } from 'express';
import { authenticate, authorize, Role } from './path/to/auth-rbac-boilerplate';

const router = Router();

// 1. Any authenticated user:
router.get('/my-account', authenticate, (req, res) => {
  res.json({ userId: req.user.sub, email: req.user.email });
});

// 2. Restricted to Admins only:
router.delete('/delete-database', authenticate, authorize(Role.ADMIN), (req, res) => {
  res.json({ success: true, message: 'Database cleared' });
});

// 3. Multi-role access:
router.post('/publish-article', authenticate, authorize(Role.ADMIN, Role.EDITOR), (req, res) => {
  res.json({ success: true, message: 'Article published' });
});
```

---

## License

MIT © [QorelySofts](https://www.qorelysofts.co.in). Built for developers and modern SaaS founders.
