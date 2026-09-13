import { adminDb } from '../config/supabase.js'
import { ApiError } from '../utils/api-error.js'

/**
 * Helper to clean social URLs or handles
 */
export function extractHandle(input = '', platform = '') {
  if (!input) return ''
  let str = input.trim()
  try {
    if (str.startsWith('http://') || str.startsWith('https://')) {
      const url = new URL(str)
      const pathname = url.pathname.replace(/\/$/, '')
      const parts = pathname.split('/').filter(Boolean)
      if (parts.length > 0) {
        let lastPart = parts[parts.length - 1]
        if (lastPart === 'add' && parts.length > 1) {
          lastPart = parts[parts.length - 1]
        }
        return lastPart.replace('@', '')
      }
    }
  } catch (e) {
    // If not a valid URL, fallback to regex string cleaning
  }
  return str.replace(/^https?:\/\/(www\.)?(instagram\.com|youtube\.com|snapchat\.com\/add)\//i, '')
    .replace(/^@/, '')
    .split('/')[0]
    .split('?')[0]
}

/**
 * Fetch YouTube Channel Statistics via YouTube Data API v3
 */
export async function fetchYouTubeStats(urlOrHandle) {
  const handle = extractHandle(urlOrHandle, 'youtube')
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    return {
      platform: 'youtube',
      handle: handle ? `@${handle}` : 'Channel',
      url: urlOrHandle.startsWith('http') ? urlOrHandle : `https://youtube.com/@${handle}`,
      subscribers: 0,
      followers: 0,
      verified: false,
      note: 'YouTube API key not configured. Please enter subscribers manually.'
    }
  }

  try {
    const fetchUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${handle}&key=${apiKey}`
    const res = await fetch(fetchUrl)
    const data = await res.json()

    if (data.items && data.items.length > 0) {
      const item = data.items[0]
      const stats = item.statistics || {}
      const subs = parseInt(stats.subscriberCount, 10) || 0
      return {
        platform: 'youtube',
        handle: `@${handle}`,
        url: `https://youtube.com/@${handle}`,
        channelId: item.id,
        subscribers: subs,
        followers: subs,
        videoCount: parseInt(stats.videoCount, 10) || 0,
        viewCount: parseInt(stats.viewCount, 10) || 0,
        title: item.snippet?.title || handle,
        verified: true
      }
    }
  } catch (err) {
    console.warn('YouTube API fetch warning:', err.message)
  }

  return {
    platform: 'youtube',
    handle: `@${handle}`,
    url: urlOrHandle.startsWith('http') ? urlOrHandle : `https://youtube.com/@${handle}`,
    subscribers: 0,
    followers: 0,
    verified: false
  }
}

/**
 * Fetch Instagram Statistics via Apify Instagram Scraper or Meta Graph API
 */
export async function fetchInstagramStats(urlOrHandle) {
  const handle = extractHandle(urlOrHandle, 'instagram')
  const apifyToken = process.env.APIFY_TOKEN
  const appId = process.env.INSTAGRAM_APP_ID
  const appSecret = process.env.INSTAGRAM_APP_SECRET

  // 1. Primary: Live Apify Instagram Profile Scraper
  if (apifyToken && !apifyToken.includes('your_')) {
    try {
      const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apifyToken}`
      const res = await fetch(apifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [handle] })
      })
      const items = await res.json()
      if (Array.isArray(items) && items.length > 0) {
        const item = items[0]
        const count = item.followersCount ?? 0
        return {
          platform: 'instagram',
          handle: `@${item.username || handle}`,
          url: item.url || `https://instagram.com/${handle}`,
          followers: count,
          subscribers: count,
          bio: item.biography || '',
          fullName: item.fullName || '',
          verified: item.verified || false
        }
      }
    } catch (err) {
      console.warn('Apify Instagram fetch warning:', err.message)
    }
  }

  // 2. Secondary: Meta Graph API / Access Token
  if (appSecret && (appSecret.startsWith('IG') || appSecret.length > 60)) {
    try {
      const igRes = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${appSecret}`)
      const igData = await igRes.json()
      if (igData && igData.username && igData.username.toLowerCase() === handle.toLowerCase()) {
        return {
          platform: 'instagram',
          handle: `@${igData.username}`,
          url: `https://instagram.com/${igData.username}`,
          followers: 0,
          subscribers: 0,
          mediaCount: igData.media_count || 0,
          verified: true
        }
      }
    } catch (e) {
      console.warn('Instagram Graph API warning:', e.message)
    }
  }

  return {
    platform: 'instagram',
    handle: `@${handle}`,
    url: urlOrHandle.startsWith('http') ? urlOrHandle : `https://instagram.com/${handle}`,
    followers: 0,
    subscribers: 0,
    verified: false
  }
}

/**
 * Fetch Snapchat Statistics via Public Profile Parsing or Apify
 */
export async function fetchSnapchatStats(urlOrHandle) {
  const handle = extractHandle(urlOrHandle, 'snapchat')
  const profileUrl = urlOrHandle.startsWith('http') ? urlOrHandle : `https://www.snapchat.com/add/${handle}`

  try {
    const res = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    })
    const html = await res.text()
    
    // Parse Next.js data or JSON-LD embedded in Snapchat profile page
    const nextMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)
    if (nextMatch && nextMatch[1]) {
      try {
        const nextData = JSON.parse(nextMatch[1])
        const pubInfo = nextData?.props?.pageProps?.userProfile?.publicProfileInfo
        if (pubInfo) {
          const subs = parseInt(pubInfo.subscriberCount, 10) || 0
          return {
            platform: 'snapchat',
            handle: pubInfo.username || handle,
            url: profileUrl,
            subscribers: subs,
            followers: subs,
            title: pubInfo.title || '',
            verified: pubInfo.badge > 0
          }
        }
      } catch (parseErr) {
        // Fallback to regex
      }
    }

    const match = html.match(/subscriberCount["']:\s*["']?(\d+)["']?/i) || html.match(/(\d+k?m?)\s*subscribers/i)
    let subscribers = 0
    if (match && match[1]) {
      const val = match[1].toLowerCase()
      if (val.includes('k')) subscribers = parseFloat(val) * 1000
      else if (val.includes('m')) subscribers = parseFloat(val) * 1000000
      else subscribers = parseInt(val, 10)
    }

    return {
      platform: 'snapchat',
      handle: handle,
      url: profileUrl,
      subscribers: subscribers,
      followers: subscribers,
      verified: subscribers > 0
    }
  } catch (err) {
    console.warn('Snapchat fetch warning:', err.message)
  }

  return {
    platform: 'snapchat',
    handle: handle,
    url: profileUrl,
    subscribers: 0,
    followers: 0,
    verified: false
  }
}

/**
 * Public helper to fetch social metrics without requiring authenticated session (for signup/preview)
 */
export async function fetchSocialPublic({ platform, urlOrHandle, manualFollowers }) {
  if (!urlOrHandle || !String(urlOrHandle).trim()) {
    throw new ApiError(400, 'Please provide a valid profile handle or URL', 'VALIDATION_ERROR')
  }

  let stats = {}
  if (platform === 'youtube') {
    stats = await fetchYouTubeStats(urlOrHandle)
  } else if (platform === 'instagram') {
    stats = await fetchInstagramStats(urlOrHandle)
  } else if (platform === 'snapchat') {
    stats = await fetchSnapchatStats(urlOrHandle)
  } else {
    throw new ApiError(400, 'Unsupported platform. Choose Instagram, YouTube, or Snapchat.', 'VALIDATION_ERROR')
  }

  const count = Number(stats.followers ?? stats.subscribers ?? 0)
  stats.followers = count
  stats.subscribers = count

  if (manualFollowers && !isNaN(manualFollowers)) {
    stats.followers = Number(manualFollowers)
    stats.subscribers = Number(manualFollowers)
  }

  return stats
}

/**
 * Controller service to sync social links to database
 */
export async function syncSocialAccount(user, { platform, urlOrHandle, manualFollowers }) {
  if (user.role !== 'influencer' && user.role !== 'admin') {
    throw new ApiError(403, 'Only influencer profiles can sync social accounts', 'FORBIDDEN')
  }

  let stats = {}
  if (platform === 'youtube') {
    stats = await fetchYouTubeStats(urlOrHandle)
  } else if (platform === 'instagram') {
    stats = await fetchInstagramStats(urlOrHandle)
  } else if (platform === 'snapchat') {
    stats = await fetchSnapchatStats(urlOrHandle)
  } else {
    throw new ApiError(400, 'Unsupported platform', 'VALIDATION_ERROR')
  }

  if (manualFollowers && !isNaN(manualFollowers)) {
    if (platform === 'instagram') stats.followers = Number(manualFollowers)
    else stats.subscribers = Number(manualFollowers)
  }

  // Fetch current influencer profile
  const db = adminDb()
  const { data: profile } = await db.from('influencer_profiles').select('*').eq('user_id', user.id).maybeSingle()

  const currentRateCard = profile?.rate_card || {}
  const currentSocialLinks = currentRateCard.social_links || {}

  const updatedSocialLinks = {
    ...currentSocialLinks,
    [platform]: {
      url: stats.url || urlOrHandle,
      handle: stats.handle || urlOrHandle,
      followers: stats.followers || stats.subscribers || 0,
      subscribers: stats.subscribers || stats.followers || 0,
      verified: stats.verified || false,
      last_synced_at: new Date().toISOString()
    }
  }

  const updatedRateCard = {
    ...currentRateCard,
    ...(platform === 'instagram' ? {
      instagram_handle: stats.handle,
      instagram_url: stats.url,
      instagram_followers: stats.followers || currentRateCard.instagram_followers || 0
    } : {}),
    ...(platform === 'youtube' ? {
      youtube_url: stats.url,
      youtube_subscribers: stats.subscribers || currentRateCard.youtube_subscribers || 0
    } : {}),
    ...(platform === 'snapchat' ? {
      snapchat_url: stats.url,
      snapchat_subscribers: stats.subscribers || currentRateCard.snapchat_subscribers || 0
    } : {}),
    social_links: updatedSocialLinks
  }

  // Primary followers_count calculation
  const totalFollowers = (updatedRateCard.instagram_followers || 0) +
    (updatedRateCard.youtube_subscribers || 0) +
    (updatedRateCard.snapchat_subscribers || 0) || profile?.followers_count || 1000

  const { data: updatedProfile, error } = await db.from('influencer_profiles')
    .upsert({
      user_id: user.id,
      followers_count: totalFollowers,
      rate_card: updatedRateCard,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error

  return {
    success: true,
    platform,
    stats,
    socialLinks: updatedSocialLinks,
    rateCard: updatedRateCard,
    profile: updatedProfile
  }
}
