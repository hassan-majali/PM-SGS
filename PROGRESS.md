# PROGRESS.md — PM Portal Development Log
> Update this file at the end of every session.

---

## 📍 Current Status — May 2026

| Layer | Status |
|---|---|
| Backend (Railway) | ✅ Deployed & Running |
| Frontend (Vercel) | ✅ Deployed & Running |
| PostgreSQL Database | ✅ Live on Railway |
| CORS | ✅ Configured & Working |
| End-to-End Testing | ⏳ In Progress |

---

## ✅ Completed Features

### Infrastructure
- [x] Monorepo setup with npm workspaces
- [x] Backend deployed on Railway via Dockerfile
- [x] Frontend deployed on Vercel
- [x] PostgreSQL running on Railway
- [x] CORS configured via `ALLOWED_ORIGINS` env var
- [x] SSH key auth to GitHub repo

### Client Management
- [x] Create a client
- [x] Client workspace view

### Project Workspace (8 Tabs)
- [x] Deliverables Tab — qty + unitPrice form, billed/remaining tracking
- [x] Financials Tab — deliverable-linked billing, qty-based invoicing, status workflow
- [ ] Dashboard Tab — charts and summary data *(needs testing)*
- [ ] Resources Tab *(needs testing)*
- [ ] Documents Tab — file uploads *(needs testing)*
- [ ] Weekly Activity Log *(needs testing)*
- [ ] Risks & Issues Tab *(needs testing)*
- [ ] Mandays Tab *(needs testing)*

### Initiatives
- [ ] Create initiative *(needs testing)*
- [ ] Add action items *(needs testing)*
- [ ] PDF export *(needs testing)*

---

## 🐛 All Bugs Fixed To Date

| Date | Bug | Root Cause | Fix Applied |
|---|---|---|---|
| 2026-05-11 | TypeScript `string \| string[]` on req.params | `@types/express` v5 incompatibility | Downgraded to v4 |
| 2026-05-11 | nixpacks `--workspace=backend` override | nixpacks config conflict | Added nixpacks.toml then switched to Dockerfile |
| 2026-05-11 | `package-lock.json` out of sync | Stale lockfile | Ran `npm install` to regenerate |
| 2026-05-11 | Prisma OpenSSL missing at runtime | Alpine image lacks OpenSSL | Switched to `node:20-slim` + installed OpenSSL |
| 2026-05-11 | `prisma migrate deploy` no-op | Wrong migration strategy | Switched to `prisma db push` |
| 2026-05-11 | `import.meta.env` TypeScript error on Vercel | Missing vite types | Added `vite-env.d.ts` + `"types": ["vite/client"]` |
| 2026-05-11 | Financials tab blank | Route conflict — `summary` matched as `/:id` | Moved `summary` route before `/:id` |
| 2026-05-11 | Financials tab crash | Radix `Select.Item` rejects `value=""` | Changed empty string to `"all"` |

---

## ⏳ Pending Testing Checklist

### Clients
- [ ] Create a client
- [ ] Open client workspace
- [ ] Create a project from within the client

### Deliverables Tab
- [ ] Add deliverable with qty + unit price
- [ ] Verify total = qty × unit price
- [ ] Check billed = 0 and remaining = qty on new deliverable

### Financials Tab
- [ ] Open tab — confirm not blank
- [ ] Click Add Invoice
- [ ] Select deliverable — verify unit price, qty, remaining shown correctly
- [ ] Enter qty to bill — verify amount auto-computes
- [ ] Save invoice and confirm it appears in table
- [ ] Check Deliverables tab — billed qty should increase, remaining should decrease
- [ ] Change invoice status: PENDING → IN_PROGRESS → INVOICED → COLLECTED
- [ ] Verify summary cards update (Forecasted / Invoiced / Collected / Pending)

### Other Tabs
- [ ] Resources — add a resource
- [ ] Documents — upload a file
- [ ] Activity Log — create a weekly log entry
- [ ] Risks & Issues — add a risk
- [ ] Mandays — update contracted/used/billed hours
- [ ] Dashboard — verify charts and summary data load correctly

### Initiatives
- [ ] Create an initiative
- [ ] Add action items
- [ ] Mark support needed
- [ ] Export to PDF — verify layout

---

## 🔜 Next Steps (Priority Order)

1. Complete full end-to-end testing of all 8 tabs
2. Fix any bugs found during testing
3. Test Excel import on Deliverables
4. Test PDF export on Initiatives
5. Add authentication (login/logout) — not yet implemented
6. Add user roles (admin / viewer) — planned
7. Polish Dashboard charts with real data

---

## 📝 Session Log

| Date | What Was Done | Next Step |
|---|---|---|
| 2026-05-11 | Fixed Financials tab (route conflict + Select crash). Aligned data model: qty/unitPrice on Deliverable, billedQty on PaymentPlan. Deployed to Railway + Vercel. | Run full end-to-end testing on all tabs |
