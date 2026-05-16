# Yeroo Coffee

Next.js 14 (App Router) + Supabase + Chapa restaurant site for Yeroo Coffee, Addisu Gebeya, Addis Ababa.

## Features

- Bilingual public site (English / Amharic) — Hero with looping ambient video, menu, gallery, events, daily specials, reservations
- Customer ordering flow: add to cart, online checkout, Chapa payment (ETB)
- Admin dashboard at `/admin/login` — orders, menu, gallery, reservations, reviews, specials, events, settings
- Supabase Storage uploads for menu / gallery / specials / event images
- Realtime order updates in the admin orders queue

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open <http://localhost:3000> for the public site, or <http://localhost:3000/admin/login> for the admin.

## Required environment variables

Set these in `.env.local` for local dev, and in Vercel → Settings → Environment Variables for production:

| Variable                          | Where it's used                            | Notes                                     |
| --------------------------------- | ------------------------------------------ | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase clients (browser, server, admin) | e.g. `https://<ref>.supabase.co`          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Public Supabase queries                   | The anon / publishable key                |
| `SUPABASE_SERVICE_ROLE_KEY`       | Server-only (`/api/checkout/*` routes)    | **Never expose to the client**            |
| `CHAPA_SECRET_KEY`                | `/api/checkout/create` and `verify`       | Get from Chapa dashboard                  |
| `NEXT_PUBLIC_SITE_URL`            | Chapa callback/return URLs                | e.g. `https://yeroocoffee.et` (no trailing slash) |

## Supabase setup

The required tables (`menu_items`, `gallery`, `testimonials`, `reservations`, `settings`, `daily_specials`, `events`, `orders`, `order_items`) and storage bucket (`yeroo-uploads`) are already provisioned. RLS policies allow:
- `anon`: SELECT on all public tables (plus public read on the storage bucket).
- `authenticated`: full access to all public tables (used by `/admin`).
- `service_role`: bypasses RLS (used only by server-side API routes).

To create an admin user, add them via the Supabase dashboard → Authentication → Users → Add user (with email/password).

## Build / deploy

```bash
npm run build
npm start
```

Vercel: just push — the project deploys automatically. Make sure all five env vars above are set in the Vercel project settings.

## Project layout

- `app/` — Next.js App Router pages, admin routes, API routes
- `components/sections/*` — Public marketing sections
- `components/admin/*` — Admin chrome (sidebar, image upload)
- `components/cart/*` — AddToCart button, floating cart FAB
- `providers/CartProvider.tsx` — Cart state in React Context, persisted to localStorage
- `lib/supabase/*` — Supabase clients (browser, server, admin)
- `lib/chapa.ts` — Chapa API wrapper
- `lib/queries.ts` — TanStack Query hooks for every table
- `lib/i18n.ts` — Inline EN / AM translations
- `types/index.ts` + `types/database.ts` — Domain types and generated Supabase types
