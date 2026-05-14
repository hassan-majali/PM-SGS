# AUTH_LESSONS.md — Challenges & Learnings
> Lessons from implementing JWT auth + user management in this project.
> Apply these to every future project that has login, sessions, or user roles.

---

## 1. Railway Healthcheck Breaks When You Add Auth

**What happened:**
The healthcheck path was `/api/v1/clients`. After wrapping all `/api/v1/*` routes with `authenticate` middleware, the healthcheck started getting 401 responses and Railway treated that as "service unavailable" — even though the server was running fine.

**Fix:**
Always have a dedicated public health endpoint that requires no auth:
```typescript
app.get("/health", (_req, res) => res.json({ ok: true }));
```
And point the healthcheck at `/health` from day one in `railway.toml`:
```toml
healthcheckPath = "/health"
```

**Rule for future projects:** Add the `/health` endpoint and set the healthcheck path before you add any auth middleware. Never use a business-logic route as a healthcheck.

---

## 2. Prisma Seed Needs Its Own Config Field

**What happened:**
The `db:seed` npm script was defined as `tsx prisma/seed.ts`, but `npx prisma db seed` does not read npm scripts — it looks for a `"prisma": { "seed": "..." }` field in `package.json`. Without it, the command exits with an error code, and because of `&&` in the Dockerfile CMD, the server never started.

**Fix:**
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

**Rule for future projects:** Always add the `prisma.seed` config when you create a seed file. Never rely on an npm script alias for `npx prisma db seed`.

---

## 3. The 401 Interceptor Must Not Touch Auth Endpoints

**What happened:**
The axios response interceptor was designed to catch 401s, attempt a token refresh, and retry the original request. On the login page, `AuthContext` calls `/auth/refresh` to restore the session. If no session exists (first visit), that call returns 401. The interceptor caught it, tried to refresh again, failed, then called `window.location.href = "/login"` — causing an infinite page reload loop that also blocked all input fields.

**Fix:**
Two rules in the interceptor:
1. Skip the retry logic entirely if the original request was to an `/auth/` endpoint
2. Never call `window.location.href` from the interceptor — let `ProtectedRoute` handle navigation naturally

```typescript
const isAuthEndpoint = original.url?.includes("/auth/");
if (error.response?.status === 401 && !original._retried && !isAuthEndpoint) {
  // retry logic here
}
// on failure: just setAccessToken(null), no redirect
```

**Rule for future projects:** Auth endpoints must be excluded from the retry interceptor. The interceptor is for recovering expired sessions on protected API calls, not for handling login/refresh failures.

---

## 4. Seed Data Must Be Idempotent

**What happened:**
The seed script created sample clients, projects, and resources on every run. Running it on every Railway deploy (as part of the startup CMD) would have created duplicate records on each redeploy.

**Fix:**
Check before creating anything:
```typescript
// Admin user
const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
if (!existing) { /* create */ }

// Sample data
const count = await prisma.client.count();
if (count > 0) return; // already seeded
```

**Rule for future projects:** Every seed script must be safe to run multiple times. Always guard each creation with an existence check.

---

## 5. Healthcheck Timeout Must Cover Startup Time

**What happened:**
The default 30s healthcheck timeout was not enough for `prisma db push` + `prisma db seed` (which runs bcrypt at 12 rounds) to complete before Railway checked the `/health` endpoint. The server was still starting up when Railway gave up.

**Fix:**
Increase the timeout in `railway.toml`:
```toml
healthcheckTimeout = 120
```

**Rule for future projects:** If your startup command does database work (migrations, seeding), set the healthcheck timeout to at least 120s. 30s is only safe for servers that start instantly.

---

## 6. Access Token Must Not Be Stored in localStorage

**What happened (avoided):**
No localStorage was used — the access token is stored in memory (a module-level variable in `api/client.ts`) and the refresh token is in an httpOnly cookie.

**Why this matters:**
- `localStorage` is accessible by any JavaScript on the page — XSS attacks can steal it
- httpOnly cookies cannot be read by JavaScript at all
- Memory storage means the token is gone on page refresh, which is why the silent refresh call in `AuthContext` on mount is essential

**Rule for future projects:**
- Refresh token → httpOnly cookie only
- Access token → memory only (module variable or React state)
- Never put either token in `localStorage` or `sessionStorage`

---

## 7. SSH Keys Don't Transfer Between Machines

**What happened:**
The GitHub remote was set to SSH (`git@github.com:...`). After moving to a new machine, there was no SSH key configured, so all pushes failed with "Permission denied (publickey)".

**Fix:**
Switch the remote to HTTPS and use a Personal Access Token:
```bash
git remote set-url origin https://github.com/user/repo.git
```

**Rule for future projects:** For solo/small team projects, use HTTPS remotes with a PAT stored in macOS Keychain. SSH is only worth the setup if you're on a stable machine or a team that manages keys centrally.

---

## 8. Docker Layer Caching Can Serve Stale Code

**What happened:**
After pushing new source files, Railway's Docker builder served all layers from cache — including `COPY . .` and `RUN npm run build` — because Railway's content-hash for the context hadn't changed from its perspective. The deployed container was running old code.

**How to force a fresh build:**
- Changing `package.json` (e.g., adding `prisma.seed` config) busts the `npm install` layer and all subsequent layers
- Changing `Dockerfile` itself always busts the cache from that line onward

**Rule for future projects:** If you suspect Railway is serving cached code, make a meaningful change to `package.json` or `Dockerfile` to force a full rebuild.

---

## Summary Checklist — Auth Features

Before shipping any project with login/auth, verify:

- [ ] `/health` endpoint exists and is set as the Railway healthcheck path
- [ ] `prisma.seed` config is in package.json if using Prisma seed
- [ ] Seed script is idempotent (guards all creates)
- [ ] Healthcheck timeout is 120s+ if startup does DB work
- [ ] 401 interceptor skips auth endpoints
- [ ] 401 interceptor does not call `window.location.href`
- [ ] Access token in memory only (not localStorage)
- [ ] Refresh token in httpOnly cookie only
- [ ] Default admin user created by seed with strong password
- [ ] `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` set in production env vars
- [ ] All app routes wrapped in ProtectedRoute
- [ ] Admin-only routes wrapped in AdminRoute
