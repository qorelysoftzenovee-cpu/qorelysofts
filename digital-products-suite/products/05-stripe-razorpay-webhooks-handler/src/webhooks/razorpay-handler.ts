/**
 * @file Next.js App Router Webhook Route Handler for Razorpay
 * @author QorelySofts
 */

import { verifyRazorpaySignature } from '../lib/verify-signature.js';
import { withTransaction, defaultLogger, defaultNoopAdapter } from '../lib/transaction-wrapper.js';
import type {
  RazorpayHandlerConfig,
  RazorpaySupportedEventName,
  RazorpayWebhookEvent,
  TransactionClient,
} from '../types/index.js';

/**
 * Creates a Next.js App Router POST Route Handler for Razorpay webhooks.
 *
 * @example
 * ```ts
 * // app/api/webhooks/razorpay/route.ts
 * import { createRazorpayRouteHandler } from 'stripe-razorpay-webhooks-handler';
 *
 * export const POST = createRazorpayRouteHandler({
 *   callbacks: {
 *     'payment.captured': async (event, ctx) => {
 *       const payment = event.payload.payment?.entity;
 *       if (payment) {
 *         await ctx.client.query('UPDATE payments SET status = $1 WHERE razorpay_payment_id = $2', [
 *           payment.status,
 *           payment.id,
 *         ]);
 *       }
 *     },
 *     'subscription.activated': async (event, ctx) => {
 *       const sub = event.payload.subscription?.entity;
 *       // Activate customer subscription
 *     },
 *   },
 * });
 * ```
 */
export function createRazorpayRouteHandler<TClient = TransactionClient>(
  config: RazorpayHandlerConfig<TClient>
) {
  const logger = config.logger ?? defaultLogger;
  const secret = config.webhookSecret ?? process.env['RAZORPAY_WEBHOOK_SECRET'];
  const adapter = config.transactionAdapter ?? (defaultNoopAdapter as unknown as typeof config.transactionAdapter);

  return async function POST(req: Request): Promise<Response> {
    const correlationId = req.headers.get('x-request-id') ?? crypto.randomUUID();
    logger.info(`[razorpay:${correlationId}] Received webhook request`);

    // 1. Ensure webhook secret is available
    if (!secret) {
      logger.error(`[razorpay:${correlationId}] RAZORPAY_WEBHOOK_SECRET is not configured in environment or config`);
      return Response.json(
        { error: 'Webhook secret is not configured on server', received: false },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Read raw request body
    let rawBody: string;
    try {
      rawBody = await req.text();
    } catch (readErr) {
      logger.error(`[razorpay:${correlationId}] Failed to read raw body from request`, readErr);
      return Response.json(
        { error: 'Failed to read request body', received: false },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verify Razorpay signature
    const signatureHeader = req.headers.get('x-razorpay-signature');
    const verification = verifyRazorpaySignature(rawBody, signatureHeader, secret);

    if (!verification.isValid) {
      logger.warn(`[razorpay:${correlationId}] Signature verification failed: ${verification.error}`);
      return Response.json(
        { error: `Invalid signature: ${verification.error}`, received: false },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Parse JSON payload
    let event: RazorpayWebhookEvent;
    try {
      event = JSON.parse(rawBody) as RazorpayWebhookEvent;
    } catch (parseErr) {
      logger.error(`[razorpay:${correlationId}] Invalid JSON payload received`, parseErr);
      return Response.json(
        { error: 'Malformed JSON payload', received: false },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info(`[razorpay:${correlationId}] Validated event: ${event.event} (account: ${event.account_id})`);

    // 5. Match callback for event type
    const eventType = event.event as RazorpaySupportedEventName;
    const callback = config.callbacks[eventType];

    if (!callback) {
      logger.info(`[razorpay:${correlationId}] No callback registered for event: ${eventType}`);
      if (config.onUnhandledEvent) {
        try {
          await config.onUnhandledEvent(eventType, event, logger);
        } catch (unhandledErr) {
          logger.warn(`[razorpay:${correlationId}] Error in onUnhandledEvent hook`, { error: String(unhandledErr) });
        }
      }
      // Acknowledge receipt to avoid unnecessary webhook retries
      return Response.json(
        { received: true, handled: false, message: `Event ${eventType} ignored` },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Execute callback within transaction wrapper
    try {
      await withTransaction(
        async (ctx) => {
          ctx.metadata['event'] = event.event;
          ctx.metadata['accountId'] = event.account_id;
          ctx.metadata['correlationId'] = correlationId;

          await callback(event as never, ctx);
        },
        adapter,
        logger
      );

      logger.info(`[razorpay:${correlationId}] Successfully processed event: ${eventType}`);

      return Response.json(
        {
          received: true,
          handled: true,
          event: event.event,
          account_id: event.account_id,
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (handlerErr) {
      const errorInstance = handlerErr instanceof Error ? handlerErr : new Error(String(handlerErr));
      logger.error(
        `[razorpay:${correlationId}] Error executing handler for event: ${eventType}`,
        errorInstance,
        { event: event.event, account_id: event.account_id }
      );

      if (config.onError) {
        try {
          await config.onError(errorInstance, eventType, logger);
        } catch (hookErr) {
          logger.error(`[razorpay:${correlationId}] Secondary error in onError hook`, hookErr);
        }
      }

      return Response.json(
        {
          error: 'Internal server error while processing webhook event',
          received: true,
          handled: false,
          event: event.event,
        },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

/**
 * Direct handler helper function.
 */
export async function handleRazorpayWebhook<TClient = TransactionClient>(
  req: Request,
  config: RazorpayHandlerConfig<TClient>
): Promise<Response> {
  const handler = createRazorpayRouteHandler(config);
  return handler(req);
}
