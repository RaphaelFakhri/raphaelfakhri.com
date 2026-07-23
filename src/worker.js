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
    if (url.pathname === '/stats') {
      const stats = (await this.state.storage.get('stats')) || {};
      const slug = url.searchParams.get('slug') || '';
      if (request.method === 'POST') {
        const action = url.searchParams.get('action');
        const s = stats[slug] || { likes: 0, views: 0 };
        if (action === 'like') s.likes++;
        else if (action === 'view') s.views++;
        stats[slug] = s;
        await this.state.storage.put('stats', stats);
      }
      return new Response(JSON.stringify(stats[slug] || { likes: 0, views: 0 }), {
        headers: { 'content-type': 'application/json' },
      });
    }
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

    if (url.pathname === '/stats') {
      const res = await stub.fetch('https://do/stats' + url.search, { method: request.method });
      return new Response(res.body, {
        status: res.status,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      });
    }

    if (url.pathname === '/feed.json') {
      try {
        const r = await fetch('https://raphaelfakhri.substack.com/feed', {
          headers: { 'user-agent': 'Mozilla/5.0' },
          cf: { cacheTtl: 300, cacheEverything: true },
        });
        const xml = await r.text();
        const items = [];
        const itemRe = /<item>([\s\S]*?)<\/item>/g;
        let m;
        const pick = (block, tag) => {
          const mm = block.match(new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>'));
          if (!mm) return '';
          return mm[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
        };
        while ((m = itemRe.exec(xml))) {
          const b = m[1];
          items.push({
            title: pick(b, 'title'),
            link: pick(b, 'link'),
            date: pick(b, 'pubDate'),
            html: pick(b, 'content:encoded') || pick(b, 'description'),
          });
        }
        return new Response(JSON.stringify(items), {
          headers: { 'content-type': 'application/json', 'cache-control': 'max-age=300' },
        });
      } catch (e) {
        return new Response('[]', { headers: { 'content-type': 'application/json' } });
      }
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
