// @ts-check
import { defineConfig } from 'astro/config';

// Static build. Output goes to ./dist, which the Cloudflare Worker serves
// (see wrangler.jsonc). GitHub is the source of truth: pushes to main run
// `astro build` then `wrangler deploy` via .github/workflows/deploy.yml.
export default defineConfig({
  site: 'https://raphaelfakhri.com',
  output: 'static',
});
