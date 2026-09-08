# Backend Architecture
## Influencer–Brand Marketplace

This document defines the Node.js + Express API and Supabase/PostgreSQL architecture for the Phase 1 MVP. It follows the existing TRD and User Flows. Campaigns, applications, reviews, favorites, notifications, payments, analytics, and verification are explicitly excluded from this implementation.

## System Architecture

```text
React + Tailwind client
  |  Authorization: Bearer <Supabase JWT>
  |  REST: profiles, discovery, conversations, messages
  v
Node.js / Express API
  |-- JWT authentication middleware
  |-- request validation + role authorization
  |-- controllers -> services -> Supabase data client
  v
Supabase
  |-- Auth (users and JWT issuance)
  |-- Postgres (application data + RLS)
  |-- Realtime (authorized message changes)
  |-- Storage (future profile/portfolio files)
```

```text
Authenticated request
  -> Express auth middleware verifies Supabase JWT
  -> controller validates request shape
  -> service enforces ownership / conversation membership
  -> Supabase Postgres executes under RLS-aware policy
  -> controller returns a DTO with public/private fields appropriate to caller
```

## Directory Structure

```text
backend/
  package.json
  src/
    app.js                       # Express app and middleware registration
    server.js                    # process startup
    config/
      env.js                     # required environment validation
      supabase.js                # service / request-scoped clients
    routes/
      auth.routes.js
      influencer.routes.js
      brand.routes.js
      conversation.routes.js
      message.routes.js
    controllers/
      auth.controller.js
      influencer.controller.js
      brand.controller.js
      conversation.controller.js
      message.controller.js
    services/
      auth.service.js
      influencer.service.js
      brand.service.js
      conversation.service.js
      message.service.js
    middleware/
      authenticate.js
      authorizeRole.js
      validate.js
      errorHandler.js
      notFound.js
    validators/
      auth.validator.js
      profile.validator.js
      conversation.validator.js
      message.validator.js
    mappers/
      influencer.mapper.js        # public profile DTOs
      conversation.mapper.js
    utils/
      ApiError.js
      pagination.js
  supabase/
    migrations/
    policies.sql
    indexes.sql
```

Controllers only translate HTTP to application calls. Services contain business rules. Database access is confined to services/configuration so authorization and data shape rules are not scattered across routes.

## API Surface (Phase 1)

| Method | Path | Auth | Behavior |
|---|---|---|---|
| `POST` | `/auth/signup` | No | Create Supabase auth user and application user/role setup |
| `POST` | `/auth/login` | No | Authenticate email/password; returns session data only if the API owns this convenience flow |
| `GET` | `/influencers` | No | Paginated discovery with niche, location, follower, and budget filters |
| `GET` | `/influencers/:id` | No | Public influencer profile; excludes private contact fields |
| `POST` | `/influencers/profile` | Influencer | Create/update own profile or draft |
| `POST` | `/brands/profile` | Brand | Create/update own brand profile |
| `POST` | `/conversations` | Brand/Influencer | Find or create one direct brand–influencer conversation |
| `GET` | `/conversations/:userId` | Owner | List conversations for that user only |
| `GET` | `/messages/:conversationId` | Participant | Return ordered message history |
| `POST` | `/messages` | Participant | Validate and insert a message |

The `signup`/`login` endpoints may delegate to Supabase Auth. The client should not receive a service-role credential. All protected endpoints require an access token even if a controller uses a privileged client for limited administrative work.

## Request Flow Diagrams

### Discovery

```text
Discovery UI
  -> GET /influencers?niche=&location=&followersMin=&followersMax=&budget=
  -> authenticate only if optional personalization is needed
  -> influencer service builds parameterized Supabase query
  -> Postgres indexes filter records
  -> public influencer DTO list
  -> UI renders cards
```

### Onboarding

```text
Signup -> Supabase Auth account + JWT
       -> role selection
       -> users row records role
       -> POST profile endpoint
       -> role ownership middleware
       -> influencer_profiles OR brand_profiles upsert
       -> redirect to discovery/dashboard
```

### Messaging

```text
Message CTA
  -> POST /conversations { influencerId / brandId }
  -> validate opposite role and create-or-return pair conversation
  -> GET /messages/:id for history
  -> Realtime subscription scoped to conversation
  -> POST /messages { conversationId, content }
  -> membership validation + insert
  -> Postgres change broadcast to both participants
```

## Auth and Authorization

### JWT Middleware

`authenticate` reads the bearer token, verifies it through Supabase Auth/JWT verification, and attaches the authenticated user ID to `req.auth`. It rejects missing, malformed, expired, and invalid tokens with `401` before controller execution.

`authorizeRole('brand')` and `authorizeRole('influencer')` load or use the trusted application role from `users`, not a role claimed by a client request. Conversation actions accept both roles but verify that the other participant is the opposite role.

### Ownership Rules

- A user can create/update only their own profile, keyed by their auth UUID.
- A brand may create a conversation only with an influencer; an influencer may initiate only with a brand.
- A conversation is unique per `brand_id` + `influencer_id`; a repeated request returns the existing conversation.
- Only conversation participants may list its messages or create messages in it.
- Public discovery/profile responses omit `users.email` and `users.phone`.

## Supabase and PostgreSQL

### Core Tables

The authoritative schema remains the TRD schema:

```text
users
  id (UUID, PK, Supabase auth user ID)
  role ('brand' | 'influencer')
  name, email, phone, created_at

influencer_profiles
  user_id (FK), niche, followers_count, engagement_rate,
  rate_card (JSONB), portfolio_links (text[]), location, bio

brand_profiles
  user_id (FK), business_name, business_type, budget_range, location

conversations
  id, brand_id (FK), influencer_id (FK), created_at

messages
  id, conversation_id (FK), sender_id (FK), content, sent_at
```

`campaigns`, `applications`, and `reviews` remain documented Phase 2 schema only; do not expose routes, workers, or UI mutation paths for them in MVP.

### Indexes

To meet the TRD’s discovery target, add indexes appropriate to deployed query patterns:

```text
influencer_profiles(location)
influencer_profiles(followers_count)
influencer_profiles(niche)
conversations(brand_id, influencer_id) UNIQUE
messages(conversation_id, sent_at)
```

Use an additional GIN index only if `niche` is implemented as an array and the actual discovery query needs array containment.

### Row-Level Security

Enable RLS on all application tables. Required policy intent:

| Table | Read | Insert/Update |
|---|---|---|
| `users` | User can read self; public views expose only safe profile data | User can update own allowed fields |
| `influencer_profiles` | Public read for completed discoverable profiles | Influencer owns matching `user_id` |
| `brand_profiles` | Public/safe display only where needed | Brand owns matching `user_id` |
| `conversations` | Brand or influencer participant | Only valid participant pair may be created |
| `messages` | Conversation participant only | Sender must be participant and equal `auth.uid()` |

For direct browser Realtime subscriptions, RLS must allow only participants to select the relevant `messages` rows. The server must not use the service role to bypass user-level ownership checks casually; where service role is necessary, the Express service enforces the same checks first.

## Validation and Error Handling

Validate all incoming request bodies and query parameters before services execute.

- Signup: normalized email, password policy, allowed role only.
- Influencer profile: non-negative integer followers, bounded engagement rate, allowed rate-card values, validated URLs, reasonable text lengths.
- Brand profile: required business name/type/location and bounded budget range string.
- Discovery: allowlisted niche/location values or safe text limits; integer bounds for follower and budget filters; pagination limits.
- Messages: existing participant conversation ID, non-empty trimmed content, maximum content length.

Return a consistent error body such as:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "A readable message", "fields": { "field": "reason" } } }
```

Use `400` for malformed input, `401` for unauthenticated, `403` for unauthorized, `404` when a resource is not visible to the caller, `409` for genuine uniqueness conflicts, and `500` only for unexpected server failures. Never return Supabase internal errors or secrets directly.

## Security Controls

- Keep Supabase URL, anon key, service-role key, and JWT settings in environment variables; the service-role key is server-only.
- Use TLS in deployment, CORS restricted to the frontend origin, and a conservative JSON body-size limit.
- Apply rate limiting to auth-related and message creation endpoints when the service is deployed; it is an Express configuration control, not a new product feature.
- Parameterize all database access through Supabase client APIs; never build raw SQL from request strings.
- Sanitize and length-limit user content before storage/display; React’s default escaping remains in place in the client.
- Log request IDs, status codes, and internal failures without logging access tokens, passwords, or message bodies.
- Use public DTO mappers to prevent accidental exposure of contact details or internal fields.

## Realtime Messaging

Express owns message authorization and insertion. Supabase Realtime broadcasts inserts from the `messages` table to clients already authorized by RLS. The client may reconnect and refetch history after a subscription error; the unique message ID prevents duplicate display.

Read receipts and online presence are intentionally excluded pending the TRD’s open MVP decision.

## Deployment Boundaries

```text
Vercel: React + Tailwind static SPA
Render/Railway: Node + Express API
Supabase: Auth, Postgres, Realtime, Storage
```

The system is intentionally one Express service for the initial few-thousand-user scale. No microservices, queues, payment systems, third-party social APIs, or backend services beyond the TRD are introduced.
