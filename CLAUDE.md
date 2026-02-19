# StockBoard

Mobile-first PWA that lets local fish stores and solo aquarium breeders publish a real-time, public-facing livestock availability board. Not an e-commerce platform — no cart, no checkout, no shipping. It's a menu board with a contact layer. Think "Linktree for aquarium livestock."

See `docs/PRD.md` for the full product requirements document.

## Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Hosting**: Vercel
- **PWA**: next-pwa or @serwist/next for service worker, manifest, offline support
- **Image handling**: Supabase Storage with client-side compression before upload (browser-image-compression)
- **State**: Zustand for client state, React Query (TanStack Query) for server state / Supabase cache

## Architecture

```
/app                    → Next.js App Router pages and layouts
  /(auth)               → Login, signup, onboarding flows
  /(dashboard)          → Seller dashboard (protected)
  /[slug]               → Public board pages (SSR for SEO)
  /api                  → API routes (minimal — prefer Supabase direct)
/components
  /ui                   → Shared primitives (buttons, inputs, modals)
  /board                → Public board components (grid, list, filters, item card)
  /dashboard            → Seller dashboard components (item form, shipment manager)
/lib
  /supabase             → Supabase client init, typed helpers, RLS policies reference
  /species              → Species database utilities, autocomplete logic
  /hooks                → Custom React hooks
  /utils                → Formatting, validation, image compression
/types                  → Shared TypeScript types and Supabase generated types
/public                 → PWA manifest, icons, static assets
/supabase
  /migrations           → SQL migration files (sequential, timestamped)
  /seed                 → Species database seed data
```

## Commands

- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npx supabase db push` — Push migrations to Supabase
- `npx supabase gen types typescript --local > types/supabase.ts` — Regenerate DB types after schema changes
- `npx supabase db reset` — Reset local DB and re-seed

Always run `typecheck` after making changes across multiple files.

## Code Style

- TypeScript strict mode, no `any` — use `unknown` and narrow
- Functional components with hooks only
- Named exports, not default exports (except for Next.js page/layout conventions which require default)
- Use ES modules (import/export), never CommonJS
- Colocate tests next to source files: `Component.tsx` → `Component.test.tsx`
- Prefer server components; add `"use client"` only when state/effects/browser APIs are needed
- Supabase calls from server components use the server client; client components use the browser client. See `lib/supabase/` for both.

## Database

All tables use Row Level Security (RLS). Every new table MUST have RLS enabled and appropriate policies before merging.

Core tables: `sellers`, `listing_items`, `listing_photos`, `species`, `shipments`, `notify_requests`. See `supabase/migrations/` for canonical schema.

After ANY schema change:
1. Write a migration file in `supabase/migrations/`
2. Run `npx supabase db push`
3. Regenerate types: `npx supabase gen types typescript --local > types/supabase.ts`

## Auth

Supabase Auth with email/password and Google OAuth. Auth state managed via Supabase's `onAuthStateChange` listener. Protected routes use middleware in `middleware.ts` — check there before adding new auth guards.

## Public Board (SEO Critical)

Pages at `/[slug]` are server-rendered. They MUST:
- Use `generateMetadata()` for dynamic OG tags (store name, item count, preview image)
- Return valid HTML on first paint (no client-side-only rendering of board content)
- Include JSON-LD structured data for LocalBusiness schema
- Show a "Last Updated" timestamp from the most recent `listing_items.updated_at`

## PWA Requirements

- Service worker caches the seller dashboard shell for offline use
- Offline mutations queue in IndexedDB and sync when back online
- `manifest.json` configured for standalone display, theme color `#1B6B4A`
- Camera access for photo capture works via standard `<input type="file" capture="environment">`

## Species Database

~2,000 species seeded at launch. Autocomplete matches on `common_name`, `scientific_name`, and `aliases` (JSONB array). Use `pg_trgm` trigram index for fuzzy matching. When a seller picks a species from autocomplete, auto-populate category and care metadata on the listing. Sellers can add custom species not in the DB — these get `is_verified: false` and are flagged for review.

## Image Handling

- Compress client-side before upload: max 1200px wide, WebP format, quality 0.8
- Store in Supabase Storage bucket `listing-photos` with path: `{seller_id}/{listing_id}/{photo_id}.webp`
- Generate thumbnail (200px) and grid (600px) variants on upload via Supabase Edge Function or client-side
- Free tier: 1 photo per item. Pro: 3. Shop: 5. Enforce in the upload form, not just the DB.

## Key Product Decisions

- **No e-commerce**: No cart, checkout, or payment processing. "Contact Seller" is the CTA. This is intentional and central to the product thesis.
- **Quantity is flexible**: Sellers can set exact count OR qualitative labels (In Stock / Limited / Sold Out / Coming Soon). Both are valid.
- **WYSIWYG mode**: For coral frags and unique items. Photo is the primary identifier. Item auto-archives when toggled to Sold.
- **Shipment badges**: "Just In" badge displays on items for 72 hours after creation via a shipment. Calculated client-side from `shipments.arrival_date`.
- **Free tier limits**: 25 items, 1 photo/item. Don't gate core functionality (public board, species autocomplete, custom URL) behind paywall.

## Don't Do

- Don't add payment/checkout features — this is explicitly out of scope
- Don't use Supabase Storage without checking the user's plan tier photo limits first
- Don't server-render the seller dashboard — it should be a client-side SPA behind auth
- Don't store uncompressed images — always compress before upload
- Don't bypass RLS with the service role key in client-facing code
- Don't hardcode species data — always query from the species table
