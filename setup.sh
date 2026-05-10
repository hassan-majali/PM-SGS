#!/usr/bin/env bash
set -e

echo "=========================================="
echo " PM Portal — One-Shot Setup"
echo "=========================================="

# ── 1. Install nvm if not present ──────────────────────────────────────────
if [ ! -d "$HOME/.nvm" ]; then
  echo "[1/6] Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
else
  echo "[1/6] nvm already installed — skipping"
fi

# Source nvm for this shell session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# ── 2. Install Node.js LTS ──────────────────────────────────────────────────
echo "[2/6] Installing Node.js LTS..."
nvm install --lts
nvm use --lts
node -v && npm -v

# ── 3. Install backend deps ─────────────────────────────────────────────────
echo "[3/6] Installing backend dependencies..."
cd "$(dirname "$0")/backend"
npm install

# ── 4. Generate Prisma client + push DB schema ──────────────────────────────
echo "[4/6] Setting up database (SQLite)..."
npx prisma db push
npx prisma generate

# ── 5. Install frontend deps ─────────────────────────────────────────────────
echo "[5/6] Installing frontend dependencies..."
cd "$(dirname "$0")/frontend"
npm install

# ── 6. Done ──────────────────────────────────────────────────────────────────
cd "$(dirname "$0")"
echo ""
echo "=========================================="
echo " Setup complete!"
echo "=========================================="
echo ""
echo "To start the application, open TWO terminal tabs:"
echo ""
echo "  Tab 1 (backend):"
echo "    cd $(pwd)/backend && npm run dev"
echo ""
echo "  Tab 2 (frontend):"
echo "    cd $(pwd)/frontend && npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
