import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getRazorpay } from '@/lib/razorpay';
import crypto from 'crypto';
import type { CreateOrderRequest } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: CreateOrderRequest = await request.json();

    // Validate input
    if (!body.productId || !body.customerName || !body.customerEmail) {
      return NextResponse.json(
        { error: 'Product ID, customer name, and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', body.productId)
      .eq('is_published', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or unavailable' },
        { status: 404 }
      );
    }

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await getRazorpay().orders.create({
      amount: product.price_inr * 100,
      currency: 'INR',
      receipt: `rcpt_${crypto.randomUUID().slice(0, 8)}`,
      notes: {
        product_id: product.id,
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        ...(body.customerPhone ? { customer_phone: body.customerPhone } : {}),
      },
    });

    // Generate a secure download token
    const downloadToken = crypto.randomUUID();

    // Insert pending order
    const { error: insertError } = await supabase.from('orders').insert({
      product_id: body.productId,
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      razorpay_order_id: razorpayOrder.id,
      status: 'pending',
      download_token: downloadToken,
    });

    if (insertError) {
      console.error('Error inserting order:', insertError);
      return NextResponse.json(
        { error: 'Failed to create order record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
