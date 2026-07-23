#!/usr/bin/env bash
# Fast content push: build the page, then write index.html + a new build_id into KV via the
# Cloudflare API (sub-second) instead of a full wrangler deploy. The worker serves these from
# KV; the page's live-reload poller flips to the new build_id and reloads. GitHub is synced async.
set -e
cd /home/opc/raphaelfakhri.com
export BUILD_ID="$(date +%s)"
npm run build >/dev/null 2>&1
set -a; . "$HOME/.config/cloudflare/creds.env"; set +a
ACCT=d35d2977618aae7b49ad0d2f177c469a
NS=ab4a803a63da481aaa1f2f11b0b72586
BASE="https://api.cloudflare.com/client/v4/accounts/$ACCT/storage/kv/namespaces/$NS/values"
curl -sS -X PUT -H "X-Auth-Email: $CLOUDFLARE_EMAIL" -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
  -H "Content-Type: text/plain" --data-binary @dist/index.html "$BASE/index_html" >/dev/null
curl -sS -X PUT -H "X-Auth-Email: $CLOUDFLARE_EMAIL" -H "X-Auth-Key: $CLOUDFLARE_API_KEY" \
  -H "Content-Type: text/plain" --data "$BUILD_ID" "$BASE/build_id" >/dev/null
echo "PUSHED build_id=$BUILD_ID"
( git add -A && git commit -q -m "voice content $BUILD_ID [skip ci]" && git push -q origin main ) >/dev/null 2>&1 &
