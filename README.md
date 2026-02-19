# StockBoard

Live aquarium livestock availability boards for local fish stores and breeders.

## Supabase

Project ref: `iffjngnppedpcczxioqi`

```bash
curl 'https://iffjngnppedpcczxioqi.supabase.co/rest/v1/todos' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZmpuZ25wcGVkcGNjenhpb3FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDAzNDksImV4cCI6MjA4NzExNjM0OX0.4swEJQ12YTJJS7q7jDmNoPDiyfAPVFQPYT6iYNQGdiE"
```

## Setup

### 1. Apply Database Schema

Run in **Supabase Dashboard → SQL Editor** (or use `supabase db push`):
1. `supabase/migrations/20260219000001_initial_schema.sql`
2. `supabase/seed/species.sql`

### 2. Supabase Auth

Enable Google OAuth in Authentication → Providers, set redirect URL to `/auth/callback`.

### 3. Vercel Environment Variables

Add to your Vercel project:
- `NEXT_PUBLIC_SUPABASE_URL=https://iffjngnppedpcczxioqi.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from .env.local>`

## Commands

- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npx supabase db push` — Push migrations
- `npx supabase gen types typescript --local > types/supabase.ts` — Regenerate types
