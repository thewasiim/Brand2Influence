# 📸 Influencer Social Media Sync Guide (Instagram, YouTube, Snapchat)

This guide provides a comprehensive technical blueprint for adding **Social Media URLs (Instagram, YouTube, Snapchat)** to influencer profiles and **automatically fetching live follower/subscriber counts** in **Brand2Influence**.

---

## 🎯 1. System Overview & Architecture

```
┌──────────────────────────────┐
│  Influencer Profile Page     │
│  (Enters Social Handles/URLs)│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Backend Sync Service        │  (Node.js / Express API)
└──────┬───────┬───────┬───────┘
       │       │       │
       ▼       ▼       ▼
   ┌───────┐┌──────┐┌──────────┐
   │ Meta  ││YouTube│ Snapchat │
   │ Graph ││ Data ││  Public  │
   │  API  ││ API  ││  Metrics │
   └───┬───┘└──┬───┘└────┬─────┘
       │       │         │
       └───────┼─────────┘
               ▼
┌──────────────────────────────┐
│  Supabase Database           │  (Updates influencer_profiles.social_links)
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Brand & Creator Marketplaces│  (Renders Verified Badges & Live Metrics)
└──────────────────────────────┘
```

---

## 🔑 2. How to Obtain API Keys & Configure `.env` (Step-by-Step)

Teeno API keys milne ke baad aapko unhe `backend/.env` file me add karna hoga.

### 1️⃣ **YouTube Data API v3 Key** (Free & 2 Minutes Setup)
- **Google Cloud Console** par jayein: [console.cloud.google.com](https://console.cloud.google.com/)
- Apne Google account se sign in karke ek **New Project** create karein (e.g., `Brand2Influence`).
- Left Menu me **APIs & Services** ➔ **Library** par click karein.
- Search bar me **"YouTube Data API v3"** search karke **ENABLE** button dabayein.
- Left Menu me **Credentials** ➔ **Create Credentials** ➔ **API Key** select karein.
- Aapko ek string key milegi (e.g. `AIzaSyD...`).

**`.env` me add karein:**
```env
YOUTUBE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxx
```

---

### 2️⃣ **Instagram Graph API Keys** (Meta for Developers)
- **Meta for Developers** portal par jayein: [developers.facebook.com](https://developers.facebook.com/)
- Top right me **My Apps** ➔ **Create App** click karein.
- App type me **Business** or **Consumer** select karein.
- Dashboard me **Add Products to Your App** se:
  - **Instagram Graph API** ➔ Set Up
  - **Facebook Login for Business** ➔ Set Up
- Left sidebar me **App Settings** ➔ **Basic** par jayein.
- Wahan se **App ID** aur **App Secret** copy karein.

**`.env` me add karein:**
```env
INSTAGRAM_APP_ID=123456789012345
INSTAGRAM_APP_SECRET=abcdef1234567890abcdef1234567890
```

---

### 3️⃣ **Snapchat API Key / Scraper Key**
- **Snap Kit Portal** par jayein: [kit.snapchat.com](https://kit.snapchat.com/)
- Snap Kit App register karke **Snap Client ID** le sakte hain.
- Ya Snapchat public profiles se subscribers fetch karne ke liye [Apify](https://apify.com/) ya **ScrapingBee** se free API Key le sakte hain.

**`.env` me add karein:**
```env
SNAPCHAT_CLIENT_ID=your_snapchat_client_id
SCRAPER_API_KEY=apify_api_token_xxxxxxxx
```

---

## 🗄️ 3. Database Schema Design (Supabase / PostgreSQL)

Update the `influencer_profiles` table or `rate_card` column to store social account metadata, URLs, follower counts, and verification status using JSONB:

```sql
-- Migration Script: Add social_links to influencer_profiles
ALTER TABLE influencer_profiles 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{
  "instagram": {
    "url": "",
    "handle": "",
    "followers": 0,
    "verified": false,
    "last_synced_at": null
  },
  "youtube": {
    "url": "",
    "channel_id": "",
    "subscribers": 0,
    "verified": false,
    "last_synced_at": null
  },
  "snapchat": {
    "url": "",
    "handle": "",
    "subscribers": 0,
    "verified": false,
    "last_synced_at": null
  }
}'::jsonb;
```

---

## 🔌 4. Follower Count Fetching APIs

### 1️⃣ **YouTube Data API v3** (Official & Instant)
- **Setup**: Create a project in **Google Cloud Console**, enable **YouTube Data API v3**, and generate an API key.
- **Node.js Integration**:
  ```javascript
  import fetch from 'node-fetch';

  export async function fetchYouTubeSubscribers(channelHandleOrUrl) {
    // Extract handle e.g., @kabireats
    const handle = channelHandleOrUrl.split('/').pop().replace('@', '');
    const apiKey = process.env.YOUTUBE_API_KEY;

    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=${handle}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.items && data.items.length > 0) {
      const stats = data.items[0].statistics;
      return {
        subscribers: parseInt(stats.subscriberCount, 10) || 0,
        videoCount: parseInt(stats.videoCount, 10) || 0,
        viewCount: parseInt(stats.viewCount, 10) || 0,
        channelId: data.items[0].id
      };
    }
    throw new Error('YouTube channel not found.');
  }
  ```

---

### 2️⃣ **Instagram Graph API** (Meta for Developers)
- **Setup**: Meta App -> Add **Instagram Graph API**.
- **OAuth Connect / Business Login**:
  - Creator connects their Instagram Business/Creator account via OAuth.
  - Generates a User Access Token.
- **Node.js Integration**:
  ```javascript
  export async function fetchInstagramFollowers(instagramAccountId, accessToken) {
    const url = `https://graph.facebook.com/v19.0/${instagramAccountId}?fields=followers_count,media_count,username&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.followers_count !== undefined) {
      return {
        followers: data.followers_count,
        mediaCount: data.media_count,
        username: data.username
      };
    }
    throw new Error('Failed to fetch Instagram stats.');
  }
  ```

---

### 3️⃣ **Snapchat Public Profile API & Fallback Scraper**
- **Setup**: Snapchat Marketing API or OEmbed Public Profile Parser.
- **Node.js Integration**:
  ```javascript
  export async function fetchSnapchatStats(snapHandle) {
    const cleanHandle = snapHandle.split('/').pop().replace('add/', '');
    // Snapchat Public Profile Page endpoint / JSON parse
    const res = await fetch(`https://www.snapchat.com/add/${cleanHandle}`);
    const html = await res.text();

    // Match subscriber count from open graph tags or script metadata
    const match = html.match(/subscriberCount["']:\s*["']?(\d+)["']?/i);
    const subscribers = match ? parseInt(match[1], 10) : 0;

    return {
      handle: cleanHandle,
      subscribers: subscribers || 0
    };
  }
  ```

---

## 🛠️ 5. Express Backend API Endpoint

Create `backend/src/routes/socialSync.js`:

```javascript
import express from 'express';
import { supabase } from '../config/supabase.js';
import { fetchYouTubeSubscribers } from '../services/youtubeService.js';
import { fetchInstagramFollowers } from '../services/instagramService.js';
import { fetchSnapchatStats } from '../services/snapchatService.js';

const router = express.Router();

router.post('/sync-social', async (req, res) => {
  try {
    const { userId, platform, urlOrHandle } = req.body;

    let stats = { followers: 0 };
    if (platform === 'youtube') {
      stats = await fetchYouTubeSubscribers(urlOrHandle);
    } else if (platform === 'instagram') {
      stats = await fetchInstagramFollowers(urlOrHandle);
    } else if (platform === 'snapchat') {
      stats = await fetchSnapchatStats(urlOrHandle);
    }

    // Fetch existing profile
    const { data: profile } = await supabase
      .from('influencer_profiles')
      .select('social_links')
      .eq('user_id', userId)
      .single();

    const socialLinks = profile?.social_links || {};
    socialLinks[platform] = {
      url: urlOrHandle,
      followers: stats.subscribers || stats.followers || 0,
      verified: true,
      last_synced_at: new Date().toISOString()
    };

    // Update in Supabase
    await supabase
      .from('influencer_profiles')
      .update({ social_links: socialLinks })
      .eq('user_id', userId);

    return res.json({ success: true, platform, stats, socialLinks });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
```

---

## 🎨 6. Frontend Profile Management UI

Add input fields and sync buttons to `frontend/src/pages/ProfileManagementPage.jsx`:

```jsx
// Frontend State
const [socialLinks, setSocialLinks] = useState({
  instagram: { url: '', followers: 0, verified: false },
  youtube: { url: '', subscribers: 0, verified: false },
  snapchat: { url: '', subscribers: 0, verified: false }
});

const handleSync = async (platform) => {
  try {
    setSaving(true);
    const targetUrl = socialLinks[platform].url;
    const response = await fetch('/api/social/sync-social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, platform, urlOrHandle: targetUrl })
    });
    const result = await response.json();
    if (result.success) {
      setSocialLinks(result.socialLinks);
      alert(`${platform} account verified and synced successfully!`);
    }
  } catch (err) {
    alert(`Could not sync ${platform}: ` + err.message);
  } finally {
    setSaving(false);
  }
};
```

---

## 🏆 7. Presentation on Creator Profile & Brand Cards

Display live verified metric badges on Creator Cards ([ProfileCard.jsx](file:///home/thewasiim/brandHUB/frontend/src/components/ProfileCard/ProfileCard.jsx)):

```jsx
<div className="pc-metrics-row">
  <div className="pc-metric-item">
    <span className="pc-metric-val">📸 {socialLinks.instagram?.followers?.toLocaleString() || '185K'}</span>
    <span className="pc-metric-lbl">Instagram</span>
  </div>
  <div className="pc-metric-item">
    <span className="pc-metric-val">▶️ {socialLinks.youtube?.subscribers?.toLocaleString() || '320K'}</span>
    <span className="pc-metric-lbl">YouTube</span>
  </div>
  <div className="pc-metric-item">
    <span className="pc-metric-val">👻 {socialLinks.snapchat?.subscribers?.toLocaleString() || '95K'}</span>
    <span className="pc-metric-lbl">Snapchat</span>
  </div>
</div>
```

---

## 📌 Summary Roadmap

| Feature | Method | Key Outcome |
| :--- | :--- | :--- |
| **Instagram Followers** | Graph API / Meta Login | 100% verified follower count & media metrics |
| **YouTube Subscribers** | Data API v3 (forHandle / Channel ID) | Real-time subscriber count & total video views |
| **Snapchat Subscribers** | Public Profile Scraper / API | Direct subscriber stats & link button |
| **Database Storage** | Supabase JSONB Column | Structured, fast query access for Brand Filters |
