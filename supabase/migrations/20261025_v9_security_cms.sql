-- MRS V9: contact security, message groups, reply metadata, push subscriptions and showcase modes.

create extension if not exists pgcrypto;

alter table public.projects
  add column if not exists showcase_type text not null default 'gallery',
  add column if not exists showcase_url text;

alter table public.projects drop constraint if exists projects_showcase_type_check;
alter table public.projects add constraint projects_showcase_type_check
  check (showcase_type in ('gallery','website','external'));

create table if not exists public.message_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  color text not null default '#7c1e2d' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.message_group_members (
  group_id uuid not null references public.message_groups(id) on delete cascade,
  message_id uuid not null references public.contact_messages(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (group_id, message_id)
);

create index if not exists message_group_members_message_idx on public.message_group_members(message_id);
create index if not exists message_group_members_group_idx on public.message_group_members(group_id);

create table if not exists public.admin_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.message_groups enable row level security;
alter table public.message_group_members enable row level security;
alter table public.admin_push_subscriptions enable row level security;

revoke all on public.message_groups from anon, authenticated;
revoke all on public.message_group_members from anon, authenticated;
revoke all on public.admin_push_subscriptions from anon, authenticated;

create policy "admin manage message groups" on public.message_groups
  for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin manage message group members" on public.message_group_members
  for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin manage push subscriptions" on public.admin_push_subscriptions
  for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create table if not exists public.contact_rate_limits (
  key_hash text primary key,
  window_started timestamptz not null,
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);

revoke all on public.contact_rate_limits from public, anon, authenticated;

create or replace function public.consume_contact_rate_limit(
  p_key_hash text,
  p_limit integer default 2,
  p_window_seconds integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_started timestamptz;
  v_count integer;
begin
  if p_key_hash is null or length(p_key_hash) < 16 then
    return false;
  end if;

  insert into public.contact_rate_limits(key_hash, window_started, request_count, updated_at)
  values (p_key_hash, v_now, 1, v_now)
  on conflict (key_hash) do update set
    request_count = case
      when extract(epoch from (v_now - public.contact_rate_limits.window_started)) >= p_window_seconds then 1
      else public.contact_rate_limits.request_count + 1
    end,
    window_started = case
      when extract(epoch from (v_now - public.contact_rate_limits.window_started)) >= p_window_seconds then v_now
      else public.contact_rate_limits.window_started
    end,
    updated_at = v_now
  returning window_started, request_count into v_started, v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_contact_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_contact_rate_limit(text, integer, integer) to service_role;

-- The public site must not be able to insert directly into the inbox.
revoke insert, update, delete, truncate on public.contact_messages from anon;

-- Keep the public read policies untouched; only the server-side service role writes contact messages now.

create index if not exists contact_rate_limits_updated_idx on public.contact_rate_limits(updated_at);

insert into public.site_settings(key, value)
values ('social_behance', '{"text":""}'::jsonb)
on conflict (key) do nothing;
