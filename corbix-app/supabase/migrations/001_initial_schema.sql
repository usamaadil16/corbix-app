create extension if not exists "pgcrypto";

create table if not exists services (
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

create table if not exists page_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null,
  section_key text not null,
  content jsonb not null default '{}',
  visible boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (page_key, section_key)
);

create table if not exists programs (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  region text not null,
  type text not null check (type in ('Citizenship', 'Residence')),
  minimum_capital text not null,
  key_benefit text not null,
  sort_order int not null default 0,
  visible boolean not null default true
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  company_name text not null default '',
  phone text not null,
  email text not null,
  service_requested text not null,
  source_page text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'lost')),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete set null,
  client_name text not null,
  company_name text not null default '',
  phone text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  type text not null check (type in ('quotation', 'proposal', 'invoice')),
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'paid')),
  line_items jsonb not null default '[]',
  terms text not null default '',
  notes text not null default '',
  valid_until date,
  parent_document_id uuid references documents (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  link text,
  visible boolean not null default true,
  sort_order int not null default 0
);

create table if not exists careers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  department text not null default '',
  location text not null default '',
  description text not null default '',
  visible boolean not null default true,
  sort_order int not null default 0
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  url text not null,
  alt_text text not null default '',
  category text not null default 'general',
  created_at timestamptz not null default now()
);

alter table services enable row level security;
alter table page_content enable row level security;
alter table programs enable row level security;
alter table leads enable row level security;
alter table clients enable row level security;
alter table documents enable row level security;
alter table case_studies enable row level security;
alter table careers enable row level security;
alter table media_assets enable row level security;

drop policy if exists "public_read_services" on services;
drop policy if exists "public_read_page_content" on page_content;
drop policy if exists "public_read_programs" on programs;
drop policy if exists "public_read_case_studies" on case_studies;
drop policy if exists "public_read_careers" on careers;
drop policy if exists "public_read_media" on media_assets;
drop policy if exists "public_insert_leads" on leads;

create policy "public_read_services" on services for select using (visible = true);
create policy "public_read_page_content" on page_content for select using (visible = true);
create policy "public_read_programs" on programs for select using (visible = true);
create policy "public_read_case_studies" on case_studies for select using (visible = true);
create policy "public_read_careers" on careers for select using (visible = true);
create policy "public_read_media" on media_assets for select using (true);
create policy "public_insert_leads" on leads for insert with check (true);
