import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { campaignsService } from '../../services/campaigns'
import {
  Button,
  Card,
  Badge,
  Input,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../../components/ui'

const NICHES = [
  'All Niches',
  'Fashion & Style',
  'Beauty & Skincare',
  'Tech & Gadgets',
  'Fitness & Health',
  'Food & Beverage',
  'Travel & Lifestyle',
  'Gaming & Esports',
  'Finance & Business',
]

const PLATFORMS = ['All Platforms', 'Instagram', 'YouTube', 'TikTok', 'Multi-platform']

export function CampaignDiscoveryPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [niche, setNiche] = useState('All Niches')
  const [platform, setPlatform] = useState('All Platforms')
  const { profile } = useAuth()

  // Bottom sheet / filter modal state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [tempNiche, setTempNiche] = useState('All Niches')
  const [tempPlatform, setTempPlatform] = useState('All Platforms')

  useEffect(() => {
    let active = true
    const filters = {}
    if (niche !== 'All Niches') filters.niche = niche
    if (platform !== 'All Platforms') filters.platform = platform
    if (search.trim()) filters.search = search.trim()

    campaignsService
      .list(filters)
      .then((data) => {
        if (active) setItems(data.items || [])
      })
      .catch((err) => {
        if (active) setError(err.message)
      })

    return () => {
      active = false
    }
  }, [niche, platform, search])

  const activeCount = (niche !== 'All Niches' ? 1 : 0) + (platform !== 'All Platforms' ? 1 : 0)

  const openSheet = () => {
    setTempNiche(niche)
    setTempPlatform(platform)
    setSheetOpen(true)
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="overline">
            <i /> Brand Advertisements & Deals
          </div>
          <h1 style={{ marginTop: '6px' }}>Open Sponsorship Opportunities</h1>
          <p>
            Explore verified brand campaign briefs. Connect directly with brands and pitch your collaboration deliverables.
          </p>
        </div>
        {profile?.role === 'brand' && (
          <div>
            <Link to="/brand/campaigns" className="ui-button ui-btn--primary">
              + Post New Ad Brief
            </Link>
          </div>
        )}
      </div>

      {/* SEARCH AND CLEAN FILTERS BUTTON */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', maxWidth: '640px' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search campaigns by keyword, brand, or requirements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search campaigns"
            />
          </div>

          <button
            type="button"
            className="ui-button ui-btn--secondary"
            onClick={openSheet}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '42px',
              padding: '0 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 500,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
            {activeCount > 0 && (
              <span
                style={{
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '2px 7px',
                  lineHeight: 1,
                }}
              >
                {activeCount}
              </span>
            )}
          </button>
        </div>

        {/* ACTIVE REMOVABLE CHIPS */}
        {activeCount > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '2px' }}>
            {niche !== 'All Niches' && (
              <button
                type="button"
                onClick={() => setNiche('All Niches')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-surface-3)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{niche}</span>
                <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 700 }}>✕</span>
              </button>
            )}

            {platform !== 'All Platforms' && (
              <button
                type="button"
                onClick={() => setPlatform('All Platforms')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-surface-3)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{platform}</span>
                <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 700 }}>✕</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setNiche('All Niches')
                setPlatform('All Platforms')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-tertiary)',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '4px 8px',
                textDecoration: 'underline',
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM SHEET / FILTER MODAL */}
      {sheetOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(6px)',
          }}
          onClick={() => setSheetOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-surface-1)',
              borderTop: '1px solid var(--color-border)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px 20px 32px',
              maxHeight: '85vh',
              overflowY: 'auto',
              maxWidth: '560px',
              margin: '0 auto',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag indicator */}
            <div
              style={{
                width: '36px',
                height: '4px',
                background: 'var(--color-border)',
                borderRadius: '2px',
                margin: '0 auto 16px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Filter Sponsorships</h3>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Niche Section */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Category / Niche
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {NICHES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`chip ${tempNiche === n ? 'chip--active' : ''}`}
                    onClick={() => setTempNiche(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Section */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Platform
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`chip ${tempPlatform === p ? 'chip--active' : ''}`}
                    onClick={() => setTempPlatform(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Button
                variant="secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setTempNiche('All Niches')
                  setTempPlatform('All Platforms')
                  setNiche('All Niches')
                  setPlatform('All Platforms')
                  setSheetOpen(false)
                }}
              >
                Clear all
              </Button>
              <Button
                variant="primary"
                style={{ flex: 2 }}
                onClick={() => {
                  setNiche(tempNiche)
                  setPlatform(tempPlatform)
                  setSheetOpen(false)
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}


      {error && <ErrorState error={error} />}

      {!items ? (
        <LoadingState label="Loading open sponsorship briefs…" />
      ) : items.length === 0 ? (
        <EmptyState title="No active campaign ads found">
          No brands have active advertisements matching this criteria right now. Check back soon or explore creators!
        </EmptyState>
      ) : (
        <div className="campaign-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
          {items.map((item) => (
            <Card key={item.id} variant="elevated" hover padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 'var(--radius-xl)' }}>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <Badge variant="primary">{item.platform}</Badge>
                    <Badge variant="accent">{item.niche}</Badge>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-secondary)' }}>
                    {item.budget_range}
                  </span>
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
                  {item.title}
                </h3>

                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <b>{item.brand?.businessName || item.brand?.name || 'Brand'}</b>
                  <span>•</span>
                  <span>{item.location}</span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </p>

                {item.deliverables?.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {item.deliverables.map((d, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11px',
                          background: 'var(--color-surface-3)',
                          border: '1px solid var(--color-border)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-neutral-subtle)',
                        }}
                      >
                        ✓ {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ paddingTop: '14px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  Min Followers: {item.target_followers_min ? Number(item.target_followers_min).toLocaleString() : 'Any'}
                </span>
                <Link to={`/campaigns/${item.id}`} className="ui-button ui-btn--primary ui-btn--sm">
                  View Brief & Contact →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}

export function CampaignDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user, profile } = useAuth()
  const [item, setItem] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const [proposal, setProposal] = useState('')
  const [proposedRate, setProposedRate] = useState('')
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    campaignsService
      .getById(id)
      .then(setItem)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleApply = async (e) => {
    e.preventDefault()
    if (!user) {
      nav('/auth/login')
      return
    }
    if (profile?.role === 'brand') {
      setApplyError('Brand accounts cannot apply to campaigns. Please switch to an Influencer/Creator account.')
      return
    }

    setApplying(true)
    setApplyError('')
    try {
      const res = await campaignsService.apply(id, {
        proposal: proposal.trim(),
        proposedRate: proposedRate.trim(),
      })
      // Direct navigation to conversation thread!
      nav(`/conversations/${res.conversationId}`)
    } catch (err) {
      setApplyError(err.message)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <main className="page">
        <LoadingState label="Loading campaign details…" />
      </main>
    )
  }

  if (error || !item) {
    return (
      <main className="page">
        <ErrorState error={error || 'Campaign not found'} />
        <Button style={{ marginTop: '16px' }} onClick={() => nav('/campaigns')}>
          ← Back to Campaigns
        </Button>
      </main>
    )
  }

  return (
    <main className="page">
      <div style={{ marginBottom: '20px' }}>
        <Button variant="secondary" size="sm" onClick={() => nav('/campaigns')}>
          ← Back to All Campaigns
        </Button>
      </div>

      <div className="bento-grid bento-grid--asymmetric">
        {/* Left / Main Brief Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card variant="elevated" padding="lg">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <Badge variant="primary">{item.platform}</Badge>
              <Badge variant="accent">{item.niche}</Badge>
              <Badge variant={item.status === 'active' ? 'secondary' : 'outline'}>
                {item.status.toUpperCase()}
              </Badge>
            </div>

            <h1 style={{ fontSize: '28px', lineHeight: 1.3, marginBottom: '12px' }}>
              {item.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              <span>Posted by <b>{item.brand?.businessName || item.brand?.name || 'Brand'}</b></span>
              <span>•</span>
              <span>📍 {item.location}</span>
            </div>

            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--color-neutral-subtle)' }}>
              Campaign Overview & Brief
            </h3>
            <p style={{ fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-line', color: 'var(--color-text-primary)', marginBottom: '28px' }}>
              {item.description}
            </p>

            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--color-neutral-subtle)' }}>
              Required Deliverables
            </h3>
            {item.deliverables?.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {item.deliverables.map((d, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', background: 'var(--color-surface-2)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                Deliverables can be aligned directly with the brand in messages.
              </p>
            )}
          </Card>
        </div>

        {/* Right / Application & Summary Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Stats Card */}
          <Card variant="glass" padding="md">
            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Campaign Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Budget Range</span>
                <b style={{ color: 'var(--color-secondary)' }}>{item.budget_range}</b>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Platform</span>
                <span>{item.platform}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Min Followers</span>
                <span>{item.target_followers_min ? Number(item.target_followers_min).toLocaleString() : 'Open to all'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>Location Preference</span>
                <span>{item.location}</span>
              </div>
            </div>
          </Card>

          {/* Contact / Pitch Form */}
          <Card variant="elevated" padding="lg">
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>
              💬 Contact Brand / Send Pitch
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
              Send your collaboration proposal or ask questions directly. A dedicated message thread will be opened with the brand.
            </p>

            <form onSubmit={handleApply}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Your Proposal / Pitch Note *
                </label>
                <textarea
                  required
                  rows={4}
                  className="ui-input"
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '13px' }}
                  placeholder="Introduce yourself, mention relevant past work or ideas for this campaign..."
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                />
              </div>

              <Input
                label="Your Proposed Quote / Rate (Optional)"
                placeholder="e.g. ₹8,000 for 1 Reel + 2 Stories"
                value={proposedRate}
                onChange={(e) => setProposedRate(e.target.value)}
              />

              {applyError && <ErrorState error={applyError} />}

              <Button
                type="submit"
                size="lg"
                className="full"
                loading={applying}
                disabled={applying || !proposal.trim()}
                style={{ marginTop: '12px' }}
              >
                {applying ? 'Sending Proposal…' : 'Send Pitch & Open Chat'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </main>
  )
}

export function BrandCampaignsPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    niche: 'Fashion & Style',
    platform: 'Instagram',
    deliverables: '1 Reel (30-60s), 2 Stories',
    budgetRange: '₹5,000–₹15,000',
    location: 'Remote / Pan-India',
    targetFollowersMin: 1000,
  })

  const loadMine = () => {
    setLoading(true)
    campaignsService
      .listMine()
      .then((data) => setItems(data.items || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMine()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError('')

    try {
      const deliverablesArray = form.deliverables
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      await campaignsService.create({
        ...form,
        targetFollowersMin: parseInt(form.targetFollowersMin, 10) || 0,
        deliverables: deliverablesArray,
      })

      setModalOpen(false)
      setForm({
        title: '',
        description: '',
        niche: 'Fashion & Style',
        platform: 'Instagram',
        deliverables: '1 Reel (30-60s), 2 Stories',
        budgetRange: '₹5,000–₹15,000',
        location: 'Remote / Pan-India',
        targetFollowersMin: 1000,
      })
      loadMine()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleStatus = async (item) => {
    const nextStatus = item.status === 'active' ? 'paused' : 'active'
    try {
      await campaignsService.update(item.id, { status: nextStatus })
      loadMine()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this advertisement?')) return
    try {
      await campaignsService.remove(id)
      loadMine()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="overline">
            <i /> Brand Campaign Management
          </div>
          <h1 style={{ marginTop: '6px' }}>My Advertisements & Briefs</h1>
          <p>
            Create advertisement briefs with required deliverables and compensation. Influencers can browse and submit proposals directly.
          </p>
        </div>
        <div>
          <Button onClick={() => setModalOpen(true)}>
            + Create New Advertisement
          </Button>
        </div>
      </div>

      {error && <ErrorState error={error} />}

      {loading ? (
        <LoadingState label="Loading your brand advertisements…" />
      ) : items && items.length === 0 ? (
        <EmptyState title="No Campaign Advertisements Yet">
          <p style={{ marginBottom: '16px' }}>
            You haven't posted any advertisements yet. Create your first campaign to start receiving creator pitches!
          </p>
          <Button onClick={() => setModalOpen(true)}>+ Post First Advertisement</Button>
        </EmptyState>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items?.map((c) => (
            <Card key={c.id} variant="elevated" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                    <Badge variant={c.status === 'active' ? 'secondary' : 'outline'}>
                      {c.status.toUpperCase()}
                    </Badge>
                    <Badge variant="primary">{c.platform}</Badge>
                    <Badge variant="accent">{c.niche}</Badge>
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>{c.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {c.description}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--color-neutral-subtle)' }}>
                    <span>💰 <b>Budget:</b> {c.budget_range}</span>
                    <span>📍 <b>Location:</b> {c.location}</span>
                    <span>👥 <b>Min Followers:</b> {c.target_followers_min || 'None'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Link to={`/campaigns/${c.id}`} className="ui-button ui-btn--secondary ui-btn--sm">
                    Preview Brief
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(c)}
                  >
                    {c.status === 'active' ? 'Pause Ad' : 'Activate Ad'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{ color: 'var(--color-error)' }}
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE ADVERTISEMENT MODAL */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--color-surface-1)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px' }}>Post New Brand Advertisement</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '20px' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Fill in the advertisement specifications. Creators matching your niche and target audience will view this brief and reach out to you.
            </p>

            <form onSubmit={handleCreate}>
              <Input
                label="Campaign / Ad Title"
                required
                placeholder="e.g. Summer Skincare Product Launch Reel"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <div className="form-row-2">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Category / Niche *
                  </label>
                  <select
                    className="ui-input"
                    value={form.niche}
                    onChange={(e) => setForm({ ...form, niche: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    {NICHES.filter((x) => x !== 'All Niches').map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                    Primary Platform *
                  </label>
                  <select
                    className="ui-input"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    {PLATFORMS.filter((x) => x !== 'All Platforms').map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
                  Detailed Brief / Requirements *
                </label>
                <textarea
                  required
                  rows={4}
                  className="ui-input"
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '13px' }}
                  placeholder="Explain the campaign goals, tone of voice, visual aesthetic, what creators should highlight, and any specific do's and don'ts..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <Input
                label="Deliverables (comma-separated)"
                required
                placeholder="e.g. 1 Reel (30-60s), 2 Stories with Link, 1 Product Photo"
                value={form.deliverables}
                onChange={(e) => setForm({ ...form, deliverables: e.target.value })}
              />

              <div className="form-row-2">
                <Input
                  label="Budget / Compensation Range"
                  required
                  placeholder="e.g. ₹5,000–₹12,000 or Barter + ₹3,000"
                  value={form.budgetRange}
                  onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                />
                <Input
                  label="Target Creator Location"
                  placeholder="e.g. Pan-India / Remote or Mumbai only"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <Input
                label="Minimum Follower Count Required"
                type="number"
                placeholder="e.g. 2000"
                value={form.targetFollowersMin}
                onChange={(e) => setForm({ ...form, targetFollowersMin: e.target.value })}
              />

              {formError && <ErrorState error={formError} />}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={busy} disabled={busy}>
                  {busy ? 'Publishing Ad Brief…' : 'Publish Advertisement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
