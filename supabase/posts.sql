create extension if not exists pgcrypto;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  image_url text,
  seo_title text,
  seo_description text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  publish_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.posts add column if not exists seo_title text;
alter table public.posts add column if not exists seo_description text;

create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_publish_at_idx on public.posts (publish_at desc);
create index if not exists posts_slug_idx on public.posts (slug);

create or replace function public.set_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_posts_updated_at on public.posts;

create trigger set_posts_updated_at
before update on public.posts
for each row
execute function public.set_posts_updated_at();

alter table public.posts enable row level security;

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts
for select
to public
using (
  status = 'published'
  and (publish_at is null or publish_at <= timezone('utc', now()))
);

drop policy if exists "Authenticated users can manage posts" on public.posts;
create policy "Authenticated users can manage posts"
on public.posts
for all
to authenticated
using (true)
with check (true);
