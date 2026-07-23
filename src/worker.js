// raphaelfakhri.com Worker.
// Fast path: serve the homepage HTML and the version marker straight from KV, which is
// updated by a sub-second API write (push_content.sh) instead of a full wrangler deploy.
// Fallback: if KV is empty (or any other path), serve the built static assets in ./dist,
// so the site can never go down even if a KV write fails.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/version.json') {
      const id = (await env.SITE.get('build_id')) || 'dev';
      return new Response(JSON.stringify({ id }), {
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      });
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = await env.SITE.get('index_html');
      if (html) {
        return new Response(html, {
          headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
