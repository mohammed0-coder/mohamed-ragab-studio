drop policy if exists "public read theme settings" on public.site_settings;

create policy "public read safe site settings"
on public.site_settings
for select
to anon
using (
  left(key, 14) = 'project_theme:'
  or key in (
    'contact_phone',
    'contact_whatsapp',
    'contact_email',
    'contact_location',
    'social_facebook',
    'social_instagram',
    'social_whatsapp',
    'social_linkedin',
    'social_x',
    'footer_text'
  )
);

drop policy if exists "admin manage site settings" on public.site_settings;
create policy "admin manage site settings"
on public.site_settings
for all
to authenticated
using ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin')
with check ((select auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');
