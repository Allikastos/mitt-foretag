insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view blog images" on storage.objects;
create policy "Public can view blog images"
on storage.objects
for select
to public
using (bucket_id = 'blog-images');

drop policy if exists "Authenticated users can upload blog images" on storage.objects;
create policy "Authenticated users can upload blog images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'blog-images');

drop policy if exists "Authenticated users can update blog images" on storage.objects;
create policy "Authenticated users can update blog images"
on storage.objects
for update
to authenticated
using (bucket_id = 'blog-images')
with check (bucket_id = 'blog-images');

drop policy if exists "Authenticated users can delete blog images" on storage.objects;
create policy "Authenticated users can delete blog images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'blog-images');
