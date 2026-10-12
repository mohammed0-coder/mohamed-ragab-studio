-- Normalize the legacy categories currently present in projects.
update public.projects
set category = 'Social Media Design'
where category = 'Advertising · National Campaign · Social Media Design';

update public.projects
set category = 'Graphic Design'
where category = 'Advertising Design';

update public.projects
set category = 'Advertising'
where category = 'Real Estate Advertising';
