import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail } from '@/lib/email';
import crypto from 'crypto';
import type { VerifyPaymentRequest } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: VerifyPaymentRequest = await request.json();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields' },
        { status: 400 }
      );
    }

    // Verify HMAC-SHA256 signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is not set');
      return NextResponse.json(
        { error: 'Payment verification configuration error' },
        { status: 500 }
      );
    }

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

    const supabase = createAdminClient();

    if (!isValid) {
      // Mark order as failed
      await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);

      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Signature is valid — mark order as paid
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id,
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('download_token, customer_name, customer_email, razorpay_order_id, products(title, price_inr)')
      .single();

    if (updateError || !order) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Trigger transactional email delivery asynchronously
    const productInfo = (order as any).products;
    if (order.customer_email && productInfo) {
      sendOrderConfirmationEmail({
        to: order.customer_email,
        customerName: order.customer_name || 'Valued Customer',
        productTitle: productInfo.title || 'Digital Product',
        priceInr: productInfo.price_inr || 0,
        downloadToken: order.download_token,
        orderId: order.razorpay_order_id,
      }).catch((emailErr) => console.error('Background email error:', emailErr));
    }

    return NextResponse.json({
      success: true,
      token: order.download_token,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
