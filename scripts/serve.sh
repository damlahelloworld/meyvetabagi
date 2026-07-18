#!/usr/bin/env bash
# inkbee — static preview server (no-cache headers via serve.py).
exec python3 "$(dirname "$0")/serve.py"
