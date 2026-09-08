# Design Requirements Document
## Influencer–Brand Marketplace — Bento + Minimal UI

---

### 1. Design Philosophy
- **Bento grid layout**: content organized into modular, rounded rectangular blocks of varying sizes (like an Apple-keynote bento grid) — used for dashboards, profile displays, and landing page feature sections.
- **Minimal**: generous white space, restrained color palette, no unnecessary decoration, strong typography hierarchy instead of heavy visual elements.
- Overall feel: clean, modern SaaS-like — trustworthy for brands, aspirational/creative for influencers.

### 2. Color Palette (suggested)
- Background: off-white / near-white (`#FAFAFA`)
- Primary accent: one bold color for CTAs (e.g. deep indigo `#4F46E5` or warm coral `#FF5C5C`) — pick ONE, don't mix multiple bold accents
- Text: near-black (`#111111`) for headings, mid-gray (`#6B7280`) for secondary text
- Card backgrounds: white with soft border (`#E5E7EB`) or very subtle shadow — no heavy drop shadows
- Bento block backgrounds: alternate white / very light tint of accent color for visual rhythm

### 3. Typography
- One clean sans-serif font family throughout (e.g. Inter, Manrope, or Satoshi)
- Large, bold headings (36–48px on desktop) for landing sections
- Body text 14–16px, generous line-height (1.5–1.6)
- Avoid more than 2 font weights (e.g. Regular + Semibold)

### 4. Bento Grid Usage
- **Landing page**: hero section + a bento grid below showing feature highlights (e.g. "Discover Influencers", "Post a Campaign", "Chat Directly", "Track Reviews") — each in its own card, varying sizes (one large 2x1 card, others 1x1).
- **Influencer discovery page**: influencer cards arranged in a bento/masonry-style grid — photo, name, niche tag, follower count, rate — rather than a plain uniform table.
- **Dashboard**: stats (active chats, profile views, campaigns) shown as small bento tiles at the top.

### 5. Core Components Needed
- Profile card (influencer) — photo, name, niche tags, followers, rate badge
- Profile card (brand) — logo, business name, type, budget badge
- Filter sidebar/bar — niche dropdown, follower range slider, location input
- Chat UI — simple two-pane (conversation list + message thread), rounded message bubbles
- Campaign post card — title, budget, niche tag, deadline, "Apply" button
- Empty states — friendly illustration/message for "no results", "no messages yet"

### 6. Page List (for wireframing)
1. Landing / marketing page (bento feature grid + CTA)
2. Signup/login (role selection: Brand / Influencer)
3. Profile creation/edit (form)
4. Discovery page (grid + filters)
5. Single profile view (public)
6. Campaign board (list + post-a-campaign form) — Phase 2
7. Messages/chat page
8. Dashboard (stats, my profile, my conversations)

### 7. Reference Inspiration (style direction, not to copy content)
- Linear.app — minimal SaaS UI, restrained color, clean typography
- Apple product pages — bento grid layout pattern
- Cred / Notion — soft minimal cards with subtle borders instead of heavy shadows

### 8. Design Don'ts
- Don't use more than one bold accent color
- Don't use heavy skeuomorphic shadows/gradients
- Don't overcrowd bento cards with text — one clear idea per card
- Don't use stock-photo-heavy hero sections — prefer illustration or clean product screenshots
