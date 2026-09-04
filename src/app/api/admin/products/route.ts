import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
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

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// GET: List all products (admin view, includes unpublished)
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!user || !adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('List products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!user || !adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const { title, slug, description, price_inr, thumbnail_url, file_path } = body;

    if (!title || !slug || !price_inr || !file_path) {
      return NextResponse.json(
        { error: 'Title, slug, price, and file path are required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must be lowercase alphanumeric with hyphens (e.g., "my-product")' },
        { status: 400 }
      );
    }

    if (typeof price_inr !== 'number' || price_inr < 100 || price_inr > 1000) {
      return NextResponse.json(
        { error: 'Price must be between ₹100 and ₹1,000 ($1 to $10 USD)' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        title,
        slug,
        description: description || '',
        price_inr: Math.round(price_inr),
        thumbnail_url: thumbnail_url || null,
        file_path,
        is_published: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 409 }
        );
      }
      console.error('Insert product error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
