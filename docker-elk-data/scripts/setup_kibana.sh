#!/usr/bin/env bash
# setup_kibana.sh — wait for Kibana, then create the "traffic" data view
# (index pattern) with @timestamp as the time field, so you can start in
# Discover/visualizations immediately instead of clicking through setup.

set -euo pipefail
KIBANA="${KIBANA_URL:-http://localhost:5601}"

echo "Waiting for Kibana at $KIBANA ..."
until curl -fsS "$KIBANA/api/status" >/dev/null 2>&1; do
  printf '.'; sleep 3
done
echo " up."

echo "Creating 'traffic' data view ..."
curl -fsS -X POST "$KIBANA/api/saved_objects/index-pattern/traffic" \
  -H 'kbn-xsrf: true' -H 'Content-Type: application/json' \
  -d '{"attributes":{"title":"traffic*","timeFieldName":"@timestamp"}}' \
  >/dev/null && echo "Done." || echo "Already exists (or Kibana still warming up) — that's fine."

echo
echo "Open Kibana:        $KIBANA"
echo "Discover the data:  $KIBANA/app/discover"
echo "Tip: set the time range to 'Oct 2, 2023' (or 'Last 5 years') to see the sample."
