-- Run once in the Supabase SQL Editor for this project.
-- Set each admin user's app_metadata.role to "admin" using the Supabase Dashboard or a trusted server.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  title text not null, client_name text not null default '', short_description text not null default '',
  description text, intro_title text, intro_text text, category text not null default 'أخرى',
  services text[] not null default '{}', technologies text[] not null default '{}',
  start_date date, end_date date, status text not null default 'active', hero_image text, cover_image text,
  challenge text, solution text, results text, external_url text,
  featured boolean not null default false, homepage_featured boolean not null default false,
  published boolean not null default false, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  image_url text not null, alt_text text not null default '', sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(), name text not null, logo_url text, website_url text,
  sort_order integer not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(), number text not null default '01', title text not null,
  description text not null default '', items text[] not null default '{}', sort_order integer not null default 0,
  visible boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(), name text not null, email text not null,
  phone text not null default '', company text not null default '', job_title text not null default '',
  project_type text not null default '', message text not null,
  status text not null default 'new' check (status in ('new','read','archived')),
  created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  key text primary key, value jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);

-- Demo entries are placeholders, not client/project claims. Replace them in /admin/dashboard.
insert into public.projects (slug,title,client_name,short_description,category,services,featured,homepage_featured,published,sort_order) values
 ('nawa','نَوى','علامة تجريبية','هوية تنمو من الفكرة إلى السوق.','هوية بصرية',array['استراتيجية','هوية بصرية'],true,true,true,1),
 ('madar','مدار','مشروع تجريبي','حضور رقمي يتحرك بإيقاع جديد.','تجارب رقمية',array['تجربة رقمية','تطوير ويب'],true,true,true,2),
 ('sifr','صِفر','علامة تجريبية','لغة بصرية لمنتج يومي مختلف.','حملات إعلانية',array['إبداع','إنتاج'],true,true,true,3),
 ('bayt','بيت الحكاية','مشروع تجريبي','حكاية محلية بصوت معاصر.','محتوى وفيديو',array['استراتيجية محتوى','فيديو'],true,true,true,4),
 ('wasl','وَصل','علامة تجريبية','منصة تربط الفكرة بجمهورها.','تجارب رقمية',array['تطوير ويب','تسويق رقمي'],true,false,true,5),
 ('saha','ساحة','مشروع تجريبي','مساحة جديدة للقاء والتجربة.','هوية بصرية',array['تسمية','هوية بصرية'],true,false,true,6)
on conflict (slug) do nothing;
insert into public.clients (name,sort_order,visible) values
 ('علامة تجريبية',1,true),('مشروع ناشئ',2,true),('وجهة محلية',3,true),('منصة رقمية',4,true),
 ('فكرة جديدة',5,true),('مساحة إبداعية',6,true),('منتج مستقل',7,true),('شريك نمو',8,true);
insert into public.services (number,title,description,items,sort_order,visible) values
 ('01','الاستراتيجية والعلامة','نمنح الأفكار اتجاهًا واضحًا، ونبني علامات تعرف من تكون وإلى أين تتجه.',array['استراتيجية العلامة','التسمية والتموضع','الهوية البصرية','التوجيه الإبداعي'],1,true),
 ('02','الحملات والإعلان','أفكار إعلانية تجد طريقها إلى الناس عبر قصة واحدة وصيغ متعددة.',array['الفكرة الإبداعية','الحملات المتكاملة','الإعلان الرقمي','الإنتاج المرئي'],2,true),
 ('03','المحتوى والتواصل','محتوى مستمر وواضح يمنح العلامة صوتًا حاضرًا في يوم جمهورها.',array['استراتيجية المحتوى','إدارة المنصات','التصوير والفيديو','العلاقات العامة'],3,true),
 ('04','المنتجات الرقمية','نصمم ونطور تجارب رقمية سهلة الاستخدام من الصفحة الأولى إلى التفاصيل الصغيرة.',array['تصميم تجربة المستخدم','تطوير المواقع','التجارة الإلكترونية','تطوير البرمجيات'],4,true)
on conflict do nothing;

create index if not exists projects_published_sort_idx on public.projects(published, sort_order);
create index if not exists project_images_project_sort_idx on public.project_images(project_id, sort_order);
create index if not exists clients_visible_sort_idx on public.clients(visible, sort_order);
create index if not exists services_visible_sort_idx on public.services(visible, sort_order);
create index if not exists contact_messages_created_idx on public.contact_messages(created_at desc);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;

grant select on public.projects, public.project_images, public.clients, public.services, public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.projects, public.project_images, public.clients, public.services, public.site_settings to authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant select on public.profiles to authenticated;

create policy "Public sees published projects" on public.projects for select to anon using (published);
create policy "Admins read all projects" on public.projects for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins insert projects" on public.projects for insert to authenticated with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins update projects" on public.projects for update to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin') with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins delete projects" on public.projects for delete to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Published project images are readable" on public.project_images for select to anon using (exists (select 1 from public.projects p where p.id=project_id and p.published));
create policy "Admins read project images" on public.project_images for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins insert project images" on public.project_images for insert to authenticated with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins update project images" on public.project_images for update to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin') with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins delete project images" on public.project_images for delete to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Public sees visible clients" on public.clients for select to anon using (visible);
create policy "Admins read all clients" on public.clients for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins insert clients" on public.clients for insert to authenticated with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins update clients" on public.clients for update to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin') with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins delete clients" on public.clients for delete to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Public sees visible services" on public.services for select to anon using (visible);
create policy "Admins read all services" on public.services for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins insert services" on public.services for insert to authenticated with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins update services" on public.services for update to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin') with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins delete services" on public.services for delete to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Visitors submit contact messages" on public.contact_messages for insert to anon, authenticated with check (status='new' and length(name) between 2 and 120 and length(email) between 3 and 254 and length(message) between 10 and 5000);
create policy "Admins read contact messages" on public.contact_messages for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins update contact messages" on public.contact_messages for update to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin') with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins delete contact messages" on public.contact_messages for delete to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Public reads site settings" on public.site_settings for select to anon using (true);
create policy "Admins read site settings" on public.site_settings for select to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins insert site settings" on public.site_settings for insert to authenticated with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins update site settings" on public.site_settings for update to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin') with check ((select auth.jwt()->'app_metadata'->>'role') = 'admin');
create policy "Admins delete site settings" on public.site_settings for delete to authenticated using ((select auth.jwt()->'app_metadata'->>'role') = 'admin');

create policy "Users read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images','project-images',false,15728640,array['image/jpeg','image/png','image/webp','image/avif']),
       ('client-logos','client-logos',true,5242880,array['image/jpeg','image/png','image/webp','image/svg+xml']),
       ('site-assets','site-assets',true,10485760,array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;

create policy "Admins list project media" on storage.objects for select to authenticated using (bucket_id='project-images' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Admins upload project media" on storage.objects for insert to authenticated with check (bucket_id='project-images' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Admins replace project media" on storage.objects for update to authenticated using (bucket_id='project-images' and (select auth.jwt()->'app_metadata'->>'role')='admin') with check (bucket_id='project-images' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Admins delete project media" on storage.objects for delete to authenticated using (bucket_id='project-images' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Public reads published project media" on storage.objects for select to anon using (bucket_id='project-images' and exists (select 1 from public.projects p where p.published and (p.hero_image=name or p.cover_image=name or exists (select 1 from public.project_images i where i.project_id=p.id and i.image_url=name))));
create policy "Admins list client logos" on storage.objects for select to authenticated using (bucket_id='client-logos' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Admins upload client logos" on storage.objects for insert to authenticated with check (bucket_id='client-logos' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Admins update client logos" on storage.objects for update to authenticated using (bucket_id='client-logos' and (select auth.jwt()->'app_metadata'->>'role')='admin') with check (bucket_id='client-logos' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Admins delete client logos" on storage.objects for delete to authenticated using (bucket_id='client-logos' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Public reads client logos" on storage.objects for select to anon using (bucket_id='client-logos');
create policy "Admins list site assets" on storage.objects for select to authenticated using (bucket_id='site-assets' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Admins upload site assets" on storage.objects for insert to authenticated with check (bucket_id='site-assets' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Admins update site assets" on storage.objects for update to authenticated using (bucket_id='site-assets' and (select auth.jwt()->'app_metadata'->>'role')='admin') with check (bucket_id='site-assets' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Admins delete site assets" on storage.objects for delete to authenticated using (bucket_id='site-assets' and (select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "Public reads site assets" on storage.objects for select to anon using (bucket_id='site-assets');
