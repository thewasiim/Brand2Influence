# BrandHUB Authentication & Onboarding Process — Complete Specification (English)

> **Document Type:** System Architecture & Functional Specification  
> **Target System:** BrandHUB (Brand2Influence Platform)  
> **Language:** English  
> **Status:** Final Proposed Architecture  
> **Reference Model:** Inspired by Instagram's multi-step authentication, onboarding flows, and social identity verification.

---

## Table of Contents

1. [Executive Summary & Core Objectives](#1-executive-summary--core-objectives)
2. [Core Terminology & Concepts](#2-core-terminology--concepts)
3. [Master Authentication Architecture](#3-master-authentication-architecture)
4. [Phase 1: Entry Point (Sign In vs Create Account)](#4-phase-1-entry-point-sign-in-vs-create-account)
5. [Phase 2: Account Creation (Sign Up Flow)](#5-phase-2-account-creation-sign-up-flow)
6. [Phase 3: Proper OTP Verification Process](#6-phase-3-proper-otp-verification-process)
7. [Phase 4: User-Based Role Selection (Branching Process)](#7-phase-4-user-based-role-selection-branching-process)
8. [Phase 5: Mandatory Social Media Detail Collection (Instagram & Others)](#8-phase-5-mandatory-social-media-detail-collection-instagram--others)
9. [Phase 6: Total Followers Calculation & Profile Showcase](#9-phase-6-total-followers-calculation--profile-showcase)
10. [Sign In / Login Flow](#10-sign-in--login-flow)
11. [Password Recovery (Forgot Password Flow)](#11-password-recovery-forgot-password-flow)
12. [Logout & Session Termination Flow](#12-logout--session-termination-flow)
13. [Developer Perspective & Backend Design](#13-developer-perspective--backend-design)
14. [Complete Database Schema (PostgreSQL / Supabase / MongoDB)](#14-complete-database-schema-postgresql--supabase--mongodb)
15. [REST API Specifications](#15-rest-api-specifications)
16. [Security & Abuse Prevention Best Practices](#16-security--abuse-prevention-best-practices)
17. [Comprehensive Flowcharts & Diagrams](#17-comprehensive-flowcharts--diagrams)
18. [Quick Revision & Status Reference Matrix](#18-quick-revision--status-reference-matrix)

---

## 1. Executive Summary & Core Objectives

BrandHUB is an influencer marketing and creator collaboration platform connecting **Content Creators / Influencers** with **Brands, Agencies, and Businesses**. 

To maintain platform trust, prevent fake accounts, and ensure high-value campaign matchmaking, our onboarding experience requires:
1. **Frictionless Entry:** Clear dual-path entry with **Sign In** for existing users and **Create Account** for new users.
2. **Ironclad OTP Verification:** Guaranteed contact identity verification via Email and SMS/WhatsApp with rate-limiting, countdown timers, and brute-force defenses.
3. **Role-Based Onboarding:** Tailored setup paths for **Creators/Influencers** versus **Brands/Sponsors**.
4. **Mandatory Social Channel Linking:** A non-skippable requirement for creators to link their **Instagram profile** along with secondary channels (YouTube, TikTok, Twitter/X).
5. **Dynamic Follower Aggregation:** Automated calculation and real-time display of aggregate followers across all connected networks on the user's public profile and brand discovery cards.
6. **Enterprise Session & Security Lifecycle:** Secure JWT token rotation, HTTP-only cookies, password hashing with Argon2/Bcrypt, and comprehensive audit logs.

---

## 2. Core Terminology & Concepts

| Term | Definition in BrandHUB |
|---|---|
| **Sign Up** | The registration process where a new visitor creates an identity with email/phone, username, and password. |
| **Sign In / Login** | Verification of existing credentials (email/username + password or OAuth) to start an authorized session. |
| **OTP (One-Time Password)** | A cryptographically generated 6-digit numeric token valid for a short window (e.g., 5 minutes) to verify contact ownership. |
| **Role-Based Routing** | Directing users to specialized experiences based on their intent (`influencer` vs `brand` vs `admin`). |
| **Primary Social Channel** | The required Instagram handle that forms the foundation of the creator's portfolio. |
| **Secondary Social Channels** | Optional or complementary channels (YouTube, TikTok, X/Twitter, Twitch, LinkedIn). |
| **Total Reach / Followers** | The aggregate sum of verified followers and subscribers across all active linked social platforms. |
| **JWT Access & Refresh Tokens** | Short-lived Access Token (15 mins) for API authorization and long-lived Refresh Token (7–30 days) stored in secure HTTP-only cookies. |
| **Account State Machine** | Sequential account statuses: `PENDING_VERIFICATION` → `VERIFIED` → `ONBOARDING_ROLE` → `ONBOARDING_SOCIALS` → `ACTIVE`. |

---

## 3. Master Authentication Architecture

The high-level user progression from landing to an active dashboard:

```text
                           [ BrandHUB Landing / Auth Gateway ]
                                         |
                +------------------------+------------------------+
                |                                                 |
         [ Create Account ]                                 [ Sign In ]
                |                                                 |
   Step 1: Basic Credentials                          Step 1: Enter Username/Email
   (Name, Email/Phone, Pass)                                  + Password
                |                                                 |
   Step 2: Mandatory OTP Verification                 Step 2: Credential Check
   (Email / SMS 6-Digit Code)                                     |
                |                                      +----------+----------+
   Step 3: Role Selection                              | Valid               | Invalid
   (Influencer  VS  Brand)                             v                     v
                |                                  Dashboard            Error Message
   +------------+------------+                    (Role-based)        / Forgot Password
   |                         |
[ Influencer Flow ]     [ Brand Flow ]
   |                         |
Step 4: MANDATORY       Step 4: Business Setup
Social Linking          (Brand Name, Website,
(Instagram handle,      Budget, Category)
Followers, Category,         |
YouTube, TikTok)             |
   |                         |
Step 5: Follower             |
Aggregator & Profile         |
   |                         |
   +------------+------------+
                |
     [ ACTIVE USER STATUS ]
                |
     [ Customized Dashboard ]
```

---

## 4. Phase 1: Entry Point (Sign In vs Create Account)

When a user visits BrandHUB or navigates to `/auth`, they are greeted by a unified, modern split-screen or modal interface with clear visual hierarchy.

### 4.1 Interface Layout & Options
1. **Brand Branding & Value Proposition:** Highlighting creators, campaigns, and secure collaborations.
2. **Primary Tabbed Toggle:**
   - **"Sign In"** (Default for returning users)
   - **"Create Account"** (Default for first-time visitors or CTA clicks)
3. **Alternative Quick Authentication (OAuth 2.0):**
   - "Continue with Google"
   - Direct integration preserving role assignment through OAuth callback parameters.

---

## 5. Phase 2: Account Creation (Sign Up Flow)

### 5.1 Registration Fields (Step 1)
To keep drop-off rates low, initial registration captures essential credentials only:

| Field Name | Type | Validation Rules | Purpose |
|---|---|---|---|
| `fullName` | Text | 2 to 60 characters, alphabetic & spaces | Display name on profile & invoices |
| `username` | Text | 3 to 30 characters, alphanumeric + `_` + `.`, lowercase only | Unique handle on BrandHUB (`brandhub.io/@username`) |
| `email` | Email | Valid RFC 5322 format, uniqueness check against database | Primary communication & OTP destination |
| `phone` | Phone | E.164 international format (e.g., `+919876543210`) | SMS OTP fallback & business verification |
| `password` | Password | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character | Primary credential (stored hashed) |
| `termsAccepted` | Boolean | Must be `true` | Legal compliance & Terms of Service agreement |

### 5.2 Real-Time Validations (Client-Side UX)
- **Live Username Availability Indicator:** Debounced API call (`/api/auth/check-username?username=xyz`) checking uniqueness in real time with green checkmark / red error.
- **Password Strength Meter:** Visual bar indicating Weak, Fair, Strong, or Excellent with live checklist.

### 5.3 Backend Action on Submit
1. System validates inputs and checks for duplicates.
2. Creates an unverified record in the `users` table with status `PENDING_OTP`.
3. Hashes password using **Argon2id** (or Bcrypt with salt rounds = 12).
4. Generates a secure 6-digit numeric OTP.
5. Sends OTP to user's registered Email (and optional SMS).
6. Automatically navigates user to the **OTP Verification Screen**.

---

## 6. Phase 3: Proper OTP Verification Process

Account verification is **strictly enforced** before any profile or social data can be submitted. This prevents spam bots and ensures authentic creators.

```text
    +-------------------------------------------------------------+
    |                    Enter Verification Code                  |
    |                                                             |
    |   We have sent a 6-digit code to:                           |
    |   w***@example.com / +91-98765*****                         |
    |                                                             |
    |      [ 4 ]  [ 8 ]  [ 1 ]  [ 9 ]  [ 2 ]  [ 0 ]               |
    |                                                             |
    |   Code expires in: 04:45                                    |
    |   Didn't receive code? Resend in (52s)                      |
    |                                                             |
    |                [ Verify & Continue ]                        |
    +-------------------------------------------------------------+
```

### 6.1 OTP Security Rules & Specifications
- **Code Format:** 6 numeric digits (`000000` to `999999`) generated via cryptographically secure random number generator (`crypto.randomInt(100000, 999999)`).
- **Time To Live (TTL):** Exactly **5 minutes** (300 seconds) from generation.
- **Resend Cooldown:** **60 seconds** cooldown timer before the user can click "Resend OTP".
- **Maximum Attempts:** Maximum **5 incorrect attempts** allowed per OTP session. Upon 5 failed attempts, the code is invalidated, and the user must request a new OTP.
- **Storage Strategy:** OTPs are never stored in plain text. A cryptographic hash `sha256(otp + secret_salt)` is stored in the `otp_verifications` table with timestamps.
- **Single-Use Guarantee:** Once verified, the OTP record is marked `is_consumed = TRUE` and cannot be reused.

### 6.2 Step-by-Step Flow:
1. **User lands on OTP screen:** Input box is auto-focused on the first box with auto-advance and paste support (pasting `123456` fills all 6 boxes).
2. **Submit OTP:** Frontend sends `POST /api/auth/verify-otp` with `{ userId, otp }`.
3. **Backend verification:**
   - Checks if user exists and is not locked.
   - Checks if current time is within `expires_at`.
   - Compares hash. If matched, updates `users.email_verified = true` and `users.account_status = 'VERIFIED'`.
   - Issues onboarding session token.
4. **Transition:** Redirects user immediately to **Phase 4: Role Selection**.

---

## 7. Phase 4: User-Based Role Selection (Branching Process)

BrandHUB accommodates two distinct user types. Immediately following OTP verification, the user chooses their primary account type:

```text
                  +----------------------------------+
                  |    What describes you best?      |
                  +----------------------------------+
                                   |
         +-------------------------+-------------------------+
         |                                                   |
         v                                                   v
+-----------------------------+             +-----------------------------+
|    INFLUENCER / CREATOR     |             |      BRAND / BUSINESS       |
|                             |             |                             |
|  - I create content         |             |  - I want to hire creators  |
|  - Connect Instagram & more |             |  - Post campaign briefs     |
|  - Earn from brand deals    |             |  - Track ROI & engagement   |
|                             |             |                             |
|       [ Select Creator ]    |             |        [ Select Brand ]     |
+-----------------------------+             +-----------------------------+
```

### 7.1 Path A: Influencer / Content Creator
- Sets `user.role = 'INFLUENCER'`.
- Proceeds directly to **Phase 5: Mandatory Social Media Detail Collection**.

### 7.2 Path B: Brand / Business / Agency
- Sets `user.role = 'BRAND'`.
- Proceeds to **Company Profile Setup**:
  - Company/Brand Name, Industry/Niche, Official Website URL, Monthly Marketing Budget, Contact Designation.
  - Skips personal social follower aggregation and routes to Brand Dashboard to create campaigns.

---

## 8. Phase 5: Mandatory Social Media Detail Collection (Instagram & Others)

> **Mandatory Rule:** An Influencer account cannot be completed without providing their active **Instagram** profile details.

Creators monetize their influence through their social audience. BrandHUB requires structured social media credentials to verify authenticity and calculate platform reach.

```text
+-------------------------------------------------------------------+
|               Step 4 of 5: Connect Your Social Channels           |
|                                                                   |
|  [*] Mandatory Channel: Instagram                                 |
|  ---------------------------------------------------------------  |
|  Instagram Handle:     @ [ iamwasim_official                   ]  |
|  Profile Link:           [ https://instagram.com/iamwasim_...   ]  |
|  Primary Category:     v [ Fashion & Lifestyle                 ]  |
|  Follower Count:         [ 145,000                             ]  |
|  Engagement Rate (%):    [ 4.2%                                ]  |
|  Profile Screenshot / Verification: [ Upload Proof / Connect IG ] |
|                                                                   |
|  [+] Secondary Channels (Expand Reach):                           |
|  ---------------------------------------------------------------  |
|  YouTube Channel:      @ [ WasimVlogs            ]  Subs: [ 50K ] |
|  TikTok Handle:        @ [ wasim_tok             ]  Foll: [ 85K ] |
|  Twitter / X:          @ [ wasim_tweets          ]  Foll: [ 12K ] |
|  LinkedIn Profile:       [ https://linkedin.com/...            ] |
|                                                                   |
|                   [ Save & Calculate Total Reach ]                |
+-------------------------------------------------------------------+
```

### 8.1 Detailed Fields Collected per Channel

#### 1. Instagram (Required)
- **Handle/Username:** e.g., `@travelwithalex` (Stripped of `@`, lowercase).
- **Public Profile URL:** Auto-generated `https://instagram.com/${handle}`.
- **Followers Count:** Numeric value representing total active followers.
- **Niche/Category:** Dropdown selection:
  - *Tech & Gadgets, Fashion & Beauty, Fitness & Health, Gaming, Food & Travel, Business & Finance, Entertainment & Comedy, Lifestyle, Education*.
- **Bio Snippet:** Creator's short description.
- **Verification Mode Options:**
  1. *Direct Handle & Metric Submission* (with optional screenshot proof for manual/AI QA).
  2. *Meta Graph API OAuth Connection* (automatic fetching of verified follower counts and reach insights).

#### 2. YouTube (Secondary / Optional)
- **Channel Name / Handle:** e.g., `@TechReviewer`
- **Subscribers Count:** Numeric integer.
- **Channel URL:** `https://youtube.com/@TechReviewer`.

#### 3. TikTok (Secondary / Optional)
- **Handle:** e.g., `@daily_cooks`
- **Followers Count:** Numeric integer.

#### 4. Twitter / X (Secondary / Optional)
- **Handle:** e.g., `@fin_expert`
- **Followers Count:** Numeric integer.

#### 5. Other Platforms (LinkedIn, Facebook, Twitch, Threads)
- Platform handle, URL, and follower count.

---

## 9. Phase 6: Total Followers Calculation & Profile Showcase

Once the social media channels are submitted, the backend system calculates the **Aggregate Follower Metric** (`totalFollowers`) and calculates the **Creator Tier**.

### 9.1 Follower Aggregation Formula

$$\text{Total Reach} = \text{Instagram Followers} + \sum_{i=1}^{n} \text{Secondary Channel Followers}_i$$

$$\text{Total Reach} = \text{IG Followers} + \text{YT Subscribers} + \text{TikTok Followers} + \text{X Followers}$$

#### Example Calculation:
- Instagram: `145,000`
- YouTube: `50,000`
- TikTok: `85,000`
- Twitter/X: `12,000`
- **Total Combined Reach:** **292,000 Followers**

### 9.2 Creator Tier Categorization

| Tier Name | Combined Follower Count Range | Platform Badge |
|---|---|---|
| **Nano Creator** | 1,000 to 9,999 | Bronze Creator Badge |
| **Micro Influencer** | 10,000 to 99,999 | Silver Creator Badge |
| **Mid-Tier Influencer** | 100,000 to 499,999 | Gold Creator Badge |
| **Macro Influencer** | 500,000 to 999,999 | Platinum Creator Badge |
| **Mega / Celebrity** | 1,000,000+ | Diamond Celebrity Verified Badge |

### 9.3 Public Profile & Discovery Display
On the creator's profile page and in brand search results:
- **Hero Metric Card:** Prominently displays **"292K Total Reach"** with animated count-up numbers.
- **Platform Breakdown Pills:**
  - 📸 Instagram: `145K`
  - 🎥 YouTube: `50K`
  - 🎵 TikTok: `85K`
  - 🐦 X: `12K`
- **Engagement Metric:** Display average cross-platform engagement rate (e.g., `4.2% Average Engagement`).
- **Direct Linkouts:** Clickable badges directing brands to verify the live social profiles.

---

## 10. Sign In / Login Flow

Existing users can log in via multiple identifiers without having to remember whether they registered with their username or email.

### 10.1 Multi-Identifier Resolution
The single identifier input field accepts:
1. **Email address** (`user@example.com`)
2. **Username** (`wasim_creator`)
3. **Phone number** (`+919876543210`)

### 10.2 Login Step Progression
```text
Start Sign In
      |
Enter Identifier (Email / Username / Phone) + Password
      |
Click "Sign In"
      |
Backend Resolves Identifier to User Record
      |
User Exists?
  |-- No  --> Return Generic Error: "Invalid credentials"
  |-- Yes --> Compare Password with Argon2/Bcrypt Hash
               |
          Password Correct?
            |-- No  --> Increment Failed Attempts counter
            |           If attempts >= 5, lock account for 15 mins
            |           Return "Invalid credentials"
            |-- Yes --> Reset Failed Attempts counter
                        |
                   Account Status Check
                     |-- PENDING_OTP --> Redirect to OTP Screen
                     |-- ONBOARDING  --> Redirect to resume incomplete step
                     |-- ACTIVE      --> Issue Tokens & Open Dashboard
```

### 10.3 "Remember Me" & Persistent Sessions
- Standard login issues a session cookie expiring after browser close.
- "Remember Me" sets a persistent refresh token cookie with a **30-day expiration** using cryptographically secure rotation.

---

## 11. Password Recovery (Forgot Password Flow)

If a user forgets their password, they can securely reset it via verified OTP:

```text
[ Click "Forgot Password?" ]
              |
[ Enter Registered Email or Phone ]
              |
[ System Generates & Sends 6-Digit Recovery OTP ]
              |
[ Enter Recovery OTP on Verify Screen ]
              |
OTP Valid & Within 5 mins?
  |-- No  --> Show Error / Allow Resend
  |-- Yes --> Issue Temporary Password Reset Grant Token
              |
[ Enter New Password + Confirm New Password ]
              |
[ Password Validated & Hashes Stored ]
              |
[ Invalidate All Active Sessions ]
              |
[ Show Success Message & Redirect to Sign In ]
```

---

## 12. Logout & Session Termination Flow

Logout must thoroughly destroy credentials both on the server and client to prevent session hijacking on shared or public devices.

### 12.1 Client-Side Actions:
1. Clear local memory/state (Redux / Zustand / React Context).
2. Remove any cached user profiles and permissions.
3. Call `POST /api/auth/logout`.

### 12.2 Server-Side Actions:
1. Invalidate the active `refresh_token` stored in the database.
2. Clear the HTTP-only cookie (`Set-Cookie: token=; Max-Age=0; Path=/; HttpOnly; Secure`).
3. Optional: Add active JWT access token to an in-memory Redis blacklist until its natural expiration.
4. Record logout event in security audit log.

### 12.3 "Log Out of All Devices" Option:
In user profile settings, a button titled **"Sign Out of All Other Devices"** invalidates all active session rows for `userId`, instantly terminating any stolen or stale sessions.

---

## 13. Developer Perspective & Backend Design

### 13.1 Architecture Overview
- **Backend Framework:** Node.js / Express.js (ES Modules)
- **Database:** PostgreSQL (with Supabase or Prisma/Drizzle ORM) or MongoDB
- **Password Hashing:** `argon2` or `bcryptjs` (salt factor 12)
- **Authentication Protocol:** JWT (JSON Web Tokens) with dual-token rotation
  - **Access Token:** Stored in Authorization header (`Bearer <token>`), 15-minute lifespan.
  - **Refresh Token:** Stored in secure `httpOnly`, `sameSite=strict`, `secure=true` cookie, 7 to 30-day lifespan.
- **OTP Delivery Services:**
  - *Email:* Nodemailer / Resend / SendGrid / AWS SES
  - *SMS / WhatsApp:* Twilio / Fast2SMS / MessageBird

---

## 14. Complete Database Schema (PostgreSQL / Supabase / MongoDB)

### 14.1 PostgreSQL / Supabase Schema (DDL)

```sql
-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('INFLUENCER', 'BRAND', 'ADMIN');
CREATE TYPE account_status AS ENUM ('PENDING_OTP', 'VERIFIED', 'ONBOARDING', 'ACTIVE', 'SUSPENDED');
CREATE TYPE creator_tier AS ENUM ('NANO', 'MICRO', 'MID_TIER', 'MACRO', 'MEGA');
CREATE TYPE otp_type AS ENUM ('SIGNUP_VERIFICATION', 'PASSWORD_RESET', 'LOGIN_2FA');

-- 2. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'INFLUENCER',
    account_status account_status DEFAULT 'PENDING_OTP',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. OTP VERIFICATIONS TABLE
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    identifier VARCHAR(255) NOT NULL, -- Email or phone
    otp_hash VARCHAR(255) NOT NULL,
    otp_type otp_type NOT NULL,
    attempts INT DEFAULT 0,
    is_consumed BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INFLUENCER PROFILES TABLE
CREATE TABLE influencer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    primary_category VARCHAR(100) NOT NULL,
    secondary_categories TEXT[],
    total_followers BIGINT DEFAULT 0,
    total_reach BIGINT DEFAULT 0,
    creator_tier creator_tier DEFAULT 'NANO',
    avg_engagement_rate NUMERIC(5,2) DEFAULT 0.0,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    is_verified_badge BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. SOCIAL ACCOUNTS TABLE (Instagram is Mandatory)
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'youtube', 'tiktok', 'twitter', 'linkedin'
    handle VARCHAR(100) NOT NULL,
    profile_url VARCHAR(255) NOT NULL,
    followers_count BIGINT DEFAULT 0,
    engagement_rate NUMERIC(5,2) DEFAULT 0.0,
    is_primary BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- 6. BRAND PROFILES TABLE (For Brand Role)
CREATE TABLE brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100),
    monthly_budget_range VARCHAR(50),
    designation VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. REFRESH TOKENS & SESSIONS TABLE
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE
);
```

---

## 15. REST API Specifications

### 15.1 Authentication Endpoints

#### 1. Register Account
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "fullName": "Wasim Akram",
  "username": "wasim_creator",
  "email": "wasim@example.com",
  "phone": "+919876543210",
  "password": "SecurePassword@2026",
  "termsAccepted": true
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully. Please verify your OTP.",
  "data": {
    "userId": "d741cb32-9ab2-4b2b-b6d4-89c0b1123456",
    "email": "wasim@example.com",
    "otpCooldownSeconds": 60,
    "nextStep": "VERIFY_OTP"
  }
}
```

---

#### 2. Verify OTP
- **Endpoint:** `POST /api/auth/verify-otp`
- **Access:** Public (with valid `userId`)
- **Request Body:**
```json
{
  "userId": "d741cb32-9ab2-4b2b-b6d4-89c0b1123456",
  "otp": "481920",
  "type": "SIGNUP_VERIFICATION"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Contact verified successfully.",
  "data": {
    "userId": "d741cb32-9ab2-4b2b-b6d4-89c0b1123456",
    "isEmailVerified": true,
    "nextStep": "ROLE_SELECTION",
    "onboardingToken": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
```

---

#### 3. Resend OTP
- **Endpoint:** `POST /api/auth/resend-otp`
- **Access:** Public (Rate-limited: 1 request per 60s)
- **Request Body:**
```json
{
  "userId": "d741cb32-9ab2-4b2b-b6d4-89c0b1123456",
  "type": "SIGNUP_VERIFICATION"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "A fresh 6-digit OTP has been sent.",
  "data": {
    "cooldownSeconds": 60,
    "expiresInSeconds": 300
  }
}
```

---

#### 4. Select Role
- **Endpoint:** `POST /api/auth/set-role`
- **Access:** Authenticated / Onboarding Token
- **Request Body:**
```json
{
  "role": "INFLUENCER" // or "BRAND"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "role": "INFLUENCER",
    "nextStep": "CONNECT_SOCIAL_ACCOUNTS"
  }
}
```

---

#### 5. Save Social Details & Calculate Total Followers (Mandatory IG Step)
- **Endpoint:** `POST /api/influencer/social-onboarding`
- **Access:** Authenticated (Influencer Role)
- **Request Body:**
```json
{
  "instagram": {
    "handle": "wasim_official",
    "followersCount": 145000,
    "category": "Fashion & Lifestyle",
    "profileUrl": "https://instagram.com/wasim_official",
    "bio": "Men's fashion, styling tips & lifestyle creator"
  },
  "otherChannels": [
    {
      "platform": "youtube",
      "handle": "WasimVlogs",
      "followersCount": 50000,
      "profileUrl": "https://youtube.com/@WasimVlogs"
    },
    {
      "platform": "tiktok",
      "handle": "wasim_tok",
      "followersCount": 85000,
      "profileUrl": "https://tiktok.com/@wasim_tok"
    },
    {
      "platform": "twitter",
      "handle": "wasim_tweets",
      "followersCount": 12000,
      "profileUrl": "https://x.com/wasim_tweets"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Social media channels connected and verified successfully.",
  "data": {
    "totalFollowers": 292000,
    "creatorTier": "MID_TIER",
    "badgeTitle": "Gold Influencer",
    "channelsConnected": 4,
    "accountStatus": "ACTIVE",
    "profileSummary": {
      "instagramFollowers": 145000,
      "youtubeSubscribers": 50000,
      "tiktokFollowers": 85000,
      "twitterFollowers": 12000
    }
  }
}
```

---

#### 6. User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "identifier": "wasim_creator", // Username, Email, or Phone
  "password": "SecurePassword@2026",
  "rememberMe": true
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "d741cb32-9ab2-4b2b-b6d4-89c0b1123456",
      "fullName": "Wasim Akram",
      "username": "wasim_creator",
      "email": "wasim@example.com",
      "role": "INFLUENCER",
      "accountStatus": "ACTIVE",
      "totalFollowers": 292000,
      "creatorTier": "MID_TIER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

---

#### 7. Logout
- **Endpoint:** `POST /api/auth/logout`
- **Access:** Authenticated
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out. Session destroyed."
}
```

---

## 16. Security & Abuse Prevention Best Practices

| Security Domain | Strategy Implemented |
|---|---|
| **Password Security** | Argon2id or Bcrypt (12 salt rounds), strict minimum complexity (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol). |
| **OTP Brute-Force Shield** | Limit max 5 failed attempts per OTP token. 60-second cooldown between resend requests. Expire in 300 seconds. |
| **Rate Limiting** | Limit `/api/auth/login` to 10 requests per minute per IP address. Block abusive IPs via `express-rate-limit`. |
| **Token Protection** | Refresh tokens stored exclusively in `HttpOnly`, `SameSite=Strict`, `Secure=true` cookies to prevent XSS theft. |
| **Input Sanitization** | Express validator sanitizes inputs against SQL Injection and NoSQL Injection; strict schema validation on social URLs. |
| **Social Spoof Prevention** | Mandatory Instagram handle formatting check; optional Meta Graph API OAuth token check for automated verification. |
| **Account Lockout** | After 5 consecutive failed passwords, the account is locked for 15 minutes, with email notification sent to the owner. |

---

## 17. Comprehensive Flowcharts & Diagrams

### 17.1 End-to-End Registration & Onboarding Lifecycle

```text
 [ Visitor Arrives ]
         |
 [ Select "Create Account" ]
         |
 [ Fill Name, Email, Phone, Username, Password ]
         |
 [ Submit Form ]
         |
 [ System Validates & Stores PENDING User ]
         |
 [ 6-Digit OTP Generated & Sent to Email / SMS ]
         |
 [ User Enters 6-Digit Code ]
         |
       Valid?
      /      \
    No        Yes
    |          |
 [Retry]  [ User Status = 'VERIFIED' ]
 (max 5)       |
          [ Select Role ]
          /             \
 [ INFLUENCER ]       [ BRAND ]
        |                 |
 [ MANDATORY IG STEP ] [ Company Details ]
  - Instagram handle      - Business name
  - Followers count       - Website
  - Niche Category        - Budget
  - Additional channels   - Campaign goals
    (YT, TikTok, X)       |
        |                 v
 [ Sum Total Followers ]  |
 [ Assign Creator Tier ]  |
        \                 /
     [ Account Status = 'ACTIVE' ]
                  |
     [ Redirect to Dashboard ]
```

---

### 17.2 Sign In & Session Management Flow

```text
 [ Visitor Visits Login ]
            |
 [ Enter Identifier & Password ]
            |
 [ Lookup User by Email, Username, or Phone ]
            |
   User Found?
    /         \
  No           Yes
  |             |
[Error]   [ Check Password Hash ]
                |
           Match?
           /     \
         No       Yes
         |         |
   [Attempts+1]  [ Reset Failed Counter ]
   [Lock if >=5]   |
                 [ Check Status ]
                   |-- PENDING_OTP --> Route to OTP Screen
                   |-- ONBOARDING  --> Route to Social Setup
                   |-- ACTIVE      --> Issue Tokens & Open Dashboard
```

---

## 18. Quick Revision & Status Reference Matrix

### 18.1 Key Feature Verification Checklist

| Requirement Feature | Implementation in BrandHUB | Mandatory? |
|---|---|:---:|
| **Sign In / Sign Up Front UI** | Tabbed switcher and dedicated landing options | Yes |
| **Role-Based Paths** | Influencer vs Brand selection immediately post-OTP | Yes |
| **Proper OTP Verification** | 6-digit code, 5-minute expiry, 60s cooldown, 5-try max | Yes |
| **Mandatory Instagram Detail** | Handle, profile URL, followers, niche category | **Yes (Required for Creators)** |
| **Secondary Social Media** | YouTube, TikTok, Twitter/X, LinkedIn | Optional / Recommended |
| **Total Followers Display** | Live aggregated metric on profile header + badge tier | Yes |
| **Forgot Password** | OTP-based identity verification before password update | Yes |
| **Secure Logout** | HTTP-only cookie clearing + DB session revoking | Yes |

### 18.2 Summary Formula for Success
- **Step 1:** Create Account with unique username & email.
- **Step 2:** Verify 6-digit OTP within 5 minutes.
- **Step 3:** Choose "Influencer" role.
- **Step 4:** Provide compulsory Instagram channel details + optional secondary networks.
- **Step 5:** System aggregates total reach and awards verified creator tier badge on profile!

---

*Document Author: Antigravity Engineering Team*  
*Project: BrandHUB (Brand2Influence)*  
*File Reference: `brandhub_authentication_and_onboarding_guide.md`*
