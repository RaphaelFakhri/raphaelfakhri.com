# raphaelfakhri.com

Personal site for Raphael Fakhri. Static assets served by a Cloudflare Worker.

## How it deploys

**GitHub is the source of truth.** Every push to `main` triggers
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which runs
`wrangler deploy` to publish the Worker (`raphaelfakhri`) to Cloudflare — the same
GitHub-Actions pattern the `symbai.dev` sites use.

- Site content: [`public/`](public/) (plain static HTML/CSS).
- Worker config: [`wrangler.jsonc`](wrangler.jsonc).
- No build step — edit `public/`, push, done.

## Infra

- **Registrar:** Spaceship (registered 2026-07-17).
- **DNS / hosting:** Cloudflare (nameservers `anita` / `ivan.ns.cloudflare.com`).
- **Deploy auth:** Cloudflare global key + email, stored as the repo secrets
  `CLOUDFLARE_API_KEY` and `CLOUDFLARE_EMAIL`.
