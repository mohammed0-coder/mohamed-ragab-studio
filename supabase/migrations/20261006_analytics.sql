create table if not exists public.analytics_visits (
  id bigint generated always as identity primary key,
  session_id text not null,
  path text not null,
  visited_at timestamptz not null default now(),
  local_day date not null default (current_date)
);

create unique index if not exists analytics_visits_session_day_path_uidx
  on public.analytics_visits(session_id, local_day, path);
create index if not exists analytics_visits_visited_at_idx
  on public.analytics_visits(visited_at desc);

alter table public.analytics_visits enable row level security;

drop policy if exists "analytics anon insert" on public.analytics_visits;
create policy "analytics anon insert" on public.analytics_visits for insert to anon with check (length(session_id) between 12 and 80 and path like '/%' and path not like '//%');

drop policy if exists "analytics admin read" on public.analytics_visits;
create policy "analytics admin read"
on public.analytics_visits
for select to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

drop policy if exists "analytics admin delete" on public.analytics_visits;
create policy "analytics admin delete"
on public.analytics_visits
for delete to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

grant usage on schema public to anon, authenticated;

drop function if exists public.record_analytics_visit(text, text);
create or replace function public.record_analytics_visit(p_session_id text, p_path text)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if length(coalesce(p_session_id, '')) < 12 or length(coalesce(p_session_id, '')) > 80 then
    return;
  end if;
  if p_path is null or p_path not like '/%' or p_path like '//%' or p_path like '%javascript:%' then
    return;
  end if;
  insert into public.analytics_visits(session_id, path, local_day)
  values (p_session_id, left(p_path, 160), (timezone('Africa/Cairo', now()))::date)
  on conflict (session_id, local_day, path) do nothing;
end;
$$;

grant execute on function public.record_analytics_visit(text, text) to anon, authenticated;

revoke all on public.analytics_visits from anon, authenticated;
grant insert on public.analytics_visits to anon, authenticated;
grant select, delete on public.analytics_visits to authenticated;

create or replace function public.analytics_summary(p_period text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  now_local timestamp := timezone('Africa/Cairo', now());
  period_start timestamp;
  previous_start timestamp;
  previous_end timestamp;
  bucket_step interval;
  bucket_format text;
  label_text text;
  current_visitors bigint;
  previous_visitors bigint;
  current_views bigint;
  series jsonb;
  change_value numeric;
  trend_value text;
begin
  if ((select auth.jwt()) -> 'app_metadata' ->> 'role') <> 'admin' then
    raise exception 'forbidden';
  end if;

  case p_period
    when 'day' then
      period_start := date_trunc('day', now_local);
      previous_start := period_start - interval '1 day';
      bucket_step := interval '1 hour';
      bucket_format := 'HH24:00';
      label_text := 'اليوم';
    when 'month' then
      period_start := now_local - interval '30 days';
      previous_start := period_start - interval '30 days';
      bucket_step := interval '1 day';
      bucket_format := 'DD/MM';
      label_text := 'آخر 30 يومًا';
    when 'year' then
      period_start := date_trunc('month', now_local) - interval '11 months';
      previous_start := period_start - interval '12 months';
      bucket_step := interval '1 month';
      bucket_format := 'Mon';
      label_text := 'آخر 12 شهرًا';
    else
      period_start := now_local - interval '6 days';
      previous_start := period_start - interval '7 days';
      bucket_step := interval '1 day';
      bucket_format := 'DD/MM';
      label_text := 'آخر 7 أيام';
  end case;

  previous_end := period_start;

  select count(distinct session_id), count(*)
    into current_visitors, current_views
  from public.analytics_visits
  where visited_at >= period_start at time zone 'Africa/Cairo'
    and visited_at < now();

  select count(distinct session_id)
    into previous_visitors
  from public.analytics_visits
  where visited_at >= previous_start at time zone 'Africa/Cairo'
    and visited_at < previous_end at time zone 'Africa/Cairo';

  if previous_visitors = 0 then
    change_value := case when current_visitors > 0 then 100 else 0 end;
  else
    change_value := round(((current_visitors - previous_visitors)::numeric / previous_visitors::numeric) * 100, 1);
  end if;

  trend_value := case when change_value > 0 then 'up' when change_value < 0 then 'down' else 'stable' end;

  select coalesce(jsonb_agg(to_jsonb(x) order by x.bucket), '[]'::jsonb)
    into series
  from (
    select
      gs as bucket_ts,
      to_char(gs, bucket_format) as bucket,
      count(distinct av.session_id)::bigint as visitors,
      count(av.id)::bigint as views
    from generate_series(period_start, now_local, bucket_step) gs
    left join public.analytics_visits av
      on av.visited_at >= (gs at time zone 'Africa/Cairo')
     and av.visited_at < ((gs + bucket_step) at time zone 'Africa/Cairo')
    group by gs
  ) x;

  return jsonb_build_object(
    'period', p_period,
    'label', label_text,
    'currentVisitors', current_visitors,
    'previousVisitors', previous_visitors,
    'currentViews', current_views,
    'changePercent', change_value,
    'trend', trend_value,
    'series', series
  );
end;
$$;

revoke execute on function public.analytics_summary(text) from public, anon, authenticated;
grant execute on function public.analytics_summary(text) to authenticated;
