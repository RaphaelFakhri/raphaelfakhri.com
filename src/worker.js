// raphaelfakhri.com Worker.
// Fast + strongly-consistent live editing: the homepage HTML and version id live in a single
// Durable Object (no edge-cache staleness like KV). push_content.sh POSTs new content to
// /__push (sub-second); the page's 3s poller sees the new id and reloads. Anything not served
// from the DO falls back to the built static assets in ./dist, so the site can't go down.

const PUSH_TOKEN = 'rf-live-edit-7c2f';

export class Site {
  constructor(state) {
    this.state = state;
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === 'POST') {
      const { id, html } = await request.json();
      await this.state.storage.put('id', id);
      await this.state.storage.put('html', html);
      return new Response('ok');
    }
    if (url.pathname === '/html') {
      const html = (await this.state.storage.get('html')) || '';
      return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    const id = (await this.state.storage.get('id')) || 'dev';
    return new Response(id);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const stub = env.SITE_DO.get(env.SITE_DO.idFromName('main'));

    if (url.pathname === '/__push' && request.method === 'POST') {
      if (url.searchParams.get('token') !== PUSH_TOKEN) return new Response('forbidden', { status: 403 });
      const body = await request.text();
      await stub.fetch('https://do/store', { method: 'POST', body, headers: { 'content-type': 'application/json' } });
      return new Response('ok');
    }

    if (url.pathname === '/version.json') {
      const id = await (await stub.fetch('https://do/id')).text();
      return new Response(JSON.stringify({ id }), {
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      });
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = await (await stub.fetch('https://do/html')).text();
      if (html) {
        return new Response(html, {
          headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
