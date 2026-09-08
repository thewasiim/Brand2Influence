# Technical Requirements Document (TRD)
## Influencer–Brand Marketplace

---

### 1. Tech Stack
| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + Tailwind CSS | Consistent with prior projects; fast to style bento/minimal UI |
| Backend | Node.js + Express | REST API layer |
| Database + Auth | Supabase (Postgres) | Handles auth, DB, and realtime out of the box |
| Realtime messaging | Supabase Realtime (Postgres changes) | No separate socket server needed for MVP |
| Hosting | Vercel (frontend) + Render/Railway (backend) or Supabase Edge Functions | Cheap/free tier friendly |
| File storage | Supabase Storage | Profile photos, portfolio images |

### 2. High-Level Architecture
```
[React + Tailwind SPA]
        |
        | REST API (fetch/axios)
        v
[Node.js + Express Server]
        |
        | Supabase client (service role)
        v
[Supabase: Postgres DB + Auth + Realtime + Storage]
```
- Frontend talks to Express API for business logic (validation, filtering, matching).
- Auth handled by Supabase Auth (JWT), verified in Express middleware.
- Messaging can go frontend → Supabase Realtime directly (no need to route through Express) for lower latency.

### 3. Database Schema (Core Tables)

**users**
- id (uuid, pk, from Supabase auth)
- role (enum: 'brand' | 'influencer')
- name, email, phone, created_at

**influencer_profiles**
- user_id (fk → users.id)
- niche (text / array)
- followers_count (int)
- engagement_rate (float)
- rate_card (jsonb — e.g. {"post": 500, "reel": 1500, "story": 300})
- portfolio_links (text[])
- location (text)
- bio (text)

**brand_profiles**
- user_id (fk → users.id)
- business_name (text)
- business_type (text)
- budget_range (text)
- location (text)

**campaigns** (Phase 2)
- id, brand_id (fk), title, description
- niche_required, budget, deadline, status (open/closed)

**applications** (Phase 2)
- id, campaign_id (fk), influencer_id (fk), status (pending/accepted/rejected)

**conversations**
- id, brand_id, influencer_id, created_at

**messages**
- id, conversation_id (fk), sender_id, content, sent_at

**reviews** (Phase 2)
- id, reviewer_id, reviewee_id, rating (1–5), comment, collab_id

### 4. API Endpoints (MVP)
```
POST   /auth/signup                → create user + role
POST   /auth/login

GET    /influencers                → list/search/filter influencers
GET    /influencers/:id            → get single profile
POST   /influencers/profile        → create/update influencer profile

POST   /brands/profile             → create/update brand profile

POST   /conversations               → start a conversation
GET    /conversations/:userId       → list conversations for a user
POST   /messages                    → send message (or direct via Supabase Realtime)
GET    /messages/:conversationId    → fetch message history
```

### 5. Auth Flow
1. User signs up via Supabase Auth (email/password or OAuth).
2. On first login, user selects role (Brand / Influencer) → creates row in respective profile table.
3. Express middleware verifies Supabase JWT on protected routes.
4. Role stored in `users` table used to gate UI (brand dashboard vs influencer dashboard).

### 6. Non-Functional Requirements
- **Performance**: Discovery page filtering should respond in <500ms for up to ~10K influencer rows (use Postgres indexes on niche/location/followers_count).
- **Security**: Row-Level Security (RLS) policies in Supabase so users can only edit their own profile/messages.
- **Scalability**: MVP designed for a few thousand users; no need for microservices yet — a single Express service is enough.
- **Data privacy**: Personal contact info (phone/email) should not be shown publicly — only exchanged via in-app chat if both parties agree.

### 7. Open Technical Questions
- Do we verify follower counts manually (self-reported) or integrate Instagram Graph API later?
- Do messages need read-receipts / online-status for MVP, or keep it simple text-only?
