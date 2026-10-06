-- Apply once to an existing Supabase project to let visitors view gallery photos
-- saved in the private project-images bucket for published projects.
create policy "Public reads published project gallery media"
on storage.objects for select to anon
using (
  bucket_id = 'project-images'
  and exists (
    select 1
    from public.project_images image
    join public.projects project on project.id = image.project_id
    where project.published and image.image_url = storage.objects.name
  )
);
