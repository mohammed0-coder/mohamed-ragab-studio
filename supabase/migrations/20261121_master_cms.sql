-- Mohamed Ragab Studio — Master CMS/Public Experience migration
-- Idempotent and safe to run after earlier V9/V10/V11 migrations.

insert into public.site_settings(key,value,updated_at) values
  ('contact_phone', jsonb_build_object('text','01040947991'), now()),
  ('contact_whatsapp', jsonb_build_object('text','https://wa.me/201040947991'), now()),
  ('contact_location', jsonb_build_object('text','القاهرة، مصر'), now()),
  ('social_facebook', jsonb_build_object('text','https://www.facebook.com/profile.php?id=61573569311050'), now()),
  ('social_instagram', jsonb_build_object('text','https://www.instagram.com/mohamed_ragab_studio/?hl=ar'), now()),
  ('social_whatsapp', jsonb_build_object('text','https://wa.me/201040947991'), now()),
  ('social_linkedin', jsonb_build_object('text','https://www.linkedin.com/in/mohamed-ragab-studio-6b3792397/'), now()),
  ('social_behance', jsonb_build_object('text','https://www.behance.net/mohamedtolba42'), now()),
  ('social_x', jsonb_build_object('text',''), now())
on conflict(key) do update set value=excluded.value, updated_at=excluded.updated_at;

alter table public.clients add column if not exists alt_text text;
alter table public.clients add column if not exists row_assignment smallint not null default 1 check (row_assignment in (1,2));
alter table public.clients add column if not exists animation_speed numeric not null default 28 check (animation_speed between 8 and 120);

alter table public.services add column if not exists title_en text;
alter table public.services add column if not exists description_en text;
alter table public.services add column if not exists cta_label_ar text;
alter table public.services add column if not exists cta_label_en text;
alter table public.services add column if not exists cta_url text;

update public.services set cta_label_ar=coalesce(nullif(cta_label_ar,''),'اطلب هذه الخدمة ↙'), cta_label_en=coalesce(nullif(cta_label_en,''),'Request this service ↙') where true;

create table if not exists public.cms_pages (
  key text primary key,
  draft jsonb not null default '{}'::jsonb,
  published jsonb not null default '{}'::jsonb,
  status text not null default 'published' check (status in ('draft','published')),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.cms_pages enable row level security;
drop policy if exists "cms published public read" on public.cms_pages;
drop policy if exists "cms admin read" on public.cms_pages;
drop policy if exists "cms admin write" on public.cms_pages;
create policy "cms published public read" on public.cms_pages for select using (status='published');
create policy "cms admin read" on public.cms_pages for select to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role')='admin');
create policy "cms admin write" on public.cms_pages for all to authenticated using ((auth.jwt() -> 'app_metadata' ->> 'role')='admin') with check ((auth.jwt() -> 'app_metadata' ->> 'role')='admin');

insert into public.cms_pages(key,draft,published,status,updated_at,published_at) values
('homepage','{"hero_title_ar":"نبني\nعلامات تُرى","hero_title_en":"We Build Brands\nThat Matter","hero_subtitle_ar":"استراتيجية، إبداع، وتجارب رقمية تصنع حضورًا واضحًا.","hero_subtitle_en":"Strategy, creativity, and digital experiences that build a clear presence.","clients_kicker_ar":"شركاء الرحلة","clients_kicker_en":"Our partners","clients_title_ar":"أناس نعتز\nبالعمل معهم.","clients_title_en":"People we’re\nproud to work with.","statement_ar":"نصنع ما يستحق\nأن يبقى في الذاكرة.","statement_en":"We make work\nthat stays with you."}'::jsonb,'{"hero_title_ar":"نبني\nعلامات تُرى","hero_title_en":"We Build Brands\nThat Matter","hero_subtitle_ar":"استراتيجية، إبداع، وتجارب رقمية تصنع حضورًا واضحًا.","hero_subtitle_en":"Strategy, creativity, and digital experiences that build a clear presence.","clients_kicker_ar":"شركاء الرحلة","clients_kicker_en":"Our partners","clients_title_ar":"أناس نعتز\nبالعمل معهم.","clients_title_en":"People we’re\nproud to work with.","statement_ar":"نصنع ما يستحق\nأن يبقى في الذاكرة.","statement_en":"We make work\nthat stays with you."}'::jsonb,'published',now(),now()),
('about','{}'::jsonb,'{}'::jsonb,'published',now(),now()),
('contact','{}'::jsonb,'{}'::jsonb,'published',now(),now()),
('global','{"footer_headline_ar":"لديك فكرة جديدة؟ احكِ لنا عن مشروعك.","footer_headline_en":"Have a new idea? Tell us about your project.","footer_caption_ar":"احكِ لنا عن مشروعك ودعنا نحوله إلى تجربة تستحق أن تُرى.","footer_caption_en":"Tell us about your project and let’s turn it into an experience worth seeing.","footer_cta_ar":"ابدأ مشروعك معنا ↗","footer_cta_en":"Start a project with us ↗"}'::jsonb,'{"footer_headline_ar":"لديك فكرة جديدة؟ احكِ لنا عن مشروعك.","footer_headline_en":"Have a new idea? Tell us about your project.","footer_caption_ar":"احكِ لنا عن مشروعك ودعنا نحوله إلى تجربة تستحق أن تُرى.","footer_caption_en":"Tell us about your project and let’s turn it into an experience worth seeing.","footer_cta_ar":"ابدأ مشروعك معنا ↗","footer_cta_en":"Start a project with us ↗"}'::jsonb,'published',now(),now())
on conflict(key) do nothing;

-- Keep seeded placeholder team rows out of the public presentation until real approved entries are provided.
update public.team_members set visible=false where image_url='/images/image-placeholder.svg' or name_ar in ('فريق الاستراتيجية','فريق الإبداع','فريق التطوير','فريق الإنتاج');
