-- Apply in Supabase SQL editor or migration pipeline. Admin role is assigned only by a trusted server/admin process.
create type public.user_role as enum ('brand','influencer','admin');
create table public.users (id uuid primary key references auth.users(id) on delete cascade, role public.user_role, name text not null default '', email text not null, phone text, is_disabled boolean not null default false, profile_status text not null default 'active', created_at timestamptz not null default now());
create table public.influencer_profiles (user_id uuid primary key references public.users(id) on delete cascade, niche text not null, followers_count integer not null check(followers_count>=0), engagement_rate numeric not null check(engagement_rate between 0 and 100), rate_card jsonb not null default '{}'::jsonb, portfolio_links text[] not null default '{}', location text not null, bio text not null, profile_image_url text, status text not null default 'published' check(status in ('draft','published')), updated_at timestamptz not null default now());
create table public.brand_profiles (user_id uuid primary key references public.users(id) on delete cascade, business_name text not null, business_type text not null, budget_range text not null, location text not null, updated_at timestamptz not null default now());
create table public.conversations (id uuid primary key default gen_random_uuid(), brand_id uuid not null references public.users(id), influencer_id uuid not null references public.users(id), created_at timestamptz not null default now(), unique(brand_id,influencer_id), check(brand_id <> influencer_id));
create table public.messages (id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade, sender_id uuid not null references public.users(id), content text not null check(char_length(content) between 1 and 2000), sent_at timestamptz not null default now());
create index influencer_profiles_discovery_idx on public.influencer_profiles(status,niche,location,followers_count); create index messages_conversation_sent_idx on public.messages(conversation_id,sent_at);
alter table public.users enable row level security; alter table public.influencer_profiles enable row level security; alter table public.brand_profiles enable row level security; alter table public.conversations enable row level security; alter table public.messages enable row level security;
create policy "public published creators" on public.influencer_profiles for select using (status='published' or user_id=auth.uid());
create policy "creator owns profile" on public.influencer_profiles for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "users read self" on public.users for select using (id=auth.uid()); create policy "users update self" on public.users for update using (id=auth.uid()) with check (id=auth.uid());
create policy "brand owns profile" on public.brand_profiles for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy "participants read conversations" on public.conversations for select using (brand_id=auth.uid() or influencer_id=auth.uid());
create policy "participants read messages" on public.messages for select using (exists(select 1 from public.conversations c where c.id=conversation_id and (c.brand_id=auth.uid() or c.influencer_id=auth.uid())));
create policy "participants send messages" on public.messages for insert with check (sender_id=auth.uid() and exists(select 1 from public.conversations c where c.id=conversation_id and (c.brand_id=auth.uid() or c.influencer_id=auth.uid())));
alter publication supabase_realtime add table public.messages;

-- Profile images are the only Phase 1 file upload. Each user may write only under their UUID prefix.
insert into storage.buckets (id, name, public) values ('profile-images', 'profile-images', true) on conflict (id) do nothing;
create policy "users upload own profile images" on storage.objects for insert to authenticated with check (bucket_id='profile-images' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "public reads profile images" on storage.objects for select using (bucket_id='profile-images');
