-- Keep the historical Bidewind articles separate from Altura Nova's public
-- marketing blog. Existing rows intentionally remain "legacy".
alter table public.posts add column if not exists site_scope text;

update public.posts
set site_scope = 'legacy'
where site_scope is null;

alter table public.posts
  alter column site_scope set default 'legacy',
  alter column site_scope set not null;

alter table public.posts drop constraint if exists posts_site_scope_check;
alter table public.posts
  add constraint posts_site_scope_check
  check (site_scope in ('legacy', 'altura_nova'));

create index if not exists posts_site_scope_status_publish_at_idx
  on public.posts (site_scope, status, publish_at desc);

drop policy if exists "Public can read public posts" on public.posts;
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read Altura Nova posts"
on public.posts
for select
to public
using (
  site_scope = 'altura_nova'
  and (
    (
      status = 'published'
      and (publish_at is null or publish_at <= timezone('utc', now()))
    )
    or (
      status = 'scheduled'
      and publish_at is not null
      and publish_at <= timezone('utc', now())
    )
  )
);

grant usage on schema public to anon, authenticated;
grant select on table public.posts to anon;
grant select, insert, update on table public.posts to authenticated;
