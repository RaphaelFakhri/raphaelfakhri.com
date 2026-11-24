# raphaelfakhri.com

Personal site and portfolio for Raphael Fakhri — static Astro build served by a Cloudflare Worker.

## Structure

- `src/pages/index.astro` — Homepage (bio, story, selected work, engineering notes, contact).
- `src/pages/writing/[slug].astro` — Static engineering articles (`src/data/writing.js`).
- `src/layouts/Base.astro` — Shared layout, light/dark theme, SEO/Open Graph metadata.
- `src/worker.js` — Cloudflare Worker serving `./dist` with caching, security headers, and legacy redirects.
- `public/cv/` — HTML and PDF CV served at `/cv/`.

## Local development & deployment

```bash
npm ci
npm run dev
npm run build
```

Pushing to `main` builds the Astro site and deploys via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
