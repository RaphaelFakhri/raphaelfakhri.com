// raphaelfakhri.com Cloudflare Worker
// Serves static Astro assets from ./dist with proper caching, security headers,
// and clean redirects for retired legacy post URLs.

// Retained as a minimal stub to preserve the existing Durable Object migration.
export class Site {
  async fetch() {
    return new Response('Gone', { status: 410 });
  }
}

const LEGACY_REDIRECTS = new Set([
  '/prompt-and-wait',
  '/the-offer',
  '/anybody-can-code',
]);

const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy':
    "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const normalizedPath = url.pathname.replace(/\/+$/, '') || '/';

    if (LEGACY_REDIRECTS.has(normalizedPath)) {
      return Response.redirect('https://raphaelfakhri.com/#writing', 301);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);

    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      headers.set(key, value);
    }

    const contentType = headers.get('content-type') || '';
    if (assetResponse.status === 200) {
      if (contentType.includes('text/html')) {
        headers.set('cache-control', 'public, max-age=300, stale-while-revalidate=86400');
      } else if (/\.(jpg|jpeg|png|svg|webp|ico|pdf|xml|txt|css|js)$/i.test(url.pathname)) {
        headers.set('cache-control', 'public, max-age=604800, stale-while-revalidate=86400');
      }
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers,
    });
  },
};
