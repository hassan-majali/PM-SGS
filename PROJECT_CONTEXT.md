# PM Portal — Project Context & Deployment Status

## What Was Built

Full-stack internal project management platform at `~/project-mgmt-platform`.

**Frontend:** React + TypeScript + Vite + Tailwind CSS  
**Backend:** Express + TypeScript + Prisma ORM  
**Database:** PostgreSQL (production), SQLite (local dev)

### Features
- Client workspaces
- Project workspaces with 8 tabs: Dashboard, Deliverables, Financials, Resources, Documents, Weekly Activity Log, Risks/Issues, Mandays
- Initiative tracking (RFP/Sutherland-driven) with action items, support needed, PDF export
- Excel import (xlsx library)
- File uploads (multer)
- Charts (Recharts)
- PDF export (jsPDF + jspdf-autotable)

---

## Repo Structure

```
project-mgmt-platform/
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── app.ts          ← CORS config via ALLOWED_ORIGINS env var
│   │   ├── routes/
│   │   └── middleware/
│   ├── prisma/
│   │   └── schema.prisma   ← PostgreSQL provider
│   ├── Dockerfile          ← node:20-slim + OpenSSL + prisma db push
│   ├── railway.toml        ← builder = "dockerfile"
│   ├── nixpacks.toml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts   ← reads VITE_API_URL env var
│   │   ├── vite-env.d.ts   ← required for import.meta.env TypeScript support
│   │   └── ...
│   ├── tsconfig.json       ← includes "types": ["vite/client"]
│   └── vercel.json         ← SPA rewrites
├── package.json            ← npm workspaces (backend + frontend)
└── .gitignore
```

---

## GitHub Repo

**URL:** `git@github.com:hassan-majali/PM-SGS.git`  
**Branch:** `main`  
**Auth:** SSH key (`~/.ssh/id_ed25519`)

---

## Deployment Setup

### Backend — Railway
- **URL:** `https://pmtools-sgs.up.railway.app`
- **Platform:** Railway (railway.app)
- **Builder:** Dockerfile (switched from nixpacks due to monorepo workspace detection issues)
- **Root Directory in Railway:** `backend`
- **Database:** PostgreSQL (added as Railway service)

**Environment Variables set in Railway:**
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | *(PostgreSQL URL from Railway Postgres service)* |
| `ALLOWED_ORIGINS` | `https://pm-sgs-frontend.vercel.app` |

**Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:20-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY . .
RUN npm run build
EXPOSE 3000
CMD sh -c "npx prisma db push && node dist/index.js"
```

### Frontend — Vercel
- **URL:** `https://pm-sgs-frontend.vercel.app`
- **Platform:** Vercel
- **Root Directory in Vercel:** `frontend`

**Environment Variables set in Vercel:**
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://pmtools-sgs.up.railway.app` |

---

## Current Status

- [x] Backend deployed and running on Railway
- [x] PostgreSQL database created and tables pushed via `prisma db push`
- [x] Frontend deployed on Vercel
- [ ] **CORS issue not resolved** — frontend cannot reach backend

### Active Problem: CORS
The browser console shows:
```
Access to XMLHttpRequest at 'https://pmtools-sgs.up.railway.app/api/v1/clients'
from origin 'https://pm-sgs-frontend.vercel.app' has been blocked by CORS policy
```

**Root cause:** After updating `ALLOWED_ORIGINS` in Railway from `*` to `https://pm-sgs-frontend.vercel.app`, the Railway redeploy took too long (16+ min) and was aborted.

**Fix needed:** Redeploy Railway backend after confirming `ALLOWED_ORIGINS` is set correctly. The CORS logic in `backend/src/app.ts` is correct — it just needs a successful redeploy.

---

## Errors Encountered & Fixed (History)

| Error | Fix |
|-------|-----|
| TypeScript `string \| string[]` on req.params | Downgraded `@types/express` from v5 to v4 |
| nixpacks `--workspace=backend` override | Added `nixpacks.toml` then switched to Dockerfile |
| `package-lock.json` out of sync | Ran `npm install` to regenerate |
| Prisma OpenSSL missing | Switched from `node:20-alpine` to `node:20-slim` + installed OpenSSL |
| `prisma migrate deploy` no-op (no migration files) | Switched to `prisma db push` |
| `import.meta.env` TypeScript error on Vercel | Added `vite-env.d.ts` + `"types": ["vite/client"]` in tsconfig |

---

## Next Steps

1. **Fix CORS** — Go to Railway → backend → Variables → confirm `ALLOWED_ORIGINS` = `https://pm-sgs-frontend.vercel.app` → Redeploy
2. **Test the app** — Open `https://pm-sgs-frontend.vercel.app` and create a client
3. **Optional** — Seed the database with initial data via `npm run db:seed --workspace=backend`

---

## Local Dev

```bash
# Node via nvm
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"

# Run both frontend and backend
cd ~/project-mgmt-platform
npm run dev

# Backend only: http://localhost:3000
# Frontend only: http://localhost:5173
```
