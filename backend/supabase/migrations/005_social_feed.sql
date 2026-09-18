-- Migration 005: Social Feed — follows, posts, likes, notifications

-- Follows: any user can follow any other user
create table if not exists public.follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

-- Posts: images and videos shared by any user (influencer or brand)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  thumbnail_url text,
  caption text not null default '' check (char_length(caption) <= 2200),
  likes_count integer not null default 0 check (likes_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists posts_user_created_idx on public.posts(user_id, created_at desc);
create index if not exists posts_created_idx on public.posts(created_at desc);

-- Post likes
create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  actor_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('follow', 'like', 'comment')),
  post_id uuid references public.posts(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

-- RLS
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.notifications enable row level security;

-- Follows policies
create policy "anyone can view follows" on public.follows for select using (true);
create policy "users manage own follows" on public.follows for all using (follower_id = auth.uid()) with check (follower_id = auth.uid());

-- Posts policies
create policy "public can read posts" on public.posts for select using (true);
create policy "users manage own posts" on public.posts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Post likes policies
create policy "public can read likes" on public.post_likes for select using (true);
create policy "users manage own likes" on public.post_likes for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Notifications policies
create policy "users read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "system inserts notifications" on public.notifications for insert with check (true);
create policy "users mark own notifications read" on public.notifications for update using (user_id = auth.uid());

-- Storage bucket for post media
insert into storage.buckets (id, name, public) values ('post-media', 'post-media', true) on conflict (id) do nothing;
create policy "authenticated users upload post media" on storage.objects for insert to authenticated with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "public reads post media" on storage.objects for select using (bucket_id = 'post-media');
create policy "users delete own post media" on storage.objects for delete using (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);
