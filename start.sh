#!/usr/bin/env bash
# Starts backend + frontend concurrently using nvm-sourced node

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting PM Portal..."
echo "  Backend  → http://localhost:3001"
echo "  Frontend → http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."
echo ""

# Run both in parallel, kill both on Ctrl+C
trap "kill 0" SIGINT SIGTERM EXIT

(cd "$SCRIPT_DIR/backend" && npm run dev) &
(cd "$SCRIPT_DIR/frontend" && npm run dev) &

wait
