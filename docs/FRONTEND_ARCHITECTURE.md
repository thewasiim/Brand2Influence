# Frontend Architecture
## Influencer–Brand Marketplace

This document defines the React + Tailwind CSS client for the Phase 1 MVP described in the PRD, TRD, and User Flows. Campaigns, applications, reviews, payments, verification, and notifications remain Phase 2/3 work and are not implemented by this architecture.

## Responsibilities

The frontend is a single-page React application responsible for:

- Public marketing and creator discovery.
- Supabase Auth sign-up, login, session recovery, and role selection.
- Role-specific guided profile completion and editing.
- Calling the Express REST API for profile, discovery, and conversation operations.
- Direct Supabase Realtime subscription for messages after a conversation is authorized.
- Client-side interaction state; server remains the source of truth for persisted data.

## Component and Data Flow

```text
Browser
  |
  v
React application
  |-- Pages + reusable UI components
  |-- Auth/session provider (Supabase Auth)
  |-- API client (Bearer token to Express)
  |-- Realtime message subscription (Supabase)
  |
  +--> Express API --> Supabase Postgres / Storage
  |
  +--> Supabase Auth + Realtime
```

```text
User action
  -> page component
  -> hook/store validates local UI state
  -> api client attaches current access token
  -> Express API
  -> response updates page state
  -> rendered component

New message
  -> authenticated Realtime subscription
  -> conversation/message state
  -> chat thread re-renders
```

## Directory Structure

```text
frontend/
  public/
  package.json
  src/
    assets/
    components/
    context/
    data/
    hooks/
    layouts/
    pages/
      LandingPage.jsx
    services/
    utils/
    main.jsx
    styles.css
```

The existing landing page is currently located at `frontend/src/pages/LandingPage.jsx`; it can be split into this structure incrementally as additional product pages are implemented. Existing visual components map directly to `Navbar`, `Hero`, `InfluencerSearch`, `InfluencerCard`, `RoleCard`, `CategoryTabs`, `HowItWorks`, `CampaignPreview`, `ValueCard`, `FinalCTA`, and `Footer`.

## Pages and Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page and CTA entry points |
| `/login`, `/signup` | Public | Auth forms; redirect if session already exists |
| `/onboarding/role` | Authenticated | Brand or influencer role selection |
| `/onboarding/profile` | Authenticated | Short required profile setup; supports draft save |
| `/discover` | Public | Filtered influencer discovery |
| `/influencers/:id` | Public | Public influencer profile and message CTA |
| `/messages` | Authenticated | Conversation list and selected thread |
| `/dashboard` | Authenticated | Role-aware MVP dashboard |
| `/profile` | Authenticated | Current user profile editing |

After onboarding, brands route to `/dashboard`; influencers route to `/discover`, matching Flow 4. Messaging is reachable from public influencer profiles and dashboard/discovery cards in no more than two interactions.

## Routing and Authorization

- Use the existing React application with a lightweight client router; no server-side route authorization is trusted.
- `RequireAuth` waits for Supabase session initialization, redirects unauthenticated users to `/login`, and retains the intended destination.
- `RequireRole` reads the `users.role` result supplied by the API and gates role-specific dashboard/profile experiences.
- Public profile routes never display phone or email.
- A `Message` CTA sends an unauthenticated user to login and resumes the intended creator/conversation action after authentication.

## State Management

Use React state and custom hooks; no global state dependency is required for the MVP.

| State | Owner | Persistence |
|---|---|---|
| Supabase session and user | `AuthProvider` | Supabase client session storage |
| Current user/profile/role | `AuthProvider` + API query | Server source of truth |
| Discovery filters, loading, results | `useInfluencerSearch` / Discovery page | URL query parameters for shareable searches |
| Profile form and draft state | Profile setup page | API draft/profile endpoint |
| Selected conversation/messages/composer | Messages page hooks | Server + Realtime |
| Landing-page filters/modal/navigation | Local component state | None |

Avoid duplicating all server records in global state. A successful mutation updates the local query/page state from its response; a failed mutation retains form state and presents an accessible error message.

## Supabase Integration

### Authentication

1. `supabase.auth.signUp` or `signInWithPassword` starts the session.
2. The frontend obtains the current `access_token` from the Supabase session.
3. The API client adds `Authorization: Bearer <access_token>` to protected Express calls.
4. Auth state listeners refresh UI and redirect on sign-out or expired sessions.
5. The service-role key is never included in browser code.

OAuth is permitted by the TRD as an auth option but is not required for the MVP UI. Email/password is sufficient for the initial implementation.

### Storage

Profile images and portfolio uploads use Supabase Storage only when upload UI is added. The client uploads only under the authenticated user’s permitted path; returned object URLs are stored through the profile API. Portfolio links remain simple user-provided URLs in Phase 1.

### Realtime Messaging

The chat page:

1. Loads authorized message history from `GET /messages/:conversationId`.
2. Subscribes to database changes for that conversation using Supabase Realtime.
3. Appends received messages idempotently by message ID.
4. Sends via `POST /messages` for validation and authorization; Realtime then delivers the authoritative inserted row to participants.
5. Unsubscribes on conversation change or page unmount.

This preserves the TRD decision: Express owns business validation while Supabase Realtime supplies low-latency delivery.

## API Layer

`lib/api.js` centralizes JSON parsing, auth headers, request cancellation, and consistent API error objects. Feature modules may expose functions such as:

```text
api.auth.signup(payload)
api.influencers.list({ niche, location, followersMin, followersMax, budget })
api.influencers.get(id)
api.influencers.saveProfile(payload)
api.brands.saveProfile(payload)
api.conversations.create({ influencerId })
api.conversations.list(userId)
api.messages.list(conversationId)
api.messages.send({ conversationId, content })
```

Discovery filters should be sent as query parameters. Input values are debounced for text search, and filter changes cancel superseded requests. The frontend does not compute authorization or expose protected contact fields.

## MVP Screen Flows

```text
Landing CTA
  -> Login / Signup
  -> Role selection
  -> Short profile setup (draft permitted)
  -> Brand dashboard OR influencer discovery

Brand dashboard / Discovery
  -> filter creators
  -> influencer public profile
  -> Message CTA
  -> existing or newly created conversation
  -> Messages page

Influencer setup
  -> profile saved
  -> profile becomes visible in discovery
  -> Messages page when contacted
```

## Accessibility and UI Requirements

- Use semantic buttons, labels, headings, landmarks, visible focus styles, and keyboard-operated cards/menus.
- Preserve focus in dialogs and return it to the invoking CTA on close.
- Respect `prefers-reduced-motion`; animations must not be required to understand content.
- Use responsive grids and navigation across mobile, tablet, and desktop sizes.
- Tailwind utility classes should use the existing dark/minimal tokens consistently; component-specific custom CSS is acceptable only for effects that utilities cannot express cleanly.

## Error and Empty States

Every network-driven page includes loading, retry, empty, and failure states. Discovery should explain when filters yield no results. Messaging must distinguish unavailable conversations, authorization failures, and transient send failures without losing unsent text.
