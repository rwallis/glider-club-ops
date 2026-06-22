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
