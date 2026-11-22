# Fault Line Flyers Glider Club

Modern public website for the [Fault Line Flyers](https://faultlineflyers.com) glider club, with a members-only equipment status dashboard.

## Public site (`/`)

- Hero with field stats and intro flight CTA
- About, fleet, intro flights, fees, guest pilots, directions & board
- Replaces the current Google Sites homepage content

## Members area (`/members`)

- Protected by access code (set `VITE_MEMBER_ACCESS_CODE` in `.env`)
- Equipment status dashboard: hangar, gliders, tow planes, field conditions, etc.
- Default access code: **`flf-members`** — clicking Members goes straight to the dashboard for now
- Set `USE_DEFAULT_MEMBER_ACCESS` to `false` in `src/config/auth.ts` when Google Auth is ready

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

- Public site: http://localhost:5173
- Members login: http://localhost:5173/members/login

## Sync glider hours from GlidingOps

Pull All Flights Report hours (since last annual) into `docs/hours-since-annual.json`:

1. Put your GlidingOps login in `.env` (never commit this file):

```env
GLIDINGOPS_USER=your@email.com
GLIDINGOPS_PASSWORD=your-password
```

2. Run:

```bash
python scripts/fetch-glidingops-hours.py
# optional fixed window / debug HTML:
python scripts/fetch-glidingops-hours.py --from 11/22/2025 --to 11/22/2026 --save-html
```

Requires `pip install requests`. Cached HTML (if `--save-html`) goes under `docs/glidingops-cache/` (gitignored).

## Deploy

Build static assets with `npm run build`. For client-side routing, configure your host to serve `index.html` for all routes (Vercel/Netlify handle this automatically).

Set `VITE_MEMBER_ACCESS_CODE` in your hosting provider's environment variables before deploying.

## Project structure

```
src/
  pages/           Home, members login, members status
  components/      Layout, home sections, status cards
  data/            Site content and equipment status
  context/         Member auth session
```
