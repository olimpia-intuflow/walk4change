# SeaSteps — frontend 🌊👣

Webowy frontend appki **SeaSteps** (hackathon Hack4Change 2026, temat: Bałtyk / człowiek / natura / technologia).
Spacer, który robi dobrze Tobie i naturze: ruch, natura, ludzie, eventy i małe działania eko.

## Stack

- **Vite + React + TypeScript** — lekki, szybki, mobile-first
- **Tailwind CSS v4** — design-system w tokenach (paleta bałtycka)
- **Motion** — animacje (m.in. animowane stópki)
- **React Router** — nawigacja (bottom-nav, 5 zakładek)

Zbudowany jako **kontener telefonu** → gotowy do zamiany na natywną apkę mobilną przez Capacitor bez przepisywania.

## Uruchomienie lokalne

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # produkcja → dist/
```

## Architektura danych

Frontend NIE łączy się bezpośrednio z Supabase. Przepływ:

```
SeaSteps (ten frontend)  →  Rust API (gałąź `backend`, Kamil)  →  Supabase Postgres
```

- Cała logika i auth (email+hasło → JWT) są po stronie backendu.
- Warstwa danych: [`src/lib/api.ts`](src/lib/api.ts) — teraz zwraca **mocki demo**.
  Kształt typów jest zgodny z trasami backendu (`/auth`, `/walks`, `/friends`,
  `/leaderboard`, `/profile`, `/rewards`). Podpięcie realnego API = ustawienie
  `VITE_API_BASE` w `.env` i zamiana ciał funkcji na `fetch()`.
- Mnożniki punktów (lustro scoring engine backendu): spacer z kimś ×1.5, natura ×3 (stackują się).

## Ekrany

| Trasa         | Ekran        | Co pokazuje |
|---------------|--------------|-------------|
| `/`           | Start (Home) | kroki, punkty, streak, pierścień postępu, bonusy, szybkie akcje |
| `/walk`       | Spacer       | live: czas, kroki, punkty, bonusy → podsumowanie |
| `/community`  | Społeczność  | wspólne spacery, ranking tygodnia |
| `/events`     | Eventy       | akcje eko/społeczne, dołączanie |
| `/eco`        | Eko          | zgłoszenie problemu + nagrody |
| `/profile`    | Profil       | avatar, zainteresowania, statystyki, odznaki |

## Deploy (Vercel)

Root directory na Vercel = `web/`. SPA-routing obsłużony w `vercel.json`.

## Struktura

```
src/
  components/   PhoneFrame, BottomNav, Logo, Footsteps, ui (Card/Pill/Button…)
  screens/      Home, Walk, Community, Events, Eco, Profile
  lib/api.ts    warstwa danych (mock → backend)
```
