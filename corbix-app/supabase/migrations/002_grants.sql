-- Grant table privileges to the Supabase roles.
-- Needed when default privileges did not auto-apply to tables created via the SQL editor.

grant usage on schema public to anon, authenticated, service_role;

-- service_role bypasses RLS and needs full access for the admin panel
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;

-- public (anon) access is still filtered by RLS policies from 001_initial_schema.sql
grant select on services, page_content, programs, case_studies, careers, media_assets
  to anon, authenticated;
grant insert on leads to anon, authenticated;

-- ensure future tables inherit the same grants
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant all on sequences to service_role;
