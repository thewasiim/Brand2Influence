-- Migration 003: Brand Campaigns / Advertisements and Campaign Inquiry Messaging

-- Create Campaigns / Advertisements table
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 200),
  description text not null check (char_length(description) between 10 and 5000),
  niche text not null check (char_length(niche) between 2 and 100),
  platform text not null default 'Instagram' check (char_length(platform) between 2 and 50),
  deliverables text[] not null default '{}',
  budget_range text not null check (char_length(budget_range) between 2 and 100),
  location text not null default 'Remote / All India' check (char_length(location) between 2 and 100),
  target_followers_min integer not null default 0 check (target_followers_min >= 0),
  status text not null default 'active' check (status in ('active', 'paused', 'closed', 'draft')),
  deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add campaign_id column to conversations for context
alter table public.conversations 
add column if not exists campaign_id uuid references public.campaigns(id) on delete set null;

-- Indexes for efficient filtering and discovery
create index if not exists campaigns_discovery_idx 
on public.campaigns(status, niche, platform, created_at desc);

create index if not exists campaigns_brand_idx 
on public.campaigns(brand_id, created_at desc);

create index if not exists conversations_campaign_idx 
on public.conversations(campaign_id);

-- Row Level Security for campaigns
alter table public.campaigns enable row level security;

-- Public/Authenticated users can view active and paused campaigns (for marketplace discovery)
create policy "public read active campaigns" 
on public.campaigns for select 
using (status in ('active', 'paused') or brand_id = auth.uid());

-- Brands can insert their own campaigns
create policy "brand insert own campaigns" 
on public.campaigns for insert 
with check (brand_id = auth.uid());

-- Brands can update their own campaigns
create policy "brand update own campaigns" 
on public.campaigns for update 
using (brand_id = auth.uid()) 
with check (brand_id = auth.uid());

-- Brands can delete their own campaigns
create policy "brand delete own campaigns" 
on public.campaigns for delete 
using (brand_id = auth.uid());

-- Optional Seed Data for Demo & Initial Discovery:
-- Inserts initial sample brand campaign advertisements if none exist.
insert into public.campaigns (brand_id, title, description, niche, platform, deliverables, budget_range, location, target_followers_min, status)
select 
  id as brand_id,
  'Specialty Coffee & Cold Brew Aesthetic Reels',
  'We are looking for food, lifestyle, and coffee enthusiast creators to create aesthetic morning routine reels showcasing our new Cold Brew cans & Monsoon blend beans. Highlight the brewing experience, taste profile, and morning productivity aesthetic.',
  'Food & Beverage',
  'Instagram',
  array['1 Dedicated Instagram Reel (30-60s)', '2 Instagram Stories with Swipe Link', 'Product Aesthetic Photo'],
  '₹6,000–₹12,000',
  'Mumbai / Delhi NCR / Bengaluru',
  5000,
  'active'
from public.users limit 1
on conflict do nothing;

