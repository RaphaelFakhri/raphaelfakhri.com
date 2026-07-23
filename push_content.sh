#!/usr/bin/env bash
# Fast content push: build the page, then POST index.html + a new build_id to the worker's
# /__push endpoint, which stores them in a Durable Object (strongly consistent, no stale edge
# cache). The page's live-reload poller flips to the new build_id and reloads. GitHub synced async.
set -e
cd /home/opc/raphaelfakhri.com
export BUILD_ID="$(date +%s)"
npm run build >/dev/null 2>&1
python3 - "$BUILD_ID" > /tmp/rf_push.json <<'PY'
import json, sys
html = open("dist/index.html", encoding="utf-8").read()
json.dump({"id": sys.argv[1], "html": html}, open("/tmp/rf_push.json", "w"))
PY
curl -sS -X POST -H "Content-Type: application/json" --data-binary @/tmp/rf_push.json \
  "https://raphaelfakhri.com/__push?token=rf-live-edit-7c2f" >/dev/null
echo "PUSHED build_id=$BUILD_ID"
( git add -A && git commit -q -m "voice content $BUILD_ID [skip ci]" && git push -q origin main ) >/dev/null 2>&1 &
