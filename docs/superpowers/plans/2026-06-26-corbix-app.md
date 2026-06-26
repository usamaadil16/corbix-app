# Corbix App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `corbix-app`, a full-stack Next.js 15 marketing site with Supabase-backed CMS, CRM, and on-demand document generation for a single env-authenticated admin.

**Architecture:** Next.js App Router splits public `(public)` routes and protected `/admin` routes. Supabase PostgreSQL stores all data with RLS for public lead inserts and CMS reads. Admin API routes use the service role key after iron-session validation. Documents render from JSON; PDFs generate on-the-fly only.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Three.js (hero particles), Supabase JS v2, iron-session, React Hook Form, Zod, @react-pdf/renderer, Vitest

## Global Constraints

- Root app directory: `corbix-app/`
- Framework: Next.js 15 App Router
- Database: Supabase PostgreSQL with RLS (anon INSERT leads + SELECT visible CMS; service_role full admin access)
- Admin auth: `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars + iron-session httpOnly cookie (no Supabase Auth)
- Visual tokens: background `#0A0A0F`, surface `#141419`, accent `#FF6B4A`, text `#FFFFFF` / `#A0A0AB`, fonts Inter + DM Serif Display
- 6 briefed service pages live; 5 unbriefed services → `/services/coming-soon?service=<slug>`
- Secondary pages: About, Case Studies, Careers, Contact with CMS-editable placeholder content
- Documents stored as JSON rows only — never persist PDF/DOCX files
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `NEXT_PUBLIC_SITE_URL`
- Respect `prefers-reduced-motion` for animations

---

## File Structure Overview

```
corbix-app/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                          # homepage
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── case-studies/page.tsx
│   │   ├── careers/page.tsx
│   │   └── services/
│   │       ├── digital-marketing/page.tsx
│   │       ├── commercial-brokerage/page.tsx
│   │       ├── general-trading/page.tsx
│   │       ├── strategic-advisory/page.tsx
│   │       ├── copywriting-brand-protection/page.tsx
│   │       ├── global-mobility/page.tsx
│   │       └── coming-soon/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── page.tsx                          # dashboard
│   │   ├── leads/page.tsx
│   │   ├── leads/[id]/page.tsx
│   │   ├── clients/page.tsx
│   │   ├── clients/[id]/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── documents/new/page.tsx
│   │   ├── documents/[id]/page.tsx
│   │   └── cms/
│   │       ├── services/page.tsx
│   │       ├── pages/page.tsx
│   │       ├── programs/page.tsx
│   │       ├── case-studies/page.tsx
│   │       ├── careers/page.tsx
│   │       └── media/page.tsx
│   ├── api/
│   │   ├── auth/login/route.ts
│   │   ├── auth/logout/route.ts
│   │   ├── leads/route.ts
│   │   ├── admin/leads/route.ts
│   │   ├── admin/leads/[id]/route.ts
│   │   ├── admin/leads/[id]/convert/route.ts
│   │   ├── admin/clients/route.ts
│   │   ├── admin/documents/route.ts
│   │   ├── admin/documents/[id]/route.ts
│   │   ├── admin/documents/[id]/pdf/route.ts
│   │   ├── admin/cms/services/route.ts
│   │   ├── admin/cms/pages/route.ts
│   │   ├── admin/cms/programs/route.ts
│   │   ├── admin/cms/case-studies/route.ts
│   │   ├── admin/cms/careers/route.ts
│   │   └── admin/cms/media/route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── public/       Header, Footer, LeadCaptureForm, ServiceSlider, PartnerMarquee, ParticleHero, ProgramExplorer, SplitServicePage, ScrollReveal
│   ├── admin/        AdminSidebar, AdminTable, DocumentEditor, DocumentPreview, LineItemsEditor, PageSectionEditor
│   └── ui/           Button, Input, Select, Textarea, Card, Badge, Toast
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   ├── supabase/admin.ts
│   ├── auth/session.ts
│   ├── auth/require-admin.ts
│   ├── validations/lead.ts
│   ├── validations/document.ts
│   ├── documents/calculate-totals.ts
│   ├── documents/pdf-document.tsx
│   ├── cms/get-page-content.ts
│   └── cms/get-services.ts
├── data/
│   ├── seed-services.json
│   ├── seed-programs.json
│   ├── seed-page-content.json
│   ├── seed-case-studies.json
│   └── seed-careers.json
├── types/database.ts
├── supabase/migrations/001_initial_schema.sql
├── middleware.ts
├── .env.example
├── vitest.config.ts
└── __tests__/
```

---

### Task 1: Scaffold Next.js project and dependencies

**Files:**
- Create: `corbix-app/` (via create-next-app)
- Create: `corbix-app/.env.example`
- Create: `corbix-app/vitest.config.ts`
- Modify: `corbix-app/package.json`

**Interfaces:**
- Produces: runnable Next.js 15 app at `corbix-app/` with all dependencies installed

- [ ] **Step 1: Create Next.js app**

Run from `c:\corbix`:

```bash
npx create-next-app@latest corbix-app --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --no-turbopack
```

Expected: `corbix-app/` created with `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 2: Install dependencies**

```bash
cd corbix-app
npm install @supabase/supabase-js iron-session zod react-hook-form @hookform/resolvers framer-motion three @types/three @react-pdf/renderer sonner
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Add test script to package.json**

In `corbix-app/package.json`, add:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 5: Create .env.example**

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```

Expected: app at http://localhost:3000

- [ ] **Step 7: Commit**

```bash
git add corbix-app/
git commit -m "chore: scaffold corbix-app Next.js project"
```

---

### Task 2: Theme, fonts, and global styles

**Files:**
- Modify: `corbix-app/app/layout.tsx`
- Modify: `corbix-app/app/globals.css`
- Modify: `corbix-app/tailwind.config.ts`

**Interfaces:**
- Produces: CSS variables `--background`, `--surface`, `--accent`, `--text-muted` available app-wide

- [ ] **Step 1: Configure Tailwind theme**

Replace `corbix-app/tailwind.config.ts` content:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        accent: "var(--accent)",
        muted: "var(--text-muted)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-dm-serif)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: Set globals.css tokens**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0a0a0f;
  --surface: #141419;
  --accent: #ff6b4a;
  --text-muted: #a0a0ab;
}

body {
  @apply bg-background text-white antialiased;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Add fonts in root layout**

```typescript
import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  title: "Corbrix — A Name You Trust",
  description: "Your single unified partner for local growth and global expansion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable} font-sans`}>
        {children}
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add corbix-app/app/layout.tsx corbix-app/app/globals.css corbix-app/tailwind.config.ts
git commit -m "feat: add Corbrix dark theme and typography"
```

---

### Task 3: Supabase schema migration

**Files:**
- Create: `corbix-app/supabase/migrations/001_initial_schema.sql`

**Interfaces:**
- Produces: PostgreSQL tables `services`, `page_content`, `programs`, `leads`, `clients`, `documents`, `case_studies`, `careers`, `media_assets` with RLS policies

- [ ] **Step 1: Write migration SQL**

Create `corbix-app/supabase/migrations/001_initial_schema.sql`:

```sql
-- Enable UUID
create extension if not exists "pgcrypto";

-- services
create table services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  visible boolean not null default true,
  has_page boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- page_content
create table page_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  content jsonb not null default '{}',
  visible boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(page_key, section_key)
);

-- programs
create table programs (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  region text not null,
  type text not null check (type in ('Citizenship', 'Residence')),
  minimum_capital text not null,
  key_benefit text not null,
  sort_order int not null default 0,
  visible boolean not null default true
);

-- leads
create table leads (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  company_name text not null default '',
  phone text not null,
  email text not null,
  service_requested text not null,
  source_page text not null,
  status text not null default 'new' check (status in ('new','contacted','qualified','lost')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  client_name text not null,
  company_name text not null default '',
  phone text not null,
  email text not null,
  created_at timestamptz not null default now()
);

-- documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  type text not null check (type in ('quotation','proposal','invoice')),
  status text not null default 'draft' check (status in ('draft','sent','accepted','paid')),
  line_items jsonb not null default '[]',
  terms text not null default '',
  notes text not null default '',
  valid_until date,
  parent_document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- case_studies
create table case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  link text,
  visible boolean not null default true,
  sort_order int not null default 0
);

-- careers
create table careers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null default '',
  location text not null default '',
  description text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0
);

-- media_assets
create table media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  url text not null,
  alt_text text not null default '',
  category text not null default 'general',
  created_at timestamptz not null default now()
);

-- RLS
alter table services enable row level security;
alter table page_content enable row level security;
alter table programs enable row level security;
alter table leads enable row level security;
alter table clients enable row level security;
alter table documents enable row level security;
alter table case_studies enable row level security;
alter table careers enable row level security;
alter table media_assets enable row level security;

-- Public read visible CMS
create policy "public_read_services" on services for select using (visible = true);
create policy "public_read_page_content" on page_content for select using (visible = true);
create policy "public_read_programs" on programs for select using (visible = true);
create policy "public_read_case_studies" on case_studies for select using (visible = true);
create policy "public_read_careers" on careers for select using (visible = true);
create policy "public_read_media" on media_assets for select using (true);

-- Public insert leads
create policy "public_insert_leads" on leads for insert with check (true);
```

- [ ] **Step 2: Apply migration in Supabase Dashboard**

Copy SQL into Supabase → SQL Editor → Run.

- [ ] **Step 3: Create Storage bucket**

Supabase → Storage → New bucket `media` → Public bucket enabled.

- [ ] **Step 4: Commit**

```bash
git add corbix-app/supabase/
git commit -m "feat: add Supabase initial schema migration"
```

---

### Task 4: Supabase clients, types, and seed data

**Files:**
- Create: `corbix-app/types/database.ts`
- Create: `corbix-app/lib/supabase/client.ts`
- Create: `corbix-app/lib/supabase/server.ts`
- Create: `corbix-app/lib/supabase/admin.ts`
- Create: `corbix-app/data/seed-services.json`
- Create: `corbix-app/data/seed-programs.json`
- Create: `corbix-app/data/seed-page-content.json`
- Create: `corbix-app/data/seed-case-studies.json`
- Create: `corbix-app/data/seed-careers.json`
- Create: `corbix-app/scripts/seed.ts`

**Interfaces:**
- Produces: `createBrowserClient()`, `createServerClient()`, `createAdminClient()` functions
- Produces: `Service`, `Lead`, `Client`, `Document`, `Program`, `PageContent` TypeScript types
- Produces: seed JSON with all 11 services (6 `has_page: true`, 5 `has_page: false`)

- [ ] **Step 1: Create types/database.ts**

```typescript
export type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  visible: boolean;
  has_page: boolean;
  sort_order: number;
};

export type Lead = {
  id: string;
  client_name: string;
  company_name: string;
  phone: string;
  email: string;
  service_requested: string;
  source_page: string;
  status: "new" | "contacted" | "qualified" | "lost";
  notes: string;
  created_at: string;
};

export type Client = {
  id: string;
  lead_id: string | null;
  client_name: string;
  company_name: string;
  phone: string;
  email: string;
  created_at: string;
};

export type LineItem = {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type Document = {
  id: string;
  client_id: string;
  type: "quotation" | "proposal" | "invoice";
  status: "draft" | "sent" | "accepted" | "paid";
  line_items: LineItem[];
  terms: string;
  notes: string;
  valid_until: string | null;
  parent_document_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Program = {
  id: string;
  country: string;
  region: string;
  type: "Citizenship" | "Residence";
  minimum_capital: string;
  key_benefit: string;
  sort_order: number;
  visible: boolean;
};

export type PageContent = {
  id: string;
  page_key: string;
  section_key: string;
  content: Record<string, unknown>;
  visible: boolean;
};
```

- [ ] **Step 2: Create Supabase client helpers**

`lib/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

export function createBrowserClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

`lib/supabase/server.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

`lib/supabase/admin.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

- [ ] **Step 3: Create seed-services.json**

Include all 11 services from spec. Example entries:

```json
[
  { "slug": "digital-marketing", "title": "Digital Marketing", "description": "Crafting compelling brand narratives and performance-driven campaigns.", "visible": true, "has_page": true, "sort_order": 1 },
  { "slug": "commercial-brokerage", "title": "Commercial Brokerage", "description": "Orchestrating high-value trade agreements across all platforms.", "visible": true, "has_page": true, "sort_order": 2 },
  { "slug": "general-trading", "title": "General Trading", "description": "Curating a dynamic global supply chain.", "visible": true, "has_page": true, "sort_order": 3 },
  { "slug": "strategic-advisory", "title": "Strategic Advisory & Market Intelligence", "description": "Comprehensive market intelligence and strategic advisory.", "visible": true, "has_page": true, "sort_order": 4 },
  { "slug": "copywriting-brand-protection", "title": "Global Copywriting & Brand Protection", "description": "Localized copy and international trademark registration.", "visible": true, "has_page": true, "sort_order": 5 },
  { "slug": "global-mobility", "title": "Global Mobility", "description": "Immigration and investor residencies with professional discretion.", "visible": true, "has_page": true, "sort_order": 6 },
  { "slug": "real-estate-advisory", "title": "Real Estate Advisory", "description": "Elite market intelligence for high-net-worth acquisitions.", "visible": true, "has_page": false, "sort_order": 7 },
  { "slug": "pr-copyright", "title": "PR & Copyright", "description": "Architecting corporate prestige and securing creative assets.", "visible": true, "has_page": false, "sort_order": 8 },
  { "slug": "translation-services", "title": "Translation Services", "description": "High-fidelity interpretation and certified document translation.", "visible": true, "has_page": false, "sort_order": 9 },
  { "slug": "telemarketing", "title": "Telemarketing", "description": "Targeted tele-campaigns that drive customer acquisition.", "visible": true, "has_page": false, "sort_order": 10 },
  { "slug": "specialized-consulting", "title": "Specialized Consulting", "description": "Niche technical advisory for complex operational challenges.", "visible": true, "has_page": false, "sort_order": 11 }
]
```

- [ ] **Step 4: Create seed-programs.json**

Include at minimum: UAE, USA, Antigua and Barbuda, Portugal, Malta, plus ~15 more from Global Mobility brief.

- [ ] **Step 5: Create seed-page-content.json**

Keys: `home.hero_headline`, `home.slogan`, `home.brand_story`, `home.vision`, `about.body`, `contact.details`. Copy text verbatim from `Corbix_Main_Page_Developer_Brief_V3.docx`.

- [ ] **Step 6: Create scripts/seed.ts**

Node script using `createAdminClient()` to upsert all seed JSON files into Supabase. Run with:

```bash
npx tsx scripts/seed.ts
```

Install `tsx` as devDep if needed.

- [ ] **Step 7: Commit**

```bash
git add corbix-app/types corbix-app/lib/supabase corbix-app/data corbix-app/scripts
git commit -m "feat: add Supabase clients, types, and seed data"
```

---

### Task 5: Admin auth (iron-session + middleware)

**Files:**
- Create: `corbix-app/lib/auth/session.ts`
- Create: `corbix-app/lib/auth/require-admin.ts`
- Create: `corbix-app/app/api/auth/login/route.ts`
- Create: `corbix-app/app/api/auth/logout/route.ts`
- Create: `corbix-app/middleware.ts`
- Create: `corbix-app/__tests__/auth/session.test.ts`

**Interfaces:**
- Produces: `getSession()`, `saveSession()`, `destroySession()` in `lib/auth/session.ts`
- Produces: `requireAdmin(): Promise<void>` throws/redirects if not authenticated
- Consumes: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET` env vars

- [ ] **Step 1: Write failing test**

```typescript
// __tests__/auth/session.test.ts
import { describe, it, expect } from "vitest";
import { validateAdminCredentials } from "@/lib/auth/session";

describe("validateAdminCredentials", () => {
  it("returns true for matching credentials", () => {
    process.env.ADMIN_EMAIL = "admin@test.com";
    process.env.ADMIN_PASSWORD = "secret123";
    expect(validateAdminCredentials("admin@test.com", "secret123")).toBe(true);
  });

  it("returns false for wrong password", () => {
    process.env.ADMIN_EMAIL = "admin@test.com";
    process.env.ADMIN_PASSWORD = "secret123";
    expect(validateAdminCredentials("admin@test.com", "wrong")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- __tests__/auth/session.test.ts
```

Expected: FAIL — `validateAdminCredentials` not defined

- [ ] **Step 3: Implement session.ts**

```typescript
import { SessionOptions, getIronSession } from "iron-session";
import { cookies } from "next/headers";

export type AdminSession = { isAdmin: boolean };

export function getSessionOptions(): SessionOptions {
  return {
    password: process.env.SESSION_SECRET!,
    cookieName: "corbix_admin_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  };
}

export async function getSession() {
  return getIronSession<AdminSession>(await cookies(), getSessionOptions());
}

export function validateAdminCredentials(email: string, password: string): boolean {
  return (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  );
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- __tests__/auth/session.test.ts
```

- [ ] **Step 5: Create login route**

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession, validateAdminCredentials } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!validateAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  const session = await getSession();
  session.isAdmin = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Create logout route**

```typescript
// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function POST() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 7: Create middleware.ts**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { AdminSession, getSessionOptions } from "@/lib/auth/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const res = NextResponse.next();
  const session = await getIronSession<AdminSession>(req, res, getSessionOptions());
  if (!session.isAdmin) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
```

- [ ] **Step 8: Create require-admin.ts for API routes**

```typescript
import { getSession } from "@/lib/auth/session";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
```

- [ ] **Step 9: Commit**

```bash
git add corbix-app/lib/auth corbix-app/app/api/auth corbix-app/middleware.ts corbix-app/__tests__
git commit -m "feat: add env-based admin auth with iron-session"
```

---

### Task 6: Shared UI components

**Files:**
- Create: `corbix-app/components/ui/Button.tsx`
- Create: `corbix-app/components/ui/Input.tsx`
- Create: `corbix-app/components/ui/Select.tsx`
- Create: `corbix-app/components/ui/Textarea.tsx`
- Create: `corbix-app/components/ui/Card.tsx`
- Create: `corbix-app/components/ui/Badge.tsx`

**Interfaces:**
- Produces: `<Button variant="primary"|"outline">`, `<Input>`, `<Select>`, `<Textarea>`, `<Card>`, `<Badge>`

- [ ] **Step 1: Implement Button**

```typescript
import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
};

export function Button({ variant = "primary", className, ...props }: Props) {
  const variants = {
    primary: "bg-accent text-white hover:bg-accent/90",
    outline: "border border-accent text-accent hover:bg-accent/10",
    ghost: "text-muted hover:text-white",
  };
  return (
    <button
      className={cn("rounded-lg px-6 py-3 font-medium transition-colors", variants[variant], className)}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Create lib/utils.ts with cn helper**

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Run: `npm install clsx tailwind-merge`

- [ ] **Step 3: Implement Input, Select, Textarea, Card, Badge** following same dark-theme styling (surface bg, white text, accent focus ring).

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add shared UI components"
```

---

### Task 7: Public layout — Header and Footer

**Files:**
- Create: `corbix-app/lib/cms/get-services.ts`
- Create: `corbix-app/components/public/Header.tsx`
- Create: `corbix-app/components/public/Footer.tsx`
- Create: `corbix-app/app/(public)/layout.tsx`

**Interfaces:**
- Produces: `getServices(): Promise<Service[]>` — fetches visible services ordered by sort_order
- Consumes: Task 4 Supabase server client

- [ ] **Step 1: Implement get-services.ts**

```typescript
import { createServerClient } from "@/lib/supabase/server";
import { Service } from "@/types/database";

export async function getServices(): Promise<Service[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("visible", true)
    .order("sort_order");
  if (error || !data) return [];
  return data as Service[];
}

export function getServiceHref(service: Service): string {
  if (service.has_page) return `/services/${service.slug}`;
  return `/services/coming-soon?service=${service.slug}`;
}
```

- [ ] **Step 2: Implement Header**

Sticky header, transparent at top → `bg-surface/95 backdrop-blur` on scroll (use `useEffect` + scroll listener). Logo text "Corbrix". Nav links: Home, Services dropdown (from `getServices()`), About, Case Studies, Careers, Contact.

- [ ] **Step 3: Implement Footer**

CTA "Let's build your future together" linking to `/contact`. Quick links mirroring nav.

- [ ] **Step 4: Create (public)/layout.tsx**

```typescript
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { getServices } from "@/lib/cms/get-services";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const services = await getServices();
  return (
    <>
      <Header services={services} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add public Header and Footer with dynamic services"
```

---

### Task 8: Lead capture form and API

**Files:**
- Create: `corbix-app/lib/validations/lead.ts`
- Create: `corbix-app/components/public/LeadCaptureForm.tsx`
- Create: `corbix-app/app/api/leads/route.ts`
- Create: `corbix-app/__tests__/validations/lead.test.ts`

**Interfaces:**
- Produces: `leadSchema` Zod object
- Produces: `<LeadCaptureForm serviceOptions={string[]} sourcePage={string} submitLabel={string} />`
- Produces: `POST /api/leads` — public endpoint inserting into Supabase

- [ ] **Step 1: Write failing validation test**

```typescript
import { describe, it, expect } from "vitest";
import { leadSchema } from "@/lib/validations/lead";

describe("leadSchema", () => {
  it("accepts valid lead", () => {
    const result = leadSchema.safeParse({
      client_name: "John",
      company_name: "Acme",
      phone: "+971501234567",
      email: "john@acme.com",
      service_requested: "Digital Marketing",
      source_page: "/contact",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = leadSchema.safeParse({
      client_name: "John",
      company_name: "Acme",
      phone: "+971501234567",
      email: "not-an-email",
      service_requested: "Digital Marketing",
      source_page: "/contact",
    });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Implement leadSchema**

```typescript
import { z } from "zod";

export const leadSchema = z.object({
  client_name: z.string().min(1, "Name is required"),
  company_name: z.string().min(1, "Company is required"),
  phone: z.string().min(5, "Phone is required"),
  email: z.string().email("Valid email required"),
  service_requested: z.string().min(1, "Service is required"),
  source_page: z.string().min(1),
});
```

- [ ] **Step 3: Implement POST /api/leads**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/validations/lead";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const supabase = createServerClient();
  const { error } = await supabase.from("leads").insert({ ...parsed.data, status: "new" });
  if (error) return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Implement LeadCaptureForm** with react-hook-form + zodResolver, sonner toast on success/error.

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- __tests__/validations/lead.test.ts
```

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add lead capture form and public API"
```

---

### Task 9: Homepage

**Files:**
- Create: `corbix-app/components/public/ParticleHero.tsx`
- Create: `corbix-app/components/public/PartnerMarquee.tsx`
- Create: `corbix-app/components/public/ScrollReveal.tsx`
- Create: `corbix-app/components/public/ServicesHub.tsx`
- Create: `corbix-app/lib/cms/get-page-content.ts`
- Modify: `corbix-app/app/(public)/page.tsx`

**Interfaces:**
- Produces: `getPageContent(pageKey: string): Promise<Record<string, Record<string, unknown>>>`
- Consumes: `getServices()`, seed page content with fallback defaults

- [ ] **Step 1: Implement get-page-content.ts**

Fetch from `page_content` table, return map `{ section_key: content }`. Merge with hardcoded fallbacks from brief if DB empty.

- [ ] **Step 2: Implement ScrollReveal**

Framer Motion wrapper: `whileInView={{ opacity: 1, y: 0 }}` initial `{ opacity: 0, y: 24 }`.

- [ ] **Step 3: Implement ParticleHero**

Three.js point cloud reacting to mouse position. Use dynamic import with `ssr: false`. On mobile or `prefers-reduced-motion`, render static gradient div instead.

- [ ] **Step 4: Implement PartnerMarquee**

CSS animation infinite horizontal scroll of placeholder partner names/logos.

- [ ] **Step 5: Implement ServicesHub**

Grid of cards from `getServices()`, each linking via `getServiceHref()`.

- [ ] **Step 6: Build homepage sections in order**

Hero (Corbrix + "A Name You Trust." + scroll anchor) → PartnerMarquee → Brand Story (COR/BRIX copy from brief) → Vision → ServicesHub → Final CTA.

- [ ] **Step 7: Verify homepage renders**

```bash
npm run dev
```

Visit http://localhost:3000 — all 5 sections visible, scroll anchor works.

- [ ] **Step 8: Commit**

```bash
git commit -m "feat: add animated homepage with services hub"
```

---

### Task 10: Service page templates and six briefed pages

**Files:**
- Create: `corbix-app/components/public/ServiceSlider.tsx`
- Create: `corbix-app/components/public/SplitServicePage.tsx`
- Create: `corbix-app/data/service-pages.ts`
- Create: 6 page files under `app/(public)/services/*/page.tsx`
- Create: `app/(public)/services/coming-soon/page.tsx`

**Interfaces:**
- Produces: `servicePages: Record<string, ServicePageConfig>` with headline, subheadline, form options, slider slides, submit label
- Produces: `<SplitServicePage config={...} />` for 60/40 layout
- Produces: `<ServiceSlider slides={...} />`

- [ ] **Step 1: Create service-pages.ts with content from all 6 briefs**

Example for commercial-brokerage:

```typescript
export type ServicePageConfig = {
  slug: string;
  headline: string;
  subheadline: string;
  serviceOptions: string[];
  submitLabel: string;
  layout: "split" | "stacked";
  slides: { title: string; description: string }[];
};

export const servicePages: Record<string, ServicePageConfig> = {
  "commercial-brokerage": {
    slug: "commercial-brokerage",
    headline: "Strategic Commercial Spaces for Scaling Businesses.",
    subheadline: "From premium corporate headquarters to high-capacity industrial warehousing...",
    serviceOptions: ["Premium Office Leasing", "Industrial & Warehousing", "Retail Space Acquisition", "Commercial Investment Sales"],
    submitLabel: "Secure Your Space",
    layout: "split",
    slides: [ /* 4 slides from brief */ ],
  },
  // ... digital-marketing (stacked), general-trading, strategic-advisory, copywriting-brand-protection, global-mobility handled in Task 11
};
```

Copy all headlines, subheadlines, dropdown options, submit labels, and slider content verbatim from docx briefs.

- [ ] **Step 2: Implement ServiceSlider**

Horizontal scroll container with snap, framer-motion hover scale on cards.

- [ ] **Step 3: Implement SplitServicePage**

60/40 grid: left headline+subheadline, right LeadCaptureForm. ServiceSlider below fold.

- [ ] **Step 4: Create 5 service pages** (all except global-mobility) importing configs from `service-pages.ts`.

- [ ] **Step 5: Create coming-soon page**

Read `?service=` query param, look up service from DB by slug, show title + description + LeadCaptureForm + link to contact.

- [ ] **Step 6: Verify all service routes**

Visit each `/services/*` route — form and slider render.

- [ ] **Step 7: Commit**

```bash
git commit -m "feat: add six service landing pages and coming-soon stub"
```

---

### Task 11: Global Mobility page with ProgramExplorer

**Files:**
- Create: `corbix-app/components/public/ProgramExplorer.tsx`
- Create: `corbix-app/lib/cms/get-programs.ts`
- Create: `corbix-app/app/(public)/services/global-mobility/page.tsx`

**Interfaces:**
- Produces: `getPrograms(): Promise<Program[]>`
- Produces: `<ProgramExplorer programs={Program[]} />` with region dropdown, type toggle, investment range filter, expandable cards

- [ ] **Step 1: Implement get-programs.ts**

Fetch visible programs from Supabase ordered by sort_order.

- [ ] **Step 2: Implement ProgramExplorer**

State: `region`, `type` (Citizenship|Residence|All), `investmentRange`. Filter programs client-side. Card grid with click-to-expand showing minimum_capital and key_benefit.

Investment range parser: extract numeric value from strings like "USD 230,000" for filtering buckets: `<250k`, `250k-500k`, `500k-1M`, `>1M`.

- [ ] **Step 3: Build global-mobility page sections**

Hero ("Your Global Plan B...") → ProgramExplorer → Value proposition (4 bullets from brief) → 3-step process → footer LeadCaptureForm with Region of Interest dropdown.

- [ ] **Step 4: Verify filters work**

Change region/type/range — card grid updates.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add Global Mobility page with program explorer"
```

---

### Task 12: Secondary public pages

**Files:**
- Create: `corbix-app/app/(public)/about/page.tsx`
- Create: `corbix-app/app/(public)/contact/page.tsx`
- Create: `corbix-app/app/(public)/case-studies/page.tsx`
- Create: `corbix-app/app/(public)/careers/page.tsx`
- Create: `corbix-app/lib/cms/get-case-studies.ts`
- Create: `corbix-app/lib/cms/get-careers.ts`

**Interfaces:**
- Produces: `getCaseStudies(): Promise<CaseStudy[]>`, `getCareers(): Promise<Career[]>`

- [ ] **Step 1: Implement data fetchers** from Supabase with seed fallbacks.

- [ ] **Step 2: About page** — brand story + vision from page_content CMS (fallback to brief copy).

- [ ] **Step 3: Contact page** — LeadCaptureForm with all service options + static contact details block (CMS-editable).

- [ ] **Step 4: Case studies page** — responsive grid of cards from DB.

- [ ] **Step 5: Careers page** — list of role cards (title, department, location, description).

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add About, Contact, Case Studies, and Careers pages"
```

---

### Task 13: Admin login and layout

**Files:**
- Create: `corbix-app/app/admin/login/page.tsx`
- Create: `corbix-app/app/admin/layout.tsx`
- Create: `corbix-app/components/admin/AdminSidebar.tsx`

**Interfaces:**
- Consumes: `POST /api/auth/login`, `POST /api/auth/logout`
- Produces: admin shell with sidebar nav matching spec routes

- [ ] **Step 1: Create login page**

Email + password form posting to `/api/auth/login`, redirect to `/admin` on success, show error on 401.

- [ ] **Step 2: Create AdminSidebar**

Links: Dashboard, Leads, Clients, Documents, CMS submenu (Services, Pages, Programs, Case Studies, Careers, Media). Logout button.

- [ ] **Step 3: Create admin layout**

Skip sidebar on login page. Dark theme, sidebar + main content area.

- [ ] **Step 4: Verify auth flow**

Visit `/admin` unauthenticated → redirect to login. Login with env credentials → dashboard access.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add admin login and layout shell"
```

---

### Task 14: Admin dashboard and leads CRM

**Files:**
- Create: `corbix-app/app/admin/page.tsx`
- Create: `corbix-app/app/admin/leads/page.tsx`
- Create: `corbix-app/app/admin/leads/[id]/page.tsx`
- Create: `corbix-app/app/api/admin/leads/route.ts`
- Create: `corbix-app/app/api/admin/leads/[id]/route.ts`
- Create: `corbix-app/components/admin/AdminTable.tsx`

**Interfaces:**
- Produces: `GET /api/admin/leads` — list with optional status filter
- Produces: `PATCH /api/admin/leads/[id]` — update status/notes
- All admin routes call `requireAdmin()` first, then `createAdminClient()`

- [ ] **Step 1: Implement GET /api/admin/leads**

Return leads ordered by created_at desc.

- [ ] **Step 2: Implement PATCH /api/admin/leads/[id]**

Update `status` and/or `notes`.

- [ ] **Step 3: Dashboard page**

Show counts: total leads, new leads, clients. List 5 most recent leads.

- [ ] **Step 4: Leads list page**

AdminTable with columns: Name, Company, Service, Source, Status, Date. Filter by status dropdown.

- [ ] **Step 5: Lead detail page**

Show all fields. Status select. Notes textarea. "Convert to Client" button (wired in Task 15).

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add admin dashboard and leads CRM"
```

---

### Task 15: Clients and lead conversion

**Files:**
- Create: `corbix-app/app/admin/clients/page.tsx`
- Create: `corbix-app/app/admin/clients/[id]/page.tsx`
- Create: `corbix-app/app/api/admin/leads/[id]/convert/route.ts`
- Create: `corbix-app/app/api/admin/clients/route.ts`

**Interfaces:**
- Produces: `POST /api/admin/leads/[id]/convert` — copies lead to clients table, returns client id
- Produces: `GET /api/admin/clients` — list all clients

- [ ] **Step 1: Implement convert endpoint**

```typescript
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).single();
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: client, error } = await supabase.from("clients").insert({
    lead_id: lead.id,
    client_name: lead.client_name,
    company_name: lead.company_name,
    phone: lead.phone,
    email: lead.email,
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await supabase.from("leads").update({ status: "qualified" }).eq("id", id);
  return NextResponse.json({ client });
}
```

- [ ] **Step 2: Clients list and detail pages**

Detail shows client info + linked documents list (empty until Task 16).

- [ ] **Step 3: Wire Convert button on lead detail**

POST convert → redirect to `/admin/clients/[id]`.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add client management and lead conversion"
```

---

### Task 16: Document generators and PDF export

**Files:**
- Create: `corbix-app/lib/validations/document.ts`
- Create: `corbix-app/lib/documents/calculate-totals.ts`
- Create: `corbix-app/lib/documents/pdf-document.tsx`
- Create: `corbix-app/components/admin/LineItemsEditor.tsx`
- Create: `corbix-app/components/admin/DocumentEditor.tsx`
- Create: `corbix-app/components/admin/DocumentPreview.tsx`
- Create: `corbix-app/app/admin/documents/page.tsx`
- Create: `corbix-app/app/admin/documents/new/page.tsx`
- Create: `corbix-app/app/admin/documents/[id]/page.tsx`
- Create: `corbix-app/app/api/admin/documents/route.ts`
- Create: `corbix-app/app/api/admin/documents/[id]/route.ts`
- Create: `corbix-app/app/api/admin/documents/[id]/pdf/route.ts`
- Create: `corbix-app/__tests__/documents/calculate-totals.test.ts`

**Interfaces:**
- Produces: `calculateLineItemTotal(qty: number, unitPrice: number): number`
- Produces: `calculateDocumentTotal(lineItems: LineItem[]): number`
- Produces: `GET /api/admin/documents/[id]/pdf` — streams PDF, does not save file

- [ ] **Step 1: Write failing totals test**

```typescript
import { describe, it, expect } from "vitest";
import { calculateLineItemTotal, calculateDocumentTotal } from "@/lib/documents/calculate-totals";

describe("calculate-totals", () => {
  it("calculates line item total", () => {
    expect(calculateLineItemTotal(2, 150)).toBe(300);
  });

  it("sums document total", () => {
    expect(calculateDocumentTotal([
      { description: "A", quantity: 1, unit_price: 100, total: 100 },
      { description: "B", quantity: 2, unit_price: 50, total: 100 },
    ])).toBe(200);
  });
});
```

- [ ] **Step 2: Implement calculate-totals.ts**

```typescript
import { LineItem } from "@/types/database";

export function calculateLineItemTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function calculateDocumentTotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.total, 0);
}
```

- [ ] **Step 3: Implement documentSchema in validations/document.ts**

Validate type, client_id, line_items array, terms, notes, valid_until optional.

- [ ] **Step 4: Implement pdf-document.tsx**

React-PDF component rendering Corbrix letterhead, client details, line items table, total, terms.

- [ ] **Step 5: Implement PDF route**

```typescript
import { renderToStream } from "@react-pdf/renderer";
import { DocumentPdf } from "@/lib/documents/pdf-document";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: doc } = await supabase.from("documents").select("*, clients(*)").eq("id", id).single();
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const stream = await renderToStream(<DocumentPdf document={doc} client={doc.clients} />);
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${doc.type}-${id}.pdf"`,
    },
  });
}
```

- [ ] **Step 6: Build DocumentEditor with LineItemsEditor**

Add/remove rows, auto-calculate totals on change. Client select dropdown pre-fills from clients table.

- [ ] **Step 7: Build documents list, new, and detail pages**

Detail: edit form, preview panel, Download PDF button, Clone as new type button (sets parent_document_id).

- [ ] **Step 8: Run tests — expect PASS**

```bash
npm test -- __tests__/documents/calculate-totals.test.ts
```

- [ ] **Step 9: Commit**

```bash
git commit -m "feat: add document generators with on-demand PDF export"
```

---

### Task 17: Admin CMS — services and pages

**Files:**
- Create: `corbix-app/app/admin/cms/services/page.tsx`
- Create: `corbix-app/app/admin/cms/pages/page.tsx`
- Create: `corbix-app/app/api/admin/cms/services/route.ts`
- Create: `corbix-app/app/api/admin/cms/pages/route.ts`
- Create: `corbix-app/components/admin/PageSectionEditor.tsx`

**Interfaces:**
- Produces: CRUD API for services (POST, PATCH, DELETE)
- Produces: PATCH API for page_content sections
- On CMS write: call `revalidatePath('/')` and affected routes

- [ ] **Step 1: Services CMS page**

Table with inline edit for title, description, visible toggle, sort_order. Add new service form. Delete with confirm.

- [ ] **Step 2: Pages CMS**

Select page from dropdown (home, about, contact). List sections with text inputs for content fields. Visible toggle per section.

- [ ] **Step 3: Implement API routes with requireAdmin + createAdminClient**

- [ ] **Step 4: Add revalidation**

```typescript
import { revalidatePath } from "next/cache";
revalidatePath("/");
revalidatePath("/about");
```

- [ ] **Step 5: Verify CMS edit reflects on public site**

Change home hero headline in admin → refresh homepage → updated text.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add CMS for services and page sections"
```

---

### Task 18: Admin CMS — programs, case studies, careers, media

**Files:**
- Create: `corbix-app/app/admin/cms/programs/page.tsx`
- Create: `corbix-app/app/admin/cms/case-studies/page.tsx`
- Create: `corbix-app/app/admin/cms/careers/page.tsx`
- Create: `corbix-app/app/admin/cms/media/page.tsx`
- Create: corresponding API routes under `app/api/admin/cms/`

**Interfaces:**
- Produces: CRUD for programs, case_studies, careers
- Produces: `POST /api/admin/cms/media` — uploads file to Supabase Storage `media` bucket, inserts media_assets row

- [ ] **Step 1: Programs editor** — table CRUD matching Program type fields.

- [ ] **Step 2: Case studies editor** — list add/edit/remove.

- [ ] **Step 3: Careers editor** — list add/edit/remove.

- [ ] **Step 4: Media upload**

```typescript
const supabase = createAdminClient();
const filename = `${Date.now()}-${file.name}`;
const { data, error } = await supabase.storage.from("media").upload(filename, buffer);
const { data: urlData } = supabase.storage.from("media").getPublicUrl(filename);
await supabase.from("media_assets").insert({ filename, url: urlData.publicUrl, category, alt_text });
```

- [ ] **Step 5: Revalidate affected paths** (`/services/global-mobility`, `/case-studies`, `/careers`).

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add CMS for programs, case studies, careers, and media"
```

---

### Task 19: Seed script execution and end-to-end verification

**Files:**
- Modify: `corbix-app/scripts/seed.ts`
- Create: `corbix-app/README.md`

**Interfaces:**
- Consumes: all seed JSON files from Task 4

- [ ] **Step 1: Run seed against Supabase**

```bash
cd corbix-app
cp .env.example .env.local
# fill in real Supabase + admin values
npx tsx scripts/seed.ts
```

Expected: services, programs, page content, case studies, careers populated.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: no TypeScript or build errors.

- [ ] **Step 3: Public smoke test checklist**

- [ ] `/` renders all homepage sections
- [ ] All 6 service pages load with forms
- [ ] `/services/coming-soon?service=real-estate-advisory` works
- [ ] `/services/global-mobility` filters work
- [ ] About, Contact, Case Studies, Careers render
- [ ] Lead form submit → success toast

- [ ] **Step 4: Admin smoke test checklist**

- [ ] Login/logout works
- [ ] Submitted lead appears in /admin/leads
- [ ] Convert lead → client
- [ ] Create quotation → preview → download PDF
- [ ] Edit service title → reflects in header dropdown
- [ ] Edit homepage headline → reflects on /

- [ ] **Step 5: Write README.md**

Document: local setup, env vars, Supabase migration steps, seed command, Vercel deployment (root dir `corbix-app`).

- [ ] **Step 6: Commit**

```bash
git commit -m "docs: add README and verify end-to-end flows"
```

---

## Spec Coverage Checklist

| Spec requirement | Task |
|-----------------|------|
| Next.js 15 App Router | Task 1 |
| Supabase schema + RLS | Task 3 |
| Supabase integration guide | Task 3, 4, README Task 19 |
| Env-based admin auth | Task 5 |
| Dark theme + coral accents | Task 2 |
| Homepage scroll sections + particles | Task 9 |
| 6 service pages | Task 10 |
| Coming-soon for 5 unbriefed | Task 10 |
| Global Mobility explorer | Task 11 |
| About, Contact, Case Studies, Careers | Task 12 |
| Lead capture all pages | Task 8 |
| Admin dashboard | Task 14 |
| Leads CRM | Task 14 |
| Client conversion | Task 15 |
| Document generators (JSON only) | Task 16 |
| On-demand PDF | Task 16 |
| CMS services | Task 17 |
| CMS page sections | Task 17 |
| CMS programs, case studies, careers, media | Task 18 |
| .env.example for Vercel | Task 1 |
| prefers-reduced-motion | Task 2, 9 |
| Seed data + fallbacks | Task 4, 19 |

## Out of Scope (confirmed — no tasks)

- Multi-user admin roles
- Supabase Auth
- Email notifications
- Payment processing
- Rich text blog CMS
- Live Henley data scraping
