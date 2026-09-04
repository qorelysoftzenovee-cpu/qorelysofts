import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabaseUser = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    // Verify authenticated user
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Verify user owns this order and order is paid
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*, products(*)')
      .eq('id', orderId)
      .eq('customer_email', user.email)
      .eq('status', 'paid')
      .single();

    if (orderError || !order || !order.products) {
      return NextResponse.json(
        { error: 'Order not found or payment incomplete' },
        { status: 404 }
      );
    }

    // Generate fresh 30-minute signed URL for the digital file
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from('digital-assets')
      .createSignedUrl(order.products.file_path, 30 * 60, {
        download: true,
      });

    if (signError || !signedData?.signedUrl) {
      console.error('Storage signed URL generation error:', signError);
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      downloadUrl: signedData.signedUrl,
      expiresInMinutes: 30,
    });
  } catch (error) {
    console.error('Download route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
