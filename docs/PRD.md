# Product Requirements Document (PRD)
## Influencer–Brand Marketplace

---

### 1. Overview
A two-sided marketplace connecting **small/local brands** with **influencers** for marketing collaborations. Influencers create a profile listing their niche, reach, and rates. Brands browse profiles or post campaign requirements. Either side can initiate contact through in-app messaging — no need to hunt for personal contact details or cold-DM on Instagram.

### 2. Problem Statement
- Small brands don't have easy access to a curated list of influencers relevant to their niche/budget — they rely on random Instagram searching and cold outreach.
- Influencers (especially micro/nano) struggle to find brands willing to collaborate at their scale, and have no central place to showcase their rate card and past work.
- No lightweight, India-focused platform currently serves this specific small-brand + micro-influencer segment well.

### 3. Goals
- Let influencers create a discoverable profile (niche, followers, engagement, rate card, portfolio).
- Let brands search/filter influencers and initiate contact directly.
- Let brands post a campaign ("looking for a food blogger, budget ₹2000, Sholapur") that influencers can browse and apply to.
- Enable trust through a review/rating system after collaboration.

### 4. Target Users / Personas
**Persona A — Small Brand Owner**
- Runs a local business (cafe, clothing brand, gym, etc.)
- Limited marketing budget, wants affordable local influencers
- Not tech-savvy, needs a simple browsing/filtering experience

**Persona B — Micro/Nano Influencer**
- 1K–50K followers, niche content creator
- Wants paid brand collabs but has no visibility
- Needs an easy way to showcase rates and past work

### 5. Core User Stories
- As a brand, I can create a profile and post what kind of influencer I need.
- As a brand, I can search/filter influencers by niche, location, follower range, and budget.
- As a brand, I can message an influencer directly from their profile.
- As an influencer, I can create a profile with my niche, stats, and rate card.
- As an influencer, I can browse open campaigns and apply/message the brand.
- As either user, I can rate/review the other after a collaboration is marked complete.

### 6. Feature Scope

**MVP (Phase 1)**
- Auth with role selection (Brand / Influencer)
- Influencer profile creation (niche, followers, engagement %, rate card, portfolio links)
- Brand profile creation (business name, type, budget range)
- Influencer discovery page with filters (niche, location, follower range)
- Direct in-app messaging (1:1 chat)

**Phase 2**
- Campaign/post board (brand posts a requirement, influencers apply)
- Rating & review system post-collaboration
- Saved/favorite influencer list for brands
- Notification system (new message, new application)

**Phase 3 (later)**
- In-app payment/escrow for collab payment
- Verified badge for influencers (follower count verification via API)
- Analytics dashboard for brands (campaign performance)

### 7. Out of Scope (for now)
- Automated follower-count verification via Instagram/YouTube API (manual entry for MVP)
- Payment gateway integration
- Multi-language support

### 8. Success Metrics
- Number of influencer + brand signups
- Number of messages/conversations initiated
- Number of completed collaborations (marked by both parties)
- Repeat usage rate (brand posting more than one campaign)

### 9. Assumptions & Constraints
- Solo/small team build — MVP must be lean and fast to ship
- Manual data entry acceptable for MVP (no third-party API dependency initially)
- Target initial audience: local/regional small brands and micro-influencers, not celebrity-tier creators
