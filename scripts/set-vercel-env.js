const { spawnSync } = require('child_process');

const envs = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://yaadhbybnsctadmgjxkr.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYWRoYnlibnNjdGFkbWdqeGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MjA1MDMsImV4cCI6MjEwNDA5NjUwM30.0fgJ4xD9SBU65EYPUKZCvH_KEBBPr5RcmKfB8k7Xr2o',
  SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhYWRoYnlibnNjdGFkbWdqeGtyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODUyMDUwMywiZXhwIjoyMTA0MDk2NTAzfQ.cEAqLfMs0UjjV2m20akNDlIaXF7W77DEFJBABL_W7oM',
  ADMIN_EMAIL: 'qorelysoftzenovee@gmail.com',
  NEXT_PUBLIC_SITE_URL: 'https://www.qorelysofts.co.in'
};

const targets = ['production', 'preview', 'development'];

for (const [key, val] of Object.entries(envs)) {
  for (const target of targets) {
    console.log(`Setting ${key} for [${target}]...`);
    const res = spawnSync('vercel.cmd', ['env', 'add', key, target, '--force'], {
      input: val,
      encoding: 'utf-8',
      shell: true
    });
    if (res.stdout) console.log(res.stdout.trim());
    if (res.error) console.error(res.error);
  }
}

console.log('All environment variables set successfully!');
