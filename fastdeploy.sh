#!/usr/bin/env bash
# Fast deploy straight from the VM — skips the GitHub Actions queue (~60-90s -> ~15s).
# Builds with a unique BUILD_ID (so the live-reload poller fires) and pushes the Worker
# to Cloudflare with the account global key. Git push is done separately with [skip ci].
set -e
cd /home/opc/raphaelfakhri.com
export BUILD_ID="$(date +%s)"
npm run build >/dev/null 2>&1
set -a; . "$HOME/.config/cloudflare/creds.env"; set +a
npx --yes wrangler@4 deploy 2>&1 | tail -3
echo "DEPLOYED build_id=$BUILD_ID"
