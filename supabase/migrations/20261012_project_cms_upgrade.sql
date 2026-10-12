-- Project CMS upgrade: bilingual intro copy + six page themes

alter table public.projects add column if not exists intro_text_ar text;
alter table public.projects add column if not exists intro_text_en text;
alter table public.projects add column if not exists theme text not null default 'red';

alter table public.projects drop constraint if exists projects_theme_check;
alter table public.projects add constraint projects_theme_check check (theme in ('olive','blue','red','sand','ink','lilac'));

update public.projects
set intro_text_ar = coalesce(intro_text_ar, intro_text, description, short_description),
    intro_text_en = coalesce(intro_text_en, intro_text, description, short_description)
where intro_text_ar is null or intro_text_en is null;
