import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
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

const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees'
]

const BRAND_GOAL_OPTIONS = [
  '🌟 Brand Awareness',
  '📦 Product Launch',
  '🛒 Conversions & Sales',
  '📱 User-Generated Content (UGC)',
  '🤝 Long-Term Ambassador',
  '🎥 Social Reach & Engagement'
]

const BRAND_BUDGET_RANGES = [
  '₹25,000 - ₹50,000',
  '₹50,000 - ₹1,50,000',
  '₹1,50,000 - ₹5,00,000',
  '₹5,00,000+'
]

export function BrandOnboardingPage() {
  const nav = useNavigate()
  const { user, profile, refreshProfile } = useAuth()

  // Retrieve initial draft if available
  const draft = (() => {
    try {
      return JSON.parse(localStorage.getItem('brandhub_onboarding_draft') || '{}')
    } catch {
      return {}
    }
  })()

  // Step state: 1: Brand Info, 2: Brand Profile, 3: Review, 4: Complete
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Brand Info
  const [brandName, setBrandName] = useState(draft.name || profile?.name || '')
  const [category, setCategory] = useState(BRAND_CATEGORIES[1] || 'Fashion & Apparel')
  const [website, setWebsite] = useState(draft.website || '')
  const [companySize, setCompanySize] = useState(COMPANY_SIZES[1])
  const [location, setLocation] = useState(draft.location || draft.country || 'Mumbai, India')
  const [logoUrl, setLogoUrl] = useState(draft.profileImageUrl || '')

  // Step 2: Brand Profile Details
  const [description, setDescription] = useState(
    draft.description || `${brandName || 'Our brand'} crafts high-quality products and collaborates with authentic creators.`
  )
  const [targetAudience, setTargetAudience] = useState('Gen Z & Millennials interested in lifestyle, fashion, and tech')
  const [goals, setGoals] = useState(['🌟 Brand Awareness', '🛒 Conversions & Sales'])
  const [budgetRange, setBudgetRange] = useState(BRAND_BUDGET_RANGES[1])
  const [contactEmail, setContactEmail] = useState(draft.email || user?.email || '')
  const [contactPerson, setContactPerson] = useState(draft.name || '')

  const logoInputRef = React.useRef(null)

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setLogoUrl(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  // --- Step 1 Submit ---
  const handleStep1Submit = (e) => {
    e.preventDefault()
    setError('')
    if (!brandName.trim()) {
      setError('Please provide your brand or business name.')
      return
    }
    setStep(2)
  }

  // --- Step 2 Submit ---
  const handleStep2Submit = (e) => {
    e.preventDefault()
    setError('')
    if (!description.trim()) {
      setError('Please provide a short description about your brand.')
      return
    }
    setStep(3)
  }

  // --- Step 3 Submit: Save & Confirm ---
  const handleConfirmProfile = async () => {
    setBusy(true)
    setError('')
    try {
      const payload = {
        businessName: brandName.trim(),
        businessType: category,
        website: website.trim(),
        budgetRange,
        location: location.trim(),
        description: `${description.trim()}\n\n[Target Audience: ${targetAudience.trim()}]\n[Goals: ${goals.join(', ')}]\n[Company Size: ${companySize}]\n[Contact: ${contactPerson} <${contactEmail}>]`,
        logoUrl
      }

      await brandsService.saveProfile(payload)
      if (typeof refreshProfile === 'function') {
        await refreshProfile()
      }
      setStep(4)
    } catch (err) {
      setError(err.message || 'Failed to save brand profile. Please check your information.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="setup" style={{ maxWidth: '780px', margin: '40px auto', padding: '0 20px' }}>
      {/* Top Breadcrumb & Step Tracker */}
      <div style={{ marginBottom: '28px' }}>
        <div className="overline" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <i /> Brand Onboarding Workspace &bull; Step {step} of 4
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h1 style={{ fontSize: '26px', margin: 0, color: '#F4F1E8' }}>
            {step === 1 ? 'Brand Information' :
             step === 2 ? 'Brand Profile & Goals' :
             step === 3 ? 'Review Information' :
             'Complete Brand Setup'}
          </h1>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
            {Math.round((step / 4) * 100)}% Complete
          </span>
        </div>
        <div style={{ width: '100%', height: '4px', background: 'rgba(244, 241, 232, 0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${(step / 4) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #0047AB 0%, #2563EB 100%)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {error && <ErrorState error={error} />}

      {/* ================= STEP 1: BRAND INFORMATION ================= */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="auth-card" style={{ maxWidth: '100%' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
            Provide basic business information so creators can recognize and research your company.
          </p>

          {/* Logo Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '8px',
                background: logoUrl ? `url(${logoUrl}) center/cover no-repeat` : 'rgba(244, 241, 232, 0.06)',
                border: '1px solid rgba(244, 241, 232, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                color: '#F4F1E8',
                flexShrink: 0
              }}
            >
              {!logoUrl && (brandName ? brandName[0]?.toUpperCase() : '🏢')}
            </div>
            <div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button type="button" variant="secondary" size="sm" onClick={() => logoInputRef.current?.click()}>
                  {logoUrl ? 'Change Logo' : 'Upload Brand Logo'}
                </Button>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
                Square PNG/JPEG recommended. Max 5MB.
              </p>
            </div>
          </div>

          <Input
            label="Brand / Company Name"
            required
            placeholder="e.g. Aura Living, Blue Tokai, Mokobara"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Industry Category</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ background: 'rgba(244, 241, 232, 0.04)', color: '#F4F1E8', border: '1px solid rgba(244, 241, 232, 0.12)', padding: '12px 14px' }}
              >
                {BRAND_CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c} style={{ background: '#0B0B0A' }}>{c}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Company Size</label>
              <select
                className="input-field"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                style={{ background: 'rgba(244, 241, 232, 0.04)', color: '#F4F1E8', border: '1px solid rgba(244, 241, 232, 0.12)', padding: '12px 14px' }}
              >
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s} style={{ background: '#0B0B0A' }}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <Input
              label="Official Website URL"
              type="url"
              placeholder="https://yourbrand.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />

            <Input
              label="Headquarters / Country Location"
              required
              placeholder="e.g. Mumbai, India or San Francisco, USA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="auth-actions-row" style={{ marginTop: '20px' }}>
            <Button type="submit" size="lg" className="full">
              Continue to Brand Profile →
            </Button>
          </div>
        </form>
      )}

      {/* ================= STEP 2: BRAND PROFILE ================= */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="auth-card" style={{ maxWidth: '100%' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
            Describe your brand values, target audience, and creator collaboration objectives.
          </p>

          <div className="input-group">
            <label className="input-label">Brand Description / About</label>
            <textarea
              className="input-field"
              rows={4}
              required
              placeholder="Tell creators what your brand does, what makes your products unique, and what aesthetic you look for…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ background: 'rgba(244, 241, 232, 0.04)', color: '#F4F1E8', border: '1px solid rgba(244, 241, 232, 0.12)', padding: '12px 14px', width: '100%', resize: 'vertical' }}
            />
          </div>

          <Input
            label="Target Audience"
            placeholder="e.g. Gen Z & Millennials interested in skincare, wellness, and conscious fashion"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
          />

          <div style={{ marginBottom: '20px' }}>
            <label className="input-label" style={{ display: 'block', marginBottom: '10px' }}>
              Primary Campaign Collaboration Goals
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {BRAND_GOAL_OPTIONS.map((goal) => {
                const isSelected = goals.includes(goal)
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => {
                      const next = isSelected ? goals.filter((g) => g !== goal) : [...goals, goal]
                      setGoals(next)
                    }}
                    style={{
                      background: isSelected ? 'rgba(0, 71, 171, 0.2)' : 'rgba(244, 241, 232, 0.03)',
                      border: isSelected ? '1px solid var(--color-accent)' : '1px solid rgba(244, 241, 232, 0.1)',
                      color: isSelected ? '#60A5FA' : '#F4F1E8',
                      padding: '10px 14px',
                      fontSize: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '} {goal}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Estimated Monthly Creator Budget</label>
              <select
                className="input-field"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                style={{ background: 'rgba(244, 241, 232, 0.04)', color: '#F4F1E8', border: '1px solid rgba(244, 241, 232, 0.12)', padding: '12px 14px' }}
              >
                {BRAND_BUDGET_RANGES.map((b) => (
                  <option key={b} value={b} style={{ background: '#0B0B0A' }}>{b}</option>
                ))}
              </select>
            </div>

            <Input
              label="Contact Person Name"
              placeholder="e.g. Elena Vance"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>

          <Input
            label="Business Contact Email"
            type="email"
            placeholder="collaborations@yourbrand.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />

          <div className="auth-actions-row" style={{ marginTop: '20px' }}>
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button type="submit" size="lg">
              Review Information →
            </Button>
          </div>
        </form>
      )}

      {/* ================= STEP 3: REVIEW INFORMATION ================= */}
      {step === 3 && (
        <div className="auth-card" style={{ maxWidth: '100%' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
            Verify your brand profile details before publishing to creator discovery.
          </p>

          <div style={{
            background: 'rgba(244, 241, 232, 0.02)',
            border: '1px solid rgba(244, 241, 232, 0.12)',
            padding: '24px',
            borderRadius: '6px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(244, 241, 232, 0.08)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '6px',
                  background: logoUrl ? `url(${logoUrl}) center/cover no-repeat` : 'rgba(0, 71, 171, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: '#F4F1E8'
                }}>
                  {!logoUrl && brandName[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#F4F1E8', margin: 0 }}>{brandName}</h3>
                  <span style={{ fontSize: '12px', color: '#60A5FA', fontFamily: 'var(--font-mono)' }}>{category} &bull; {companySize}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
              >
                Edit Info
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Website</span>
                <p style={{ fontSize: '13px', color: '#F4F1E8', margin: '2px 0 0' }}>{website || 'Not specified'}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Location</span>
                <p style={{ fontSize: '13px', color: '#F4F1E8', margin: '2px 0 0' }}>{location}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monthly Budget</span>
                <p style={{ fontSize: '13px', color: '#34D399', margin: '2px 0 0', fontWeight: 600 }}>{budgetRange}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact</span>
                <p style={{ fontSize: '13px', color: '#F4F1E8', margin: '2px 0 0' }}>{contactPerson ? `${contactPerson} (${contactEmail})` : contactEmail}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(244, 241, 232, 0.08)', paddingTop: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Brand Mission</span>
              <p style={{ fontSize: '13px', color: '#F4F1E8', lineHeight: 1.6, margin: '6px 0 12px' }}>{description}</p>

              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Campaign Goals</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                {goals.map((g) => (
                  <Badge key={g} variant="neutral">{g}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="auth-actions-row">
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(2)} disabled={busy}>
              ← Back to Details
            </Button>
            <Button
              type="button"
              size="lg"
              disabled={busy}
              loading={busy}
              onClick={handleConfirmProfile}
            >
              {busy ? 'Launching Profile…' : 'Confirm & Launch Brand Profile →'}
            </Button>
          </div>
        </div>
      )}

      {/* ================= STEP 4: COMPLETE BRAND SETUP ================= */}
      {step === 4 && (
        <div className="auth-card" style={{ maxWidth: '100%', textAlign: 'center', padding: '40px 24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            margin: '0 auto 20px',
            color: '#10B981'
          }}>
            ✓
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#F4F1E8', marginBottom: '8px' }}>
            Your Brand Profile Is Ready!
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '460px', margin: '0 auto 28px', lineHeight: 1.6 }}>
            Welcome to Brand2Influence! Your company profile is now published. You can now discover verified creators, review their audience metrics, and invite them to your brand campaigns.
          </p>

          <div style={{
            background: 'rgba(244, 241, 232, 0.02)',
            border: '1px solid rgba(244, 241, 232, 0.1)',
            padding: '18px',
            borderRadius: '6px',
            maxWidth: '460px',
            margin: '0 auto 30px',
            textAlign: 'left'
          }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-accent)', display: 'block', marginBottom: '8px' }}>
              Recommended Next Steps
            </span>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#F4F1E8', lineHeight: 1.8 }}>
              <li>Browse top-tier creators across Fashion, Tech, and Lifestyle</li>
              <li>Create your first campaign brief with target deliverables</li>
              <li>Review verified audience metrics before sending collaboration offers</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button size="lg" onClick={() => nav('/dashboard')}>
              Go to Brand Dashboard →
            </Button>
            <Button size="lg" variant="secondary" onClick={() => nav('/discover')}>
              Explore Creators
            </Button>
          </div>
        </div>
      )}
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
      {/* Signature CodeAstra Page Heading */}
      <FadeIn className="page-heading">
        <span className="eyebrow">
          <span className="num-accent">[ 02 ]</span> Brand Directory
        </span>
        <h2>
          Explore <em>Brands &amp; Partnerships<span className="dot-accent">.</span></em>
        </h2>
        <p>
          Search verified brands offering creator sponsorships. View company profiles, budgets, and explore active campaign advertisements.
        </p>
      </FadeIn>

      {/* Obsidian Glass Search & Filter Panel */}
      <FadeIn delay={0.08} distance={18}>
        <form
          className="bento-search-panel"
          style={{
            marginBottom: '28px',
            background: 'rgba(244, 241, 232, 0.03)',
            border: '1px solid rgba(244, 241, 232, 0.12)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 16px',
            boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(244, 241, 232, 0.06)',
            backdropFilter: 'blur(16px)',
          }}
          onSubmit={handleSearchSubmit}
        >
          <div className="search-field-item" style={{ flex: 1.5 }}>
            <label style={{ color: 'rgba(244, 241, 232, 0.45)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em' }}>
              Brand Name or Keyword
            </label>
            <input
              placeholder="Search by brand name, product, niche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                color: 'var(--cb-text)',
                border: 'none',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div className="search-field-item">
            <label style={{ color: 'rgba(244, 241, 232, 0.45)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em' }}>
              Industry / Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Category filter"
              style={{
                background: 'transparent',
                color: 'var(--cb-text)',
                border: 'none',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {BRAND_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} style={{ background: '#121211', color: '#f4f1e8' }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="search-field-item">
            <label style={{ color: 'rgba(244, 241, 232, 0.45)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em' }}>
              Headquarters / City
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Location filter"
              style={{
                background: 'transparent',
                color: 'var(--cb-text)',
                border: 'none',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {BRAND_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} style={{ background: '#121211', color: '#f4f1e8' }}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary" style={{ height: '44px' }}>
            Search Brands
          </Button>
        </form>
      </FadeIn>

      {/* QUICK CATEGORY CHIPS */}
      <FadeIn delay={0.12} distance={14} style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'rgba(244, 241, 232, 0.45)', marginRight: '4px' }}>
            CATEGORIES:
          </span>
          {BRAND_CATEGORIES.map((cat) => {
            const isActive = category === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
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
                {cat}
              </button>
            )
          })}
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
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  height: '100%',
                  cursor: 'pointer',
                  padding: '24px',
                  background: 'rgba(244, 241, 232, 0.03)',
                  border: '1px solid rgba(244, 241, 232, 0.12)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(244, 241, 232, 0.06)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
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
                onClick={() => navigate(`/brands/${brand.id}`)}
              >
                <div>
                  {/* Brand Top Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <Avatar
                        name={brand.businessName}
                        size="lg"
                        tone="secondary"
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cb-text)', margin: 0, fontFamily: 'var(--font-display)' }}>
                            {brand.businessName}
                          </h3>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: 'rgba(244, 241, 232, 0.08)',
                              color: '#f4f1e8',
                              border: '1px solid rgba(244, 241, 232, 0.2)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            ✓ Verified
                          </span>
                        </div>
                        <span style={{ fontSize: '12.5px', color: 'rgba(244, 241, 232, 0.55)', fontFamily: 'var(--font-mono)', marginTop: '3px', display: 'block' }}>
                          {brand.businessType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Brand Location & Budget Row */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      background: 'rgba(244, 241, 232, 0.025)',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      marginBottom: '16px',
                      border: '1px solid rgba(244, 241, 232, 0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                      <span style={{ color: 'rgba(244, 241, 232, 0.5)', fontFamily: 'var(--font-mono)' }}>📍 Headquarters</span>
                      <b style={{ color: 'var(--cb-text)', fontWeight: 600 }}>{brand.location}</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px' }}>
                      <span style={{ color: 'rgba(244, 241, 232, 0.5)', fontFamily: 'var(--font-mono)' }}>💰 Collab Budget</span>
                      <b style={{ color: '#f4f1e8', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{brand.budgetRange}</b>
                    </div>
                  </div>

                  {brand.description && (
                    <p style={{ fontSize: '13.5px', color: 'rgba(244, 241, 232, 0.65)', lineHeight: 1.6, marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {brand.description}
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(244, 241, 232, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: brand.activeCampaignsCount > 0 ? '#f4f1e8' : 'rgba(244, 241, 232, 0.45)' }}>
                    {brand.activeCampaignsCount > 0 ? `📢 ${brand.activeCampaignsCount} Active Campaign${brand.activeCampaignsCount > 1 ? 's' : ''}` : '✨ Open to Pitches'}
                  </span>
                  <Link
                    to={`/brands/${brand.id}`}
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
                    View Brand →
                  </Link>
                </div>
              </div>
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

function getDeliverablesBreakdown(camp) {
  if (!camp) return { reels: 0, posts: 0, stories: 0, list: [], deadline: 'Rolling' }
  const list = Array.isArray(camp.deliverables)
    ? camp.deliverables
    : (typeof camp.deliverables === 'string'
        ? camp.deliverables.split('+').map(s => s.trim()).filter(Boolean)
        : [])

  let reels = camp.reelsCount || 0
  let posts = camp.postsCount || 0
  let stories = camp.storiesCount || 0

  if (!reels && !posts && !stories) {
    for (const item of list) {
      const lower = item.toLowerCase()
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
    deadline: camp.deadline || '30 Apr 2026'
  }
}

export function BrandProfilePage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const campaignParam = searchParams.get('campaign')
  const navigate = useNavigate()
  const { user } = useAuth()
  const [brand, setBrand] = useState(null)
  const isOwner = Boolean(user && (user.id === brand?.userId || user.id === brand?.id))
  const [error, setError] = useState('')
  const [actionNotice, setActionNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [selectedCampId, setSelectedCampId] = useState(campaignParam || null)

  useEffect(() => {
    if (campaignParam) {
      setSelectedCampId(campaignParam)
    }
  }, [campaignParam])

  useEffect(() => {
    setLoading(true)
    brandsService
      .getById(id)
      .then((b) => {
        setBrand(b)
        if (b?.campaigns?.length > 0) {
          if (campaignParam) {
            setSelectedCampId(campaignParam)
          } else if (!selectedCampId) {
            setSelectedCampId(b.campaigns[0].id)
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, campaignParam])

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
    if (!brand?.userId && !brand?.id) return

    setBusy(true)
    setActionNotice('')
    try {
      const c = await conversationsService.create(brand.userId || brand.id)
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
  const selectedCampaign = campaigns.find(c => c.id === selectedCampId) || (campaigns.length > 0 ? campaigns[0] : null)
  const selectedDeliv = selectedCampaign ? getDeliverablesBreakdown(selectedCampaign) : null

  return (
    <main className="page">
      {/* 1. Header Navigation & Editorial Breadcrumb */}
      <FadeIn delay={0.04} distance={14}>
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1)
              } else {
                navigate('/campaigns')
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              height: '38px',
              padding: '0 18px',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '13px',
              fontFamily: 'var(--font-display)',
              background: 'rgba(244, 241, 232, 0.04)',
              color: '#f4f1e8',
              border: '1px solid rgba(244, 241, 232, 0.14)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(244, 241, 232, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.3)'
              e.currentTarget.style.transform = 'translateX(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(244, 241, 232, 0.04)'
              e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.14)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <span>← Back</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'rgba(244, 241, 232, 0.55)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <span style={{ color: 'rgba(244, 241, 232, 0.4)' }}>[ 02 // BRAND HUB ]</span>
            <span>•</span>
            <span style={{ color: '#f4f1e8', fontWeight: 600 }}>{brand.businessName}</span>
          </div>
        </div>
      </FadeIn>

      {/* 2. Brand Hero Bento Banner (Frosted Obsidian Glass) */}
      <FadeIn delay={0.08} distance={18}>
        <div
          style={{
            marginBottom: '28px',
            borderRadius: '24px',
            padding: 'clamp(24px, 4vw, 36px)',
            background: 'rgba(244, 241, 232, 0.03)',
            border: '1px solid rgba(244, 241, 232, 0.12)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 36px -10px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(244, 241, 232, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <Avatar
              name={brand.businessName}
              size="xl"
              tone="secondary"
              style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
                border: '1px solid rgba(244, 241, 232, 0.18)',
              }}
            />
            <div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: 800, color: '#f4f1e8', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>
                  {brand.businessName}
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
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
                  <span>🛡️</span> Verified Brand
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(244, 241, 232, 0.65)', fontFamily: 'var(--font-mono)', fontSize: '13px', flexWrap: 'wrap' }}>
                <span style={{ color: '#f4f1e8', fontWeight: 600 }}>{brand.businessType}</span>
                <span>•</span>
                <span>📍 Headquarters: {brand.location || 'India'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {brand.website && (
              <a
                href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  background: 'rgba(244, 241, 232, 0.04)',
                  border: '1px solid rgba(244, 241, 232, 0.16)',
                  color: '#f4f1e8',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 241, 232, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 241, 232, 0.04)'
                  e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.16)'
                }}
              >
                🌐 Visit Website ↗
              </a>
            )}
            {brand.deckLink && (
              <a
                href={brand.deckLink.startsWith('http') ? brand.deckLink : `https://${brand.deckLink}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '9999px',
                  background: 'rgba(244, 241, 232, 0.04)',
                  border: '1px solid rgba(244, 241, 232, 0.16)',
                  color: '#f4f1e8',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 241, 232, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 241, 232, 0.04)'
                  e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.16)'
                }}
              >
                📄 Brand Lookbook ↗
              </a>
            )}
            {isOwner ? (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  background: '#f4f1e8',
                  border: '1px solid #f4f1e8',
                  color: '#0b0b0a',
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(244, 241, 232, 0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                ⚙️ Settings
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={handleMessageBrand}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '9999px',
                  background: '#f4f1e8',
                  border: '1px solid #f4f1e8',
                  color: '#0b0b0a',
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(244, 241, 232, 0.15)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(244, 241, 232, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f4f1e8'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(244, 241, 232, 0.15)'
                }}
              >
                💬 {busy ? 'Connecting…' : 'Message Brand'}
              </button>
            )}
            {actionNotice && (
              <div style={{ width: '100%', fontSize: '12.5px', color: 'rgba(244, 241, 232, 0.8)', background: 'rgba(244, 241, 232, 0.06)', border: '1px solid rgba(244, 241, 232, 0.14)', padding: '8px 14px', borderRadius: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{actionNotice}</span>
                <button type="button" onClick={() => setActionNotice('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(244, 241, 232, 0.5)', fontSize: '13px', marginLeft: '6px' }}>✕</button>
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* 3. SELECTED CAMPAIGN SPOTLIGHT (Design based exactly on /campaigns) */}
      {selectedCampaign && (
        <FadeIn delay={0.12} distance={20}>
          <div
            style={{
              marginBottom: '36px',
              borderRadius: '24px',
              padding: 'clamp(24px, 4vw, 36px)',
              background: 'rgba(244, 241, 232, 0.03)',
              border: '1px solid rgba(244, 241, 232, 0.14)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(244, 241, 232, 0.08)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 700,
                      background: '#f4f1e8',
                      color: '#0b0b0a',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    ★ Featured Campaign Brief
                  </span>
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
                    {selectedCampaign.platform || 'Instagram'}
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
                      color: 'rgba(244, 241, 232, 0.75)',
                      border: '1px solid rgba(244, 241, 232, 0.12)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {selectedCampaign.niche || brand.businessType || 'General'}
                  </span>
                </div>

                <span style={{ fontSize: '11.5px', color: '#60a5fa', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Product Advertisement
                </span>
                <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 800, color: '#f4f1e8', fontFamily: 'var(--font-display)', margin: '4px 0 0 0', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                  {selectedCampaign.productName || selectedCampaign.title}
                </h2>
              </div>

              <div
                style={{
                  textAlign: 'right',
                  background: 'rgba(244, 241, 232, 0.04)',
                  padding: '12px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(244, 241, 232, 0.12)',
                }}
              >
                <span style={{ fontSize: '11px', color: 'rgba(244, 241, 232, 0.5)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '2px' }}>
                  Brand Pays
                </span>
                <strong style={{ fontSize: '22px', color: '#f4f1e8', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                  {selectedCampaign.budget_range || (selectedCampaign.budget ? `₹${Number(selectedCampaign.budget).toLocaleString()}` : 'Flexible')}
                </strong>
              </div>
            </div>

            {/* 4 Deliverables Specs Cards: Reels, Posts, Stories, Deadline */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '24px' }}>
              {/* Reels */}
              <div style={{ background: 'rgba(244, 241, 232, 0.03)', border: '1px solid rgba(244, 241, 232, 0.1)', borderRadius: '16px', padding: '16px 18px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(244, 241, 232, 0.5)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                  🎬 Reels To Post
                </span>
                <b style={{ fontSize: '16px', color: '#f4f1e8', fontFamily: 'var(--font-display)' }}>
                  {selectedDeliv.reels > 0 ? `${selectedDeliv.reels} Dedicated Reel${selectedDeliv.reels > 1 ? 's' : ''}` : 'Optional'}
                </b>
              </div>

              {/* Posts */}
              <div style={{ background: 'rgba(244, 241, 232, 0.03)', border: '1px solid rgba(244, 241, 232, 0.1)', borderRadius: '16px', padding: '16px 18px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(244, 241, 232, 0.5)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                  📸 Posts To Publish
                </span>
                <b style={{ fontSize: '16px', color: '#f4f1e8', fontFamily: 'var(--font-display)' }}>
                  {selectedDeliv.posts > 0 ? `${selectedDeliv.posts} Feed Post / Carousel` : 'Not required'}
                </b>
              </div>

              {/* Stories */}
              <div style={{ background: 'rgba(244, 241, 232, 0.03)', border: '1px solid rgba(244, 241, 232, 0.1)', borderRadius: '16px', padding: '16px 18px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(244, 241, 232, 0.5)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                  ⏱️ Stories To Share
                </span>
                <b style={{ fontSize: '16px', color: '#f4f1e8', fontFamily: 'var(--font-display)' }}>
                  {selectedDeliv.stories > 0 ? `${selectedDeliv.stories} Story Link${selectedDeliv.stories > 1 ? 's' : ''}` : 'Optional'}
                </b>
              </div>

              {/* Deadline */}
              <div style={{ background: 'rgba(244, 241, 232, 0.05)', border: '1px solid rgba(244, 241, 232, 0.18)', borderRadius: '16px', padding: '16px 18px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(244, 241, 232, 0.65)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>
                  📅 Campaign Deadline
                </span>
                <b style={{ fontSize: '16px', color: '#f4f1e8', fontFamily: 'var(--font-mono)' }}>
                  {selectedDeliv.deadline}
                </b>
              </div>
            </div>

            {/* Product Overview & Description */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '11.5px', color: 'rgba(244, 241, 232, 0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                Product Creative Brief &amp; Deliverables Overview
              </h4>
              <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: 'rgba(244, 241, 232, 0.85)', margin: 0, fontFamily: 'var(--font-body)' }}>
                {selectedCampaign.description}
              </p>
            </div>

            {/* Action Row */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid rgba(244, 241, 232, 0.08)' }}>
              <button
                type="button"
                disabled={busy}
                onClick={handleMessageBrand}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 24px',
                  borderRadius: '9999px',
                  background: '#f4f1e8',
                  border: '1px solid #f4f1e8',
                  color: '#0b0b0a',
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(244, 241, 232, 0.15)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ffffff'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f4f1e8'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                💬 Message {brand.businessName} &amp; Pitch for this Campaign
              </button>
              <Link
                to={`/campaigns/${selectedCampaign.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '11px 22px',
                  borderRadius: '9999px',
                  background: 'rgba(244, 241, 232, 0.04)',
                  border: '1px solid rgba(244, 241, 232, 0.16)',
                  color: '#f4f1e8',
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 241, 232, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(244, 241, 232, 0.04)'
                  e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.16)'
                }}
              >
                Full Campaign Application Page ↗
              </Link>
            </div>
          </div>
        </FadeIn>
      )}

      {/* 4. Brand Metrics Row (Frosted Obsidian Cards) */}
      <FadeIn delay={0.15} distance={18}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div
            style={{
              background: 'rgba(244, 241, 232, 0.03)',
              border: '1px solid rgba(244, 241, 232, 0.12)',
              borderRadius: '18px',
              padding: '20px 24px',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span style={{ fontSize: '11px', color: 'rgba(244, 241, 232, 0.5)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Collaboration Budget Scale
            </span>
            <strong style={{ fontSize: '24px', fontWeight: 800, color: '#f4f1e8', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>
              {brand.budgetRange || 'Flexible'}
            </strong>
            <span style={{ fontSize: '12.5px', color: 'rgba(244, 241, 232, 0.55)', fontFamily: 'var(--font-body)' }}>
              Typical campaign allocation
            </span>
          </div>

          <div
            style={{
              background: 'rgba(244, 241, 232, 0.03)',
              border: '1px solid rgba(244, 241, 232, 0.12)',
              borderRadius: '18px',
              padding: '20px 24px',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span style={{ fontSize: '11px', color: 'rgba(244, 241, 232, 0.5)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Active Campaigns
            </span>
            <strong style={{ fontSize: '24px', fontWeight: 800, color: '#f4f1e8', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>
              {activeCampaigns.length}
            </strong>
            <span style={{ fontSize: '12.5px', color: 'rgba(244, 241, 232, 0.55)', fontFamily: 'var(--font-body)' }}>
              Open sponsorship opportunities
            </span>
          </div>

          <div
            style={{
              background: 'rgba(244, 241, 232, 0.03)',
              border: '1px solid rgba(244, 241, 232, 0.12)',
              borderRadius: '18px',
              padding: '20px 24px',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span style={{ fontSize: '11px', color: 'rgba(244, 241, 232, 0.5)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>
              Operational Base
            </span>
            <strong style={{ fontSize: '24px', fontWeight: 800, color: '#f4f1e8', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>
              {brand.location || 'Pan-India'}
            </strong>
            <span style={{ fontSize: '12.5px', color: 'rgba(244, 241, 232, 0.55)', fontFamily: 'var(--font-body)' }}>
              Target collaboration geography
            </span>
          </div>
        </div>
      </FadeIn>

      {/* 5. Brand About & Overview */}
      {brand.description && (
        <FadeIn delay={0.18} distance={18}>
          <div
            style={{
              marginBottom: '36px',
              background: 'rgba(244, 241, 232, 0.03)',
              border: '1px solid rgba(244, 241, 232, 0.12)',
              borderRadius: '20px',
              padding: '28px 32px',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 12px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                background: '#f4f1e8',
                color: '#0b0b0a',
                fontFamily: 'var(--font-mono)',
                marginBottom: '14px',
              }}
            >
              Brand Overview
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f4f1e8', fontFamily: 'var(--font-display)', marginBottom: '10px' }}>
              About {brand.businessName}
            </h3>
            <p style={{ fontSize: '14.5px', lineHeight: 1.7, color: 'rgba(244, 241, 232, 0.75)', margin: 0, fontFamily: 'var(--font-body)' }}>
              {brand.description}
            </p>
          </div>
        </FadeIn>
      )}

      {/* 6. ALL OTHER CAMPAIGNS BY THIS BRAND (Matching /campaigns card design) */}
      <section style={{ marginTop: '24px' }} id="all-brand-campaigns">
        <FadeIn delay={0.2} distance={18}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div className="overline">
                <i /> All Brand Briefs
              </div>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 30px)', marginTop: '6px', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                All Campaigns by <em>{brand.businessName}<span className="dot-accent">.</span></em>
              </h2>
              <p style={{ color: 'rgba(244, 241, 232, 0.65)', fontSize: '13.5px', margin: 0 }}>
                Browse all open collaboration briefs and advertisements run by this brand. Click any campaign to view full deliverables.
              </p>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 14px',
                borderRadius: '999px',
                background: 'rgba(244, 241, 232, 0.05)',
                border: '1px solid rgba(244, 241, 232, 0.15)',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: '#f4f1e8',
              }}
            >
              {campaigns.length} Total Brief{campaigns.length !== 1 ? 's' : ''}
            </span>
          </div>
        </FadeIn>

        {campaigns.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              background: 'rgba(244, 241, 232, 0.03)',
              border: '1px solid rgba(244, 241, 232, 0.12)',
              borderRadius: '20px',
              backdropFilter: 'blur(16px)',
            }}
          >
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '12px' }}>📢</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f4f1e8', marginBottom: '8px' }}>
              No Active Public Campaign Briefs
            </h3>
            <p style={{ color: 'rgba(244, 241, 232, 0.6)', fontSize: '13.5px', maxWidth: '480px', margin: '0 auto 20px' }}>
              {brand.businessName} hasn't listed open public advertisements at the moment. You can still reach out directly to pitch creative ideas!
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={handleMessageBrand}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '9999px',
                background: '#f4f1e8',
                border: '1px solid #f4f1e8',
                color: '#0b0b0a',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              💬 Send Collaboration Pitch to Brand
            </button>
          </div>
        ) : (
          <StaggerContainer className="bento-grid bento-grid--2" staggerDelay={0.08}>
            {campaigns.map((camp) => {
              const isSelected = selectedCampId === camp.id
              const deliv = getDeliverablesBreakdown(camp)
              return (
                <StaggerItem key={camp.id}>
                  <div
                    style={{
                      borderRadius: '20px',
                      padding: '24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: '100%',
                      boxSizing: 'border-box',
                      background: 'rgba(244, 241, 232, 0.03)',
                      border: isSelected ? '1px solid rgba(244, 241, 232, 0.35)' : '1px solid rgba(244, 241, 232, 0.12)',
                      boxShadow: isSelected
                        ? '0 16px 40px -10px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(244, 241, 232, 0.12)'
                        : '0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(244, 241, 232, 0.06)',
                      backdropFilter: 'blur(16px)',
                      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.35)'
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = '0 16px 40px -10px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(244, 241, 232, 0.12)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isSelected ? 'rgba(244, 241, 232, 0.35)' : 'rgba(244, 241, 232, 0.12)'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = isSelected
                        ? '0 16px 40px -10px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(244, 241, 232, 0.12)'
                        : '0 10px 30px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(244, 241, 232, 0.06)'
                    }}
                    onClick={() => {
                      setSelectedCampId(camp.id)
                      window.scrollTo({ top: 180, behavior: 'smooth' })
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                            {camp.platform || 'Instagram'}
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
                              color: 'rgba(244, 241, 232, 0.75)',
                              border: '1px solid rgba(244, 241, 232, 0.12)',
                              fontFamily: 'var(--font-display)',
                            }}
                          >
                            {camp.niche || brand.businessType || 'General'}
                          </span>
                          {isSelected && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: '#f4f1e8',
                                color: '#0b0b0a',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              ✓ In Spotlight
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#f4f1e8', fontFamily: 'var(--font-mono)' }}>
                          💰 {camp.budget_range || (camp.budget ? `₹${Number(camp.budget).toLocaleString()}` : 'Flexible')}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '6px', color: '#f4f1e8', fontFamily: 'var(--font-display)' }}>
                        {camp.productName || camp.title}
                      </h3>

                      <p style={{ fontSize: '13.5px', color: 'rgba(244, 241, 232, 0.65)', lineHeight: 1.6, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {camp.description}
                      </p>

                      {/* Deliverables Pills */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                        {deliv.reels > 0 && (
                          <span style={{ fontSize: '11px', background: 'rgba(244, 241, 232, 0.03)', border: '1px solid rgba(244, 241, 232, 0.1)', padding: '3px 10px', borderRadius: '999px', color: 'rgba(244, 241, 232, 0.85)', fontFamily: 'var(--font-mono)' }}>
                            🎬 {deliv.reels}x Reel{deliv.reels > 1 ? 's' : ''}
                          </span>
                        )}
                        {deliv.posts > 0 && (
                          <span style={{ fontSize: '11px', background: 'rgba(244, 241, 232, 0.03)', border: '1px solid rgba(244, 241, 232, 0.1)', padding: '3px 10px', borderRadius: '999px', color: 'rgba(244, 241, 232, 0.85)', fontFamily: 'var(--font-mono)' }}>
                            📸 {deliv.posts}x Post{deliv.posts > 1 ? 's' : ''}
                          </span>
                        )}
                        {deliv.stories > 0 && (
                          <span style={{ fontSize: '11px', background: 'rgba(244, 241, 232, 0.03)', border: '1px solid rgba(244, 241, 232, 0.1)', padding: '3px 10px', borderRadius: '999px', color: 'rgba(244, 241, 232, 0.85)', fontFamily: 'var(--font-mono)' }}>
                            ⏱️ {deliv.stories}x Stories
                          </span>
                        )}
                        <span style={{ fontSize: '11px', background: 'rgba(244, 241, 232, 0.05)', border: '1px solid rgba(244, 241, 232, 0.18)', padding: '3px 10px', borderRadius: '999px', color: '#f4f1e8', fontFamily: 'var(--font-mono)' }}>
                          📅 {deliv.deadline}
                        </span>
                      </div>
                    </div>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(244, 241, 232, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCampId(camp.id)
                          window.scrollTo({ top: 180, behavior: 'smooth' })
                        }}
                        style={{
                          background: isSelected ? '#f4f1e8' : 'rgba(244, 241, 232, 0.04)',
                          border: isSelected ? '1px solid #f4f1e8' : '1px solid rgba(244, 241, 232, 0.16)',
                          borderRadius: '9999px',
                          color: isSelected ? '#0b0b0a' : '#f4f1e8',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'var(--font-display)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isSelected ? '✓ In Spotlight' : 'Inspect Deliverables'}
                      </button>

                      <Link
                        to={`/campaigns/${camp.id}`}
                        onClick={(e) => e.stopPropagation()}
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
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ffffff'
                          e.currentTarget.style.transform = 'translateX(2px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f4f1e8'
                          e.currentTarget.style.transform = 'translateX(0)'
                        }}
                      >
                        View Brief →
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        )}
      </section>
    </main>
  )
}
