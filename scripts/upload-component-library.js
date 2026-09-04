const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yaadhbybnsctadmgjxkr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYWRoYnlibnNjdGFkbWdqeGtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUyMDUwMywiZXhwIjoyMTA0MDk2NTAzfQ.cEAqLfMs0UjjV2m20akNDlIaXF7W77DEFJBABL_W7oM';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const zipPath = path.join(__dirname, '..', 'products-repo', 'developer-component-library.zip');
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Zip file not found at ${zipPath}`);
  }

  const zipBuffer = fs.readFileSync(zipPath);
  console.log(`Uploading ${zipPath} (${zipBuffer.length} bytes)...`);

  const storagePath = 'products/developer-component-library.zip';
  const { error: uploadError } = await supabase.storage
    .from('digital-assets')
    .upload(storagePath, zipBuffer, {
      upsert: true,
      contentType: 'application/zip'
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }
  console.log(`Successfully uploaded zip to storage at ${storagePath}`);

  // Upsert product in database
  const productData = {
    title: '25 Modern React + Tailwind Component Vault',
    slug: 'react-tailwind-component-vault',
    description: 'A curated collection of 25 production-ready, fully responsive, and animated React components styled with Tailwind CSS. Includes 5 Heroes, 5 Pricing tables, 5 Testimonial carousels, 5 Feature grids, and 5 Footers with an interactive preview page and 1-click code copying.',
    price_inr: 999,
    thumbnail_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    file_path: storagePath,
    is_published: true,
  };

  const { data: existing, error: selectErr } = await supabase
    .from('products')
    .select('id')
    .eq('slug', productData.slug)
    .maybeSingle();

  if (selectErr) console.error('Select error:', selectErr);

  if (existing) {
    console.log(`Updating existing product ${existing.id}...`);
    const { error: updateErr } = await supabase
      .from('products')
      .update(productData)
      .eq('id', existing.id);
    if (updateErr) throw updateErr;
    console.log('Product updated successfully!');
  } else {
    console.log('Inserting new product...');
    const { data: inserted, error: insertErr } = await supabase
      .from('products')
      .insert([productData])
      .select();
    if (insertErr) throw insertErr;
    console.log('Product inserted successfully:', inserted[0].id);
  }

  // Verify signed download URL generation
  const { data: signedData, error: signedErr } = await supabase.storage
    .from('digital-assets')
    .createSignedUrl(storagePath, 3600);

  if (signedErr) {
    console.error('Signed URL test failed:', signedErr);
  } else {
    console.log('Verified signed download URL can be generated successfully!');
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
