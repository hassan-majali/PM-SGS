# CLAUDE.md — PM Portal (hassan-majali/PM-SGS)
> Read this file at the start of every session before touching any code.

---

## 🏗️ Project Identity

- **Name:** PM Portal — SGS Project Management Platform
- **Repo:** `git@github.com:hassan-majali/PM-SGS.git` (branch: `main`)
- **Frontend:** `https://pm-sgs-frontend.vercel.app`
- **Backend:** `https://pmtools-sgs.up.railway.app`
- **Local dev:** Frontend → `localhost:5173` | Backend → `localhost:3000`

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Express + TypeScript + Prisma ORM |
| Database (prod) | PostgreSQL on Railway |
| Database (local) | SQLite |
| Frontend Deploy | Vercel (root: `frontend/`) |
| Backend Deploy | Railway via Dockerfile (root: `backend/`) |
| Monorepo | npm workspaces |

---

## ⚙️ How to Start Local Dev

```bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh"
cd ~/project-mgmt-platform
npm run dev
```

---

## 🚨 Critical Rules — Read Before Every Change

### Never Break These
- `summary` and `import/excel` routes MUST be registered **before** `/:id` in every route file — Express will match "summary" as an ID otherwise
- `ALLOWED_ORIGINS` env var controls CORS — never hardcode URLs
- `VITE_API_URL` env var drives all API calls from frontend — never hardcode
- Always run `npx prisma generate` after any schema change
- Use `prisma db push` for schema sync — NOT `prisma migrate deploy`
- Never use `node:20-alpine` — use `node:20-slim` + install OpenSSL explicitly
- `@types/express` must stay at **v4** — v5 breaks `req.params` types
- Radix `Select.Item` must never have `value=""` — use a real string like `"all"`

### TypeScript Rules
- All imports from `import.meta.env` require `vite-env.d.ts` + `"types": ["vite/client"]` in tsconfig
- Strict mode is on — no `any` types unless absolutely unavoidable and commented
- All API response types must match `frontend/src/types/index.ts`

---

## 📐 Architecture Principles

### Backend
- Controllers handle all business logic — routes are thin
- Computed fields (`billedQty`, `remainingQty`) are calculated in the controller, never stored redundantly except `amount = qty × unitPrice`
- Route order matters: specific routes before parameterized ones
- All controllers return consistent JSON shapes

### Frontend
- All API calls go through `src/api/client.ts` — never use raw `fetch` elsewhere
- Types live in `src/types/index.ts` — always update here first before building features
- Tabs are self-contained components under `pages/projects/project-workspace/tabs/`

---

## 🧠 Development Practices

### Before Writing Any Code
1. Read `SPEC.md` to understand what feature you're building
2. Read `PROGRESS.md` to know what's done and what's pending
3. Check the relevant tab component and its API controller before modifying
4. If the change touches the Prisma schema — stop and confirm with the user first

### While Building
- Work in layers: **schema → controller → route → frontend type → component**
- Never skip a layer
- After every meaningful change, run the local dev server and verify it works
- If something breaks, check the "All Bugs Fixed" list in PROGRESS.md before debugging blindly

### Before Saying "Done"
- Test the specific feature end to end in the browser
- Check that no existing tabs broke
- Verify TypeScript compiles without errors: `npm run build`
- Confirm no console errors in the browser

---

## 💬 Communication Style

- Explain what you're about to do before doing it
- Flag any risk before making a breaking change
- If a change touches the database schema, always warn the user first
- When something is unclear, ask — don't assume
- After completing work, summarize what changed and update `PROGRESS.md`

---

## 🔐 Deployment Reminders

### Railway (Backend)
- Builder is Dockerfile — do not change to nixpacks
- Root directory in Railway dashboard must stay as `backend`
- After schema changes: Railway will auto-run `prisma db push` on next deploy via CMD

### Vercel (Frontend)
- Root directory must stay as `frontend`
- `VITE_API_URL` must point to Railway backend URL
- `vercel.json` contains SPA rewrites — do not remove

---

## 📁 Key Files Quick Reference

| File | Purpose |
|---|---|
| `backend/src/app.ts` | CORS config |
| `backend/src/routes/paymentPlans.routes.ts` | Route order critical |
| `backend/src/controllers/deliverables.controller.ts` | billedQty/remainingQty logic |
| `backend/prisma/schema.prisma` | Database schema |
| `frontend/src/api/client.ts` | All API calls |
| `frontend/src/types/index.ts` | All TypeScript types |
| `frontend/src/vite-env.d.ts` | Required for import.meta.env |
