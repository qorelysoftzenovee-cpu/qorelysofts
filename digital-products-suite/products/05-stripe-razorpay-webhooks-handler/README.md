# Stripe & Razorpay Webhooks Handler

> Production-grade, drop-in Next.js App Router webhook handlers for **Stripe** and **Razorpay** with cryptographic signature verification, transactional database wrappers, and end-to-end TypeScript safety.

Developed by **QorelySofts**.

---

## Features

- **Drop-in Next.js App Router Support**: Seamless integration into `app/api/webhooks/stripe/route.ts` and `app/api/webhooks/razorpay/route.ts`.
- **Zero-Compromise Security**:
  - Uses `node:crypto` with constant-time equality checks (`timingSafeEqual`) to eliminate timing-attack vulnerabilities.
  - Replay attack defense using configurable timestamp tolerance windows.
  - Raw unparsed request body handling preserves cryptographically valid hash verification.
- **Transactional Database Wrapper**:
  - Automated `beginTransaction` / `commit` / `rollback` lifecycle.
  - Built-in adapter pattern compatible with **Prisma**, **Drizzle ORM**, **Knex**, **Kysely**, or raw PostgreSQL / MySQL pools.
  - Zero partial writes: database state rolls back automatically if handler logic throws an exception.
- **Type-Safe Event Handlers**:
  - Full TypeScript types for every payload entity.
  - Pre-typed handlers for key lifecycle events across both providers.
- **Observability & Logging**:
  - Structured contextual logging with unique correlation and transaction IDs.
  - Custom error hooks (`onError`) and fallback hooks (`onUnhandledEvent`).

---

## Supported Events

### Stripe Events
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`

### Razorpay Events
- `payment.authorized`
- `payment.captured`
- `payment.failed`
- `order.paid`
- `subscription.activated`
- `subscription.cancelled`

---

## Installation

```bash
# Inside your Next.js application
npm install stripe-razorpay-webhooks-handler stripe
# or
pnpm add stripe-razorpay-webhooks-handler stripe
# or
yarn add stripe-razorpay-webhooks-handler stripe
```

---

## Quick Start

### 1. Configure Environment Variables

Create or update your `.env.local` or `.env` file:

```env
# Stripe Webhook Secret (from Dashboard or `stripe listen`)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Razorpay Webhook Secret (from Razorpay Dashboard > Settings > Webhooks)
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here

# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

---

### 2. Stripe Route Handler Setup

Create `app/api/webhooks/stripe/route.ts`:

```typescript
import { createStripeRouteHandler } from 'stripe-razorpay-webhooks-handler';
import { prisma } from '@/lib/db'; // Your Prisma or DB client

export const POST = createStripeRouteHandler({
  // Optional: Supply your ORM transaction adapter
  transactionAdapter: {
    async beginTransaction() {
      // Return a transaction client or session
      return prisma;
    },
    async commit(client) {
      // Handled by Prisma $transaction or committed automatically
    },
    async rollback(client, error) {
      // Rollback logic if using manual transactions
    },
  },

  callbacks: {
    'checkout.session.completed': async (event, ctx) => {
      const session = event.data.object;
      ctx.logger.info(`Processing checkout session: ${session.id}`);

      // Perform your DB update using ctx.client
      // If an error is thrown, the transaction is automatically rolled back
      await ctx.client.order.update({
        where: { stripeSessionId: session.id },
        data: { status: 'PAID', paidAt: new Date() },
      });
    },

    'payment_intent.succeeded': async (event, ctx) => {
      const paymentIntent = event.data.object;
      ctx.logger.info(`Payment succeeded: ${paymentIntent.id} for amount ${paymentIntent.amount}`);
    },

    'payment_intent.payment_failed': async (event, ctx) => {
      const paymentIntent = event.data.object;
      ctx.logger.warn(`Payment failed: ${paymentIntent.id}`, {
        lastError: paymentIntent.last_payment_error?.message,
      });
    },

    'customer.subscription.created': async (event, ctx) => {
      const subscription = event.data.object;
      ctx.logger.info(`Subscription created: ${subscription.id}`);
    },

    'customer.subscription.deleted': async (event, ctx) => {
      const subscription = event.data.object;
      ctx.logger.info(`Subscription cancelled: ${subscription.id}`);
    },

    'invoice.payment_succeeded': async (event, ctx) => {
      const invoice = event.data.object;
      ctx.logger.info(`Invoice paid: ${invoice.id}`);
    },
  },

  onUnhandledEvent: async (eventName, payload, logger) => {
    logger.info(`Received unhandled Stripe event: ${eventName}`);
  },

  onError: async (error, eventName, logger) => {
    logger.error(`Error in Stripe webhook: ${eventName}`, error);
    // Send alert to Sentry / Slack / Datadog
  },
});
```

---

### 3. Razorpay Route Handler Setup

Create `app/api/webhooks/razorpay/route.ts`:

```typescript
import { createRazorpayRouteHandler } from 'stripe-razorpay-webhooks-handler';
import { db } from '@/lib/db';

export const POST = createRazorpayRouteHandler({
  callbacks: {
    'payment.captured': async (event, ctx) => {
      const payment = event.payload.payment?.entity;
      if (!payment) return;

      ctx.logger.info(`Razorpay payment captured: ${payment.id}`);

      await ctx.client.payment.create({
        data: {
          razorpayPaymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: payment.status,
          method: payment.method,
        },
      });
    },

    'payment.failed': async (event, ctx) => {
      const payment = event.payload.payment?.entity;
      if (!payment) return;

      ctx.logger.warn(`Payment failed: ${payment.id}`, {
        reason: payment.error_description,
      });
    },

    'order.paid': async (event, ctx) => {
      const order = event.payload.order?.entity;
      if (!order) return;

      ctx.logger.info(`Order paid: ${order.id}`);
    },

    'subscription.activated': async (event, ctx) => {
      const sub = event.payload.subscription?.entity;
      if (!sub) return;

      ctx.logger.info(`Subscription activated: ${sub.id}`);
    },

    'subscription.cancelled': async (event, ctx) => {
      const sub = event.payload.subscription?.entity;
      if (!sub) return;

      ctx.logger.info(`Subscription cancelled: ${sub.id}`);
    },
  },
});
```

---

## Transaction Adapters

The handler includes a clean `TransactionAdapter` interface. Below are examples for popular ORMs.

### Prisma Adapter Example

```typescript
import { PrismaClient } from '@prisma/client';
import type { TransactionAdapter } from 'stripe-razorpay-webhooks-handler';

const prisma = new PrismaClient();

export const prismaTransactionAdapter: TransactionAdapter = {
  async beginTransaction() {
    return prisma;
  },
  async commit() {
    // Prisma manages per-query or interactive transactions
  },
  async rollback() {
    // Prisma rolls back automatically if an interactive transaction throws
  },
};
```

### PostgreSQL Pool (`pg`) Adapter Example

```typescript
import { Pool, type PoolClient } from 'pg';
import type { TransactionAdapter } from 'stripe-razorpay-webhooks-handler';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const pgTransactionAdapter: TransactionAdapter<PoolClient> = {
  async beginTransaction() {
    const client = await pool.connect();
    await client.query('BEGIN');
    return client;
  },
  async commit(client) {
    try {
      await client.query('COMMIT');
    } finally {
      client.release();
    }
  },
  async rollback(client) {
    try {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  },
};
```

---

## Testing Webhooks

### Testing Stripe with Stripe CLI

1. **Install Stripe CLI** (macOS/Linux via Brew, Windows via Scoop/winget):
   ```bash
   stripe login
   ```

2. **Forward events to your local Next.js server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

3. **Copy the printed secret** (`whsec_...`) into your `.env.local` as `STRIPE_WEBHOOK_SECRET`.

4. **Trigger test events**:
   ```bash
   stripe trigger checkout.session.completed
   stripe trigger payment_intent.succeeded
   stripe trigger payment_intent.payment_failed
   stripe trigger customer.subscription.created
   ```

### Testing Razorpay with cURL

Calculate HMAC-SHA256 signature and test your endpoint:

```bash
# Compute signature:
PAYLOAD='{"entity":"event","account_id":"acc_123","event":"payment.captured","contains":["payment"],"payload":{"payment":{"entity":{"id":"pay_test123","entity":"payment","amount":50000,"currency":"INR","status":"captured"}}}}'
SECRET="your_razorpay_webhook_secret_here"

# Linux / macOS signature generation:
SIG=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.* //')

# Dispatch webhook:
curl -X POST http://localhost:3000/api/webhooks/razorpay \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: $SIG" \
  -d "$PAYLOAD"
```

---

## API Reference

### `createStripeRouteHandler(config)`
Creates an App Router `POST` handler for Stripe webhooks.

**Config parameters:**
| Field | Type | Default | Description |
|---|---|---|---|
| `webhookSecret` | `string` | `process.env.STRIPE_WEBHOOK_SECRET` | Stripe signing secret |
| `toleranceInSeconds` | `number` | `300` | Replay window tolerance in seconds |
| `callbacks` | `StripeEventCallbacks` | required | Typed callbacks for Stripe events |
| `transactionAdapter` | `TransactionAdapter` | optional | DB transactional adapter |
| `logger` | `WebhookLogger` | `defaultLogger` | Custom logger |
| `onUnhandledEvent` | `Function` | optional | Called when an unhandled event arrives |
| `onError` | `Function` | optional | Called on internal errors |

### `createRazorpayRouteHandler(config)`
Creates an App Router `POST` handler for Razorpay webhooks.

**Config parameters:**
| Field | Type | Default | Description |
|---|---|---|---|
| `webhookSecret` | `string` | `process.env.RAZORPAY_WEBHOOK_SECRET` | Razorpay signing secret |
| `callbacks` | `RazorpayEventCallbacks` | required | Typed callbacks for Razorpay events |
| `transactionAdapter` | `TransactionAdapter` | optional | DB transactional adapter |
| `logger` | `WebhookLogger` | `defaultLogger` | Custom logger |
| `onUnhandledEvent` | `Function` | optional | Called when an unhandled event arrives |
| `onError` | `Function` | optional | Called on internal errors |

### Cryptographic Helpers

- `verifyStripeSignature(rawBody, signatureHeader, secret, toleranceInSeconds)`
- `verifyRazorpaySignature(rawBody, signatureHeader, secret)`
- `timingSafeCompare(a, b)`
- `withTransaction(callback, adapter, logger)`

---

## License

MIT © [QorelySofts](https://github.com/qorelysofts). All rights reserved.
