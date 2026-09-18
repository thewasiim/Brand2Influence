import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { influencersService } from '../../services/influencers'
import { supabase } from '../../lib/supabase'
import { conversationsService } from '../../services/conversations'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  Textarea,
  LoadingState,
  Badge,
  Card,
  Avatar,
  BentoGrid,
  MetricCard,
  InfluencerCard,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from '../../components/ui'

const CREATOR_NICHES = [
  'All Niches',
  'Fashion',
  'Beauty',
  'Food',
  'Fitness',
  'Travel',
  'Tech',
  'Lifestyle',
]

export function InfluencerOnboardingPage() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    name: '',
    niche: '',
    followersCount: '',
    engagementRate: '',
    reelRate: '',
    portfolioLinks: '',
    location: '',
    bio: '',
    profileImageUrl: '',
    profileImage: null,
    status: 'published',
  })
  const [syncPlatform, setSyncPlatform] = useState('instagram')
  const [socialInput, setSocialInput] = useState('')
  const [fetchingSocial, setFetchingSocial] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleFetchSocial = async () => {
    if (!socialInput.trim()) {
      setError(`Please enter your ${syncPlatform} username, handle, or profile URL`)
      return
    }
    setFetchingSocial(true)
    setError('')
    setSyncMsg('')
    try {
      const res = await api('/influencers/social-sync', {
        method: 'POST',
        body: JSON.stringify({
          platform: syncPlatform,
          urlOrHandle: socialInput.trim()
        })
      })
      if (res?.stats) {
        const count = res.stats.followers || res.stats.subscribers || 0
        setForm(prev => ({
          ...prev,
          followersCount: count || prev.followersCount,
          portfolioLinks: prev.portfolioLinks
            ? `${res.stats.url}, ${prev.portfolioLinks}`
            : res.stats.url
        }))
        setSyncMsg(`✓ Connected ${res.stats.handle || syncPlatform}! ${Number(count).toLocaleString()} audience auto-filled.`)
      }
    } catch (err) {
      setError(err.message || `Could not fetch ${syncPlatform} details`)
    } finally {
      setFetchingSocial(false)
    }
  }

  const save = async (status) => {
    setBusy(true)
    setError('')
    try {
      let profileImageUrl = form.profileImageUrl
      if (form.profileImage && supabase) {
        const userRes = await supabase.auth.getUser()
        if (userRes.data?.user?.id) {
          profileImageUrl = await influencersService.uploadProfileImage(form.profileImage, userRes.data.user.id)
        }
      }

      await influencersService.saveProfile({
        ...form,
        profileImageUrl,
        status,
        portfolioLinks: form.portfolioLinks
          ? form.portfolioLinks.split(',').map((x) => x.trim()).filter(Boolean)
          : [],
        rateCard: { reel: Number(form.reelRate || 0) },
      })

      nav(status === 'draft' ? '/dashboard' : '/influencers')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="setup">
      <div className="overline">
        <i /> Creator Profile Setup
      </div>

      {/* Multi-Platform Social Auto-Fetch Banner */}
      <div
        style={{
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 18px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>⚡</span>
            <b style={{ fontSize: '13.5px' }}>Auto-Fetch Creator Stats (Optional)</b>
          </div>
          {/* Platform Switcher */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'instagram', label: '📸 Instagram' },
              { id: 'youtube', label: '▶️ YouTube' },
              { id: 'snapchat', label: '👻 Snapchat' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                className={`chip ${syncPlatform === p.id ? 'chip--active' : ''}`}
                style={{ fontSize: '11px', padding: '3px 9px' }}
                onClick={() => {
                  setSyncPlatform(p.id)
                  setSyncMsg('')
                  setError('')
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
          Connect your {syncPlatform === 'instagram' ? 'Instagram' : syncPlatform === 'youtube' ? 'YouTube' : 'Snapchat'} to automatically fetch and verify audience metrics.
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="field-input"
            style={{ flex: 1, minWidth: '200px' }}
            placeholder={
              syncPlatform === 'instagram'
                ? '@yourhandle or instagram.com/username'
                : syncPlatform === 'youtube'
                ? '@channelHandle or youtube.com/@channel'
                : 'snapchat.com/add/yourhandle'
            }
            value={socialInput}
            onChange={(e) => setSocialInput(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            loading={fetchingSocial}
            onClick={handleFetchSocial}
          >
            {fetchingSocial ? 'Fetching…' : 'Fetch Live Stats'}
          </Button>
        </div>
        {syncMsg && (
          <p style={{ color: 'var(--color-secondary)', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>
            {syncMsg}
          </p>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); save('published') }}>
        <Input
          label="Display Name"
          required
          placeholder="e.g. Aanya Kapoor"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <div className="form-row-2">
          <Input
            label="Creative Niche"
            required
            placeholder="Fashion, Food, Tech..."
            value={form.niche}
            onChange={(e) => setForm({ ...form, niche: e.target.value })}
          />
          <Input
            label="Location (City)"
            required
            placeholder="e.g. Mumbai, Delhi"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>

        <div className="form-row-3">
          <Input
            label="Followers"
            type="number"
            min="0"
            required
            placeholder="15000"
            value={form.followersCount}
            onChange={(e) => setForm({ ...form, followersCount: e.target.value })}
          />
          <Input
            label="Engagement Rate (%)"
            type="number"
            min="0"
            max="100"
            step="0.1"
            required
            placeholder="4.5"
            value={form.engagementRate}
            onChange={(e) => setForm({ ...form, engagementRate: e.target.value })}
          />
          <Input
            label="Starting Reel (₹)"
            type="number"
            min="0"
            required
            placeholder="3000"
            value={form.reelRate}
            onChange={(e) => setForm({ ...form, reelRate: e.target.value })}
          />
        </div>

        <Input
          label="Portfolio Links (comma separated)"
          placeholder="https://instagram.com/reel/..., https://youtube.com/..."
          value={form.portfolioLinks}
          onChange={(e) => setForm({ ...form, portfolioLinks: e.target.value })}
        />

        <Input
          label="Profile Image URL (optional)"
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={form.profileImageUrl}
          onChange={(e) => setForm({ ...form, profileImageUrl: e.target.value })}
        />

        <label className="field">
          <span className="field-label">Upload Profile Photo</span>
          <input
            type="file"
            accept="image/*"
            className="field-input"
            onChange={(e) => setForm({ ...form, profileImage: e.target.files?.[0] || null })}
          />
        </label>

        <Textarea
          label="Bio & Aesthetic Focus"
          required
          placeholder="Tell brands about your style, audience demographic, and past collaborations..."
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />

        {error && <ErrorState error={error} />}

        <div className="form-actions" style={{ marginTop: '16px' }}>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => save('draft')}
          >
            Save Draft
          </Button>
          <Button disabled={busy} loading={busy}>
            {busy ? 'Saving…' : 'Publish Profile'}
          </Button>
        </div>
      </form>
    </main>
  )
}

export function DiscoveryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async (searchQuery = search) => {
    setLoading(true)
    setError('')
    try {
      const payload = {}
      if (searchQuery && searchQuery.trim()) {
        payload.search = searchQuery.trim()
      }
      const res = await influencersService.list(payload)
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Live real-time search on typing with slight debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      load(search)
    }, 200)

    return () => clearTimeout(timer)
  }, [search])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    load(search)
  }

  const handleClear = () => {
    setSearch('')
  }

  return (
    <main className="page">
      <FadeIn className="page-heading">
        <div>
          <div className="overline">
            <i /> Creator Directory & Discovery
          </div>
          <h1 style={{ marginTop: '6px' }}>Discover Verified Creators</h1>
          <p>Search verified creators across industries, niches, and locations.</p>
        </div>
      </FadeIn>

      {/* SINGLE SEARCH BAR */}
      <FadeIn delay={0.08} distance={18}>
        <form
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '8px 12px 8px 18px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            marginBottom: '28px',
            maxWidth: '720px',
          }}
          onSubmit={handleSearchSubmit}
        >
          <span style={{ fontSize: '16px', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search creators by name, handle, niche, location, bio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              fontFamily: 'inherit',
              color: 'var(--color-text-primary)',
              outline: 'none',
              padding: '6px 0',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>
      </FadeIn>

      {error && <ErrorState error={error} onRetry={() => load(search)} />}

      {loading ? (
        <LoadingState label="Loading creators…" />
      ) : data?.items?.length ? (
        <StaggerContainer
          key={search}
          className="bento-grid bento-grid--3"
          staggerDelay={0.07}
        >
          {data.items.map((creator, idx) => (
            <StaggerItem key={creator.id}>
              <InfluencerCard
                creator={creator}
                size={idx === 0 ? 'large' : 'medium'}
                onSelect={() => navigate(`/influencers/${creator.id}`)}
                onMessage={() => navigate(`/influencers/${creator.id}`)}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <EmptyState
          title={search ? `No creators match "${search}"` : "No creators found"}
          action={
            search ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClear}
              >
                Clear Search
              </Button>
            ) : null
          }
        >
          {search
            ? "Try searching with a different keyword, handle, city, or niche."
            : "No creators are available in the directory at this time."}
        </EmptyState>
      )}
    </main>
  )
}

export function ProfileCard({ creator }) {
  return <InfluencerCard creator={creator} size="medium" />
}

export function InfluencerProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [creator, setCreator] = useState(null)
  const [pageError, setPageError] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState('photos') // 'photos' | 'videos' | 'about'
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [postForm, setPostForm] = useState({
    type: 'image',
    mediaUrl: '',
    caption: '',
    thumbnailUrl: '',
  })
  const [submittingPost, setSubmittingPost] = useState(false)
  const [postError, setPostError] = useState('')
  const nav = useNavigate()

  const isOwner = user && (user.id === creator?.userId || user.id === creator?.id || user.role === 'admin')

  useEffect(() => {
    influencersService
      .get(id)
      .then(setCreator)
      .catch((e) => setPageError(e.message))
  }, [id])

  const message = async () => {
    if (!user) {
      nav('/auth/login')
      return
    }
    if (user.id === creator?.userId || user.id === creator?.id) {
      setActionNotice('ℹ️ This is your own creator profile.')
      return
    }
    if (user.role === 'influencer') {
      setActionNotice('ℹ️ Switch to a brand account to initiate sponsorship collaboration messages.')
      return
    }
    if (!creator?.userId) return
    setBusy(true)
    setActionNotice('')
    try {
      const c = await conversationsService.create(creator.userId)
      nav(`/conversations/${c.id}`)
    } catch (e) {
      setActionNotice(`⚠️ ${e.message || 'Could not start conversation'}`)
    } finally {
      setBusy(false)
    }
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!postForm.mediaUrl.trim()) {
      setPostError('Please provide an image or video URL')
      return
    }
    setSubmittingPost(true)
    setPostError('')
    try {
      const newPost = await influencersService.addPost(postForm)
      setCreator(prev => ({
        ...prev,
        posts: [newPost, ...(prev?.posts || [])]
      }))
      setPostForm({ type: 'image', mediaUrl: '', caption: '', thumbnailUrl: '' })
      setShowPostModal(false)
      if (postForm.type === 'video') {
        setActiveTab('videos')
      } else {
        setActiveTab('photos')
      }
    } catch (err) {
      setPostError(err.message || 'Failed to publish post')
    } finally {
      setSubmittingPost(false)
    }
  }

  if (pageError) {
    return (
      <main className="page">
        <ErrorState error={pageError} />
        <Button style={{ marginTop: '16px' }} onClick={() => nav('/influencers')}>
          ← Back to Creators Directory
        </Button>
      </main>
    )
  }

  if (!creator) return <LoadingState label="Loading creator profile…" />

  const posts = creator.posts || []
  const photoPosts = posts.filter(p => p.type === 'image' || !p.type)
  const videoPosts = posts.filter(p => p.type === 'video')

  const formattedFollowers = creator.followersCount
    ? Number(creator.followersCount).toLocaleString()
    : '—'

  return (
    <main className="page" style={{ maxWidth: '1120px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <Button variant="secondary" size="sm" onClick={() => nav('/influencers')}>
          ← Back to All Creators
        </Button>

        {isOwner && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowPostModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>➕</span> Add New Post
          </Button>
        )}
      </div>

      {/* Profile Bento Header */}
      <Card variant="glass" padding="lg" className="profile-hero-card">
        <div className="profile-hero-inner">
          <div className="profile-hero-left">
            <Avatar
              name={creator.name}
              src={creator.profileImageUrl}
              size="xl"
              tone="secondary"
            />
            <div className="profile-hero-info">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h1 className="profile-name-title">{creator.name}</h1>
                <Badge variant="accent">Verified Creator</Badge>
              </div>
              <p style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px', margin: '0 0 6px 0' }}>
                @{creator.username || creator.name?.toLowerCase().replace(/\s+/g, '')} · {creator.location || 'India'}
              </p>
              <p style={{ marginTop: '6px', fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '640px', lineHeight: 1.5 }}>
                {creator.bio || `${creator.niche || 'Digital'} creator collaborating on verified brand sponsorships.`}
              </p>

              {/* Social Links Chips */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                {creator.rateCard?.instagram_url && (
                  <a href={creator.rateCard.instagram_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--color-text-primary)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', padding: '5px 12px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    📸 Instagram ↗
                  </a>
                )}
                {creator.rateCard?.youtube_url && (
                  <a href={creator.rateCard.youtube_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--color-text-primary)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', padding: '5px 12px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    ▶️ YouTube ↗
                  </a>
                )}
                {creator.rateCard?.snapchat_url && (
                  <a href={creator.rateCard.snapchat_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--color-text-primary)', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', padding: '5px 12px', borderRadius: 'var(--radius-pill)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    👻 Snapchat ↗
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="profile-hero-actions">
            <Button size="lg" variant="primary" loading={busy} onClick={message} style={{ minWidth: '160px' }}>
              💬 Message Creator
            </Button>
            {actionNotice && (
              <div style={{ width: '100%', fontSize: '12.5px', color: 'var(--color-text-secondary)', background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', padding: '8px 12px', borderRadius: 'var(--radius-md)', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{actionNotice}</span>
                <button type="button" onClick={() => setActionNotice('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', fontSize: '13px', marginLeft: '6px' }}>✕</button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Metrics Bento Row */}
      <div className="creator-metrics-grid">
        <MetricCard
          label="Total Audience"
          value={formattedFollowers}
          subtext="Followers across platforms"
        />
        <MetricCard
          label="Engagement Rate"
          value={`${creator.engagementRate || '0'}%`}
          subtext="Audience interaction score"
        />
        <MetricCard
          label="Starting Reel Rate"
          value={`₹${creator.rateCard?.reel?.toLocaleString() || '—'}`}
          subtext="Base production package"
        />
        <MetricCard
          label="Published Posts"
          value={`${posts.length}`}
          subtext={`${photoPosts.length} Photos · ${videoPosts.length} Videos`}
        />
      </div>

      {/* Instagram-Style Content Tabs Header */}
      <div className="creator-tabs-nav">
        <button
          type="button"
          onClick={() => setActiveTab('photos')}
          className={`creator-tab-btn ${activeTab === 'photos' ? 'is-active' : ''}`}
        >
          <span>📷</span>
          <span>Photos</span>
          <span className="creator-tab-badge">
            {photoPosts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('videos')}
          className={`creator-tab-btn ${activeTab === 'videos' ? 'is-active' : ''}`}
        >
          <span>🎥</span>
          <span>Videos & Reels</span>
          <span className="creator-tab-badge">
            {videoPosts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`creator-tab-btn ${activeTab === 'about' ? 'is-active' : ''}`}
        >
          <span>ℹ️</span>
          <span>Rates & Deliverables</span>
        </button>
      </div>

      {/* 1. PHOTOS / IMAGES TAB */}
      {activeTab === 'photos' && (
        <div>
          {photoPosts.length > 0 ? (
            <div className="creator-photos-grid">
              {photoPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPhoto(post)}
                  className="creator-photo-card"
                >
                  <img
                    src={post.mediaUrl}
                    alt={post.caption || 'Creator photo post'}
                    loading="lazy"
                  />
                  <div className="creator-photo-overlay">
                    <div style={{ width: '100%' }}>
                      <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {post.caption || 'View photo'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11.5px', opacity: 0.9 }}>
                        <span>❤️ {post.likesCount?.toLocaleString() || 120}</span>
                        <span>📷 Photo</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '36px' }}>📷</span>
              <h3 style={{ marginTop: '12px' }}>No photo posts yet</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '8px auto 16px' }}>
                {isOwner ? 'Publish your high-resolution editorial looks and photo shoots to show brands your aesthetic.' : 'This creator has not posted any photos yet.'}
              </p>
              {isOwner && (
                <Button size="sm" variant="primary" onClick={() => { setPostForm(prev => ({ ...prev, type: 'image' })); setShowPostModal(true); }}>
                  ➕ Post First Photo
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. VIDEOS & REELS TAB */}
      {activeTab === 'videos' && (
        <div>
          {videoPosts.length > 0 ? (
            <div className="creator-videos-grid">
              {videoPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedVideo(post)}
                  className="creator-video-card"
                >
                  <img
                    src={post.thumbnailUrl || post.mediaUrl}
                    alt={post.caption || 'Video thumbnail'}
                    loading="lazy"
                  />

                  {/* Play Button Overlay */}
                  <div className="creator-video-play-icon">
                    ▶
                  </div>

                  <div className="creator-video-overlay">
                    <div style={{ width: '100%' }}>
                      <p style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        {post.caption || 'Play Reel'}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11.5px', opacity: 0.9 }}>
                        <span>👁️ {post.viewsCount?.toLocaleString() || '15K'} views</span>
                        <span>❤️ {post.likesCount?.toLocaleString() || '2.4K'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '36px' }}>🎥</span>
              <h3 style={{ marginTop: '12px' }}>No video reels yet</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '8px auto 16px' }}>
                {isOwner ? 'Upload video reels, product reviews, and unboxings to showcase your video storytelling reach.' : 'This creator has not posted any video reels yet.'}
              </p>
              {isOwner && (
                <Button size="sm" variant="primary" onClick={() => { setPostForm(prev => ({ ...prev, type: 'video' })); setShowPostModal(true); }}>
                  ➕ Post First Video
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. ABOUT & RATES TAB */}
      {activeTab === 'about' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <Card variant="elevated" padding="lg">
            <Badge variant="primary" style={{ marginBottom: '14px' }}>About & Aesthetic</Badge>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Creative Bio</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
              {creator.bio || 'No bio provided yet.'}
            </p>
          </Card>

          <Card variant="elevated" padding="lg">
            <Badge variant="secondary" style={{ marginBottom: '14px' }}>Deliverables</Badge>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Collaboration Rates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-3)' }}>
                <span>Instagram Reel / Video Post</span>
                <b>₹{creator.rateCard?.reel?.toLocaleString() || '—'}</b>
              </div>
              {creator.portfolioLinks?.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <small style={{ color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                    PORTFOLIO LINKS
                  </small>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {creator.portfolioLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: 'var(--color-secondary)' }}
                      >
                        {link} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* --- MODAL 1: ADD NEW POST MODAL --- */}
      {showPostModal && (
        <div
          className="creator-modal-backdrop"
          onClick={() => setShowPostModal(false)}
        >
          <div
            className="creator-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>➕ Publish New Post</h2>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'var(--color-text-tertiary)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost}>
              {/* Type Switcher */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  type="button"
                  onClick={() => setPostForm({ ...postForm, type: 'image' })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: postForm.type === 'image' ? 'var(--color-primary)' : 'var(--color-border)',
                    background: postForm.type === 'image' ? 'var(--color-primary)' : 'var(--color-surface-2)',
                    color: postForm.type === 'image' ? '#FFFFFF' : 'var(--color-text-primary)',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                  }}
                >
                  📷 Photo / Image
                </button>
                <button
                  type="button"
                  onClick={() => setPostForm({ ...postForm, type: 'video' })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: postForm.type === 'video' ? 'var(--color-primary)' : 'var(--color-border)',
                    background: postForm.type === 'video' ? 'var(--color-primary)' : 'var(--color-surface-2)',
                    color: postForm.type === 'video' ? '#FFFFFF' : 'var(--color-text-primary)',
                    fontWeight: 600,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                  }}
                >
                  🎥 Video / Reel
                </button>
              </div>

              <Input
                label={postForm.type === 'video' ? 'Video URL (.mp4 / stream / cloud link)' : 'Image URL (Unsplash / Cloud link)'}
                required
                placeholder={postForm.type === 'video' ? 'https://example.com/video.mp4' : 'https://images.unsplash.com/...'}
                value={postForm.mediaUrl}
                onChange={(e) => setPostForm({ ...postForm, mediaUrl: e.target.value })}
              />

              {postForm.type === 'video' && (
                <Input
                  label="Thumbnail Cover Image URL (Optional)"
                  placeholder="https://images.unsplash.com/cover-preview"
                  value={postForm.thumbnailUrl}
                  onChange={(e) => setPostForm({ ...postForm, thumbnailUrl: e.target.value })}
                />
              )}

              <Textarea
                label="Caption / Title"
                placeholder="Write a catchy caption about your styling, shoot location, or product sponsorship..."
                value={postForm.caption}
                onChange={(e) => setPostForm({ ...postForm, caption: e.target.value })}
              />

              {/* Sample preset shortcut buttons */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11.5px', color: 'var(--color-text-tertiary)' }}>Try sample:</span>
                <button
                  type="button"
                  style={{ fontSize: '11px', background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', padding: '3px 8px', borderRadius: '10px', cursor: 'pointer' }}
                  onClick={() => setPostForm(prev => ({ ...prev, type: 'image', mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', caption: 'Summer studio editorial shoot 📸✨' }))}
                >
                  Fashion Photo
                </button>
                <button
                  type="button"
                  style={{ fontSize: '11px', background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', padding: '3px 8px', borderRadius: '10px', cursor: 'pointer' }}
                  onClick={() => setPostForm(prev => ({ ...prev, type: 'video', mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', thumbnailUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800', caption: 'Creative styling reel breakdown 🎬' }))}
                >
                  Demo Reel
                </button>
              </div>

              {postError && <ErrorState error={postError} />}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', flexWrap: 'wrap' }}>
                <Button type="button" variant="secondary" onClick={() => setShowPostModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submittingPost}>
                  {submittingPost ? 'Publishing…' : 'Publish to Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: PHOTO LIGHTBOX --- */}
      {selectedPhoto && (
        <div
          className="creator-modal-backdrop"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            style={{
              background: '#09090B',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              maxWidth: '800px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.15)',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', background: '#000000', maxHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={selectedPhoto.mediaUrl}
                alt={selectedPhoto.caption}
                style={{ width: '100%', height: 'auto', maxHeight: '65vh', objectFit: 'contain' }}
              />
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.65)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '16px 20px', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <b style={{ fontSize: '15px' }}>{creator.name}</b>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  ❤️ {selectedPhoto.likesCount?.toLocaleString() || 120} likes
                </span>
              </div>
              <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>
                {selectedPhoto.caption || 'No caption provided.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: VIDEO PLAYER MODAL --- */}
      {selectedVideo && (
        <div
          className="creator-modal-backdrop"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            style={{
              background: '#09090B',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              maxWidth: '540px',
              width: '100%',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              border: '1px solid rgba(255,255,255,0.15)',
              maxHeight: '90vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', background: '#000000', display: 'flex', justifyContent: 'center' }}>
              <video
                src={selectedVideo.mediaUrl}
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '68vh', objectFit: 'contain' }}
              />
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.65)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '16px',
                  zIndex: 2,
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: '16px 18px', color: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <b style={{ fontSize: '15px' }}>{creator.name} · Reel</b>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                  👁️ {selectedVideo.viewsCount?.toLocaleString() || '15K'} views
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>
                {selectedVideo.caption}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

