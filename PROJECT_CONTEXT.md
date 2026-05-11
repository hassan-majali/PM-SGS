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
│   │   ├── app.ts              ← CORS config via ALLOWED_ORIGINS env var
│   │   ├── routes/
│   │   │   ├── paymentPlans.routes.ts  ← summary route must come before /:id
│   │   │   └── ...
│   │   └── controllers/
│   │       ├── deliverables.controller.ts  ← computes billedQty/remainingQty
│   │       ├── paymentPlans.controller.ts  ← auto-computes amount from billedQty
│   │       └── ...
│   ├── prisma/
│   │   └── schema.prisma       ← PostgreSQL, Deliverable has qty/unitPrice, PaymentPlan has billedQty
│   ├── Dockerfile              ← node:20-slim + OpenSSL + prisma db push
│   ├── railway.toml            ← builder = "dockerfile"
│   ├── nixpacks.toml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts       ← reads VITE_API_URL env var
│   │   ├── vite-env.d.ts       ← required for import.meta.env TypeScript support
│   │   ├── types/index.ts      ← Deliverable has qty/unitPrice/billedQty/remainingQty
│   │   └── pages/projects/project-workspace/tabs/
│   │       ├── DeliverablesTab.tsx   ← qty + unitPrice form, billed/remaining tracking
│   │       └── FinancialsTab.tsx     ← deliverable-linked billing, qty-based invoicing
│   ├── tsconfig.json           ← includes "types": ["vite/client"]
│   └── vercel.json             ← SPA rewrites
├── package.json                ← npm workspaces (backend + frontend)
├── PROJECT_CONTEXT.md          ← this file
└── .gitignore
```

---

## GitHub Repo

**URL:** `git@github.com:hassan-majali/PM-SGS.git`  
**Branch:** `main`  
**Auth:** SSH key (`~/.ssh/id_ed25519`)

---

## Deployment

### Backend — Railway
- **URL:** `https://pmtools-sgs.up.railway.app`
- **Builder:** Dockerfile
- **Root Directory in Railway:** `backend`
- **Database:** PostgreSQL (Railway service)

**Environment Variables:**
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
- **Root Directory in Vercel:** `frontend`

**Environment Variables:**
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://pmtools-sgs.up.railway.app` |

---

## Current Status

- [x] Backend deployed on Railway
- [x] PostgreSQL database running, tables created via `prisma db push`
- [x] Frontend deployed on Vercel
- [x] CORS configured and working
- [x] Clients can be created
- [x] Deliverables tab working — qty + unitPrice form, billed/remaining tracking
- [x] Financials tab fixed and working — deliverable-linked billing, qty-based invoicing
- [ ] **Full testing pending** — all 8 tabs need to be tested end to end

---

## Data Model — Key Changes (2026-05-11)

### Deliverable
```prisma
model Deliverable {
  qty       Float @default(1)
  unitPrice Float @default(0)
  amount    Float  // stored as qty × unitPrice, computed on save
  // backend also returns computed fields:
  // billedQty    = sum of PaymentPlan.billedQty for this deliverable
  // remainingQty = qty - billedQty
}
```

### PaymentPlan
```prisma
model PaymentPlan {
  billedQty Float?  // units billed in this specific invoice
  // amount is auto-computed = billedQty × deliverable.unitPrice
}
```

---

## Deliverables Tab — How It Works

**Adding a deliverable:**
- Enter Name, Description, Qty, Unit Price
- Total = Qty × Unit Price (shown live before saving)

**Table columns:** DELIVERABLE | QTY | UNIT PRICE | TOTAL | BILLED | REMAINING

- BILLED = sum of all qty billed across invoices for this deliverable (yellow)
- REMAINING = qty - billed (green/yellow/red based on how much is left)

---

## Financials Tab — How It Works

**Adding an invoice:**
1. Select a deliverable (shows unit price, total qty, already billed, available to bill)
2. Enter Qty to Bill (capped at remaining qty)
3. Invoice Amount auto-computes = qty × unit price (read-only)
4. Set Invoice Date, Status, Fiscal Year, Invoice Number

**Table columns:** DELIVERABLE | QTY BILLED | AMOUNT | INVOICE DATE | STATUS | FISCAL YEAR | ATTACHMENT

**Status workflow:** PENDING → IN_PROGRESS → INVOICED → COLLECTED

**Summary cards:** Forecasted / Invoiced / Collected / Pending (filtered by fiscal year)

---

## Bugs Fixed (2026-05-11)

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Financials tab blank | `summary` route registered after `/:id` — Express matched "summary" as an ID | Moved `summary` and `import/excel` routes before `/:id` |
| Financials tab crash | Radix `Select.Item` doesn't allow `value=""` | Changed "All Years" option value from `""` to `"all"` |

---

## All Bugs Fixed To Date

| Error | Fix |
|-------|-----|
| TypeScript `string \| string[]` on req.params | Downgraded `@types/express` from v5 to v4 |
| nixpacks `--workspace=backend` override | Added `nixpacks.toml` then switched to Dockerfile |
| `package-lock.json` out of sync | Ran `npm install` to regenerate |
| Prisma OpenSSL missing at runtime | Switched from `node:20-alpine` to `node:20-slim` + installed OpenSSL |
| `prisma migrate deploy` no-op | Switched to `prisma db push` |
| `import.meta.env` TypeScript error on Vercel | Added `vite-env.d.ts` + `"types": ["vite/client"]` in tsconfig |
| Financials tab blank (route conflict) | Moved `summary` route before `/:id` in paymentPlans.routes.ts |
| Financials tab crash (Select empty value) | Changed `value=""` to `value="all"` on All Years option |

---

## Testing Checklist (Pending)

### Clients
- [ ] Create a client
- [ ] Open client workspace
- [ ] Create a project from within the client

### Deliverables Tab
- [ ] Add deliverable with qty + unit price
- [ ] Verify total = qty × unit price
- [ ] Check billed = 0 and remaining = qty on new deliverable

### Financials Tab
- [ ] Open tab (should not be blank)
- [ ] Click Add Invoice
- [ ] Select deliverable — verify unit price, qty, remaining shown correctly
- [ ] Enter qty to bill — verify amount auto-computes
- [ ] Save and check invoice appears in table
- [ ] Check Deliverables tab — billed qty should increase, remaining should decrease
- [ ] Change invoice status (PENDING → INVOICED → COLLECTED)
- [ ] Verify summary cards update

### Other Tabs
- [ ] Resources — add a resource
- [ ] Documents — upload a file
- [ ] Activity Log — create a weekly log
- [ ] Risks & Issues — add a risk
- [ ] Mandays — update contracted/used/billed hours
- [ ] Dashboard — verify charts and summary data load

### Initiatives
- [ ] Create an initiative
- [ ] Add action items
- [ ] Export to PDF

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
