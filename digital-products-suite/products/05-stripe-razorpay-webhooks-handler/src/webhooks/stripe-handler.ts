/**
 * @file Next.js App Router Webhook Route Handler for Stripe
 * @author QorelySofts
 */

import { verifyStripeSignature } from '../lib/verify-signature.js';
import { withTransaction, defaultLogger, defaultNoopAdapter } from '../lib/transaction-wrapper.js';
import type {
  StripeHandlerConfig,
  StripeSupportedEventName,
  StripeWebhookEvent,
  TransactionClient,
} from '../types/index.js';

/**
 * Creates a Next.js App Router POST Route Handler for Stripe webhooks.
 *
 * @example
 * ```ts
 * // app/api/webhooks/stripe/route.ts
 * import { createStripeRouteHandler } from 'stripe-razorpay-webhooks-handler';
 *
 * export const POST = createStripeRouteHandler({
 *   callbacks: {
 *     'checkout.session.completed': async (event, ctx) => {
 *       const session = event.data.object;
 *       await ctx.client.query('UPDATE orders SET status = $1 WHERE session_id = $2', [
 *         'paid',
 *         session.id,
 *       ]);
 *     },
 *     'payment_intent.succeeded': async (event, ctx) => {
 *       const paymentIntent = event.data.object;
 *       // Handle payment intent success
 *     },
 *   },
 * });
 * ```
 */
export function createStripeRouteHandler<TClient = TransactionClient>(
  config: StripeHandlerConfig<TClient>
) {
  const logger = config.logger ?? defaultLogger;
  const secret = config.webhookSecret ?? process.env['STRIPE_WEBHOOK_SECRET'];
  const tolerance = config.toleranceInSeconds ?? 300;
  const adapter = config.transactionAdapter ?? (defaultNoopAdapter as unknown as typeof config.transactionAdapter);

  return async function POST(req: Request): Promise<Response> {
    const correlationId = req.headers.get('x-request-id') ?? crypto.randomUUID();
    logger.info(`[stripe:${correlationId}] Received webhook request`);

    // 1. Ensure webhook secret is available
    if (!secret) {
      logger.error(`[stripe:${correlationId}] STRIPE_WEBHOOK_SECRET is not configured in environment or config`);
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
      logger.error(`[stripe:${correlationId}] Failed to read raw body from request`, readErr);
      return Response.json(
        { error: 'Failed to read request body', received: false },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verify Stripe signature
    const signatureHeader = req.headers.get('stripe-signature');
    const verification = verifyStripeSignature(rawBody, signatureHeader, secret, tolerance);

    if (!verification.isValid) {
      logger.warn(`[stripe:${correlationId}] Signature verification failed: ${verification.error}`);
      return Response.json(
        { error: `Invalid signature: ${verification.error}`, received: false },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Parse JSON payload
    let event: StripeWebhookEvent;
    try {
      event = JSON.parse(rawBody) as StripeWebhookEvent;
    } catch (parseErr) {
      logger.error(`[stripe:${correlationId}] Invalid JSON payload received`, parseErr);
      return Response.json(
        { error: 'Malformed JSON payload', received: false },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info(`[stripe:${correlationId}] Validated event: ${event.type} (id: ${event.id})`);

    // 5. Match callback for event type
    const eventType = event.type as StripeSupportedEventName;
    const callback = config.callbacks[eventType];

    if (!callback) {
      logger.info(`[stripe:${correlationId}] No callback registered for event: ${eventType}`);
      if (config.onUnhandledEvent) {
        try {
          await config.onUnhandledEvent(eventType, event, logger);
        } catch (unhandledErr) {
          logger.warn(`[stripe:${correlationId}] Error in onUnhandledEvent handler`, { error: String(unhandledErr) });
        }
      }
      // Acknowledge receipt so Stripe does not continuously retry unhandled events
      return Response.json(
        { received: true, handled: false, message: `Event ${eventType} ignored` },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 6. Execute callback within transaction wrapper
    try {
      await withTransaction(
        async (ctx) => {
          ctx.metadata['eventId'] = event.id;
          ctx.metadata['eventType'] = event.type;
          ctx.metadata['correlationId'] = correlationId;

          await callback(event as never, ctx);
        },
        adapter,
        logger
      );

      logger.info(`[stripe:${correlationId}] Successfully processed event: ${eventType} (id: ${event.id})`);

      return Response.json(
        {
          received: true,
          handled: true,
          eventId: event.id,
          type: event.type,
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (handlerErr) {
      const errorInstance = handlerErr instanceof Error ? handlerErr : new Error(String(handlerErr));
      logger.error(
        `[stripe:${correlationId}] Error executing handler for event: ${eventType}`,
        errorInstance,
        { eventId: event.id }
      );

      if (config.onError) {
        try {
          await config.onError(errorInstance, eventType, logger);
        } catch (hookErr) {
          logger.error(`[stripe:${correlationId}] Secondary error in onError hook`, hookErr);
        }
      }

      return Response.json(
        {
          error: 'Internal server error while processing webhook event',
          received: true,
          handled: false,
          eventId: event.id,
        },
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}

/**
 * Direct handler helper function.
 */
export async function handleStripeWebhook<TClient = TransactionClient>(
  req: Request,
  config: StripeHandlerConfig<TClient>
): Promise<Response> {
  const handler = createStripeRouteHandler(config);
  return handler(req);
}
