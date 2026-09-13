import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { influencersService } from '../../services/influencers'
import { supabase } from '../../lib/supabase'
import { conversationsService } from '../../services/conversations'
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
  const [filters, setFilters] = useState({
    niche: '',
    location: '',
    followersMin: '',
    followersMax: '',
    budget: '',
  })
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const payload = { ...filters }
      if (search.trim()) payload.search = search.trim()
      const res = await influencersService.list(payload)
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filters.niche])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    load()
  }

  return (
    <main className="page">
      <FadeIn className="page-heading">
        <div>
          <div className="overline">
            <i /> Creator Directory & Discovery
          </div>
          <h1 style={{ marginTop: '6px' }}>Discover Verified Creators</h1>
          <p>Filter by creative niche, city location, audience scale, and starting reel rates.</p>
        </div>
      </FadeIn>

      {/* BENTO SEARCH & FILTER PANEL */}
      <FadeIn delay={0.08} distance={18}>
        <form
          className="bento-search-panel"
          style={{ marginBottom: '24px' }}
          onSubmit={handleSearchSubmit}
        >
          <div className="search-field-item" style={{ flex: 1.5 }}>
            <label>Search Keyword</label>
            <input
              placeholder="Creator name, username, bio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="search-field-item">
            <label>Location</label>
            <input
              placeholder="City or state"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>

          <div className="search-field-item">
            <label>Min Followers</label>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={filters.followersMin}
              onChange={(e) => setFilters({ ...filters, followersMin: e.target.value })}
            />
          </div>

          <div className="search-field-item">
            <label>Max Followers</label>
            <input
              type="number"
              placeholder="e.g. 200000"
              value={filters.followersMax}
              onChange={(e) => setFilters({ ...filters, followersMax: e.target.value })}
            />
          </div>

          <div className="search-field-item">
            <label>Max Reel Rate (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={filters.budget}
              onChange={(e) => setFilters({ ...filters, budget: e.target.value })}
            />
          </div>

          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>
      </FadeIn>

      {/* QUICK NICHE PILLS */}
      <FadeIn delay={0.12} distance={14} style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '4px' }}>
            Niche:
          </span>
          {CREATOR_NICHES.map((n) => {
            const active = (!filters.niche && n === 'All Niches') || filters.niche.toLowerCase() === n.toLowerCase()
            return (
              <button
                key={n}
                type="button"
                className={`chip ${active ? 'chip--active' : ''}`}
                onClick={() => setFilters({ ...filters, niche: n === 'All Niches' ? '' : n })}
              >
                {n}
              </button>
            )
          })}
          {(filters.niche || filters.location || filters.followersMin || filters.followersMax || filters.budget || search.trim()) && (
            <button
              type="button"
              onClick={() => {
                setFilters({ niche: '', location: '', followersMin: '', followersMax: '', budget: '' })
                setSearch('')
                load()
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-secondary)',
                fontSize: '12px',
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

      {error && <ErrorState error={error} onRetry={load} />}

      {loading ? (
        <LoadingState label="Loading creators…" />
      ) : data?.items?.length ? (
        <StaggerContainer
          key={search + filters.niche + filters.location + filters.followersMin + filters.followersMax + filters.budget}
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
          title="No creators match these filters"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFilters({ niche: '', location: '', followersMin: '', followersMax: '', budget: '' })
                setSearch('')
                load()
              }}
            >
              Reset Filters
            </Button>
          }
        >
          Try loosening your filter parameters or exploring other creative categories.
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
  const [creator, setCreator] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  useEffect(() => {
    influencersService
      .get(id)
      .then(setCreator)
      .catch((e) => setError(e.message))
  }, [id])

  const message = async () => {
    if (!creator?.userId) return
    setBusy(true)
    try {
      const c = await conversationsService.create(creator.userId)
      nav(`/conversations/${c.id}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (error) {
    return (
      <main className="page">
        <ErrorState error={error} />
        <Button style={{ marginTop: '16px' }} onClick={() => nav('/influencers')}>
          ← Back to Creators Directory
        </Button>
      </main>
    )
  }

  if (!creator) return <LoadingState label="Loading creator profile…" />

  const formattedFollowers = creator.followersCount
    ? Number(creator.followersCount).toLocaleString()
    : '—'

  return (
    <main className="page">
      <div style={{ marginBottom: '20px' }}>
        <Button variant="secondary" size="sm" onClick={() => nav('/influencers')}>
          ← Back to All Creators
        </Button>
      </div>

      {/* Profile Bento Header */}
      <Card variant="glass" padding="lg" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar
            name={creator.name}
            src={creator.profileImageUrl}
            size="xl"
            tone="secondary"
          />
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 700 }}>{creator.name}</h1>
              <Badge variant="accent">Verified</Badge>
            </div>
            <p style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              @{creator.username || creator.name?.toLowerCase().replace(/\s+/g, '')}
            </p>
            <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {creator.niche} Creator based in {creator.location}
            </p>
          </div>
          <div>
            <Button size="lg" variant="primary" loading={busy} onClick={message}>
              💬 Message Creator
            </Button>
          </div>
        </div>
      </Card>

      {/* Metrics Bento Row */}
      <BentoGrid cols={4} gap="md" style={{ marginBottom: '24px' }}>
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
          label="Location"
          value={creator.location || 'India'}
          subtext="Primary operational city"
        />
      </BentoGrid>

      {/* Bio and Portfolio Asymmetric Bento */}
      <div className="bento-grid bento-grid--asymmetric">
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
              <span>Instagram Reel</span>
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
    </main>
  )
}
