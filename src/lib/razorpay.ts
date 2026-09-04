import Razorpay from 'razorpay';
import crypto from 'crypto';

let _razorpay: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (_razorpay) return _razorpay;

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      'Missing Razorpay environment variables: NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set'
    );
  }

  _razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return _razorpay;
}

/**
 * Verifies Razorpay post-payment signature sent by client-side checkout modal.
 * Uses constant-time buffer comparison to prevent timing attacks.
 */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured');
  }

  const payload = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const generatedBuffer = Buffer.from(generatedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (generatedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(generatedBuffer, signatureBuffer);
}

/**
 * Verifies Razorpay webhook signature sent in the x-razorpay-signature header.
 * Uses unparsed raw body string to prevent payload normalization failures.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret?: string
): boolean {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const generatedBuffer = Buffer.from(generatedSignature);
  const signatureBuffer = Buffer.from(signature);

  if (generatedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(generatedBuffer, signatureBuffer);
}
