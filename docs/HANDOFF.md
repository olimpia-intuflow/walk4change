# SeaSteps (walk4change) — Project Handoff

Self-contained brief to continue this project in a fresh (incl. remote/cloud) session.
**Source of truth = the `main` branch** (monorepo). Read this fully before changing anything.

> **Updated 2026-07-09.** The hackathon-era infrastructure (Kamil's homelab, Cloudflare tunnel,
> k3s/ArgoCD, old Supabase project) is **gone** — full takeover happened 2026-07-06/07.
> Everything now runs on the owner's accounts: Azure (backend), Vercel (frontend), Supabase
> `plncauubrwbfbavcejgs` (DB/Auth/Storage). If any doc still mentions
> `walk4change.kamilandrzejrybacki.dpdns.org` or Supabase `vjsjxdqnmhyrglsfqvvp`, it is stale.

---

## 1. What it is
**SeaSteps** — a hackathon app (Hack4Change 2026, Baltic/nature theme) that gamifies walking:
you earn points for movement, **×1.5 walking together**, **×3 in a nature zone** (they stack → ×4.5).
Eco rewards (plant a tree, adopt a seal), friends, live two-person walks, leaderboard.

## 2. Architecture
```
Browser ──HTTPS──> Vercel (static: landing / + SPA /app/)
   │                 project "seasteps-app", account olimpia-intuflow
   │ app calls API (HTTPS + WS)
   ▼
Azure App Service (Linux B1, container)          Supabase (NEW project plncauubrwbfbavcejgs)
if-app-walk4change-prod-pl  ──DATABASE_URL──>    • Postgres + PostGIS (session pooler)
RG if-rg-walk4change-prod-pl                     • Auth (magic-link OTP)
1 instance — do NOT scale (in-memory WS hub)     • Storage: bucket eco-photos
Magic-link: Supabase Auth emails link ──> app /app/auth/magic ──> backend exchanges Supabase token for app JWT
```
- **Frontend**: Vite + React 19 + TS + Tailwind v4 (in `web/`). PWA (installable, offline shell).
- **Backend**: Rust + Axum + Tokio + sqlx (in `backend/`). Owns all logic; issues its own HS256 JWT.
  Health: `/api/v1/health` (also set as App Service healthCheckPath).
- **DB**: Supabase Postgres + PostGIS. Project `plncauubrwbfbavcejgs` (org SeaSteps, account
  admin@seasteps.pl, eu-west-1, Free). Migrated 2026-07-07 (12/12 tables, storage + policies, zero drift).
  Old project `vjsjxdqnmhyrglsfqvvp` = frozen backup on the inaccessible hackathon account — do not touch.
- **RLS**: enabled deny-all on public tables (security audit 2026-07-08); the backend connects as
  `postgres` and bypasses it. PostgREST/Data API is not used for these tables.

## 3. Live URLs
- **https://seasteps.pl** (canonical; `www` redirects to apex) — landing `/`, app `/app/`.
- https://seasteps-app.vercel.app — same deploy (Vercel project `seasteps-app`).
- **Backend API:** https://if-app-walk4change-prod-pl.azurewebsites.net (health: `/api/v1/health` → `ok`).
- Legacy Vercel projects on the h4cstolik3 account (`seasteps`, `walk4change`, `web-alpha-three-89`…) —
  superseded, no domain attached, will wither.

Demo accounts (seeded): `ana@demo.walk4change` / `bek@demo.walk4change`, password `demodemo`.

## 4. Repo (branch `main` = monorepo)
- **github.com/olimpiagozdziewicz/walk4change** — transferred from `h4cstolik3` 2026-07-07;
  the account was renamed `olimpia-intuflow` → `olimpiagozdziewicz` 2026-07-09 (old URLs redirect).
- Local working clone (Windows workspace): `BIZNES/projekty/seasteps/app/` —
  `core.autocrlf=false`, do not change it.
```
index.html              # marketing landing (static)
web/                    # Vite React app (base path = /app/)
  src/screens/Walk.tsx  # the real two-phone GPS walk (Spacer) — core demo
  src/screens/MagicVerify.tsx  # /auth/magic → exchange Supabase session for app JWT
  src/lib/{http,auth,ws,supabase,api}.ts
  public/{manifest.webmanifest,sw.js,pwa-192.png,pwa-512.png}
backend/                # Rust/Axum API
  crates/api/src/...    # auth, routes, repo, scoring, ws, mail, config
  migrations/           # auto-apply on startup (sqlx::migrate!())
  Dockerfile, docker-compose.yml, Makefile
  deploy/homelab.sh     # LEGACY (old homelab) — prod is Azure now, see §5
docs/                   # design spec, plan, this handoff
scripts/build-site.sh   # builds combined site (landing + app under /app/)
vercel.json (root)      # buildCommand build-site.sh + SPA rewrites for /app/*
```

## 5. Deploys
**Frontend → Vercel (manual; no git integration):**
- From the repo root: `npx vercel deploy --prod` (CLI linked to project `seasteps-app`).
  Root `vercel.json` makes Vercel build via `scripts/build-site.sh` (landing `/` + app `/app/`).
- Build-time env (Vercel project → Production — ALL three must be set before any build,
  lesson from the 2026-06-30 incident): `VITE_API_BASE` (Azure URL), `VITE_SUPABASE_URL`,
  `VITE_SUPABASE_ANON_KEY`.

**Backend → Azure App Service (automatic CI/CD):**
- Push to `main` touching `backend/**` → GitHub Actions builds the Docker image →
  `ghcr.io/olimpia-intuflow/walk4change-api` (public) → repo secret `AZURE_CD_WEBHOOK`
  triggers the App Service to pull `:latest` and restart. Verified e2e 2026-07-07.
- ⚠ **Unverified after the 2026-07-09 account rename:** the ghcr namespace may now be
  `olimpiagozdziewicz/` — at the next backend deploy check the CI run and, if needed,
  repoint the App Service image reference.
- App Service settings: Web Sockets ON, Always On ON, **replicas locked at 1** (in-memory WS hub).
- Backend env lives in App Service → Configuration (values in the owner's private vault, never
  in repo/chat): `DATABASE_URL` (Supabase **session pooler**, port 5432 — sqlx uses prepared
  statements, the 6543 transaction pooler will NOT work), `JWT_SECRET`, `BIND_ADDR=0.0.0.0:8080`,
  `CORS_ALLOWED_ORIGINS` (seasteps.pl origins), `APP_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  optional `SMTP_*`, `SCORING_*`.
- Rollback env snapshot from the migration: kept locally by the owner (see project docs).

## 6. Auth model
Two ways in, both end with the **backend's own JWT** (used for all API/WS calls):
1. **Email + password** (`/api/v1/auth/register`, `/login`).
2. **Magic link via Supabase Auth**: app calls `supabase.auth.signInWithOtp({email,
   emailRedirectTo: <origin>/app/auth/magic})` → Supabase emails the link → `/app/auth/magic`
   exchanges the Supabase session via **`POST /api/v1/auth/supabase`** → app JWT.
   - Supabase Auth config (new project): site_url `https://seasteps.pl`; redirect allow-list:
     `https://seasteps.pl/app/auth/magic`, `https://seasteps-app.vercel.app/app/auth/magic`.
   - Supabase built-in mailer is rate-limited (~3–4/h) — OK for demos. **Brevo SMTP pending**:
     domain seasteps.pl authorized in Brevo + sender `noreply@seasteps.pl` verified (2026-07-08);
     remaining = SMTP env on Azure + the `email_verified` feature (see §10).
   - Legacy SMTP magic-link (`/auth/magic/request` + `/verify`) kept as fallback.

## 7. Two-phone GPS walk (the demo) — `web/src/screens/Walk.tsx`
- Log in → **Start walk** (gets a `join_code`) OR **Join by code** (`POST /api/v1/walks/join-by-code`).
- `navigator.geolocation.watchPosition` streams GPS over WebSocket (`/api/v1/ws`):
  `auth` → `subscribe(session)` → `ping` frames.
- Backend scores each ping: `together_mult` (≥2 active participants) and `nature_mult`
  (point inside an active `nature_zones` polygon via `ST_Covers`). Both stack.
- Join codes expire after 24h (hardening 2026-07-08).
- Nature zone helper: `backend/deploy/add-nature-zone.sh <lat> <lng> [radius_m]`.
  A "Demo Walk Zone" exists at `54.39498, 18.57653` (Gdańsk).
- `backend/scripts/replay.sh [session]` simulates two walkers over WS without phones.

## 8. Local dev
- Backend: `cd backend && ./scripts/dev-up.sh` (Postgres+API in Docker on :5433/:8080),
  `./scripts/seed.sh`, `make demo`.
- Frontend: `cd web && npm install && npm run dev` (empty `VITE_API_BASE` = mock mode;
  `VITE_API_BASE=http://localhost:8080 npm run dev` for the real API).

## 9. Status — DONE
- **Full infra takeover (2026-07-06/07):** backend on Azure App Service (smoke + E2E PASS:
  login → walk → live points → leaderboard → eco), domain `seasteps.pl` + `www` on the owner's
  Vercel project `seasteps-app`, repo transferred, backend CI→ghcr→webhook→App Service verified.
- **Supabase migration (2026-07-07 ~23:35):** new project `plncauubrwbfbavcejgs`; 12/12 tables,
  `_sqlx_migrations` with checksums, storage bucket + policies; backend + frontend cut over;
  login demo E2E via browser PASS; zero data drift after cutover.
- **Security hardening (2026-07-08, deployed):** RLS deny-all on public tables (Data API no longer
  exposes them), eco-photos bucket 5MB limit + MIME whitelist, field length limits, URL validation
  (blocks `javascript:`), email normalization, join-code 24h expiry, `_whoami` removed.
  Audit verdict otherwise: no SQLi/IDOR; JWT/CORS/rate-limit/security headers OK.
- Monorepo on `main`; combined single deploy (landing `/` + app `/app/`); PWA installable.
- Real two-phone GPS walk verified end-to-end (2 walkers, ×1.5 + ×3).

## 10. Status — PENDING
1. **Magic-link production test** — owner clicks the test link sent to admin@seasteps.pl.
2. **Brevo SMTP env on Azure + `email_verified` feature** (migration + register/login/verify
   + verify page in the frontend + e2e test; only then enable the login block). Deliverability
   path already verified (2026-07-08). Note: no local Rust toolchain — test via CI + prod smoke.
3. **Secret rotation** (values flashed in a chat log 2026-07-09): Supabase DB password (+ all
   pooler/direct URLs containing it), `AZURE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY` +
   `SUPABASE_SECRET_KEY`. Anon/publishable keys are public — no rotation needed.
4. **Verify backend CI after the GitHub rename** (ghcr namespace, §5).
5. **Homelab wind-down** — Kamil's backend was plan B until ~2026-07-09; ask him to switch it off.
   Old Supabase project pauses itself. Old h4c Vercel projects wither (no domain).

## 11. Secrets (NEVER in repo/chat)
Live in: Azure App Service → Configuration (backend), Vercel project env (frontend build),
and the owner's private local vault (prefix `SEASTEPS_*`). The Supabase **anon key** is public
by design (in the app bundle). Everything else — treat as secret; values are never quoted in docs.

## 12. Gotchas
- Frontend build needs **Node ≥ 20** (Vite 8).
- Backend uses runtime sqlx queries — Docker build needs no DB.
- Supabase **direct** connection is IPv6-only; always use the **session pooler** (IPv4, port 5432)
  for `DATABASE_URL`.
- Live WS hub is **in-memory** → single backend instance, never scale out without adding
  shared pub/sub (e.g. Redis).
- Frontend env vars are **build-time** (Vite) — changing `VITE_API_BASE` etc. requires
  a rebuild/redeploy.
- iOS: PWA install works **only in Safari**.
- Steps are derived from GPS distance (`steps ≈ meters / 0.75`), not the accelerometer.
