import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { brandsService } from '../../services/brands'
import { conversationsService } from '../../services/conversations'
import { useAuth } from '../../context/AuthContext'
import {
  Button,
  Card,
  Badge,
  Input,
  LoadingState,
  ErrorState,
  EmptyState,
  Avatar,
  BentoGrid,
  MetricCard,
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from '../../components/ui'

const BRAND_CATEGORIES = [
  'All Categories',
  'Food & Beverage',
  'Beauty & Skincare',
  'Fashion & Apparel',
  'Tech & Gadgets',
  'Travel & Lifestyle',
  'Fitness & Wellness',
  'Consumer & D2C',
]

const BRAND_LOCATIONS = [
  'All locations',
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Remote / Pan-India',
]

export function BrandOnboardingPage() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    budgetRange: '',
    location: '',
    website: '',
    deckLink: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await brandsService.saveProfile(form)
      nav('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="setup">
      <div className="overline">
        <i /> Brand Profile Setup
      </div>
      <h1 style={{ marginTop: '8px' }}>Tell creators about your brand.</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
        This profile helps creators discover your company, visit your store/website, and review your campaign expectations.
      </p>

      <form onSubmit={submit}>
        <Input
          label="Business / Brand Name"
          required
          placeholder="e.g. Blue Tokai, Kiro Beauty, Mokobara"
          value={form.businessName}
          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
        />

        <Input
          label="Industry / Business Category"
          required
          placeholder="e.g. Specialty Café, Organic Skincare, Travel Luggage"
          value={form.businessType}
          onChange={(e) => setForm({ ...form, businessType: e.target.value })}
        />

        <div className="form-row-2">
          <Input
            label="Estimated Campaign Budget"
            required
            placeholder="e.g. ₹5,000–₹25,000"
            value={form.budgetRange}
            onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
          />
          <Input
            label="Primary City / Headquarters"
            required
            placeholder="e.g. Mumbai, Bengaluru"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>

        <div className="form-row-2">
          <Input
            label="Official Website URL"
            placeholder="https://yourbrand.com"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          <Input
            label="Pitch Deck / Brief / Upload Link"
            placeholder="https://drive.google.com/... or brand deck link"
            value={form.deckLink}
            onChange={(e) => setForm({ ...form, deckLink: e.target.value })}
          />
        </div>

        <Input
          label="Brand Story / Overview"
          placeholder="Tell creators what makes your brand unique, your visual aesthetic, and what you look for in creators..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {error && <ErrorState error={error} />}

        <Button
          disabled={busy}
          loading={busy}
          size="lg"
          className="full"
          style={{ marginTop: '16px' }}
        >
          {busy ? 'Saving profile…' : 'Complete Setup & Enter Workspace'}
        </Button>
      </form>
    </main>
  )
}

export function BrandDiscoveryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All Categories')
  const [location, setLocation] = useState('All locations')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadBrands = async () => {
    setLoading(true)
    setError('')
    try {
      const filters = {}
      if (search.trim()) filters.search = search.trim()
      if (category !== 'All Categories') filters.businessType = category
      if (location !== 'All locations') filters.location = location

      const res = await brandsService.list(filters)
      setData(res.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrands()
  }, [category, location])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadBrands()
  }

  return (
    <main className="page">
      <FadeIn className="page-heading">
        <div>
          <div className="overline">
            <i /> Brand Directory & Discovery
          </div>
          <h1 style={{ marginTop: '6px' }}>Explore Brands & Partnerships</h1>
          <p>
            Search verified brands offering creator sponsorships. View company profiles, budgets, and explore active campaign advertisements.
          </p>
        </div>
      </FadeIn>

      {/* SEARCH AND FILTER BAR */}
      <FadeIn delay={0.08} distance={18}>
        <form
          className="bento-search-panel"
          style={{ marginBottom: '28px' }}
          onSubmit={handleSearchSubmit}
        >
          <div className="search-field-item" style={{ flex: 1.5 }}>
            <label>Brand Name or Keyword</label>
            <input
              placeholder="Search by brand name, product, niche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="search-field-item">
            <label>Industry / Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category filter"
            >
              {BRAND_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field-item">
            <label>Headquarters / City</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Location filter"
            >
              {BRAND_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary">
            Search Brands
          </Button>
        </form>
      </FadeIn>

      {/* QUICK CATEGORY CHIPS */}
      <FadeIn delay={0.12} distance={14} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginRight: '4px' }}>
            Popular:
          </span>
          {BRAND_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip ${category === cat ? 'chip--active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
          {(category !== 'All Categories' || location !== 'All locations' || search.trim()) && (
            <button
              type="button"
              onClick={() => {
                setCategory('All Categories')
                setLocation('All locations')
                setSearch('')
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

      {error && <ErrorState error={error} onRetry={loadBrands} />}

      {loading ? (
        <LoadingState label="Searching verified brands…" />
      ) : data?.length ? (
        <StaggerContainer
          key={search + category + location}
          className="bento-grid bento-grid--3"
          staggerDelay={0.07}
        >
          {data.map((brand) => (
            <StaggerItem key={brand.id}>
              <Card
                variant="elevated"
                hover
                padding="lg"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-xl)',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onClick={() => navigate(`/brands/${brand.id}`)}
              >
                <div>
                  {/* Brand Top Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Avatar
                        name={brand.businessName}
                        size="lg"
                        tone="secondary"
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {brand.businessName}
                          </h3>
                          <Badge variant="accent" size="sm">✓ Verified</Badge>
                        </div>
                        <span style={{ fontSize: '12.5px', color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {brand.businessType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Brand Location & Budget Row */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--color-surface-2)', padding: '10px 12px', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>📍 Headquarters:</span>
                      <b>{brand.location}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: 'var(--color-text-secondary)' }}>💰 Collab Budget:</span>
                      <b style={{ color: 'var(--color-secondary)' }}>{brand.budgetRange}</b>
                    </div>
                  </div>

                  {brand.description && (
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {brand.description}
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div style={{ paddingTop: '14px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: brand.activeCampaignsCount > 0 ? 'var(--color-secondary)' : 'var(--color-text-tertiary)' }}>
                    {brand.activeCampaignsCount > 0 ? `📢 ${brand.activeCampaignsCount} Active Campaign${brand.activeCampaignsCount > 1 ? 's' : ''}` : '✨ Open to Pitches'}
                  </span>
                  <Link
                    to={`/brands/${brand.id}`}
                    className="ui-button ui-btn--primary ui-btn--sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Brand & Campaigns →
                  </Link>
                </div>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <EmptyState
          title="No brands match these filters"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setCategory('All Categories')
                setLocation('All locations')
                setSearch('')
                loadBrands()
              }}
            >
              Reset Filters
            </Button>
          }
        >
          Try searching for a different brand keyword, category, or city.
        </EmptyState>
      )}
    </main>
  )
}

export function BrandProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [brand, setBrand] = useState(null)
  const [error, setError] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setLoading(true)
    brandsService
      .getById(id)
      .then(setBrand)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleMessageBrand = async () => {
    if (!user) {
      navigate('/auth/login')
      return
    }
    if (user.id === brand?.userId || user.id === brand?.id) {
      setActionNotice('ℹ️ This is your own brand profile.')
      return
    }
    if (user.role === 'brand') {
      setActionNotice('ℹ️ Switch to a creator account to message brand sponsorship opportunities.')
      return
    }
    if (!brand?.userId) return

    setBusy(true)
    setActionNotice('')
    try {
      const c = await conversationsService.create(brand.userId)
      navigate(`/conversations/${c.id}`)
    } catch (e) {
      setActionNotice(`⚠️ ${e.message || 'Could not start conversation'}`)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <main className="page">
        <LoadingState label="Loading brand profile and campaign history…" />
      </main>
    )
  }

  if (error || !brand) {
    return (
      <main className="page">
        <ErrorState error={error || 'Brand profile not found'} />
        <Button style={{ marginTop: '16px' }} onClick={() => navigate('/brands')}>
          ← Back to Brands Directory
        </Button>
      </main>
    )
  }

  const campaigns = brand.campaigns || []
  const activeCampaigns = campaigns.filter((c) => c.status === 'active')

  return (
    <main className="page">
      <div style={{ marginBottom: '20px' }}>
        <Button variant="secondary" size="sm" onClick={() => navigate('/brands')}>
          ← Back to All Brands
        </Button>
      </div>

      {/* Brand Hero Bento Banner */}
      <Card variant="glass" padding="lg" className="profile-hero-card">
        <div className="profile-hero-inner">
          <div className="profile-hero-left">
            <Avatar
              name={brand.businessName}
              size="xl"
              tone="secondary"
            />
            <div className="profile-hero-info">
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                <h1 className="profile-name-title">{brand.businessName}</h1>
                <Badge variant="accent">Verified Brand</Badge>
              </div>
              <p style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, margin: '0 0 6px 0' }}>
                {brand.businessType}
              </p>
              <p style={{ marginTop: '4px', fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
                📍 Headquarters: {brand.location}
              </p>
            </div>
          </div>

          <div className="profile-hero-actions">
            {brand.website && (
              <a
                href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-button ui-btn--secondary ui-btn--md"
              >
                🌐 Visit Website ↗
              </a>
            )}
            {brand.deckLink && (
              <a
                href={brand.deckLink.startsWith('http') ? brand.deckLink : `https://${brand.deckLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-button ui-btn--secondary ui-btn--md"
              >
                📄 Pitch Deck / Brief ↗
              </a>
            )}
            <Button size="md" variant="primary" loading={busy} onClick={handleMessageBrand}>
              💬 Message Brand
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

      {/* Brand Metrics Row */}
      <div className="brand-metrics-grid">
        <MetricCard
          label="Collaboration Budget Scale"
          value={brand.budgetRange || 'Flexible'}
          subtext="Typical campaign allocation"
        />
        <MetricCard
          label="Active Campaigns"
          value={`${activeCampaigns.length}`}
          subtext="Open sponsorship opportunities"
        />
        <MetricCard
          label="Operational Base"
          value={brand.location || 'Pan-India'}
          subtext="Target collaboration geography"
        />
      </div>

      {/* Brand About & Overview */}
      {brand.description && (
        <Card variant="elevated" padding="lg" style={{ marginBottom: '32px' }}>
          <Badge variant="primary" style={{ marginBottom: '12px' }}>Brand Overview</Badge>
          <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>About {brand.businessName}</h3>
          <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
            {brand.description}
          </p>
        </Card>
      )}

      {/* BRAND CAMPAIGNS SECTION */}
      <section style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
          <div>
            <div className="overline">
              <i /> Sponsorship Campaigns
            </div>
            <h2 style={{ fontSize: '24px', marginTop: '6px' }}>
              Campaigns by {brand.businessName}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13.5px' }}>
              Browse all open collaboration briefs and advertisements run by this brand.
            </p>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-secondary)' }}>
            {campaigns.length} Total Brief{campaigns.length !== 1 ? 's' : ''}
          </span>
        </div>

        {campaigns.length === 0 ? (
          <Card variant="elevated" padding="lg" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>📢</span>
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Active Public Campaign Briefs</h3>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13.5px', maxWidth: '480px', margin: '0 auto 20px' }}>
              {brand.businessName} hasn't listed open public advertisements at the moment. You can still reach out directly to pitch creative ideas!
            </p>
            <Button variant="primary" onClick={handleMessageBrand} loading={busy}>
              💬 Send Collaboration Pitch to Brand
            </Button>
          </Card>
        ) : (
          <StaggerContainer className="bento-grid bento-grid--2" staggerDelay={0.08}>
            {campaigns.map((camp) => (
              <StaggerItem key={camp.id}>
                <Card
                  variant="elevated"
                  hover
                  padding="lg"
                  style={{
                    borderRadius: 'var(--radius-xl)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <Badge variant="primary">{camp.platform || 'Instagram'}</Badge>
                        <Badge variant="accent">{camp.niche || brand.businessType || 'General'}</Badge>
                        <Badge variant={camp.status === 'active' ? 'secondary' : 'outline'}>
                          {(camp.status || 'active').toUpperCase()}
                        </Badge>
                      </div>
                      <b style={{ color: 'var(--color-secondary)', fontSize: '13px' }}>
                        {camp.budget_range || (camp.budget ? `₹${Number(camp.budget).toLocaleString()}` : 'Flexible')}
                      </b>
                    </div>

                    <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                      {camp.title}
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {camp.description}
                    </p>

                    {(() => {
                      const delivList = Array.isArray(camp.deliverables)
                        ? camp.deliverables
                        : (typeof camp.deliverables === 'string'
                            ? camp.deliverables.split('+').map(s => s.trim()).filter(Boolean)
                            : [])
                      if (delivList.length === 0) return null
                      return (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                          {delivList.map((d, i) => (
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
                      )
                    })()}
                  </div>

                  <div style={{ paddingTop: '14px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      Min Followers: {camp.target_followers_min ? Number(camp.target_followers_min).toLocaleString() : 'Any'}
                    </span>
                    <Link to={`/campaigns/${camp.id}`} className="ui-button ui-btn--primary ui-btn--sm">
                      View Brief & Pitch →
                    </Link>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>
    </main>
  )
}
