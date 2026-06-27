-- Add a "service_type" field to programs.
-- Safe to run multiple times; existing rows default to an empty string.
alter table programs
  add column if not exists service_type text not null default '';
