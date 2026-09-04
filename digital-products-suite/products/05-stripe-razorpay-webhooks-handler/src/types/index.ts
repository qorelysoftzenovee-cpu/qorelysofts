/**
 * @file Types and interfaces for Stripe & Razorpay Webhook Handler
 * @author QorelySofts
 */

import type Stripe from 'stripe';

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

/**
 * Standard logger interface used across handlers and transaction wrappers.
 */
export interface WebhookLogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: unknown, meta?: Record<string, unknown>): void;
}

/**
 * Database client or transactional session wrapper.
 */
export interface TransactionClient {
  query?: (sql: string, params?: unknown[]) => Promise<unknown>;
  [key: string]: unknown;
}

/**
 * Transaction lifecycle adapter for plugging in Prisma, Drizzle, Knex, pg, etc.
 */
export interface TransactionAdapter<TClient = TransactionClient> {
  /**
   * Begins a new transactional session/connection.
   */
  beginTransaction(): Promise<TClient>;

  /**
   * Commits the current transactional session.
   */
  commit(client: TClient): Promise<void>;

  /**
   * Rolls back the transaction in the event of an error.
   */
  rollback(client: TClient, error: unknown): Promise<void>;
}

/**
 * Context provided to event handlers when executing within a transaction.
 */
export interface TransactionContext<TClient = TransactionClient> {
  /** Unique correlation ID for tracking the transaction and webhook lifecycle */
  readonly id: string;

  /** The active database transactional client/session */
  readonly client: TClient;

  /** Manual commit trigger (normally executed automatically by the wrapper) */
  commit(): Promise<void>;

  /** Manual rollback trigger */
  rollback(error?: unknown): Promise<void>;

  /** Whether the transaction has already completed (committed or rolled back) */
  readonly isCompleted: boolean;

  /** Logger instance pre-bound with transaction metadata */
  readonly logger: WebhookLogger;

  /** Arbitrary metadata attached to this request context */
  metadata: Record<string, unknown>;
}

// ============================================================================
// STRIPE EVENT TYPES
// ============================================================================

export type StripeSupportedEventName =
  | 'checkout.session.completed'
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'customer.subscription.created'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded';

export interface StripeEventPayloadMap {
  'checkout.session.completed': Stripe.Checkout.Session;
  'payment_intent.succeeded': Stripe.PaymentIntent;
  'payment_intent.payment_failed': Stripe.PaymentIntent;
  'customer.subscription.created': Stripe.Subscription;
  'customer.subscription.deleted': Stripe.Subscription;
  'invoice.payment_succeeded': Stripe.Invoice;
}

/**
 * Generalized or typed Stripe Webhook Event.
 */
export interface StripeWebhookEvent<
  TType extends StripeSupportedEventName = StripeSupportedEventName
> {
  id: string;
  object: 'event';
  api_version: string | null;
  created: number;
  data: {
    object: StripeEventPayloadMap[TType];
    previous_attributes?: Partial<StripeEventPayloadMap[TType]>;
  };
  livemode: boolean;
  pending_webhooks: number;
  request: {
    id: string | null;
    idempotency_key: string | null;
  } | null;
  type: TType;
}

/**
 * Callback signature for typed Stripe event handlers.
 */
export type StripeEventCallback<
  TType extends StripeSupportedEventName,
  TClient = TransactionClient
> = (
  event: StripeWebhookEvent<TType>,
  ctx: TransactionContext<TClient>
) => Promise<void> | void;

/**
 * Map of callbacks for supported Stripe events.
 */
export type StripeEventCallbacks<TClient = TransactionClient> = {
  [K in StripeSupportedEventName]?: StripeEventCallback<K, TClient>;
};

// ============================================================================
// RAZORPAY EVENT TYPES
// ============================================================================

export type RazorpaySupportedEventName =
  | 'payment.authorized'
  | 'payment.captured'
  | 'payment.failed'
  | 'order.paid'
  | 'subscription.activated'
  | 'subscription.cancelled';

export interface RazorpayPaymentEntity {
  id: string;
  entity: 'payment';
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string | null;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  customer_id?: string | null;
  notes: Record<string, string | number>;
  fee: number | null;
  tax: number | null;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data?: Record<string, unknown>;
  created_at: number;
}

export interface RazorpayOrderEntity {
  id: string;
  entity: 'order';
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  offer_id: string | null;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  notes: Record<string, string | number>;
  created_at: number;
}

export interface RazorpaySubscriptionEntity {
  id: string;
  entity: 'subscription';
  plan_id: string;
  customer_id: string | null;
  status:
    | 'created'
    | 'authenticated'
    | 'active'
    | 'pending'
    | 'halted'
    | 'cancelled'
    | 'completed'
    | 'expired';
  current_start: number | null;
  current_end: number | null;
  ended_at: number | null;
  quantity: number;
  notes: Record<string, string | number>;
  charge_at: number | null;
  start_at: number | null;
  end_at: number | null;
  total_count: number;
  paid_count: number;
  remaining_count: number;
  customer_notify: boolean;
  created_at: number;
}

export interface RazorpayPayloadEntities {
  payment?: {
    entity: RazorpayPaymentEntity;
  };
  order?: {
    entity: RazorpayOrderEntity;
  };
  subscription?: {
    entity: RazorpaySubscriptionEntity;
  };
  [key: string]: unknown;
}

/**
 * Razorpay webhook event envelope
 */
export interface RazorpayWebhookEvent<
  TEvent extends RazorpaySupportedEventName = RazorpaySupportedEventName
> {
  entity: 'event';
  account_id: string;
  event: TEvent;
  contains: string[];
  payload: RazorpayPayloadEntities;
  created_at: number;
}

/**
 * Callback signature for typed Razorpay event handlers.
 */
export type RazorpayEventCallback<
  TEvent extends RazorpaySupportedEventName,
  TClient = TransactionClient
> = (
  event: RazorpayWebhookEvent<TEvent>,
  ctx: TransactionContext<TClient>
) => Promise<void> | void;

/**
 * Map of callbacks for supported Razorpay events.
 */
export type RazorpayEventCallbacks<TClient = TransactionClient> = {
  [K in RazorpaySupportedEventName]?: RazorpayEventCallback<K, TClient>;
};

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface WebhookHandlerConfigBase<TClient = TransactionClient> {
  /**
   * Optional custom transaction adapter. If not provided, an in-memory/no-op
   * transactional client is provided to the context.
   */
  transactionAdapter?: TransactionAdapter<TClient>;

  /**
   * Optional logger instance. Defaults to formatted console logger.
   */
  logger?: WebhookLogger;

  /**
   * Called when an unhandled event type is received.
   */
  onUnhandledEvent?: (
    eventName: string,
    rawPayload: unknown,
    logger: WebhookLogger
  ) => Promise<void> | void;

  /**
   * Called whenever an unhandled internal error occurs during processing.
   */
  onError?: (
    error: Error,
    eventName: string | undefined,
    logger: WebhookLogger
  ) => Promise<void> | void;
}

export interface StripeHandlerConfig<TClient = TransactionClient>
  extends WebhookHandlerConfigBase<TClient> {
  /**
   * Stripe Webhook Signing Secret (e.g. `whsec_...`).
   * If omitted, reads from `process.env.STRIPE_WEBHOOK_SECRET`.
   */
  webhookSecret?: string;

  /**
   * Clock drift tolerance in seconds for timestamp replay protection.
   * Defaults to 300 seconds (5 minutes).
   */
  toleranceInSeconds?: number;

  /**
   * Typed event callbacks for Stripe webhook events.
   */
  callbacks: StripeEventCallbacks<TClient>;
}

export interface RazorpayHandlerConfig<TClient = TransactionClient>
  extends WebhookHandlerConfigBase<TClient> {
  /**
   * Razorpay Webhook Secret set in dashboard.
   * If omitted, reads from `process.env.RAZORPAY_WEBHOOK_SECRET`.
   */
  webhookSecret?: string;

  /**
   * Typed event callbacks for Razorpay webhook events.
   */
  callbacks: RazorpayEventCallbacks<TClient>;
}

export interface SignatureVerificationResult {
  isValid: boolean;
  error?: string;
}
