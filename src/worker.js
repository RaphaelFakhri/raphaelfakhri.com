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
        else if (action === 'reset') { s.likes = 0; s.views = 0; }
        stats[slug] = s;
        await this.state.storage.put('stats', stats);
      }
      return new Response(JSON.stringify(stats[slug] || { likes: 0, views: 0 }), {
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.pathname === '/feed-store' && request.method === 'POST') {
      await this.state.storage.put('feed', await request.text());
      return new Response('ok');
    }
    if (url.pathname === '/feed-get') {
      return new Response((await this.state.storage.get('feed')) || '', {
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
      if (url.searchParams.get('action') === 'reset' && url.searchParams.get('token') !== 'rf-live-edit-7c2f') {
        return new Response('forbidden', { status: 403 });
      }
      const res = await stub.fetch('https://do/stats' + url.search, { method: request.method });
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      });
    }

    if (url.pathname === '/likes.json') {
      // Proxy the public Substack reaction count for a post (CORS-safe for the homepage).
      const slug = url.searchParams.get('slug') || '';
      if (!/^[a-z0-9-]+$/i.test(slug)) {
        return new Response('{"count":0}', { headers: { 'content-type': 'application/json' } });
      }
      try {
        const r = await fetch('https://raphaelfakhri.substack.com/api/v1/posts/' + slug, {
          headers: { 'user-agent': 'Mozilla/5.0' },
          cf: { cacheTtl: 60, cacheEverything: true },
        });
        const d = await r.json();
        const p = d.post || d;
        const count = Number(p.reaction_count) || 0;
        return new Response(JSON.stringify({ count }), {
          headers: { 'content-type': 'application/json', 'cache-control': 'max-age=60' },
        });
      } catch (e) {
        return new Response('{"count":0}', {
          headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        });
      }
    }

    if (url.pathname === '/post-meta.json') {
      // Public Substack post meta for the homepage: like count, comment count, top 3 comments.
      const slug = url.searchParams.get('slug') || '';
      const EMPTY = '{"likes":0,"comments":0,"top":[]}';
      if (!/^[a-z0-9-]+$/i.test(slug)) {
        return new Response(EMPTY, { headers: { 'content-type': 'application/json' } });
      }
      try {
        // Per-minute cache-buster: Substack edge-caches this API per URL and would otherwise
        // serve a stale like/comment count. cf.cacheTtl still dedupes within each minute.
        const bust = Math.floor(Date.now() / 60000);
        const r = await fetch('https://raphaelfakhri.substack.com/api/v1/posts/' + slug + '?cb=' + bust, {
          headers: { 'user-agent': 'Mozilla/5.0' },
          cf: { cacheTtl: 60, cacheEverything: true },
        });
        const d = await r.json();
        const p = d.post || d;
        const out = { likes: Number(p.reaction_count) || 0, comments: Number(p.comment_count) || 0, top: [] };
        if (p.id && out.comments > 0) {
          const cr = await fetch(
            'https://raphaelfakhri.substack.com/api/v1/post/' + p.id + '/comments?all_comments=true&sort=best_first',
            { headers: { 'user-agent': 'Mozilla/5.0' }, cf: { cacheTtl: 60, cacheEverything: true } }
          );
          const cd = await cr.json();
          const cs = cd.comments || [];
          out.top = cs.slice(0, 3).map(function (c) {
            return { name: String(c.name || 'Reader'), body: String(c.body || '').slice(0, 280) };
          });
        }
        return new Response(JSON.stringify(out), {
          headers: { 'content-type': 'application/json', 'cache-control': 'max-age=60' },
        });
      } catch (e) {
        return new Response(EMPTY, { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
      }
    }

    if (url.pathname === '/feed.json') {
      try {
        // Substack edge-caches its RSS per user-agent and serves a stale variant to plain
        // requests. A rotating query param (5-min bucket) busts that cache so we get fresh
        // content; cf.cacheTtl still dedupes our own subrequests within each bucket.
        const bust = Math.floor(Date.now() / 300000);
        const r = await fetch('https://raphaelfakhri.substack.com/feed?cb=' + bust, {
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
        if (items.length) {
          // good fetch: remember it as last-known-good, then serve fresh
          const body = JSON.stringify(items);
          await stub.fetch('https://do/feed-store', { method: 'POST', body });
          return new Response(body, {
            headers: { 'content-type': 'application/json', 'cache-control': 'max-age=300' },
          });
        }
        // empty/error parse: never serve empty (it would drop the homepage to fallback posts).
        // Serve the last-known-good feed instead, uncached so the next request can refresh.
        const good = await (await stub.fetch('https://do/feed-get')).text();
        return new Response(good || '[]', {
          headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        });
      } catch (e) {
        const good = await (await stub.fetch('https://do/feed-get')).text().catch(() => '');
        return new Response(good || '[]', {
          headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
        });
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
