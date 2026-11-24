#!/usr/bin/env bash
# Fast deploy directly to Cloudflare Workers from the current checkout.
set -euo pipefail
npm run build
set -a; . "$HOME/.config/cloudflare/creds.env"; set +a
./node_modules/.bin/wrangler deploy
