# Corbix App — Design Specification

**Date:** 2026-06-26  
**Status:** Approved (brainstorming)  
**Project:** `corbix-app` (Next.js 15 + Supabase)

---

## 1. Overview

Corbix is a premium B2B corporate services website with two major parts:

1. **Public landing pages** — marketing site with animated homepage, six detailed service pages, Global Mobility interactive explorer, and placeholder pages for About, Case Studies, Careers, and Contact.
2. **Admin panel** — single-admin dashboard for CMS, CRM (lead management), and on-demand document generation (quotations, proposals, invoices).

### Scope decisions (confirmed)

| Decision | Choice |
|----------|--------|
| Delivery scope | Full stack in one release (public + admin) |
| Service pages | 6 briefed pages live; 5 unbriefed services → coming-soon stub |
| Secondary pages | About, Case Studies, Careers, Contact with placeholder content (CMS-editable) |
| Visual identity | Derived from references — dark premium + coral accents, placeholder wordmark |

### Source briefs

- `Corbix_Main_Page_Developer_Brief_V3.docx`
- `Corbix_Digital_Marketing_Brief_Short.docx`
- `Corbix_Commercial_Brokerage_Brief.docx`
- `Corbix_General_Trading_Brief.docx`
- `Corbix_Consulting_Research_Brief.docx`
- `Corbix_Copywriting_Trademark_Brief.docx`
- `Corbix_Global_Mobility_Brief.docx`
- `Corbix_Backend_Admin_Brief.docx`

### Design references

- Main page: [Ever Advertiser](https://everadvertiser.com), [Paymark template](https://lovable.dev/templates/websites/landing-page/paymark-template)
- Global Mobility: [Henley Global countries](https://www.henleyglobal.com/countries)
- Animation: [batcloud.art](https://batcloud.art), [landing.love showcases](https://www.landing.love/)

---

## 2. Architecture

### Project structure

```
corbix/
├── Corbrix_*.docx              (existing briefs)
├── docs/superpowers/specs/     (this document)
└── corbix-app/                 (new Next.js application)
    ├── app/
    │   ├── (public)/           public routes & layouts
    │   ├── admin/              protected admin panel
    │   └── api/                auth, leads, documents, CMS, media
    ├── components/
    │   ├── public/             hero, sliders, forms, explorer
    │   ├── admin/              dashboard, tables, editors
    │   └── ui/                 shared primitives
    ├── lib/
    │   ├── supabase/           client, server, admin helpers
    │   └── auth/               session management
    ├── data/                   seed JSON (programs, default copy)
    ├── supabase/migrations/    SQL schema + RLS policies
    ├── .env.local              local secrets (gitignored)
    └── .env.example            template for Vercel
```

### Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS custom properties |
| Animation | Framer Motion; Three.js particles (homepage hero only) |
| Database | Supabase PostgreSQL |
| File storage | Supabase Storage (`media` bucket) |
| Admin auth | Env credentials + iron-session (httpOnly cookie) |
| Forms | React Hook Form + Zod |
| PDF generation | `@react-pdf/renderer` (on-demand, not persisted) |

### Chosen approach

**Next.js + Supabase as unified backend** with env-based single-admin auth. Supabase Auth is not used; admin credentials live in environment variables and are validated server-side.

Rejected alternatives:
- Supabase Auth — adds dashboard setup, doesn't match env-credential requirement
- Split headless CMS + Supabase CRM — two systems, unnecessary for single admin

---

## 3. Supabase Integration Guide

### Step 1: Create project

In [Supabase Dashboard](https://supabase.com/dashboard), create a project named `corbix` (or similar). Save the database password.

### Step 2: Copy API keys

From **Project Settings → API**:

| Dashboard value | Env variable |
|-----------------|--------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role key | `SUPABASE_SERVICE_ROLE_KEY` |

`SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it to the browser or commit it.

### Step 3: Run database migration

Apply `corbix-app/supabase/migrations/001_initial_schema.sql` via Supabase SQL Editor or CLI. Creates all tables and RLS policies.

### Step 4: Create Storage bucket

In **Storage**, create a public bucket named `media` for logos, carousel images, and partner logos. Admin uploads go through server API routes using the service role key.

### Step 5: Local environment

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Admin (single user)
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=random-32-char-string-minimum

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 6: Vercel deployment

1. Import repository; set **Root Directory** to `corbix-app`
2. Add all env vars from `.env.example` in **Settings → Environment Variables**
3. Set `NEXT_PUBLIC_SITE_URL` to production domain
4. Deploy

### Row Level Security policies

| Role | Permissions |
|------|-------------|
| anon (public) | INSERT on `leads`; SELECT on published CMS tables (`services`, `page_content`, `programs`, `case_studies`, `careers`) where `visible = true` |
| service_role (admin API) | Full CRUD on all tables; Storage upload/delete |

Public pages use the anon key. Admin API routes use the service role key after session validation.

---

## 4. Authentication

### Flow

```
Admin → /admin/login
  → POST /api/auth/login { email, password }
  → Server compares to ADMIN_EMAIL / ADMIN_PASSWORD
  → On match: create encrypted httpOnly session cookie (iron-session)
  → Redirect to /admin

Middleware on /admin/* (except /admin/login)
  → No valid session → redirect to /admin/login
```

### Security notes

- Credentials exist only in env vars (local + Vercel)
- Session cookie: httpOnly, secure in production, sameSite=lax
- Admin routes never use anon key for writes
- Rate-limit login endpoint (basic: 5 attempts per minute per IP)

---

## 5. Database Schema

### `services`

CMS-managed service catalog for nav dropdown and homepage hub.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| slug | text | unique, URL-safe |
| title | text | display name |
| description | text | short hub description |
| visible | boolean | default true |
| has_page | boolean | false for unbriefed → coming-soon |
| sort_order | int | nav ordering |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `page_content`

Key-value CMS store for editable page sections.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| page_key | text | e.g. `home`, `about`, `contact` |
| section_key | text | e.g. `hero_headline`, `brand_story` |
| content | jsonb | text, rich text, or structured data |
| visible | boolean | section toggle |
| updated_at | timestamptz | |

### `programs`

Global Mobility citizenship/residence program data.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| country | text | |
| region | text | Middle East, Caribbean, Europe, etc. |
| type | text | Citizenship or Residence |
| minimum_capital | text | display string e.g. "USD 230,000" |
| key_benefit | text | |
| sort_order | int | |
| visible | boolean | |

### `leads`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| client_name | text | |
| company_name | text | |
| phone | text | |
| email | text | |
| service_requested | text | |
| source_page | text | route path |
| status | text | new, contacted, qualified, lost |
| notes | text | admin-only |
| created_at | timestamptz | |

### `clients`

Converted from leads.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| lead_id | uuid | FK → leads, nullable |
| client_name | text | |
| company_name | text | |
| phone | text | |
| email | text | |
| created_at | timestamptz | |

### `documents`

Structured document storage (no static files).

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| client_id | uuid | FK → clients |
| type | text | quotation, proposal, invoice |
| status | text | draft, sent, accepted, paid |
| line_items | jsonb | `[{ description, quantity, unit_price, total }]` |
| terms | text | |
| notes | text | |
| valid_until | date | nullable |
| parent_document_id | uuid | FK → documents, for clone/convert chain |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `case_studies`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| title | text | |
| description | text | |
| link | text | nullable |
| visible | boolean | |
| sort_order | int | |

### `careers`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| title | text | |
| department | text | |
| location | text | |
| description | text | |
| visible | boolean | |
| sort_order | int | |

### `media_assets`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| filename | text | |
| url | text | Supabase Storage public URL |
| alt_text | text | |
| category | text | logo, partner, carousel, hero |
| created_at | timestamptz | |

---

## 6. Public Site

### Visual system

| Token | Value |
|-------|-------|
| Background | `#0A0A0F` |
| Surface | `#141419` |
| Accent | `#FF6B4A` (coral) |
| Text primary | `#FFFFFF` |
| Text muted | `#A0A0AB` |
| Body font | Inter |
| Display font | DM Serif Display |

### Route map

| Route | Page |
|-------|------|
| `/` | Homepage |
| `/services/digital-marketing` | Digital Marketing |
| `/services/commercial-brokerage` | Commercial Brokerage |
| `/services/general-trading` | General Trading |
| `/services/strategic-advisory` | Strategic Advisory & Market Intelligence |
| `/services/copywriting-brand-protection` | Global Copywriting & Brand Protection |
| `/services/global-mobility` | Global Mobility + program explorer |
| `/services/coming-soon` | Stub for 5 unbriefed services |
| `/about` | Brand story + vision |
| `/case-studies` | Case study grid |
| `/careers` | Open roles list |
| `/contact` | Contact form + details |

### Unbriefed services (coming-soon)

These appear in the homepage hub and nav dropdown but link to `/services/coming-soon?service=<slug>`:

- Real Estate Advisory
- PR & Copyright
- Translation Services
- Telemarketing
- Specialized Consulting

Each stub shows service name, hub description, and contact CTA.

### Homepage sections (scroll order)

1. **Hero** — Corbrix wordmark, slogan "A Name You Trust.", particle background, scroll-down anchor
2. **Partner marquee** — infinite horizontal logo slider
3. **Brand story** — COR/BRIX narrative, vision & strategic goals
4. **Services hub** — interactive card grid, routes to service pages
5. **Final CTA** — "Let's build your future together" → Contact

### Service page layouts

**Split-screen (4 pages):** Commercial Brokerage, General Trading, Strategic Advisory, Copywriting & Brand Protection

- 60/40 above-fold: hero copy left, lead form right
- Horizontal capability carousel below

**Stacked (1 page):** Digital Marketing

- Headline + sub-headline + inline form
- Service slider below

**Global Mobility:**

- Hero with slow-pan background imagery
- Interactive program explorer (region filter, citizenship/residence toggle, investment range → card grid with expand)
- Value proposition section
- 3-step fulfillment process
- Footer lead form (Name, Email, Phone, Region of Interest)

### Shared components

- `Header` — sticky, transparent → solid on scroll; dynamic services dropdown
- `Footer` — CTA, links, contact info
- `LeadCaptureForm` — reusable with page-specific service dropdown options
- `ServiceSlider` — horizontal carousel
- `PartnerMarquee` — infinite logo scroll
- `ParticleHero` — Three.js mouse-tracking particles (desktop; static gradient fallback on mobile)
- `ProgramExplorer` — filterable country card grid

### Lead capture flow

```
Form submit → Zod validation → POST /api/leads
  → Supabase INSERT (anon + RLS)
  → Success toast
  → Lead visible in /admin/leads
```

Captured fields: Client Name, Company Name, Phone, Email, Service Requested, Timestamp (auto), Source Page (hidden).

### Animation guidelines

- Scroll-triggered fade/slide via Framer Motion (`whileInView`)
- Homepage hero: Three.js particle field reacting to cursor (disabled on mobile for performance)
- Service carousels: smooth horizontal scroll with snap
- Global Mobility cards: expand/flip on click for detail view
- Respect `prefers-reduced-motion`: disable particles and reduce animations

---

## 7. Admin Panel

### Routes

| Route | Purpose |
|-------|---------|
| `/admin/login` | Login form |
| `/admin` | Dashboard — stats, recent leads, quick actions |
| `/admin/leads` | Lead inbox with filter/search/sort |
| `/admin/leads/[id]` | Lead detail, status update, convert to client |
| `/admin/clients` | Client list |
| `/admin/clients/[id]` | Client profile + linked documents |
| `/admin/documents` | All documents list |
| `/admin/documents/new` | Create document |
| `/admin/documents/[id]` | View/edit, preview, download PDF |
| `/admin/cms/services` | Service CRUD |
| `/admin/cms/pages` | Page section editor |
| `/admin/cms/programs` | Global Mobility program editor |
| `/admin/cms/media` | Media upload manager |
| `/admin/cms/case-studies` | Case study list editor |
| `/admin/cms/careers` | Careers list editor |

### CRM workflow

```
Lead submitted → Admin views in leads inbox
  → Update status (New / Contacted / Qualified / Lost)
  → Convert to Client (copies data, links lead_id)
  → Create Document (pre-fills client details)
```

### Document generators

Documents stored as structured JSON in `documents` table. No static PDF/DOCX files saved.

**Types:** Quotation, Proposal, Invoice

**Admin workflow:**
1. Select type → pick client → client details auto-fill
2. Add line items (description, quantity, unit price; totals calculated live)
3. Add terms and notes
4. Save as draft or update status
5. Preview rendered document in browser
6. Download PDF (generated on-the-fly, streamed, not stored)
7. Clone existing document → edit → save as new type (e.g. quotation → invoice)

### CMS capabilities

| Feature | Details |
|---------|---------|
| Services | Add, rename, hide, delete, reorder; changes reflect in nav and hub immediately |
| Page sections | Edit hero text, body copy, CTA per page; toggle section visibility |
| Programs | CRUD for Global Mobility country data |
| Case studies | Add/edit/remove entries |
| Careers | Add/edit/remove job listings |
| Media | Upload images to Supabase Storage; manage partner logos and carousel backgrounds |

### Admin UI

Dark theme consistent with public site. Left sidebar navigation. Desktop-optimized, tablet-usable. Data tables with pagination for leads, clients, documents.

---

## 8. Error Handling

| Scenario | Response |
|----------|----------|
| Client form validation failure | Inline field errors, block submit |
| Lead insert failure | Error toast with retry |
| Invalid admin credentials | "Invalid email or password" on login form |
| Expired/missing session | Redirect to `/admin/login` |
| PDF generation failure | Error message; document data preserved in DB |
| Missing CMS content | Fallback to seed copy from briefs |
| Supabase unavailable | Graceful error page; public pages show cached/seed content where possible |

---

## 9. Environment Variables

Complete list for `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Admin auth
ADMIN_EMAIL=
ADMIN_PASSWORD=
SESSION_SECRET=

# Site
NEXT_PUBLIC_SITE_URL=
```

---

## 10. Testing & Verification

### Public site smoke tests

- All routes render without error
- Navigation dropdown reflects CMS services
- Lead forms submit and validate correctly
- Global Mobility explorer filters work
- Mobile responsive layout
- Animations respect `prefers-reduced-motion`
- Coming-soon pages display for unbriefed services

### Admin smoke tests

- Login/logout with env credentials
- Lead appears after public form submit
- Lead → Client conversion
- Document create, edit, preview, PDF download
- CMS edit reflects on public site after revalidation
- Service hide/show updates nav

### Deployment verification

- All env vars set in Vercel
- Supabase RLS policies active
- Storage bucket accessible
- Production URL in `NEXT_PUBLIC_SITE_URL`

---

## 11. Out of Scope

- Multi-user admin roles
- Supabase Auth integration
- Email notifications on new leads
- Payment processing for invoices
- Blog/CMS with rich text editor (page content uses structured fields)
- Scraping live Henley Global data (seed JSON + admin-editable instead)
- Dedicated briefs for the 5 unbriefed services (coming-soon stubs only)
