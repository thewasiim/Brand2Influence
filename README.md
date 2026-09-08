# BrandHUB

A React + Express marketplace for local brands and micro/nano influencers. Product scope is defined in [`docs/PRD.md`](docs/PRD.md), [`docs/TRD.md`](docs/TRD.md), and [`docs/User-Flows.md`](docs/User-Flows.md).

## Run locally

1. Copy `frontend/.env.example` to `frontend/.env` and provide the Supabase URL, anon key, and API URL.
2. Copy `backend/.env.example` to `backend/.env` and provide server-side Supabase credentials. Never place the service-role key in `frontend/.env`.
3. Apply `backend/supabase/migrations/001_initial.sql` in Supabase.
4. Run `npm install && npm run dev` in `backend/` and `frontend/` in separate terminals.

`GET http://localhost:3001/api/health` is available without Supabase configuration. All data routes require configured Supabase credentials and a valid Supabase session.
