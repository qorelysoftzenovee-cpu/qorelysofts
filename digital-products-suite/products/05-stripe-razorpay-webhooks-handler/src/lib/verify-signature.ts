/**
 * @file Cryptographic signature verification utilities for Stripe and Razorpay
 * @author QorelySofts
 */

import * as crypto from 'node:crypto';
import type { SignatureVerificationResult } from '../types/index.js';

/**
 * Constant-time comparison between two hex-encoded strings.
 * Protects against timing-attack side channels.
 *
 * @param a - First string (e.g. expected hash)
 * @param b - Second string (e.g. signature from header)
 * @returns boolean indicating if both strings are identical
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (!a || !b) {
    return false;
  }

  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies a Stripe webhook signature.
 *
 * Stripe sends signatures in the `Stripe-Signature` header with format:
 * `t=timestamp,v1=signature1,v1=signature2...`
 *
 * The signature is computed as HMAC-SHA256 of `${timestamp}.${rawBody}` using the webhook secret.
 *
 * @param rawBody - Unparsed raw payload string or Buffer from HTTP request
 * @param signatureHeader - Value of `stripe-signature` header
 * @param secret - Stripe webhook signing secret (whsec_...)
 * @param toleranceInSeconds - Maximum allowed age of the webhook to prevent replay attacks (default: 300s)
 * @returns SignatureVerificationResult
 */
export function verifyStripeSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  secret: string,
  toleranceInSeconds: number = 300
): SignatureVerificationResult {
  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return {
      isValid: false,
      error: 'Missing or invalid Stripe-Signature header',
    };
  }

  if (!secret || typeof secret !== 'string') {
    return {
      isValid: false,
      error: 'Stripe webhook secret is not configured',
    };
  }

  const payloadString =
    typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

  // Parse header parts (e.g. t=1492774577,v1=5257a86...,v0=...)
  const parts = signatureHeader.split(',');
  let timestamp: number | null = null;
  const signatures: string[] = [];

  for (const part of parts) {
    const [key, val] = part.trim().split('=');
    if (!key || !val) continue;

    if (key === 't') {
      const parsed = parseInt(val, 10);
      if (!Number.isNaN(parsed)) {
        timestamp = parsed;
      }
    } else if (key === 'v1') {
      signatures.push(val);
    }
  }

  if (timestamp === null) {
    return {
      isValid: false,
      error: 'Unable to extract timestamp (t) from Stripe-Signature header',
    };
  }

  if (signatures.length === 0) {
    return {
      isValid: false,
      error: 'No v1 signatures found in Stripe-Signature header',
    };
  }

  // Replay attack prevention check
  if (toleranceInSeconds > 0) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const age = Math.abs(currentTimestamp - timestamp);
    if (age > toleranceInSeconds) {
      return {
        isValid: false,
        error: `Timestamp outside tolerance window (${age}s > ${toleranceInSeconds}s allowed)`,
      };
    }
  }

  // Compute expected HMAC SHA256 digest
  const signedPayload = `${timestamp}.${payloadString}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  // Validate against any v1 signature (Stripe supports rolling multiple keys)
  const isValid = signatures.some((sig) => timingSafeCompare(expectedSignature, sig));

  if (!isValid) {
    return {
      isValid: false,
      error: 'Computed signature does not match any v1 signatures in header',
    };
  }

  return { isValid: true };
}

/**
 * Verifies a Razorpay webhook signature.
 *
 * Razorpay computes HMAC-SHA256 of the raw request body using the webhook secret
 * and passes the hex digest in the `x-razorpay-signature` header.
 *
 * @param rawBody - Raw unparsed request body string or Buffer
 * @param signatureHeader - Value of `x-razorpay-signature` header
 * @param secret - Razorpay webhook secret configured in Dashboard
 * @returns SignatureVerificationResult
 */
export function verifyRazorpaySignature(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  secret: string
): SignatureVerificationResult {
  if (!signatureHeader || typeof signatureHeader !== 'string') {
    return {
      isValid: false,
      error: 'Missing or invalid x-razorpay-signature header',
    };
  }

  if (!secret || typeof secret !== 'string') {
    return {
      isValid: false,
      error: 'Razorpay webhook secret is not configured',
    };
  }

  const payloadString =
    typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString, 'utf8')
      .digest('hex');

    const isValid = timingSafeCompare(expectedSignature, signatureHeader.trim());

    if (!isValid) {
      return {
        isValid: false,
        error: 'Calculated Razorpay HMAC digest does not match header signature',
      };
    }

    return { isValid: true };
  } catch (err) {
    return {
      isValid: false,
      error: `Error computing Razorpay signature: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
