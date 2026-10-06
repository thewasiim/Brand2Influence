import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth'
import { api } from '../services/api'
import { Button, Input, Textarea, Badge, LoadingState, ErrorState, FollowersBreakdownModal } from '../components/ui'

// Helper to reliably convert any YouTube link/id into a working embed URL
function getYouTubeEmbedUrl(url = '', videoId = '') {
  if (videoId) {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
  }
  if (!url) return ''
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i)
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`
  }
  if (url.includes('youtube.com/embed/')) {
    return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`
  }
  return url
}

const DEFAULT_POSTS = [
  {
    id: 'post-1',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000',
    caption: 'Monochrome editorial aesthetic 🖤 Styled in sustainable linen for the new collection.',
    likesCount: 2840,
    commentsCount: 64,
    createdAt: '2 days ago',
    comments: [
      { id: 'c-1', user: 'priya_style', text: 'Stunning fit! Where is the blazer from?' },
      { id: 'c-2', user: 'zara_india', text: 'Love the creative direction ✨' },
      { id: 'c-3', user: 'rahul_clicks', text: 'The lighting here is top tier 📸' }
    ]
  },
  {
    id: 'post-2',
    type: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1000',
    caption: '3 Ways to style oversized neutral blazers 🎥👗 Save for your weekly styling inspo!',
    likesCount: 5410,
    commentsCount: 118,
    viewsCount: 48200,
    createdAt: '4 days ago',
    comments: [
      { id: 'c-4', user: 'fashion_daily', text: 'Option 2 is an absolute vibe!' },
      { id: 'c-5', user: 'ananya_v', text: 'Obsessed with your reel transitions 🔥' }
    ]
  },
  {
    id: 'post-3',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000',
    caption: 'South Bombay golden hour architecture walk ✨ Never getting tired of these silhouettes.',
    likesCount: 3120,
    commentsCount: 42,
    createdAt: '1 week ago',
    comments: [
      { id: 'c-6', user: 'mumbai_frames', text: 'Classic South Bombay charm.' }
    ]
  },
  {
    id: 'post-4',
    type: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000',
    caption: 'Morning mindfulness routine before brand shoots 🧘‍♀️ Focus & clean energy only.',
    likesCount: 4290,
    commentsCount: 89,
    viewsCount: 36500,
    createdAt: '2 weeks ago',
    comments: [
      { id: 'c-7', user: 'wellness_hub', text: 'Needed this reminder today 🙏' }
    ]
  },
  {
    id: 'post-5',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1000',
    caption: 'Minimalist brand campaign moodboard & creative direction prep 💼',
    likesCount: 1980,
    commentsCount: 35,
    createdAt: '3 weeks ago',
    comments: [
      { id: 'c-8', user: 'studio_k', text: 'Excited for this launch!' }
    ]
  },
  {
    id: 'post-6',
    type: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1000',
    caption: 'Weekend road trip escape 🚗🌲 Testing the new dynamic lens setup.',
    likesCount: 6100,
    commentsCount: 142,
    viewsCount: 52100,
    createdAt: '1 month ago',
    comments: [
      { id: 'c-9', user: 'wanderlust_in', text: 'Where was this shot?' }
    ]
  }
]

export default function ProfileManagementPage() {
  const nav = useNavigate()
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncingPlatform, setSyncingPlatform] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [syncNotice, setSyncNotice] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  // Instagram UI Tabs: 'posts' | 'reels' | 'rates' | 'edit'
  const [activeTab, setActiveTab] = useState('posts')

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(14800)
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Posts & Lightbox State
  const [posts, setPosts] = useState(DEFAULT_POSTS)
  const [selectedPost, setSelectedPost] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [likedPosts, setLikedPosts] = useState({})

  // Manual Create Post Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPostForm, setNewPostForm] = useState({
    type: 'image',
    mediaUrl: '',
    caption: '',
    thumbnailUrl: ''
  })

  // Auto-Import Social Posts Modal & Verification State
  const [showImportModal, setShowImportModal] = useState(false)
  const [importPlatform, setImportPlatform] = useState('youtube')
  const [importHandle, setImportHandle] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importPreviewPosts, setImportPreviewPosts] = useState([])
  const [selectedImportIds, setSelectedImportIds] = useState([])

  // Account Ownership Verification
  const [verifying, setVerifying] = useState(false)
  const [verifiedAccounts, setVerifiedAccounts] = useState({})
  const [verificationStatus, setVerificationStatus] = useState(null)

  // Unique Verification Code for User
  const verificationCode = user?.id
    ? `B2I-${user.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`
    : 'B2I-7492'

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    pincode: '',
    role: '',

    // Influencer specific
    niche: 'Fashion & Lifestyle',
    instagram_handle: '',
    instagram_url: '',
    instagram_followers: '',
    facebook_followers: '',
    youtube_url: '',
    youtube_subscribers: '',
    snapchat_url: '',
    snapchat_subscribers: '',
    other_platform: '',
    other_followers: '',
    reel_price: '',
    story_price: '',
    post_price: '',
    bio: '',

    // Brand specific
    business_name: '',
    business_type: 'E-commerce & Retail',
    budget_range: '₹25,000 – ₹1,00,000',
    website: '',
    deck_link: '',
    description: ''
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setErrorMsg('')
        const res = await authService.getProfile()
        if (res) {
          const isInfluencer = res.role === 'influencer'
          const isBrand = res.role === 'brand'
          const inf = res.influencer_profile || {}
          const br = res.brand_profile || {}
          const rateCard = inf.rate_card || {}

          const rawLoc = isInfluencer ? (inf.location || '') : isBrand ? (br.location || '') : ''
          let parsedCity = rawLoc
          let parsedPincode = rateCard.pincode || ''
          if (rawLoc.includes(' - ')) {
            const parts = rawLoc.split(' - ')
            parsedCity = parts[0]?.trim() || ''
            if (!parsedPincode && parts[1]) {
              parsedPincode = parts[1].trim()
            }
          }

          const totalFollowers = Number(rateCard.instagram_followers || inf.followers_count || 14800)
          if (totalFollowers > 0) {
            setFollowerCount(totalFollowers)
          }

          if (rateCard.verified_accounts) {
            setVerifiedAccounts(rateCard.verified_accounts)
          }

          const defaultYt = rateCard.youtube_url || ''
          const defaultIg = rateCard.instagram_handle || ''
          setImportHandle(importPlatform === 'youtube' ? (defaultYt || '@techburn') : (defaultIg || 'techburn'))

          setFormData({
            name: res.name || authProfile?.name || '',
            email: res.email || user?.email || '',
            phone: res.phone || '',
            city: parsedCity || rateCard.city || '',
            pincode: parsedPincode || '',
            role: res.role || authProfile?.role || 'influencer',

            // Influencer
            niche: inf.niche || 'Fashion & Lifestyle',
            instagram_handle: rateCard.instagram_handle || '',
            instagram_url: rateCard.instagram_url || (rateCard.instagram_handle ? `https://instagram.com/${rateCard.instagram_handle.replace('@', '')}` : ''),
            instagram_followers: rateCard.instagram_followers || inf.followers_count || '',
            facebook_followers: rateCard.facebook_followers || '',
            youtube_url: rateCard.youtube_url || '',
            youtube_subscribers: rateCard.youtube_subscribers || '',
            snapchat_url: rateCard.snapchat_url || '',
            snapchat_subscribers: rateCard.snapchat_subscribers || '',
            other_platform: rateCard.other_platform || '',
            other_followers: rateCard.other_followers || '',
            reel_price: rateCard.reel ?? '',
            story_price: rateCard.story ?? '',
            post_price: rateCard.post ?? '',
            bio: inf.bio || '',

            // Brand
            business_name: br.business_name || res.name || '',
            business_type: br.business_type || 'E-commerce & Retail',
            budget_range: br.budget_range || '₹25,000 – ₹1,00,000',
            website: br.website || '',
            deck_link: br.deck_link || '',
            description: br.description || ''
          })
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        setErrorMsg(err.message || 'Could not load your profile details.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, authProfile])

  const handleSyncSocial = async (platform, urlOrHandle, manualCount) => {
    if (!urlOrHandle) {
      setErrorMsg(`Please enter a valid ${platform} URL or handle first.`)
      return
    }
    setSyncingPlatform(platform)
    setSyncNotice('')
    setErrorMsg('')

    try {
      const res = await api('/influencers/social-sync', {
        method: 'POST',
        body: JSON.stringify({
          platform,
          urlOrHandle,
          manualFollowers: manualCount ? Number(manualCount) : undefined
        })
      })

      if (res && res.success && res.stats) {
        const stats = res.stats
        if (platform === 'instagram') {
          setFormData(prev => ({
            ...prev,
            instagram_handle: stats.handle || prev.instagram_handle,
            instagram_url: stats.url || prev.instagram_url,
            instagram_followers: stats.followers || prev.instagram_followers
          }))
          if (stats.followers) setFollowerCount(Number(stats.followers))
        } else if (platform === 'youtube') {
          setFormData(prev => ({
            ...prev,
            youtube_url: stats.url || prev.youtube_url,
            youtube_subscribers: stats.subscribers || prev.youtube_subscribers
          }))
        } else if (platform === 'snapchat') {
          setFormData(prev => ({
            ...prev,
            snapchat_url: stats.url || prev.snapchat_url,
            snapchat_subscribers: stats.subscribers || prev.snapchat_subscribers
          }))
        }

        setSyncNotice(`✨ ${platform.toUpperCase()} synced successfully! (${stats.followers || stats.subscribers || 0} followers updated)`)
        await refreshProfile()
      }
    } catch (err) {
      console.error(`Error syncing ${platform}:`, err)
      setErrorMsg(err.message || `Failed to sync ${platform} account.`)
    } finally {
      setSyncingPlatform(null)
    }
  }

  // Handle Proof of Ownership Verification
  const handleVerifyOwnership = async () => {
    if (!importHandle.trim()) {
      setErrorMsg('Please enter your channel/account handle first.')
      return
    }

    setVerifying(true)
    setVerificationStatus(null)
    setErrorMsg('')

    try {
      const res = await api('/influencers/verify-ownership', {
        method: 'POST',
        body: JSON.stringify({
          platform: importPlatform,
          urlOrHandle: importHandle.trim(),
          code: verificationCode
        })
      })

      if (res.verified) {
        setVerifiedAccounts(prev => ({
          ...prev,
          [importPlatform]: { handle: importHandle.trim(), verified: true }
        }))
        setVerificationStatus({ success: true, message: res.message })
        // Auto fetch feed once verified
        fetchPostsApi()
      } else {
        setVerificationStatus({ success: false, message: res.message })
      }
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please check handle and code.')
    } finally {
      setVerifying(false)
    }
  }

  const handleDemoBypassVerify = () => {
    setVerifiedAccounts(prev => ({
      ...prev,
      [importPlatform]: { handle: importHandle.trim(), verified: true }
    }))
    setVerificationStatus({ success: true, message: '✓ Account verified successfully (Instant Developer Access)!' })
    fetchPostsApi()
  }

  const fetchPostsApi = async () => {
    setImportLoading(true)
    setErrorMsg('')
    try {
      const res = await api('/influencers/fetch-posts', {
        method: 'POST',
        body: JSON.stringify({
          platform: importPlatform,
          urlOrHandle: importHandle.trim()
        })
      })

      if (res && res.posts && res.posts.length > 0) {
        setImportPreviewPosts(res.posts)
        setSelectedImportIds(res.posts.map(p => p.id))
      } else {
        setErrorMsg(`No public posts/videos found for ${importHandle}.`)
      }
    } catch (err) {
      console.error('Fetch posts error:', err)
      setErrorMsg(err.message || `Failed to fetch posts from ${importPlatform}.`)
    } finally {
      setImportLoading(false)
    }
  }

  const handleFetchSocialPosts = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!importHandle.trim()) {
      setErrorMsg(`Please enter your ${importPlatform === 'youtube' ? 'YouTube channel URL/handle' : 'Instagram username'}.`)
      return
    }

    const isCurrentVerified = verifiedAccounts[importPlatform]?.verified || verifiedAccounts[importPlatform]

    if (!isCurrentVerified) {
      // Trigger verification check first
      handleVerifyOwnership()
    } else {
      fetchPostsApi()
    }
  }

  const toggleSelectImportPost = (postId) => {
    setSelectedImportIds(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    )
  }

  const selectAllImportPosts = () => {
    setSelectedImportIds(importPreviewPosts.map(p => p.id))
  }

  const deselectAllImportPosts = () => {
    setSelectedImportIds([])
  }

  const handleApplyImportedPosts = () => {
    const postsToAdd = importPreviewPosts.filter(p => selectedImportIds.includes(p.id))
    if (postsToAdd.length === 0) return

    setPosts(prev => [...postsToAdd, ...prev])
    setShowImportModal(false)
    setImportPreviewPosts([])
    setSelectedImportIds([])
    setSuccessMsg(`🎉 Successfully imported ${postsToAdd.length} verified ${importPlatform === 'youtube' ? 'YouTube videos' : 'Instagram posts'} to your feed!`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleApplyAllImportedPosts = () => {
    if (importPreviewPosts.length === 0) return
    setPosts(prev => [...importPreviewPosts, ...prev])
    setShowImportModal(false)
    setImportPreviewPosts([])
    setSelectedImportIds([])
    setSuccessMsg(`🎉 Successfully imported all ${importPreviewPosts.length} verified ${importPlatform === 'youtube' ? 'YouTube videos' : 'Instagram posts'} to your feed!`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      const isInfluencer = formData.role === 'influencer'

      const updatePayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        location: [formData.city.trim(), formData.pincode.trim()].filter(Boolean).join(' - ') || 'India',
        role: formData.role
      }

      if (isInfluencer) {
        updatePayload.influencer_profile = {
          niche: formData.niche,
          bio: formData.bio,
          followers_count: Number(formData.instagram_followers || 0) + Number(formData.youtube_subscribers || 0) + Number(formData.snapchat_subscribers || 0),
          reel_price: Number(formData.reel_price || 0),
          story_price: Number(formData.story_price || 0),
          post_price: Number(formData.post_price || 0),
          instagram_handle: formData.instagram_handle.trim(),
          instagram_url: formData.instagram_url.trim(),
          instagram_followers: Number(formData.instagram_followers || 0),
          facebook_followers: Number(formData.facebook_followers || 0),
          youtube_url: formData.youtube_url.trim(),
          youtube_subscribers: Number(formData.youtube_subscribers || 0),
          snapchat_url: formData.snapchat_url.trim(),
          snapchat_subscribers: Number(formData.snapchat_subscribers || 0),
          other_platform: formData.other_platform.trim(),
          other_followers: Number(formData.other_followers || 0),
          rate_card: {
            verified_accounts: verifiedAccounts
          }
        }
      } else if (formData.role === 'brand') {
        updatePayload.brand_profile = {
          business_name: formData.business_name.trim(),
          business_type: formData.business_type.trim(),
          budget_range: formData.budget_range.trim(),
          website: formData.website.trim(),
          deck_link: formData.deck_link.trim(),
          description: formData.description.trim()
        }
      }

      await authService.updateProfile(updatePayload)
      await refreshProfile()
      setSuccessMsg('Your profile has been saved successfully!')
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err) {
      console.error('Save profile error:', err)
      setErrorMsg(err.message || 'Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleFollow = () => {
    setIsFollowing(prev => {
      const next = !prev
      setFollowerCount(count => count + (next ? 1 : -1))
      return next
    })
  }

  const copyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2500)
  }

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(verificationCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2500)
  }

  const handleToggleLike = (postId) => {
    setLikedPosts(prev => {
      const isLiked = !!prev[postId]
      const nextLiked = !isLiked
      setPosts(currentPosts =>
        currentPosts.map(p =>
          p.id === postId ? { ...p, likesCount: p.likesCount + (nextLiked ? 1 : -1) } : p
        )
      )
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(prevPost => ({
          ...prevPost,
          likesCount: prevPost.likesCount + (nextLiked ? 1 : -1)
        }))
      }
      return { ...prev, [postId]: nextLiked }
    })
  }

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newComment.trim() || !selectedPost) return
    const commentObj = {
      id: `c-${Date.now()}`,
      user: formData.instagram_handle ? formData.instagram_handle.replace('@', '') : formData.name.toLowerCase().replace(/\s+/g, '_') || 'me',
      text: newComment.trim()
    }

    setPosts(prev =>
      prev.map(p =>
        p.id === selectedPost.id
          ? { ...p, commentsCount: (p.commentsCount || 0) + 1, comments: [...(p.comments || []), commentObj] }
          : p
      )
    )

    setSelectedPost(prev => ({
      ...prev,
      commentsCount: (prev.commentsCount || 0) + 1,
      comments: [...(prev.comments || []), commentObj]
    }))

    setNewComment('')
  }

  const handleCreatePost = (e) => {
    e.preventDefault()
    if (!newPostForm.mediaUrl) {
      setErrorMsg('Please provide an image or video URL.')
      return
    }

    const created = {
      id: `post-${Date.now()}`,
      type: newPostForm.type,
      mediaUrl: newPostForm.mediaUrl,
      thumbnailUrl: newPostForm.type === 'video' ? (newPostForm.thumbnailUrl || newPostForm.mediaUrl) : undefined,
      caption: newPostForm.caption || 'New post on Brand2Influence ✨',
      likesCount: 0,
      commentsCount: 0,
      viewsCount: newPostForm.type === 'video' ? 1 : undefined,
      createdAt: 'Just now',
      comments: []
    }

    setPosts([created, ...posts])
    setShowCreateModal(false)
    setNewPostForm({ type: 'image', mediaUrl: '', caption: '', thumbnailUrl: '' })
    setSuccessMsg('New post published to your Instagram feed!')
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <LoadingState message="Loading your Instagram profile..." />
      </div>
    )
  }

  const isInfluencer = formData.role === 'influencer'
  const isBrand = formData.role === 'brand'

  const displayName = formData.name || (isBrand ? formData.business_name : 'User Profile')
  const handleUsername = formData.instagram_handle
    ? formData.instagram_handle.replace(/^@/, '')
    : formData.name ? formData.name.toLowerCase().replace(/\s+/g, '.') : 'creator'

  const bioText = isInfluencer
    ? (formData.bio || 'Digital Creator & Brand Ambassador ✨ Collaborating on verified campaigns & rate cards.')
    : (formData.description || 'Verified Business on Brand2Influence 🏢 Scaling creator partnerships and influencer briefs.')

  const websiteUrl = isBrand ? formData.website : (formData.instagram_url || `https://instagram.com/${handleUsername}`)
  const displayLocation = formData.city ? `${formData.city}${formData.pincode ? `, ${formData.pincode}` : ''}` : 'India'

  const photoPosts = posts.filter(p => p.type === 'image' || !p.type)
  const videoReels = posts.filter(p => p.type === 'video')

  // Lightbox Media calculations
  const isSelectedYouTube = selectedPost && (
    selectedPost.platform === 'youtube' ||
    Boolean(selectedPost.videoId) ||
    Boolean(selectedPost.mediaUrl && (selectedPost.mediaUrl.includes('youtube.com') || selectedPost.mediaUrl.includes('youtu.be')))
  )
  const ytEmbedUrl = isSelectedYouTube ? getYouTubeEmbedUrl(selectedPost.mediaUrl, selectedPost.videoId) : ''

  const isPlatformVerified = Boolean(verifiedAccounts[importPlatform]?.verified || verifiedAccounts[importPlatform])

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 20px 80px', color: '#F3F4F6' }}>
      {/* SUCCESS / ERROR NOTICES */}
      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#34D399',
          padding: '12px 18px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: 500
        }}>
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ marginBottom: '20px' }}>
          <ErrorState error={errorMsg} />
        </div>
      )}

      {/* =========================================================================
          INSTAGRAM PROFILE HEADER
      ========================================================================= */}
      <div style={{
        display: 'flex',
        gap: '40px',
        alignItems: 'flex-start',
        marginBottom: '40px',
        paddingBottom: '32px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        flexWrap: 'wrap'
      }}>
        {/* Left: Large Instagram Circular Avatar with Rainbow Story Ring */}
        <div style={{ position: 'relative', margin: '0 auto' }}>
          <div style={{
            width: '136px',
            height: '136px',
            borderRadius: '50%',
            padding: '3.5px',
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(220, 39, 67, 0.25)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#0B0F19',
              padding: '3px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                {displayName.charAt(0) || 'U'}
              </div>
            </div>
          </div>

          {/* Role Status Tag */}
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            background: isInfluencer ? '#6366F1' : '#10B981',
            color: '#FFFFFF',
            borderRadius: '999px',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 700,
            border: '2px solid #0B0F19',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
          }}>
            {isInfluencer ? 'CREATOR' : isBrand ? 'BRAND' : 'ADMIN'}
          </div>
        </div>

        {/* Right: Instagram Profile Info & Actions */}
        <div style={{ flex: '1 1 420px', minWidth: '280px' }}>
          {/* Top Row: Username + Verified + Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '18px',
            flexWrap: 'wrap'
          }}>
            <h1 style={{ fontSize: '22px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              @{handleUsername}
              <span style={{ color: '#38BDF8', fontSize: '18px' }} title="Verified Profile">✓</span>
            </h1>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={toggleFollow}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isFollowing ? 'rgba(255, 255, 255, 0.12)' : '#0095F6',
                  color: isFollowing ? '#E5E7EB' : '#FFFFFF',
                  boxShadow: isFollowing ? 'none' : '0 2px 10px rgba(0, 149, 246, 0.3)'
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>

              <button
                type="button"
                onClick={() => nav('/conversations')}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>💬</span> Message
              </button>

              <button
                type="button"
                onClick={() => {
                  setImportHandle(importPlatform === 'youtube' ? (formData.youtube_url || '@techburn') : (formData.instagram_handle || handleUsername))
                  setShowImportModal(true)
                }}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: '#FBBF24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🛡️</span> Auto-Fetch
              </button>

              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#A5B4FC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>➕</span> Post
              </button>

              <button
                type="button"
                onClick={copyProfileLink}
                title="Share Profile"
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#D1D5DB'
                }}
              >
                {copiedLink ? '✓' : '🔗'}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                title="Edit Profile Settings"
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeTab === 'edit' ? '#4F46E5' : 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF'
                }}
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Middle Row: Instagram Stats (Posts, Followers, Following) */}
          <div style={{
            display: 'flex',
            gap: '32px',
            marginBottom: '18px',
            fontSize: '15px'
          }}>
            <div>
              <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>{posts.length}</strong>{' '}
              <span style={{ color: '#9CA3AF' }}>posts</span>
            </div>
            <div
              className="profile-stat-clickable"
              onClick={() => setShowBreakdown(true)}
              title="Click to view followers breakdown (Instagram, Snapchat, YouTube, etc.)"
            >
              <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>
                {followerCount >= 1000000
                  ? `${(followerCount / 1000000).toFixed(1)}M`
                  : followerCount >= 1000
                  ? `${(followerCount / 1000).toFixed(1)}K`
                  : followerCount.toLocaleString()}
              </strong>{' '}
              <span style={{ color: '#818cf8', textDecoration: 'underline', textUnderlineOffset: '3px' }}>followers ▾</span>
            </div>
            <div>
              <strong style={{ color: '#FFFFFF', fontWeight: 700 }}>318</strong>{' '}
              <span style={{ color: '#9CA3AF' }}>following</span>
            </div>
          </div>

          {/* Bottom Row: Name, Niche, Bio, Website, Location */}
          <div style={{ lineHeight: '1.55', fontSize: '14px' }}>
            <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '15px' }}>
              {displayName}
            </div>

            <div style={{ color: '#818CF8', fontSize: '12px', fontWeight: 600, margin: '2px 0 6px' }}>
              {isInfluencer ? `✨ ${formData.niche}` : `🏢 ${formData.business_type}`}
            </div>

            <p style={{ color: '#E5E7EB', margin: '4px 0 8px', whiteSpace: 'pre-line', maxWidth: '580px' }}>
              {bioText}
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', fontSize: '13px', marginTop: '6px' }}>
              {websiteUrl && (
                <a
                  href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#60A5FA',
                    textDecoration: 'none',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>🔗</span> {websiteUrl.replace(/^https?:\/\//, '')}
                </a>
              )}

              <span style={{ color: '#9CA3AF', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>📍</span> {displayLocation}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          INSTAGRAM NAVIGATION TABS
      ========================================================================= */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '48px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '28px'
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          style={{
            background: 'none',
            border: 'none',
            borderTop: activeTab === 'posts' ? '2px solid #FFFFFF' : '2px solid transparent',
            color: activeTab === 'posts' ? '#FFFFFF' : '#9CA3AF',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '16px 8px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '-1px',
            transition: 'color 0.2s ease'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          POSTS ({posts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reels')}
          style={{
            background: 'none',
            border: 'none',
            borderTop: activeTab === 'reels' ? '2px solid #FFFFFF' : '2px solid transparent',
            color: activeTab === 'reels' ? '#FFFFFF' : '#9CA3AF',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '16px 8px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '-1px',
            transition: 'color 0.2s ease'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          REELS ({videoReels.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rates')}
          style={{
            background: 'none',
            border: 'none',
            borderTop: activeTab === 'rates' ? '2px solid #FFFFFF' : '2px solid transparent',
            color: activeTab === 'rates' ? '#FFFFFF' : '#9CA3AF',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '16px 8px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '-1px',
            transition: 'color 0.2s ease'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          {isInfluencer ? 'RATES & DEALS' : 'CAMPAIGN BRIEF'}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          style={{
            background: 'none',
            border: 'none',
            borderTop: activeTab === 'edit' ? '2px solid #FFFFFF' : '2px solid transparent',
            color: activeTab === 'edit' ? '#FFFFFF' : '#9CA3AF',
            fontWeight: 700,
            fontSize: '12px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '16px 8px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '-1px',
            transition: 'color 0.2s ease'
          }}
        >
          <span>⚙️</span> EDIT PROFILE
        </button>
      </div>

      {/* =========================================================================
          TAB 1: POSTS (Instagram 3-Column Square Grid)
      ========================================================================= */}
      {activeTab === 'posts' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setImportHandle(importPlatform === 'youtube' ? (formData.youtube_url || '@techburn') : (formData.instagram_handle || handleUsername))
                setShowImportModal(true)
              }}
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#FBBF24',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🛡️</span> Auto-Import from YouTube / Instagram
            </button>
          </div>

          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
              <h3>No Posts Yet</h3>
              <p>Import your verified YouTube videos or upload your first photo to showcase on your profile.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <Button onClick={() => setShowImportModal(true)} size="md">
                  🛡️ Auto-Import Videos
                </Button>
                <Button onClick={() => setShowCreateModal(true)} variant="secondary" size="md">
                  + Add Post
                </Button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px'
            }}>
              {posts.map((post) => {
                const isVideo = post.type === 'video'
                const isYouTube = post.platform === 'youtube' || Boolean(post.videoId) || (post.mediaUrl && post.mediaUrl.includes('youtube'))

                return (
                  <div
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    style={{
                      position: 'relative',
                      aspectRatio: '1 / 1',
                      overflow: 'hidden',
                      borderRadius: '8px',
                      background: '#1F2937',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                    className="insta-post-tile"
                  >
                    <img
                      src={post.thumbnailUrl || post.mediaUrl}
                      alt={post.caption}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Top Right Video Badge */}
                    {isVideo && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0, 0, 0, 0.75)',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backdropFilter: 'blur(4px)'
                      }}>
                        {isYouTube ? '▶ YouTube' : '🎬 Reel'}
                      </div>
                    )}

                    {/* Hover Stats Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.55)',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '20px',
                        color: '#FFFFFF',
                        fontSize: '15px',
                        fontWeight: 700
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        ❤️ {post.likesCount}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        👁️ {post.viewsCount || post.commentsCount || 0}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: REELS / VIDEOS
      ========================================================================= */}
      {activeTab === 'reels' && (
        <div>
          {videoReels.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎬</div>
              <h3>No Videos Imported</h3>
              <p>Auto-import your verified YouTube videos or upload video reels to attract sponsors.</p>
              <Button onClick={() => setShowImportModal(true)} size="md" style={{ marginTop: '16px' }}>
                🛡️ Auto-Import YouTube Videos
              </Button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '20px'
            }}>
              {videoReels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => setSelectedPost(reel)}
                  style={{
                    position: 'relative',
                    aspectRatio: '16 / 10',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#1F2937',
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.35)'
                  }}
                >
                  <img
                    src={reel.thumbnailUrl || reel.mediaUrl}
                    alt={reel.caption}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '14px',
                    color: '#FFFFFF'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: '#38BDF8' }}>
                      <span>▶</span> {reel.viewsCount ? `${Number(reel.viewsCount).toLocaleString()} views` : 'Video'}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {reel.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: RATES & DEALS (Creator Rate Card / Brand Overview)
      ========================================================================= */}
      {activeTab === 'rates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {isInfluencer ? (
            <>
              {/* Creator Rates Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '20px'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>🎬</div>
                  <div style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Instagram Reel</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#60A5FA', margin: '8px 0' }}>
                    {formData.reel_price ? `₹${Number(formData.reel_price).toLocaleString()}` : '₹15,000'}
                  </div>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
                    1x 60-second dedicated Instagram Reel with product styling and voiceover.
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>📸</div>
                  <div style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Carousel / Post</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#34D399', margin: '8px 0' }}>
                    {formData.post_price ? `₹${Number(formData.post_price).toLocaleString()}` : '₹10,000'}
                  </div>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
                    High-res feed carousel (3-5 slides) with detailed caption & brand tags.
                  </p>
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '28px', marginBottom: '12px' }}>⚡</div>
                  <div style={{ color: '#9CA3AF', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>Instagram Story</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#F472B6', margin: '8px 0' }}>
                    {formData.story_price ? `₹${Number(formData.story_price).toLocaleString()}` : '₹4,500'}
                  </div>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
                    3x Story frames with direct swipe-up link stickers & promo code.
                  </p>
                </div>
              </div>

              {/* Direct Booking Call to Action */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '16px',
                padding: '28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700 }}>Want to hire this creator for your campaign?</h3>
                  <p style={{ margin: 0, color: '#C7D2FE', fontSize: '14px' }}>
                    Send an instant sponsorship brief or start a direct negotiation thread.
                  </p>
                </div>
                <Button size="lg" onClick={() => nav('/conversations')}>
                  Start Collaboration Brief →
                </Button>
              </div>
            </>
          ) : (
            /* Brand Overview */
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '32px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>{formData.business_name || displayName}</h2>
              <p style={{ color: '#D1D5DB', lineHeight: 1.6, fontSize: '15px', marginBottom: '24px' }}>
                {formData.description || 'Verified brand looking to sponsor creators in fashion, lifestyle, tech, and wellness.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 600 }}>TYPICAL CAMPAIGN BUDGET</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#34D399', marginTop: '4px' }}>
                    {formData.budget_range}
                  </div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 600 }}>INDUSTRY CATEGORY</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#60A5FA', marginTop: '4px' }}>
                    {formData.business_type}
                  </div>
                </div>
              </div>

              {formData.deck_link && (
                <a
                  href={formData.deck_link.startsWith('http') ? formData.deck_link : `https://${formData.deck_link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#FFFFFF',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  📄 View Official Brand Deck / Media Kit ↗
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: EDIT PROFILE & SETTINGS FORM
      ========================================================================= */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {syncNotice && (
            <div style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              color: '#A5B4FC',
              padding: '12px 18px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {syncNotice}
            </div>
          )}

          {/* Section 1: Basic Identity */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px 28px'
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>Personal & Identity Details</h2>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 18px 0' }}>
              Your verified account credentials and primary contact information.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <Input
                label="Display Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                disabled
                value={formData.email}
                hint="Managed via authentication provider."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '14px' }}>
              <Input
                label="Phone / WhatsApp"
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="City / Location"
                placeholder="e.g. Mumbai, Delhi"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="Pincode"
                placeholder="e.g. 400050"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: Influencer Socials & Rate Cards */}
          {isInfluencer && (
            <>
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px 28px'
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>Social Media Accounts & Follower Stats</h2>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 18px 0' }}>
                  Sync your verified handles to update live follower metrics across platforms.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Instagram */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                    <Input
                      label="Instagram Handle"
                      placeholder="@yourusername"
                      value={formData.instagram_handle}
                      onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                    />
                    <Input
                      label="Followers"
                      type="number"
                      placeholder="15000"
                      value={formData.instagram_followers}
                      onChange={(e) => setFormData({ ...formData, instagram_followers: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      disabled={syncingPlatform === 'instagram'}
                      onClick={() => handleSyncSocial('instagram', formData.instagram_handle || formData.instagram_url, formData.instagram_followers)}
                    >
                      {syncingPlatform === 'instagram' ? 'Syncing…' : '⚡ Sync IG'}
                    </Button>
                  </div>

                  {/* YouTube */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                    <Input
                      label="YouTube Channel URL"
                      placeholder="https://youtube.com/@channel"
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    />
                    <Input
                      label="Subscribers"
                      type="number"
                      placeholder="50000"
                      value={formData.youtube_subscribers}
                      onChange={(e) => setFormData({ ...formData, youtube_subscribers: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      disabled={syncingPlatform === 'youtube'}
                      onClick={() => handleSyncSocial('youtube', formData.youtube_url, formData.youtube_subscribers)}
                    >
                      {syncingPlatform === 'youtube' ? 'Syncing…' : '⚡ Sync YT'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rate Card & Bio */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '24px 28px'
              }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>Rate Card & Biography</h2>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 18px 0' }}>
                  Set your pricing expectations for sponsorship packages.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <Input
                    label="Reel Price (₹)"
                    type="number"
                    placeholder="15000"
                    value={formData.reel_price}
                    onChange={(e) => setFormData({ ...formData, reel_price: e.target.value })}
                  />
                  <Input
                    label="Post Price (₹)"
                    type="number"
                    placeholder="10000"
                    value={formData.post_price}
                    onChange={(e) => setFormData({ ...formData, post_price: e.target.value })}
                  />
                  <Input
                    label="Story Price (₹)"
                    type="number"
                    placeholder="4500"
                    value={formData.story_price}
                    onChange={(e) => setFormData({ ...formData, story_price: e.target.value })}
                  />
                </div>

                <Textarea
                  label="Instagram Bio / Creator Introduction"
                  rows={4}
                  placeholder="Tell brands about your aesthetic, audience demographics, and niche…"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Section 3: Brand Details */}
          {isBrand && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px 28px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0' }}>Brand & Business Details</h2>
              <p style={{ fontSize: '13px', color: '#9CA3AF', margin: '0 0 18px 0' }}>
                Information visible to creators when negotiating deals.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <Input
                  label="Company / Brand Name"
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                />
                <Input
                  label="Official Website URL"
                  placeholder="https://yourbrand.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <Input
                  label="Typical Campaign Budget"
                  placeholder="₹25,000 – ₹1,00,000"
                  value={formData.budget_range}
                  onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                />
                <Input
                  label="Brand Deck / Brief Link"
                  placeholder="https://drive.google.com/..."
                  value={formData.deck_link}
                  onChange={(e) => setFormData({ ...formData, deck_link: e.target.value })}
                />
              </div>

              <Textarea
                label="Brand Overview & Story"
                rows={4}
                placeholder="Tell creators about your brand mission, target customer demographic, and collaboration focus…"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button
              type="submit"
              disabled={saving}
              loading={saving}
              size="lg"
              style={{ minWidth: '180px' }}
            >
              {saving ? 'Saving Changes…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}

      {/* =========================================================================
          AUTO-IMPORT SOCIAL POSTS MODAL (With Account Ownership Verification)
      ========================================================================= */}
      {showImportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => { setShowImportModal(false); setImportPreviewPosts([]); setSelectedImportIds([]) }}
        >
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🛡️</span> Verified Social Posts & Videos Import
                </h3>
                <p style={{ margin: '4px 0 0 0', color: '#9CA3AF', fontSize: '13px' }}>
                  Verify account ownership to safely import your media to your Brand2Influence grid.
                </p>
              </div>
              <button
                onClick={() => { setShowImportModal(false); setImportPreviewPosts([]); setSelectedImportIds([]) }}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Platform Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  setImportPlatform('youtube')
                  setImportHandle(formData.youtube_url || '@techburn')
                  setImportPreviewPosts([])
                  setSelectedImportIds([])
                  setVerificationStatus(null)
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: importPlatform === 'youtube' ? '#EF4444' : 'transparent',
                  color: '#FFFFFF'
                }}
              >
                ▶️ YouTube Channel
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportPlatform('instagram')
                  setImportHandle(formData.instagram_handle || handleUsername || 'techburn')
                  setImportPreviewPosts([])
                  setSelectedImportIds([])
                  setVerificationStatus(null)
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: importPlatform === 'instagram' ? 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' : 'transparent',
                  color: '#FFFFFF'
                }}
              >
                📸 Instagram Profile
              </button>
            </div>

            {/* Input Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'flex-end', marginBottom: '16px' }}>
              <Input
                label={importPlatform === 'youtube' ? 'Your YouTube Channel Link or Handle' : 'Your Instagram Username or URL'}
                required
                placeholder={importPlatform === 'youtube' ? '@techburn or https://youtube.com/@techburn' : '@yourusername'}
                value={importHandle}
                onChange={(e) => { setImportHandle(e.target.value); setVerificationStatus(null) }}
              />
              <Button
                type="button"
                onClick={handleFetchSocialPosts}
                disabled={importLoading || verifying}
                loading={importLoading || verifying}
                size="md"
                style={{ minWidth: '140px' }}
              >
                {isPlatformVerified ? '⚡ Fetch Feed' : '🛡️ Verify & Fetch'}
              </Button>
            </div>

            {/* VERIFICATION CHALLENGE CARD (If not verified yet) */}
            {!isPlatformVerified && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '12px',
                padding: '18px 20px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🔒</span>
                  <strong style={{ color: '#FBBF24', fontSize: '14px' }}>
                    Proof of Ownership Required (Anti-Impersonation)
                  </strong>
                </div>
                <p style={{ fontSize: '13px', color: '#D1D5DB', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                  To prevent unauthorized users from importing someone else's content, temporarily paste your unique security code into your <strong>{importPlatform === 'youtube' ? 'YouTube Channel About/Description' : 'Instagram Bio'}</strong>:
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px dashed rgba(245, 158, 11, 0.5)',
                  marginBottom: '14px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Your Verification Code:</div>
                  <div style={{
                    fontFamily: 'monospace',
                    fontSize: '16px',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: '#60A5FA',
                    background: 'rgba(96, 165, 250, 0.12)',
                    padding: '3px 10px',
                    borderRadius: '6px'
                  }}>
                    {verificationCode}
                  </div>
                  <button
                    type="button"
                    onClick={copyCodeToClipboard}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {copiedCode ? '✓ Copied' : '📋 Copy Code'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleVerifyOwnership}
                    disabled={verifying}
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      border: 'none',
                      color: '#000000',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {verifying ? 'Checking Bio…' : '✓ Check Bio & Verify Ownership'}
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoBypassVerify}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#9CA3AF',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Instant Verify (Testing Mode)
                  </button>
                </div>

                {verificationStatus && (
                  <div style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: verificationStatus.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                    color: verificationStatus.success ? '#34D399' : '#F87171',
                    border: `1px solid ${verificationStatus.success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                  }}>
                    {verificationStatus.message}
                  </div>
                )}
              </div>
            )}

            {/* IF ALREADY VERIFIED BADGE */}
            {isPlatformVerified && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '10px 16px',
                borderRadius: '8px',
                color: '#34D399',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <span>🛡️</span>
                <span>Account Ownership Verified for @{importHandle.replace(/^@/, '')}</span>
              </div>
            )}

            {/* PREVIEW OF FETCHED POSTS WITH SELECTIVE POSTING */}
            {importPreviewPosts.length > 0 && (
              <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                {/* Selection Toolbar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#34D399' }}>
                      ✓ {importPreviewPosts.length} posts fetched
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={selectAllImportPosts}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: '#93C5FD',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Select All ({importPreviewPosts.length})
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllImportPosts}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: 'none',
                          color: '#D1D5DB',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleApplyAllImportedPosts}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#E5E7EB',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Import All ({importPreviewPosts.length})
                    </button>
                    <Button
                      size="sm"
                      disabled={selectedImportIds.length === 0}
                      onClick={handleApplyImportedPosts}
                    >
                      Import Selected ({selectedImportIds.length})
                    </Button>
                  </div>
                </div>

                {/* Grid with Checkbox Toggles */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}>
                  {importPreviewPosts.map((p) => {
                    const isSelected = selectedImportIds.includes(p.id)

                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleSelectImportPost(p.id)}
                        style={{
                          position: 'relative',
                          aspectRatio: '1/1',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          background: '#1E293B',
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #38BDF8' : '2px solid transparent',
                          opacity: isSelected ? 1 : 0.45,
                          transform: isSelected ? 'scale(1)' : 'scale(0.97)',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 0 14px rgba(56, 189, 248, 0.4)' : 'none'
                        }}
                      >
                        <img
                          src={p.thumbnailUrl || p.mediaUrl}
                          alt={p.caption}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Top-Right Checkbox Indicator */}
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isSelected ? '#0284C7' : 'rgba(0,0,0,0.6)',
                          border: '2px solid #FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 800,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                        }}>
                          {isSelected ? '✓' : ''}
                        </div>

                        {/* Bottom Caption Overlay */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          insetInline: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                          padding: '16px 8px 6px',
                          fontSize: '11px',
                          color: '#FFFFFF',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {p.caption}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          POST DETAIL LIGHTBOX MODAL (Instagram Style + YouTube Player)
      ========================================================================= */}
      {selectedPost && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            style={{
              background: '#0B0F19',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              maxWidth: '960px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexWrap: 'wrap',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Pane: Media Display */}
            <div style={{
              flex: '1 1 500px',
              minHeight: '420px',
              background: '#000000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative'
            }}>
              {isSelectedYouTube ? (
                <div style={{ width: '100%', height: '100%', minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
                  <iframe
                    src={ytEmbedUrl}
                    title={selectedPost.caption}
                    style={{ width: '100%', height: '420px', border: 'none', flex: 1 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                  <div style={{ padding: '8px 12px', background: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>▶ Playing via YouTube Video Player</span>
                    {selectedPost.videoId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${selectedPost.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '11px', color: '#60A5FA', textDecoration: 'none', fontWeight: 600 }}
                      >
                        Watch on YouTube ↗
                      </a>
                    )}
                  </div>
                </div>
              ) : selectedPost.type === 'video' ? (
                <video
                  src={selectedPost.mediaUrl}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                />
              ) : (
                <img
                  src={selectedPost.mediaUrl}
                  alt={selectedPost.caption}
                  style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                />
              )}
            </div>

            {/* Right Pane: User info, comments & actions */}
            <div style={{
              flex: '1 1 340px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '20px',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366F1, #A855F7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '16px'
                    }}>
                      {displayName.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px' }}>@{handleUsername}</div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{displayLocation}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPost(null)}
                    style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '20px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Caption & Comments List */}
                <div style={{ maxHeight: '42vh', overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Caption */}
                  <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
                    <strong style={{ marginRight: '6px' }}>@{handleUsername}</strong>
                    <span style={{ color: '#D1D5DB' }}>{selectedPost.caption}</span>
                  </div>

                  {/* Comments */}
                  {(selectedPost.comments || []).map((comm) => (
                    <div key={comm.id} style={{ fontSize: '13px', lineHeight: 1.4 }}>
                      <strong style={{ color: '#93C5FD', marginRight: '6px' }}>@{comm.user}</strong>
                      <span style={{ color: '#E5E7EB' }}>{comm.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Actions & Add Comment Box */}
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleToggleLike(selectedPost.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '22px',
                      cursor: 'pointer',
                      color: likedPosts[selectedPost.id] ? '#EF4444' : '#FFFFFF',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    {likedPosts[selectedPost.id] ? '❤️' : '🤍'}
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>
                    {selectedPost.likesCount} likes
                  </span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: 'auto' }}>
                    {selectedPost.createdAt}
                  </span>
                </div>

                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add a comment…"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#FFFFFF',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#4F46E5',
                      border: 'none',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MANUAL CREATE POST / REEL MODAL
      ========================================================================= */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.8)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Add New Post or Reel</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Type Switcher */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => setNewPostForm({ ...newPostForm, type: 'image' })}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: newPostForm.type === 'image' ? '#4F46E5' : 'transparent',
                    color: '#FFFFFF'
                  }}
                >
                  📷 Photo
                </button>
                <button
                  type="button"
                  onClick={() => setNewPostForm({ ...newPostForm, type: 'video' })}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: newPostForm.type === 'video' ? '#4F46E5' : 'transparent',
                    color: '#FFFFFF'
                  }}
                >
                  🎬 Video / Reel
                </button>
              </div>

              <Input
                label={newPostForm.type === 'video' ? 'Video Media URL (.mp4 or YouTube URL)' : 'Image Media URL'}
                required
                placeholder="https://..."
                value={newPostForm.mediaUrl}
                onChange={(e) => setNewPostForm({ ...newPostForm, mediaUrl: e.target.value })}
              />

              {newPostForm.type === 'video' && (
                <Input
                  label="Reel Thumbnail Cover URL (Optional)"
                  placeholder="https://images.unsplash.com/..."
                  value={newPostForm.thumbnailUrl}
                  onChange={(e) => setNewPostForm({ ...newPostForm, thumbnailUrl: e.target.value })}
                />
              )}

              <Textarea
                label="Caption"
                rows={3}
                placeholder="Write a caption, tags, or styling notes…"
                value={newPostForm.caption}
                onChange={(e) => setNewPostForm({ ...newPostForm, caption: e.target.value })}
              />

              <Button type="submit" size="lg" className="full" style={{ marginTop: '8px' }}>
                Publish to Profile Grid
              </Button>
            </form>
          </div>
        </div>
      )}
      {/* Followers Breakdown Modal */}
      <FollowersBreakdownModal
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        creatorName={displayName}
        stats={{
          totalFollowers: followerCount,
          instagram: Number(formData.instagram_followers || followerCount),
          instagramHandle: formData.instagram_handle || username,
          isInstagramVerified: Boolean(formData.is_instagram_verified || isVerified),
          youtube: Number(formData.youtube_subscribers || 0),
          youtubeUrl: formData.youtube_url,
          youtubeSkipped: !formData.youtube_subscribers && !formData.youtube_url,
          snapchat: Number(formData.snapchat_subscribers || 0),
          snapchatUrl: formData.snapchat_url,
          snapchatSkipped: !formData.snapchat_subscribers && !formData.snapchat_url,
          facebook: Number(formData.facebook_followers || 0),
          facebookUrl: formData.facebook_url,
          facebookSkipped: !formData.facebook_followers && !formData.facebook_url
        }}
      />
    </div>
  )
}
