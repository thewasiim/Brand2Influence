import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom'
import { influencersService } from '../../services/influencers'
import { supabase } from '../../lib/supabase'
import { conversationsService } from '../../services/conversations'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { CURATED_CREATORS } from '../../data/curatedData'
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
  FollowersBreakdownModal,
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

const CREATOR_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
]

export { CreatorOnboardingPage as InfluencerOnboardingPage } from './CreatorOnboardingPage'


export function DiscoveryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [niche, setNiche] = useState('All Niches')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async (searchQuery = search, nicheFilter = niche) => {
    setLoading(true)
    setError('')
    try {
      const payload = {}
      if (searchQuery && searchQuery.trim()) {
        payload.search = searchQuery.trim()
      }
      if (nicheFilter && nicheFilter !== 'All Niches') {
        payload.niche = nicheFilter
      }
      const res = await influencersService.list(payload)
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Live search and niche change
  useEffect(() => {
    const timer = setTimeout(() => {
      load(search, niche)
    }, 200)

    return () => clearTimeout(timer)
  }, [search, niche])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    load(search, niche)
  }

  const handleClear = () => {
    setSearch('')
    setNiche('All Niches')
  }

  return (
    <main className="page">
      {/* Signature CodeAstra Page Heading */}
      <FadeIn className="page-heading">
        <span className="eyebrow">
          <span className="num-accent">[ 01 ]</span> Creator Directory
        </span>
        <h2>
          Discover <em>Verified Creators<span className="dot-accent">.</span></em>
        </h2>
        <p>
          Connect with vetted creators across high-growth niches, inspect transparent rate cards, and launch genuine collaborations.
        </p>
      </FadeIn>

      {/* Obsidian Glass Search & Filter Panel */}
      <FadeIn delay={0.08} distance={18} style={{ marginBottom: '28px' }}>
        <form
          onSubmit={handleSearchSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(244, 241, 232, 0.03)',
            border: '1px solid rgba(244, 241, 232, 0.14)',
            borderRadius: 'var(--radius-pill)',
            padding: '8px 12px 8px 20px',
            boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(244, 241, 232, 0.08)',
            backdropFilter: 'blur(16px)',
            maxWidth: '760px',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.35)'
            e.currentTarget.style.boxShadow = '0 12px 40px -8px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(244, 241, 232, 0.15)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.14)'
            e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(244, 241, 232, 0.08)'
          }}
        >
          <span style={{ fontSize: '16px', color: 'rgba(244, 241, 232, 0.5)', display: 'flex', alignItems: 'center' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search creators by handle, name, city, bio, or creative style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              fontFamily: 'var(--font-display)',
              color: 'var(--cb-text)',
              outline: 'none',
              padding: '8px 0',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                background: 'rgba(244, 241, 232, 0.08)',
                border: 'none',
                color: 'var(--cb-text-muted)',
                cursor: 'pointer',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '999px',
              }}
              title="Clear search input"
            >
              ✕
            </button>
          )}
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
        </form>

        {/* Niche Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '16px' }}>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(244, 241, 232, 0.45)', marginRight: '4px' }}>
            NICHES:
          </span>
          {CREATOR_NICHES.map((n) => {
            const isActive = niche === n
            return (
              <button
                key={n}
                type="button"
                onClick={() => setNiche(n)}
                style={{
                  background: isActive ? '#f4f1e8' : 'rgba(244, 241, 232, 0.04)',
                  color: isActive ? '#0b0b0a' : 'rgba(244, 241, 232, 0.75)',
                  border: `1px solid ${isActive ? '#f4f1e8' : 'rgba(244, 241, 232, 0.12)'}`,
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 700 : 500,
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 2px 10px rgba(244, 241, 232, 0.2)' : 'none',
                }}
              >
                {n}
              </button>
            )
          })}
          {(niche !== 'All Niches' || search.trim()) && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(244, 241, 232, 0.5)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                padding: '4px 8px',
                textDecoration: 'underline',
              }}
            >
              Reset filters
            </button>
          )}
        </div>
      </FadeIn>

      {error && <ErrorState error={error} onRetry={() => load(search, niche)} />}

      {loading ? (
        <LoadingState label="Searching verified creators…" />
      ) : data?.items?.length ? (
        <StaggerContainer
          key={search + niche}
          className="bento-grid bento-grid--3"
          staggerDelay={0.06}
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
          title={search || niche !== 'All Niches' ? "No creators match this filter" : "No creators found"}
          action={
            (search || niche !== 'All Niches') ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClear}
              >
                Reset Filters
              </Button>
            ) : null
          }
        >
          {search || niche !== 'All Niches'
            ? "Try selecting another niche category or clearing your search keywords."
            : "No verified creator profiles are available in the directory at this time."}
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
  const [showBreakdown, setShowBreakdown] = useState(false)
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
      .then((data) => {
        if (data) setCreator(data)
        else throw new Error('Creator profile not found')
      })
      .catch((e) => {
        // Fallback to curated creators by id, userId, legacyId, username, or lowercase name
        const fallback = CURATED_CREATORS.find(
          c => c.id === id ||
               c.userId === id ||
               c.legacyId === id ||
               c.username === id ||
               c.name?.toLowerCase() === id?.toLowerCase() ||
               (id === '806f7e5d-754c-4c74-8bba-e03f34164a70' && c.id === 'c-1')
        )
        if (fallback) {
          setCreator(fallback)
          setPageError('')
        } else {
          setPageError(e.message || 'Creator profile not found')
        }
      })
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
        <div
          onClick={() => setShowBreakdown(true)}
          style={{ cursor: 'pointer' }}
          title="Click to view audience breakdown by platform"
        >
          <MetricCard
            label="Total Audience ▾"
            value={formattedFollowers}
            subtext="Click to view platform breakdown"
          />
        </div>
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
      {/* Followers Breakdown Modal */}
      <FollowersBreakdownModal
        isOpen={showBreakdown}
        onClose={() => setShowBreakdown(false)}
        creatorName={creator?.name}
        stats={{
          totalFollowers: Number(creator?.followersCount || 0),
          instagram: Number(creator?.rateCard?.instagram_followers || creator?.followersCount || 0),
          instagramHandle: creator?.rateCard?.instagram_handle || creator?.username,
          isInstagramVerified: Boolean(creator?.rateCard?.is_instagram_verified || true),
          youtube: Number(creator?.rateCard?.youtube_subscribers || 0),
          youtubeUrl: creator?.rateCard?.youtube_url,
          youtubeSkipped: Boolean(creator?.rateCard?.youtube_skipped || (!creator?.rateCard?.youtube_subscribers && !creator?.rateCard?.youtube_url)),
          snapchat: Number(creator?.rateCard?.snapchat_subscribers || 0),
          snapchatUrl: creator?.rateCard?.snapchat_url,
          snapchatSkipped: Boolean(creator?.rateCard?.snapchat_skipped || (!creator?.rateCard?.snapchat_subscribers && !creator?.rateCard?.snapchat_url)),
          facebook: Number(creator?.rateCard?.facebook_followers || 0),
          facebookUrl: creator?.rateCard?.facebook_url,
          facebookSkipped: Boolean(creator?.rateCard?.facebook_skipped || (!creator?.rateCard?.facebook_followers && !creator?.rateCard?.facebook_url))
        }}
      />
    </main>
  )
}

