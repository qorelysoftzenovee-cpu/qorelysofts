import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RazorpayWebhookPayload {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        status: string;
        amount: number;
        currency: string;
        email: string;
        contact?: string;
        error_code?: string | null;
        error_description?: string | null;
      };
    };
    order?: {
      entity: {
        id: string;
        amount: number;
        amount_paid: number;
        status: string;
      };
    };
  };
  created_at: number;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing x-razorpay-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook authenticity
    let isValid = false;
    try {
      isValid = verifyWebhookSignature(rawBody, signature);
    } catch (err) {
      console.error('Webhook signature verification configuration error:', err);
      return NextResponse.json(
        { error: 'Webhook secret not configured on server' },
        { status: 500 }
      );
    }

    if (!isValid) {
      console.warn('Invalid Razorpay webhook signature received');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    const eventData: RazorpayWebhookPayload = JSON.parse(rawBody);
    const supabase = createAdminClient();

    switch (eventData.event) {
      case 'payment.captured':
      case 'order.paid': {
        const payment = eventData.payload.payment?.entity;
        const orderId = payment?.order_id || eventData.payload.order?.entity?.id;
        const paymentId = payment?.id;

        if (orderId) {
          // Idempotently update order status to paid
          const { error } = await supabase
            .from('orders')
            .update({
              status: 'paid',
              ...(paymentId ? { razorpay_payment_id: paymentId } : {}),
            })
            .eq('razorpay_order_id', orderId);

          if (error) {
            console.error(`Failed to update order ${orderId} from webhook:`, error);
          } else {
            console.log(`Order ${orderId} successfully marked as paid via webhook.`);
          }
        }
        break;
      }

      case 'payment.failed': {
        const payment = eventData.payload.payment?.entity;
        const orderId = payment?.order_id;

        if (orderId) {
          // Update order to failed only if it wasn't already paid
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('razorpay_order_id', orderId)
            .eq('status', 'pending');

          console.log(`Order ${orderId} marked as failed via webhook.`);
        }
        break;
      }

      default:
        // Ignore unhandled events with 200 OK
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Razorpay webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing webhook' },
      { status: 500 }
    );
  }
}
