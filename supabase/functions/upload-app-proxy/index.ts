import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';

const CORS_HEADERS = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
});

function buildJsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...Object.fromEntries(CORS_HEADERS.entries()),
      'Content-Type': 'application/json'
    }
  });
}

function getEnvVariable(key: string) {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

async function createGithubRelease(username: string, repo: string, packageName: string, title: string) {
  const tagName = `v-${packageName}-${Date.now()}`;
  const releaseResponse = await fetch(`https://api.github.com/repos/${username}/${repo}/releases`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getEnvVariable('GH_TOKEN')}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tag_name: tagName,
      name: `Release for ${title}`,
      body: `Secure upload proxy release for ${packageName}`,
      draft: false,
      prerelease: false
    })
  });

  if (!releaseResponse.ok) {
    const payload = await releaseResponse.text();
    throw new Error(`GitHub release creation failed (${releaseResponse.status}): ${payload}`);
  }

  const releaseData = await releaseResponse.json();
  if (!releaseData.upload_url) {
    throw new Error('GitHub response missing upload_url.');
  }
  return releaseData.upload_url.replace(/\{.*$/, '');
}

async function uploadAssetToRelease(uploadUrl: string, file: File, assetName: string) {
  const assetResponse = await fetch(`${uploadUrl}?name=${encodeURIComponent(assetName)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getEnvVariable('GH_TOKEN')}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': file.type || 'application/vnd.android.package-archive'
    },
    body: file.stream()
  });

  if (!assetResponse.ok) {
    const payload = await assetResponse.text();
    throw new Error(`GitHub asset upload failed (${assetResponse.status}): ${payload}`);
  }

  const assetData = await assetResponse.json();
  if (!assetData.browser_download_url) {
    throw new Error('GitHub asset upload succeeded but did not return browser_download_url.');
  }
  return assetData.browser_download_url;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const githubUsername = getEnvVariable('GH_USERNAME');
    const githubRepo = Deno.env.get('GH_REPO') || 'qorelysofts';

    if (!req.headers.get('content-type')?.includes('multipart/form-data')) {
      return buildJsonResponse({ error: 'Content-Type must be multipart/form-data' }, 400);
    }

    const formData = await req.formData();
    const apkFile = formData.get('apk');
    const title = formData.get('title')?.toString();
    const packageName = formData.get('package_name')?.toString();

    if (!apkFile || !(apkFile instanceof File)) {
      return buildJsonResponse({ error: 'APK file is required.' }, 400);
    }
    if (!title || !packageName) {
      return buildJsonResponse({ error: 'title and package_name are required.' }, 400);
    }

    const safePackageName = packageName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const assetName = `${safePackageName}.apk`;
    const uploadUrl = await createGithubRelease(githubUsername, githubRepo, safePackageName, title);
    const browserDownloadUrl = await uploadAssetToRelease(uploadUrl, apkFile, assetName);

    return buildJsonResponse({ browser_download_url: browserDownloadUrl, package_name: packageName, title });
  } catch (error) {
    console.error('Upload proxy error:', error);
    return buildJsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
