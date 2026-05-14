# PROGRESS.md — PM Portal Development Log
> Update this file at the end of every session.

---

## 📍 Current Status — May 2026

| Layer | Status |
|---|---|
| Backend (Railway) | ✅ Deployed & Running |
| Frontend (Vercel) | ✅ Deployed & Running |
| PostgreSQL Database | ✅ Live on Railway |
| Authentication | ✅ JWT-based login fully live |
| User Management | ✅ Admin Center live |
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
- [x] GitHub remote configured via HTTPS + PAT

### Authentication & User Management (2026-05-14)
- [x] JWT access token (1h) + refresh token (7d, httpOnly cookie)
- [x] bcrypt password hashing (12 salt rounds)
- [x] Password complexity policy enforced (uppercase + lowercase + number + special char, min 8)
- [x] Login page (`/login`) with show/hide password toggle
- [x] Session restore on page refresh via refresh cookie
- [x] Auto token refresh interceptor in API client (silent, no page reload)
- [x] ProtectedRoute — redirects unauthenticated users to `/login`
- [x] AdminRoute — redirects non-admins away from `/admin`
- [x] Logout button in sidebar
- [x] Admin Center (`/admin`) — list, create, role change, activate/deactivate, reset password
- [x] Default admin seeded on first deploy (`admin@pmportal.com`)
- [x] Seed runs idempotently on every Railway deploy

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
| 2026-05-11 | TypeScript `string \| string[]` on req.params | `@types/express` v5 incompatibility | Downgraded to v4, added `String()` coercion on all req.params |
| 2026-05-11 | nixpacks build override | nixpacks config conflict | Switched to Dockerfile |
| 2026-05-11 | `package-lock.json` out of sync | Stale lockfile | Ran `npm install` to regenerate |
| 2026-05-11 | Prisma OpenSSL missing at runtime | Alpine image lacks OpenSSL | Switched to `node:20-slim` + installed OpenSSL |
| 2026-05-11 | `prisma migrate deploy` no-op | Wrong migration strategy | Switched to `prisma db push` |
| 2026-05-11 | `import.meta.env` TypeScript error on Vercel | Missing vite types | Added `vite-env.d.ts` + `"types": ["vite/client"]` |
| 2026-05-11 | Financials tab blank | Route conflict — `summary` matched as `/:id` | Moved `summary` route before `/:id` |
| 2026-05-11 | Financials tab crash | Radix `Select.Item` rejects `value=""` | Changed empty string to `"all"` |
| 2026-05-14 | Railway healthcheck failing after auth added | `/api/v1/clients` now returns 401 | Added public `/health` endpoint, updated `railway.toml` |
| 2026-05-14 | Server never started on Railway | `npx prisma db seed` has no command without `prisma.seed` in package.json | Added `"prisma": { "seed": "tsx prisma/seed.ts" }` to package.json |
| 2026-05-14 | Login page reloading every 2 seconds | 401 interceptor triggered `window.location.href` on auth endpoint failure | Skip interceptor for `/auth/` endpoints, removed forced redirect |
| 2026-05-14 | Healthcheck timeout too short for seed + db push | Default 30s window not enough for startup commands | Increased `healthcheckTimeout` to 120s in `railway.toml` |

---

## ⏳ Pending Testing Checklist

### Authentication
- [ ] Login with admin credentials
- [ ] Verify redirect to dashboard after login
- [ ] Verify unauthenticated users redirected to `/login`
- [ ] Verify session persists after page refresh
- [ ] Verify logout clears session and redirects to `/login`
- [ ] Test Admin Center: create user, change role, deactivate, reset password
- [ ] Verify non-admin users cannot access `/admin`

### Clients & Projects
- [ ] Create a client
- [ ] Open client workspace
- [ ] Create a project from within the client

### Deliverables Tab
- [ ] Add deliverable with qty + unit price
- [ ] Verify total = qty × unit price
- [ ] Check billed = 0 and remaining = qty on new deliverable

### Financials Tab
- [ ] Open tab — confirm not blank
- [ ] Add invoice, select deliverable, enter qty
- [ ] Save and verify billed/remaining updates on Deliverables tab
- [ ] Cycle status: PENDING → IN_PROGRESS → INVOICED → COLLECTED
- [ ] Verify summary cards update

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

1. Complete full end-to-end testing of all tabs
2. Fix any bugs found during testing
3. Test Excel import on Deliverables
4. Test PDF export on Initiatives
5. Polish Dashboard charts with real data

---

## 📝 Session Log

| Date | What Was Done | Next Step |
|---|---|---|
| 2026-05-11 | Fixed Financials tab (route conflict + Select crash). Aligned data model. Deployed to Railway + Vercel. | Run full end-to-end testing |
| 2026-05-14 | Built full auth system — Phase 1 (backend JWT + bcrypt + RBAC), Phase 2 (frontend login + auth context + protected routes), Phase 3 (Admin Center UI). Fixed 4 Railway deployment issues along the way. All three phases live in production. | End-to-end test auth flows, then continue tab testing |
