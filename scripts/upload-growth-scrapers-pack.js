const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yaadhbybnsctadmgjxkr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYWRoYnlibnNjdGFkbWdqeGtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUyMDUwMywiZXhwIjoyMTA0MDk2NTAzfQ.cEAqLfMs0UjjV2m20akNDlIaXF7W77DEFJBABL_W7oM';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const zipPath = path.join(__dirname, '..', 'products-repo', 'growth-scrapers-pack.zip');
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Zip file not found at ${zipPath}`);
  }

  const zipBuffer = fs.readFileSync(zipPath);
  console.log(`Uploading ${zipPath} (${zipBuffer.length} bytes)...`);

  const storagePath = 'products/growth-scrapers-pack.zip';
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
    title: 'Growth Scrapers Pack — Lead Extraction & SEO Automation Bundle',
    slug: 'growth-scrapers-pack',
    description: 'A production-grade Node.js automation suite for growth hackers, agencies, and developers. Includes a stealth Google Maps local business lead extractor with anti-detection headers, and a technical site SEO auditor with Core Web Vitals readiness reporting.',
    price_inr: 799,
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
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
