# User Flows Document
## Influencer–Brand Marketplace

*(This is the file most people forget — but it's what actually connects the PRD, TRD, and Design docs into a buildable sequence. Use this to design wireframes screen-by-screen.)*

---

### Flow 1: Brand — Find & Contact an Influencer
1. Brand signs up → selects "Brand" role
2. Fills brand profile (business name, type, budget range, location)
3. Lands on Discovery page → applies filters (niche, location, follower range)
4. Opens an influencer's public profile
5. Clicks "Message" → chat thread opens
6. Discusses collab details in-app
7. (Phase 2) Marks collab as "Completed" → leaves a review

### Flow 2: Influencer — Get Discovered & Apply
1. Influencer signs up → selects "Influencer" role
2. Fills profile (niche, followers, engagement rate, rate card, portfolio links)
3. Profile becomes visible on Discovery page
4. (Phase 2) Browses open Campaign posts → applies to relevant ones
5. Receives message from brand (either from profile view or campaign application)
6. Discusses & agrees to collab
7. (Phase 2) Marks collab as "Completed" → leaves a review

### Flow 3: Brand — Post a Campaign (Phase 2)
1. Brand logs in → Dashboard → "Post a Campaign"
2. Fills form: title, niche required, budget, deadline, description
3. Campaign appears on public Campaign Board
4. Influencers apply → brand sees list of applicants on dashboard
5. Brand reviews applicants → messages the ones they like
6. Brand marks campaign as "Closed" once filled

### Flow 4: First-time Onboarding (either role)
1. Landing page → "Get Started"
2. Choose role: Brand or Influencer
3. Basic signup (email/password)
4. Guided profile-completion form (short, 3–4 fields minimum to get listed, rest optional)
5. Redirect to Discovery page (influencer) or Dashboard (brand)

### Flow 5: Messaging (shared by both roles)
1. User clicks "Message" from a profile or campaign application
2. If no existing conversation → new conversation created
3. Chat page shows conversation list (left) + active thread (right)
4. Real-time message delivery via Supabase Realtime
5. (Phase 2) Notification badge shown for unread messages

---

### Notes for Wireframing
- Every flow should be completable in **under 5 screens** for MVP — don't over-engineer onboarding.
- Profile creation should allow "save as draft" — don't force all fields at once, or users will drop off.
- Chat should always be reachable in **max 2 clicks** from any profile or campaign card — it's the core action of the whole app.
