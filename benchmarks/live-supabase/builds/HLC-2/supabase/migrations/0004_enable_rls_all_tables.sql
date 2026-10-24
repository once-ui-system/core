-- Safety net: enable row level security on every table in the public schema,
-- including any created by later migrations that were not listed above.
do $$
declare
  t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end
$$;
