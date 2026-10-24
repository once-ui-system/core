-- Row level security on every table in the public schema. There are no policies:
-- anon and authenticated clients see nothing, and the app reaches the tables with
-- the service-role key, which bypasses RLS and filters by organization in code
-- (src/lib/orgs/guard.ts).
do $$
declare
  t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;
