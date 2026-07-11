const INDEXNOW_KEY = 'd1fc505c0bd2b087bc463a1b955f0f13';
const DEFAULT_SITE_URL = 'https://ytgify.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

const fetchBaseUrl = (process.env.INDEXNOW_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');
const dryRun = process.env.INDEXNOW_DRY_RUN === '1';
const host = new URL(DEFAULT_SITE_URL).host;
const keyLocation = `${DEFAULT_SITE_URL}/${INDEXNOW_KEY}.txt`;

function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((match) => match[1].trim())
    .filter((url) => new URL(url).host === host);
}

async function fetchDeployedAsset(url, expectedText) {
  let lastError;

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'ytgify-indexnow-deploy/1.0' },
      });
      const body = await response.text();

      if (response.ok && (!expectedText || body.trim() === expectedText)) {
        return body;
      }

      lastError = new Error(`${url} returned ${response.status} or unexpected content`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < 6) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  throw lastError;
}

await fetchDeployedAsset(`${fetchBaseUrl}/${INDEXNOW_KEY}.txt`, INDEXNOW_KEY);
const sitemapXml = await fetchDeployedAsset(`${fetchBaseUrl}/sitemap.xml`);
const urlList = extractSitemapUrls(sitemapXml);

if (urlList.length === 0) {
  throw new Error(`No ${host} URLs were found in the deployed sitemap`);
}

const payload = {
  host,
  key: INDEXNOW_KEY,
  keyLocation,
  urlList,
};

if (dryRun) {
  console.log(JSON.stringify({ dryRun: true, ...payload }, null, 2));
  process.exit(0);
}

const response = await fetch(INDEXNOW_ENDPOINT, {
  method: 'POST',
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'user-agent': 'ytgify-indexnow-deploy/1.0',
  },
  body: JSON.stringify(payload),
});

if (![200, 202].includes(response.status)) {
  const responseBody = await response.text();
  throw new Error(`IndexNow returned ${response.status}: ${responseBody.slice(0, 300)}`);
}

console.log(`IndexNow accepted ${urlList.length} URLs with status ${response.status}.`);
