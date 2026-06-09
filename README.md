# meepled-ui

Frontend for **Meepled**, a directory app for board game cafés.
React · Vite · React Router · react-i18next (EN/VI).

## Run locally

Prereqs: **Node 20+** (Vite 5 needs Node 18+).

```bash
cp .env.example .env        # set VITE_API_BASE_URL + VITE_GOOGLE_MAPS_KEY
npm install
npm run dev                 # http://localhost:5173
```

The dev API defaults to `http://localhost:5029` (see `.env`). The backend allows
the Vite origin via CORS in Development.

## Build

```bash
npm run build               # outputs to dist/
```

## Layout

```
src/
  api/client.js       fetch wrapper (Bearer token) + endpoint helpers
  context/            AuthContext (JWT in localStorage, role helpers)
  i18n/               i18next setup + en.json / vi.json
  components/         NavBar, Stars
  pages/              Home, CafeLibrary, GameDetail, Search, MapView, Profile, CafeAdmin, Login
  styles/theme.css    "Cozy & Warm" design tokens
```

Backend: https://github.com/kdinh-webmd/meepled-api
