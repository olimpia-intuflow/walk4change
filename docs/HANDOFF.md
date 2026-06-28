# SeaSteps (walk4change) — Project Handoff

Self-contained brief to continue this project in a fresh (incl. remote/cloud) session.
**Source of truth = the `main` branch** (monorepo). Read this fully before changing anything.

---

## 1. What it is
**SeaSteps** — a hackathon app (Hack4Change 2026, Baltic/nature theme) that gamifies walking:
you earn points for movement, **×1.5 walking together**, **×3 in a nature zone** (they stack → ×4.5).
Eco rewards (plant a tree, adopt a seal), friends, live two-person walks, leaderboard.

## 2. Architecture
```
Browser ──HTTPS──> Vercel (static: landing + SPA)
   │ app calls API (HTTPS + WS)
   ▼
Cloudflare named tunnel ──> Homelab Docker container (Rust/Axum API) ──> Supabase Postgres (+PostGIS)
Magic-link auth: Supabase Auth sends email ──> app ──> backend exchanges Supabase token for app JWT
```
- **Frontend**: Vite + React 19 + TS + Tailwind v4 (in `web/`). PWA (installable, offline shell).
- **Backend**: Rust + Axum + Tokio + sqlx (in `backend/`). Owns all logic; issues its own HS256 JWT.
- **DB**: Supabase Postgres + PostGIS (prod). Migrations auto-apply on backend startup.
- **Hosting**: frontend on Vercel; backend on the user's **homelab** behind a **Cloudflare named tunnel** (free, HTTPS+WS, no port-forward). Supabase is DB-only.

## 3. Live URLs
- **Combined site (canonical):** https://seasteps.vercel.app
  - `/` → marketing **landing** (static `index.html`)
  - `/app/` → the **React app** (SPA)
- **Backend API:** https://walk4change.kamilandrzejrybacki.dpdns.org  (health: `/api/v1/health` → `ok`)
- **Custom domain (pending DNS):** `seasteps.pl` (+ `www`) — assigned to the Vercel `seasteps` project; nameservers still at SEOhost (see Pending).
- Legacy separate deploys still exist (`web-alpha-three-89`, `landing-jet-six-83`) — superseded by the combined `seasteps` project. Prefer the combined one.

Demo accounts (seeded): `ana@demo.walk4change` / `bek@demo.walk4change`, password `demodemo`.

## 4. Repo layout (branch `main` = monorepo)
```
index.html              # marketing landing (static; has Supabase magic-link JS)
favicon.svg, app-preview.png
web/                    # Vite React app (base path = /app/)
  src/screens/Walk.tsx  # the real two-phone GPS walk (Spacer) — core demo
  src/screens/MagicVerify.tsx  # /auth/magic → exchange Supabase session for app JWT
  src/lib/{http,auth,ws,supabase,api}.ts
  src/components/{LiveMap,InstallModal,AppShell,...}.tsx
  public/{manifest.webmanifest,sw.js,pwa-192.png,pwa-512.png}
backend/                # Rust/Axum API
  crates/api/src/...    # auth, routes, repo, scoring, ws, mail, config
  migrations/           # 0001_init, 0002_hardening, 0003_magic_links
  Dockerfile, docker-compose.yml, Makefile
  scripts/{dev-up,dev-down,seed,replay,demo}.sh
  deploy/{homelab.sh,cloudrun.sh,add-nature-zone.sh, *.env.*.example}
docs/                   # design spec, plan, this handoff
scripts/build-site.sh   # builds combined site (landing + app under /app/) -> ./site
```
Other branches: `frontend` (legacy landing/PWA work — its content is already merged into main; local copy is stale), `backend` (legacy). **Work on `main`.**

## 5. Single-deploy structure (important)
The app is built with **Vite `base: '/app/'`** so landing (`/`) and app (`/app/`) share ONE Vercel deploy.
- Router uses `basename={import.meta.env.BASE_URL}` (`/app`).
- `manifest.webmanifest`, `sw.js`, apple/icon links all use `/app/...`.
- Build + assemble: `scripts/build-site.sh` → outputs `./site/` (landing at root + `web/dist` under `/app/` + a `vercel.json` with SPA rewrites for `/app/*`).
- Deploy: `cd site && vercel deploy --prod` (Vercel project **seasteps**).
- Build env baked into the app: `VITE_API_BASE`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## 6. Auth model
Two ways in, both end with the **backend's own JWT** (used for all API/WS calls):
1. **Email + password** (`/api/v1/auth/register`, `/login`) — used by the in-app Spacer auth + `/app/login`.
2. **Magic link via Supabase Auth** (preferred): landing/app call `supabase.auth.signInWithOtp({email, emailRedirectTo: <origin>/app/auth/magic})` → Supabase emails the link → app `/app/auth/magic` gets the Supabase session → **`POST /api/v1/auth/supabase {access_token}`** validates it via Supabase `/auth/v1/user` and find-or-creates the user, returning the app JWT.
   - There is also a legacy SMTP magic-link (`/auth/magic/request` + `/verify`, lettre/Gmail) kept as fallback; Supabase is the active path.

## 7. Two-phone GPS walk (the demo) — `web/src/screens/Walk.tsx`
- Log in (or magic link) → **Start walk** (gets a `join_code`) OR **Join by code**.
- `navigator.geolocation.watchPosition` streams GPS over WebSocket (`/api/v1/ws`): `auth` → `subscribe(session)` → `ping` frames.
- Backend scores each ping: `together_mult` (≥2 active participants pinging in the session) and `nature_mult` (point inside an active `nature_zones` polygon, via `ST_Covers`). Both stack.
- **Pairing without friendship:** `POST /api/v1/walks/join-by-code {code}` (added so two strangers can pair).
- **Nature zone for a demo location:** `backend/deploy/add-nature-zone.sh <lat> <lng> [radius_m]` inserts a ×3 zone. A "Demo Walk Zone" exists at `54.39498, 18.57653` (Gdańsk).
- `backend/scripts/replay.sh [session]` simulates two walkers over WS without phones (uses `fixtures/track_a|b.json`).

## 8. Backend run/deploy (homelab)
- Image: multi-stage `backend/Dockerfile` (rust → debian-slim, rustls so no OpenSSL; migrations embedded).
- `backend/deploy/homelab.sh` runs the API container (against Supabase) + the Cloudflare tunnel; reads secrets from `backend/deploy/.env.homelab` (gitignored).
- Update flow on the homelab box: `git pull && cd backend && docker build -t walk4change-api:dev . && ./deploy/homelab.sh`.
- Env the backend reads: `DATABASE_URL` (Supabase **session pooler**), `JWT_SECRET` (≥32 chars), `BIND_ADDR=0.0.0.0:8080`, `CORS_ALLOWED_ORIGINS`, `APP_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, optional `SMTP_*`.
- Local dev (no homelab): `cd backend && ./scripts/dev-up.sh` (Postgres+API in Docker on :5433/:8080), `./scripts/seed.sh`, `make demo`.

## 9. Status — DONE
- Monorepo on `main`; combined single deploy (landing `/` + app `/app/`) live on `seasteps.vercel.app`.
- Backend live on homelab via Cloudflare tunnel → Supabase; migrations + seed applied.
- Real two-phone GPS walk in the Spacer screen; join-by-code; nature zone at demo coords. Verified end-to-end (2 walkers, ×1.5 + ×3).
- Supabase magic-link wired (frontend + backend exchange) and deployed; Supabase email provider confirmed enabled (signups on, autoconfirm off).
- PWA installable (Android/Chrome prompt + iOS Add-to-Home hint).

## 10. Status — PENDING (config; mostly needs the human, not code)
1. **DNS for `seasteps.pl`** — at SEOhost change nameservers to `ns1.vercel-dns.com` + `ns2.vercel-dns.com` (or add the A/CNAME Vercel shows). Until then the domain isn't serving.
2. **Backend CORS** — after the domain is live, `CORS_ALLOWED_ORIGINS` must include the serving origins, e.g.:
   `https://seasteps.pl,https://www.seasteps.pl,https://seasteps.vercel.app` → update `deploy/.env.homelab` and re-run `./deploy/homelab.sh`. (Currently only the old `web-alpha-three-89` origin is allowed, so the app on the new origin will be CORS-blocked on API calls until updated.)
3. **Supabase redirect URLs** — Auth → URL Configuration: Site URL `https://seasteps.pl`; add redirect URLs `https://seasteps.pl/app/auth/magic`, `https://www.seasteps.pl/app/auth/magic`, `https://seasteps.vercel.app/app/auth/magic`.
4. Optional: Supabase built-in email is rate-limited (~2–4/hr); set custom SMTP in Supabase to lift it.

## 11. Secrets (NEVER commit; provided by the human / live only in homelab env or Vercel)
- Vercel token (deploy), Cloudflare **tunnel token** (homelab), **Supabase DB password** (in `DATABASE_URL`), Supabase **service key** (rotate — was exposed in chat), **Gmail app password** (SMTP fallback), `JWT_SECRET`.
- The Supabase **anon key** is public (already in the app bundle + landing) — fine to use; project ref `vjsjxdqnmhyrglsfqvvp`, URL `https://vjsjxdqnmhyrglsfqvvp.supabase.co`.
- ⚠️ Several secrets were pasted in earlier chat — assume compromised and rotate.

## 12. What a remote/cloud session CAN vs CANNOT do
- **CAN**: edit code, build (`web` needs Node ≥20; backend builds in Docker), run frontend typecheck/build, commit + push `main`, update docs.
- **CANNOT (needs the human)**: reach the **homelab** (private LAN/VPN), deploy to **Vercel** (needs the token), change **DNS**, edit **Supabase dashboard**. Hand those back as instructions.

## 13. Gotchas
- Host Node is 18 but Vite 8 needs ≥20.19 → build the frontend in a Node 20 container.
- Backend uses runtime sqlx queries (no compile-time DB) — Docker build needs no DB.
- Supabase **direct** connection is IPv6-only; use the **session pooler** URL (IPv4) for `DATABASE_URL`.
- Live WS hub is **in-memory** → run a single backend instance.
- Frontend env vars are **build-time** (Vite) — changing `VITE_API_BASE` etc. requires a rebuild/redeploy.
