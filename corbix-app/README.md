# Corbix App

Next.js App Router application for Corbrix public marketing pages and a protected admin panel (CMS + CRM + document generation).

## Stack

- Next.js 16 + TypeScript + Tailwind CSS v4 (`@theme` tokens in `app/globals.css`)
- Supabase PostgreSQL + RLS policies
- Admin auth via `iron-session` + environment credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- Form validation with Zod + React Hook Form
- On-demand PDF generation with `@react-pdf/renderer` (documents stored as JSON)

## Environment Variables

Create `.env.local` in `corbix-app/`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> Do not commit `.env.local`.

## Supabase Setup

1. Create Supabase project.
2. Copy URL and keys from **Project Settings > API**.
3. Run SQL migration from:
   - `supabase/migrations/001_initial_schema.sql`
4. Create public Storage bucket named `media`.

## Local Development

From `corbix-app/`:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed Data

After `.env.local` is configured:

```bash
npx tsx scripts/seed.ts
```

This seeds services, programs, page content, case studies, and careers from JSON files in `data/`.

## Verify

```bash
npm run build
```

Optional tests:

```bash
npm test -- __tests__/auth/session.test.ts __tests__/validations/lead.test.ts __tests__/documents/calculate-totals.test.ts
```

## Deployment (Vercel)

1. Import repository to Vercel.
2. Set **Root Directory** to `corbix-app`.
3. Add all env vars listed above.
4. Set `NEXT_PUBLIC_SITE_URL` to production domain.
5. Deploy.
