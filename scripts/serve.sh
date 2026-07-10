#!/usr/bin/env bash
# Sıra Sende prototype — static preview server.
cd "$(dirname "$0")/.." || exit 1
echo "→ landing:  http://localhost:8080/web/index.html"
echo "→ app:      http://localhost:8080/web/app.html"
python3 -m http.server 8080
