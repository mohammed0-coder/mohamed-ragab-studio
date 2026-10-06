create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null,
  visit_day date not null,
  path text not null default '/',
  created_at timestamptz not null default now(),
  unique(visitor_id, visit_day)
);

alter table public.site_visits enable row level security;

drop policy if exists "public insert site visits" on public.site_visits;
create policy "public insert site visits" on public.site_visits for insert to anon, authenticated with check (true);

create index if not exists site_visits_day_idx on public.site_visits(visit_day);

create or replace function public.get_visit_analytics(p_period text default 'week')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  unit text;
  start_at timestamptz;
  previous_start timestamptz;
  current_end timestamptz;
  previous_end timestamptz;
  current_count bigint;
  previous_count bigint;
  series jsonb;
  change_value numeric := 0;
begin
  if coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') <> 'admin' then
    raise exception 'forbidden';
  end if;

  case p_period
    when 'day' then
      unit := 'hour';
      current_end := date_trunc('hour', now()) + interval '1 hour';
      start_at := current_end - interval '24 hours';
      previous_start := start_at - interval '24 hours';
      previous_end := start_at;
    when 'month' then
      unit := 'day';
      current_end := date_trunc('day', now()) + interval '1 day';
      start_at := current_end - interval '30 days';
      previous_start := start_at - interval '30 days';
      previous_end := start_at;
    when 'year' then
      unit := 'month';
      current_end := date_trunc('month', now()) + interval '1 month';
      start_at := current_end - interval '12 months';
      previous_start := start_at - interval '12 months';
      previous_end := start_at;
    else
      unit := 'day';
      current_end := date_trunc('day', now()) + interval '1 day';
      start_at := current_end - interval '7 days';
      previous_start := start_at - interval '7 days';
      previous_end := start_at;
  end case;

  select count(*) into current_count from site_visits where created_at >= start_at and created_at < current_end;
  select count(*) into previous_count from site_visits where created_at >= previous_start and created_at < previous_end;

  if previous_count = 0 then
    change_value := case when current_count > 0 then 100 else 0 end;
  else
    change_value := round(((current_count - previous_count)::numeric / previous_count::numeric) * 100, 1);
  end if;

  if unit = 'hour' then
    select coalesce(jsonb_agg(jsonb_build_object('label', to_char(bucket,'HH24:00'), 'value', value) order by bucket), '[]'::jsonb) into series
    from (select date_trunc('hour', created_at) bucket, count(*) value from site_visits where created_at >= start_at and created_at < current_end group by 1) x;
  elsif unit = 'day' then
    select coalesce(jsonb_agg(jsonb_build_object('label', to_char(bucket,'DD Mon'), 'value', value) order by bucket), '[]'::jsonb) into series
    from (select date_trunc('day', created_at) bucket, count(*) value from site_visits where created_at >= start_at and created_at < current_end group by 1) x;
  else
    select coalesce(jsonb_agg(jsonb_build_object('label', to_char(bucket,'Mon YY'), 'value', value) order by bucket), '[]'::jsonb) into series
    from (select date_trunc('month', created_at) bucket, count(*) value from site_visits where created_at >= start_at and created_at < current_end group by 1) x;
  end if;

  return jsonb_build_object('current', current_count, 'previous', previous_count, 'change', change_value, 'label', case p_period when 'day' then 'آخر 24 ساعة' when 'month' then 'آخر 30 يومًا' when 'year' then 'آخر 12 شهرًا' else 'آخر 7 أيام' end, 'series', series);
end;
$$;

revoke all on function public.get_visit_analytics(text) from public, anon, authenticated;
grant execute on function public.get_visit_analytics(text) to authenticated;
