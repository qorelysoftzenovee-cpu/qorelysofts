# Add all required environment variables to Vercel across Production, Preview, and Development
param (
  [string]$Token = ""
)

$tokenArg = @()
if ($Token -ne "") {
  $tokenArg = @("--token", $Token)
}

$envs = [ordered]@{
  "NEXT_PUBLIC_SUPABASE_URL" = "https://yaadhbybnsctadmgjxkr.supabase.co"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYWRoYnlibnNjdGFkbWdqeGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MjA1MDMsImV4cCI6MjEwNDA5NjUwM30.0fgJ4xD9SBU65EYPUKZCvH_KEBBPr5RcmKfB8k7Xr2o"
  "SUPABASE_SERVICE_ROLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYWRoYnlibnNjdGFkbWdqeGtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUyMDUwMywiZXhwIjoyMTA0MDk2NTAzfQ.cEAqLfMs0UjjV2m20akNDlIaXF7W77DEFJBABL_W7oM"
  "ADMIN_EMAIL" = "qorelysoftzenovee@gmail.com"
  "NEXT_PUBLIC_SITE_URL" = "https://www.qorelysofts.co.in"
}

Write-Host "=== Setting up Vercel Environment Variables ===" -ForegroundColor Cyan

foreach ($key in $envs.Keys) {
  $val = $envs[$key]
  foreach ($target in @("production", "preview", "development")) {
    Write-Host "Setting $key ($target)..." -ForegroundColor Yellow
    # Pipe value to vercel env add
    $val | vercel env add $key $target --force @tokenArg
  }
}

Write-Host "`nAll environment variables added to Vercel successfully!" -ForegroundColor Green
Write-Host "To apply them to your live website, trigger a redeploy:" -ForegroundColor Cyan
Write-Host "vercel --prod @tokenArg" -ForegroundColor White
