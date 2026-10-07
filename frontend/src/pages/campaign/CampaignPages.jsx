import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { campaignsService } from '../../services/campaigns'
import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Textarea,
  LoadingState,
  ErrorState,
  EmptyState,
  FadeIn,
  StaggerContainer,
  StaggerItem,
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
      {/* Signature CodeAstra Page Heading */}
      <FadeIn className="page-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="eyebrow">
              <span className="num-accent">[ 03 ]</span> Open Briefs &amp; Deals
            </span>
            <h2>
              Active <em>Sponsorship Deals<span className="dot-accent">.</span></em>
            </h2>
            <p>
              Explore verified brand campaign briefs. Pitch directly to decision-makers with upfront deliverables and transparent budgets.
            </p>
          </div>
          {profile?.role === 'brand' && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                to="/brand/campaigns"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '0px',
                  background: 'rgba(244, 241, 232, 0.08)',
                  border: '1px solid rgba(244, 241, 232, 0.2)',
                  color: '#f4f1e8',
                  fontWeight: 600,
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                📋 My Brand Briefs
              </Link>
              <Link
                to="/brand/campaigns"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  borderRadius: '0px',
                  background: '#0047AB',
                  border: '1px solid #0047AB',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(0, 71, 171, 0.35)',
                  transition: 'all 0.2s ease',
                }}
              >
                + Post New Brief
              </Link>
            </div>
          )}
        </div>
      </FadeIn>

      {/* SEARCH AND CLEAN FILTERS BUTTON */}
      <FadeIn delay={0.08} distance={16} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', maxWidth: '760px' }}>
          <div
            style={{
              flex: 1,
              minWidth: '260px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(244, 241, 232, 0.03)',
              border: '1px solid rgba(244, 241, 232, 0.14)',
              borderRadius: 'var(--radius-pill)',
              padding: '8px 16px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(244, 241, 232, 0.06)',
            }}
          >
            <span style={{ fontSize: '15px', color: 'rgba(244, 241, 232, 0.45)' }}>🔍</span>
            <input
              placeholder="Search campaigns by keyword, brand, or requirements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search campaigns"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: '14.5px',
                fontFamily: 'var(--font-display)',
                color: 'var(--cb-text)',
                outline: 'none',
                padding: '4px 0',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{
                  background: 'rgba(244, 241, 232, 0.08)',
                  border: 'none',
                  color: 'rgba(244, 241, 232, 0.6)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '2px 7px',
                  borderRadius: '999px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={openSheet}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '42px',
              padding: '0 18px',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '13px',
              fontFamily: 'var(--font-display)',
              background: activeCount > 0 ? '#f4f1e8' : 'rgba(244, 241, 232, 0.04)',
              color: activeCount > 0 ? '#0b0b0a' : 'rgba(244, 241, 232, 0.85)',
              border: `1px solid ${activeCount > 0 ? '#f4f1e8' : 'rgba(244, 241, 232, 0.14)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters</span>
            {activeCount > 0 && (
              <span
                style={{
                  background: '#0b0b0a',
                  color: '#f4f1e8',
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  borderRadius: '10px',
                  padding: '1px 7px',
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
            {niche !== 'All Niches' && (
              <button
                type="button"
                onClick={() => setNiche('All Niches')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(244, 241, 232, 0.06)',
                  border: '1px solid rgba(244, 241, 232, 0.2)',
                  color: '#f4f1e8',
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{niche}</span>
                <span style={{ color: 'rgba(244, 241, 232, 0.45)', fontWeight: 700 }}>✕</span>
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
                  background: 'rgba(244, 241, 232, 0.06)',
                  border: '1px solid rgba(244, 241, 232, 0.2)',
                  color: '#f4f1e8',
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{platform}</span>
                <span style={{ color: 'rgba(244, 241, 232, 0.45)', fontWeight: 700 }}>✕</span>
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
                color: 'rgba(244, 241, 232, 0.5)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                padding: '4px 8px',
                textDecoration: 'underline',
              }}
            >
              Clear all
            </button>
          </div>
        )}
      </FadeIn>

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
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={() => setSheetOpen(false)}
        >
          <div
            style={{
              background: '#121211',
              borderTop: '1px solid rgba(244, 241, 232, 0.16)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '28px 24px 36px',
              maxHeight: '85vh',
              overflowY: 'auto',
              maxWidth: '580px',
              margin: '0 auto',
              width: '100%',
              boxShadow: '0 -20px 50px rgba(0, 0, 0, 0.9)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag indicator */}
            <div
              style={{
                width: '40px',
                height: '4px',
                background: 'rgba(244, 241, 232, 0.18)',
                borderRadius: '2px',
                margin: '0 auto 20px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--cb-text)', margin: 0, fontFamily: 'var(--font-display)' }}>
                Filter Sponsorships
              </h3>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(244, 241, 232, 0.6)',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Niche Section */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(244, 241, 232, 0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                Category / Niche
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {NICHES.map((n) => {
                  const isActive = tempNiche === n
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTempNiche(n)}
                      style={{
                        background: isActive ? '#f4f1e8' : 'rgba(244, 241, 232, 0.04)',
                        color: isActive ? '#0b0b0a' : 'rgba(244, 241, 232, 0.75)',
                        border: `1px solid ${isActive ? '#f4f1e8' : 'rgba(244, 241, 232, 0.12)'}`,
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        fontFamily: 'var(--font-display)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Platform Section */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'rgba(244, 241, 232, 0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', marginBottom: '12px' }}>
                Platform
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PLATFORMS.map((p) => {
                  const isActive = tempPlatform === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTempPlatform(p)}
                      style={{
                        background: isActive ? '#f4f1e8' : 'rgba(244, 241, 232, 0.04)',
                        color: isActive ? '#0b0b0a' : 'rgba(244, 241, 232, 0.75)',
                        border: `1px solid ${isActive ? '#f4f1e8' : 'rgba(244, 241, 232, 0.12)'}`,
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        fontFamily: 'var(--font-display)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '9999px',
                  background: 'rgba(244, 241, 232, 0.05)',
                  border: '1px solid rgba(244, 241, 232, 0.14)',
                  color: 'rgba(244, 241, 232, 0.8)',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setTempNiche('All Niches')
                  setTempPlatform('All Platforms')
                  setNiche('All Niches')
                  setPlatform('All Platforms')
                  setSheetOpen(false)
                }}
              >
                Clear all
              </button>
              <button
                type="button"
                style={{
                  flex: 2,
                  padding: '12px 20px',
                  borderRadius: '9999px',
                  background: '#f4f1e8',
                  border: '1px solid #f4f1e8',
                  color: '#0b0b0a',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(244, 241, 232, 0.2)',
                }}
                onClick={() => {
                  setNiche(tempNiche)
                  setPlatform(tempPlatform)
                  setSheetOpen(false)
                }}
              >
                Apply Filters
              </button>
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
        <StaggerContainer
          key={search + niche + platform}
          className="campaign-grid"
          style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}
          staggerDelay={0.07}
        >
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  padding: '24px',
                  background: 'rgba(244, 241, 232, 0.03)',
                  border: '1px solid rgba(244, 241, 232, 0.12)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(244, 241, 232, 0.06)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 16px 40px -10px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(244, 241, 232, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.12)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(244, 241, 232, 0.06)'
                }}
                onClick={() => navigate(`/campaigns/${item.id}`)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: 'rgba(244, 241, 232, 0.08)',
                          color: '#f4f1e8',
                          border: '1px solid rgba(244, 241, 232, 0.2)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {item.platform}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'rgba(244, 241, 232, 0.03)',
                          color: 'rgba(244, 241, 232, 0.7)',
                          border: '1px solid rgba(244, 241, 232, 0.1)',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {item.niche}
                      </span>
                    </div>
                    <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#f4f1e8', fontFamily: 'var(--font-mono)' }}>
                      💰 {item.budget_range}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px', color: 'var(--cb-text)', fontFamily: 'var(--font-display)' }}>
                    {item.title}
                  </h3>

                  <div style={{ fontSize: '12.5px', color: 'rgba(244, 241, 232, 0.6)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}>
                    <b style={{ color: 'var(--cb-text)', fontWeight: 600 }}>{item.brand?.businessName || item.brand?.name || 'Brand'}</b>
                    <span>•</span>
                    <span>📍 {item.location}</span>
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'rgba(244, 241, 232, 0.65)', lineHeight: 1.6, marginBottom: '18px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.description}
                  </p>

                  {(() => {
                    const delivList = Array.isArray(item.deliverables)
                      ? item.deliverables
                      : (typeof item.deliverables === 'string'
                          ? item.deliverables.split('+').map(s => s.trim()).filter(Boolean)
                          : [])
                    if (delivList.length === 0) return null
                    return (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                        {delivList.map((d, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '11px',
                              background: 'rgba(244, 241, 232, 0.03)',
                              border: '1px solid rgba(244, 241, 232, 0.1)',
                              padding: '3px 10px',
                              borderRadius: '999px',
                              color: 'rgba(244, 241, 232, 0.85)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            ✓ {d}
                          </span>
                        ))}
                      </div>
                    )
                  })()}
                </div>

                <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(244, 241, 232, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: 'rgba(244, 241, 232, 0.45)', fontFamily: 'var(--font-mono)' }}>
                    Min Followers: {item.target_followers_min ? Number(item.target_followers_min).toLocaleString() : 'Any'}
                  </span>
                  <Link
                    to={`/campaigns/${item.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      borderRadius: '9999px',
                      background: '#f4f1e8',
                      color: '#0b0b0a',
                      fontSize: '12px',
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ffffff'
                      e.currentTarget.style.transform = 'translateX(2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f4f1e8'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    View Brief &amp; Contact →
                  </Link>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
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

  const delivInfo = (() => {
    if (!item) return { reels: 0, posts: 0, stories: 0, list: [], deadline: 'Rolling' }
    const list = Array.isArray(item.deliverables)
      ? item.deliverables
      : (typeof item.deliverables === 'string'
          ? item.deliverables.split('+').map(s => s.trim()).filter(Boolean)
          : [])
    let reels = item.reelsCount || 0
    let posts = item.postsCount || 0
    let stories = item.storiesCount || 0
    if (!reels && !posts && !stories) {
      for (const it of list) {
        const lower = it.toLowerCase()
        const m = lower.match(/(\d+)\s*x?/)
        const count = m ? parseInt(m[1], 10) : 1
        if (lower.includes('reel') || lower.includes('video') || lower.includes('short') || lower.includes('grwm')) {
          reels += count
        } else if (lower.includes('story') || lower.includes('stories')) {
          stories += count
        } else if (lower.includes('post') || lower.includes('carousel') || lower.includes('image') || lower.includes('photo')) {
          posts += count
        }
      }
    }
    return {
      reels: reels || (list.some(s => s.toLowerCase().includes('reel')) ? 1 : 0),
      posts: posts || (list.some(s => s.toLowerCase().includes('post') || s.toLowerCase().includes('carousel')) ? 1 : 0),
      stories: stories || (list.some(s => s.toLowerCase().includes('story')) ? 2 : 0),
      list,
      deadline: item.deadline || '30 Apr 2026'
    }
  })()

  return (
    <main className="page">
      <div style={{ marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (window.history.length > 2) {
              nav(-1)
            } else {
              nav('/campaigns')
            }
          }}
        >
          ← Back
        </Button>

        {item.brand && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => nav(`/brands/${item.brand?.id || item.brand_id}?campaign=${item.id}`)}
          >
            🏢 View Brand Profile &amp; All Other Campaigns →
          </Button>
        )}
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

            <span style={{ fontSize: '12px', color: '#60a5fa', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Product Advert
            </span>
            <h1 style={{ fontSize: '28px', lineHeight: 1.3, margin: '4px 0 12px 0' }}>
              {item.productName || item.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
              <span>Posted by <b>{item.brand?.businessName || item.brand?.name || 'Brand'}</b></span>
              <span>•</span>
              <span>📍 {item.location}</span>
            </div>

            {/* 4 Specs Cards: Reels, Posts, Stories, Deadline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  🎬 Reels To Post
                </span>
                <b style={{ fontSize: '15px' }}>
                  {delivInfo.reels > 0 ? `${delivInfo.reels} Dedicated Reel${delivInfo.reels > 1 ? 's' : ''}` : 'Optional'}
                </b>
              </div>

              <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  📸 Posts To Publish
                </span>
                <b style={{ fontSize: '15px' }}>
                  {delivInfo.posts > 0 ? `${delivInfo.posts} Feed Post / Carousel` : 'None required'}
                </b>
              </div>

              <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  ⏱️ Stories To Share
                </span>
                <b style={{ fontSize: '15px' }}>
                  {delivInfo.stories > 0 ? `${delivInfo.stories} Story Link${delivInfo.stories > 1 ? 's' : ''}` : 'Optional'}
                </b>
              </div>

              <div style={{ background: 'rgba(0, 71, 171, 0.1)', border: '1px solid rgba(0, 71, 171, 0.3)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
                <span style={{ fontSize: '11px', color: '#7eb1ff', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  📅 Deadline
                </span>
                <b style={{ fontSize: '15px' }}>
                  {delivInfo.deadline}
                </b>
              </div>
            </div>

            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--color-neutral-subtle)' }}>
              Campaign Overview &amp; Brief
            </h3>
            <p style={{ fontSize: '15px', lineHeight: 1.8, whiteSpace: 'pre-line', color: 'var(--color-text-primary)', marginBottom: '28px' }}>
              {item.description}
            </p>

            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--color-neutral-subtle)' }}>
              Required Deliverables
            </h3>
            {delivInfo.list.length === 0 ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
                Deliverables can be aligned directly with the brand in messages.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {delivInfo.list.map((d, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', background: 'var(--color-surface-2)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <span style={{ color: 'var(--color-secondary)', fontWeight: 'bold' }}>✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/campaigns"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '0px',
              background: 'rgba(244, 241, 232, 0.06)',
              border: '1px solid rgba(244, 241, 232, 0.18)',
              color: '#f4f1e8',
              fontWeight: 600,
              fontSize: '11.5px',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            ← Browse All Briefs
          </Link>
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
            <Card key={c.id} variant="elevated" padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                    <Badge variant={c.status === 'active' ? 'primary' : 'outline'}>
                      {c.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{c.platform}</Badge>
                    <Badge variant="accent">{c.niche}</Badge>
                  </div>
                  <h3 style={{ fontSize: '19px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
                    {c.description}
                  </p>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '12.5px', color: 'var(--color-text-secondary)', padding: '10px 14px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <span>💰 <strong style={{ color: 'var(--color-text-primary)' }}>Budget:</strong> {c.budget_range}</span>
                    <span>📍 <strong style={{ color: 'var(--color-text-primary)' }}>Location:</strong> {c.location}</span>
                    <span>👥 <strong style={{ color: 'var(--color-text-primary)' }}>Min Followers:</strong> {c.target_followers_min ? Number(c.target_followers_min).toLocaleString() : 'None'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Link to={`/campaigns/${c.id}`} className="ui-button ui-btn--secondary ui-btn--sm">
                    Preview Brief →
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(c)}
                  >
                    {c.status === 'active' ? 'Pause Ad' : 'Activate Ad'}
                  </Button>
                  <Button
                    variant="ghost"
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
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false)
          }}
        >
          <div className="modal-container">
            <div className="modal-header">
              <div className="modal-title-group">
                <h2>Post New Brand Advertisement</h2>
                <p>
                  Fill in the advertisement specifications. Creators matching your niche and target audience will view this brief and reach out to you.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Campaign / Ad Title"
                required
                placeholder="e.g. Summer Skincare Product Launch Reel"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <div className="form-row-2">
                <Select
                  label="Category / Niche"
                  required
                  value={form.niche}
                  onChange={(e) => setForm({ ...form, niche: e.target.value })}
                >
                  {NICHES.filter((x) => x !== 'All Niches').map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Primary Platform"
                  required
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                >
                  {PLATFORMS.filter((x) => x !== 'All Platforms').map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>

              <Textarea
                label="Detailed Brief / Requirements"
                required
                rows={4}
                placeholder="Explain the campaign goals, tone of voice, visual aesthetic, what creators should highlight, and any specific do's and don'ts..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />

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

              <div className="modal-footer">
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
