-- Migration 004: Enhanced User Profiles, Pincode, and Social Metrics
-- Documents optional column additions for Postgres / Supabase SQL Editor.
-- Note: Our application layer also stores extended metrics in jsonb (rate_card) 
-- and formatted location fields to guarantee immediate out-of-the-box compatibility.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city text;

ALTER TABLE public.influencer_profiles ADD COLUMN IF NOT EXISTS instagram_handle text;
ALTER TABLE public.influencer_profiles ADD COLUMN IF NOT EXISTS facebook_followers integer DEFAULT 0;
ALTER TABLE public.influencer_profiles ADD COLUMN IF NOT EXISTS youtube_subscribers integer DEFAULT 0;
ALTER TABLE public.influencer_profiles ADD COLUMN IF NOT EXISTS pincode text;

ALTER TABLE public.brand_profiles ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE public.brand_profiles ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.brand_profiles ADD COLUMN IF NOT EXISTS pincode text;
