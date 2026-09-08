import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Button,
  Badge,
  Avatar,
  Tabs,
  InfluencerCard,
} from '../components/ui'

// Curated Showcase Creators for Bento Showcase & Dynamic Filtering
const SHOWCASE_CREATORS = [
  {
    id: 'c-1',
    name: 'Aanya Kapoor',
    username: '@aanyakapoor',
    niche: 'Fashion',
    location: 'Mumbai',
    followersCount: 185000,
    engagementRate: 4.8,
    rateCard: { reel: 4500 },
    budget: 4500,
    bio: 'Sustainable fashion stylist and editorial creator based in Mumbai. Helping homegrown labels build cult followings.',
    featured: true,
  },
  {
    id: 'c-2',
    name: 'Kabir Varma',
    username: '@kabir.eats',
    niche: 'Food',
    location: 'Delhi NCR',
    followersCount: 320000,
    engagementRate: 5.4,
    rateCard: { reel: 3800 },
    budget: 3800,
    bio: 'Regional street food archivist & micro-brewery storyteller across Delhi, Lucknow, and Jaipur.',
    featured: false,
  },
  {
    id: 'c-3',
    name: 'Dr. Rhea Sen',
    username: '@dr.rheasen',
    niche: 'Beauty',
    location: 'Bengaluru',
    followersCount: 95000,
    engagementRate: 6.2,
    rateCard: { reel: 2800 },
    budget: 2800,
    bio: 'Dermatologist & science-backed skincare advocate. Zero fluff, ingredient-first reviews.',
    featured: false,
  },
  {
    id: 'c-4',
    name: 'Vikramaditya Rao',
    username: '@vikram_fitness',
    niche: 'Fitness',
    location: 'Hyderabad',
    followersCount: 210000,
    engagementRate: 4.2,
    rateCard: { reel: 3500 },
    budget: 3500,
    bio: 'Calisthenics athlete and high-performance nutrition coach. Championing natural athleticism.',
    featured: false,
  },
  {
    id: 'c-5',
    name: 'Tara Mukherjee',
    username: '@tara_wanderlust',
    niche: 'Travel',
    location: 'Goa',
    followersCount: 142000,
    engagementRate: 5.1,
    rateCard: { reel: 4200 },
    budget: 4200,
    bio: 'Slow-travel photographer and boutique homestay reviewer across South Asia.',
    featured: false,
  },
  {
    id: 'c-6',
    name: 'Arjun Mehta',
    username: '@arjun.craft',
    niche: 'Lifestyle',
    location: 'Pune',
    followersCount: 68000,
    engagementRate: 6.8,
    rateCard: { reel: 2200 },
    budget: 2200,
    bio: 'Minimalist living, coffee brewing rituals, and desk setup aesthetician.',
    featured: false,
  }
]

const CATEGORY_TABS = [
  'All',
  'Food',
  'Fashion',
  'Fitness',
  'Beauty',
  'Travel',
  'Lifestyle'
]

const LOCATIONS = ['All locations', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Goa', 'Pune']
const FOLLOWER_RANGES = ['Any audience', '10K – 50K', '50K – 150K', '150K+']
const BUDGET_OPTIONS = ['Any budget', 'Up to ₹2,500', 'Up to ₹3,500', 'Up to ₹5,000']

export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('All')
  const [heroCardIndex, setHeroCardIndex] = useState(0)

  // Search filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchNiche, setSearchNiche] = useState('All')
  const [searchLocation, setSearchLocation] = useState('All locations')
  const [searchFollowers, setSearchFollowers] = useState('Any audience')
  const [searchBudget, setSearchBudget] = useState('Any budget')

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setMobileMenuOpen(false)
  }

  // Live filtered creator list
  const filteredCreators = useMemo(() => {
    return SHOWCASE_CREATORS.filter((c) => {
      // Tab filter
      if (activeTab !== 'All' && c.niche !== activeTab) return false
      // Niche filter from search bar
      if (searchNiche !== 'All' && c.niche !== searchNiche) return false
      // Location filter
      if (searchLocation !== 'All locations' && c.location !== searchLocation) return false
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const text = `${c.name} ${c.username} ${c.niche} ${c.location} ${c.bio}`.toLowerCase()
        if (!text.includes(q)) return false
      }
      // Budget filter
      if (searchBudget === 'Up to ₹2,500' && c.rateCard.reel > 2500) return false
      if (searchBudget === 'Up to ₹3,500' && c.rateCard.reel > 3500) return false
      if (searchBudget === 'Up to ₹5,000' && c.rateCard.reel > 5000) return false

      // Followers filter
      if (searchFollowers === '10K – 50K' && (c.followersCount < 10000 || c.followersCount > 50000)) return false
      if (searchFollowers === '50K – 150K' && (c.followersCount < 50000 || c.followersCount > 150000)) return false
      if (searchFollowers === '150K+' && c.followersCount < 150000) return false

      return true
    })
  }, [activeTab, searchNiche, searchLocation, searchQuery, searchBudget, searchFollowers])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    scrollTo('marketplace')
  }

  const activeHeroCreator = SHOWCASE_CREATORS[heroCardIndex] || SHOWCASE_CREATORS[0]

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <div className="landing-page-root">
      {/* 1. STICKY / FLOATING NAVBAR */}
      <header className={`navbar ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <Link to="/" className="brand" onClick={() => { setMobileMenuOpen(false); scrollTo('top'); }}>
          Brand2Influence
        </Link>

        {mobileMenuOpen && (
          <div className="nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
        )}

        <nav className={mobileMenuOpen ? 'open' : ''}>
          <div className="nav-drawer-header">
            <span className="nav-drawer-title">Menu</span>
            <button
              type="button"
              className="nav-drawer-close"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <button type="button" onClick={() => { setMobileMenuOpen(false); scrollTo('marketplace'); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            Discover Creators
          </button>
          <button type="button" onClick={() => { setMobileMenuOpen(false); scrollTo('how-it-works'); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            How it Works
          </button>
          <button type="button" onClick={() => { setMobileMenuOpen(false); scrollTo('roles-bento'); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            For Brands
          </button>
          <button type="button" onClick={() => { setMobileMenuOpen(false); scrollTo('roles-bento'); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            For Influencers
          </button>
          <button type="button" className="nav-login" onClick={() => { setMobileMenuOpen(false); navigate('/auth/login'); }}>
            Log in
          </button>
          <button type="button" className="nav-join" onClick={() => { setMobileMenuOpen(false); navigate('/auth/signup'); }}>
            Get started
          </button>
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="menu"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      <main>
        {/* 2. BENTO HERO */}
        <section className="bento-hero" id="top">
          <div className="bento-hero-left">
            <div className="overline">
              <i /> India’s Creator Marketplace
            </div>
            <h1 className="hero-title">
              Make work that<br />
              <em>moves people.</em>
            </h1>
            <p className="hero-desc">
              Discover independent creators who truly understand your brand, your audience, and the cultural impact you want to create. Direct messaging, upfront rates, zero middleman markups.
            </p>
            <div className="hero-cta-group">
              <Button size="lg" variant="primary" onClick={() => scrollTo('marketplace')}>
                Explore Creators
              </Button>
              <Button size="lg" variant="secondary" onClick={() => scrollTo('how-it-works')}>
                How it Works
              </Button>
            </div>
            <p className="quiet">
              Are you a creator? <b onClick={() => navigate('/auth/signup')} style={{ cursor: 'pointer' }}>Join the community →</b>
            </p>
          </div>

          {/* Hero Right: Interactive Influencer Profile Card Stack */}
          <div className="bento-hero-right">
            <div className="hero-stack-container">
              <div className="hero-stack-selector">
                {SHOWCASE_CREATORS.slice(0, 3).map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`hero-stack-tab ${heroCardIndex === idx ? 'active' : ''}`}
                    onClick={() => setHeroCardIndex(idx)}
                  >
                    {c.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="hero-stack-card">
                <div className="creator-card-badge-row">
                  <Badge variant="accent">Top Collaborator</Badge>
                  <span className="creator-card-available">Verified</span>
                </div>

                <div className="creator-card-header">
                  <Avatar name={activeHeroCreator.name} size="lg" tone="secondary" />
                  <div>
                    <h3>{activeHeroCreator.name} <span className="verified-check">✓</span></h3>
                    <p className="creator-handle">{activeHeroCreator.username}</p>
                    <div className="creator-meta-pills">
                      <span className="meta-pill">{activeHeroCreator.niche}</span>
                      <span className="meta-pill">{activeHeroCreator.location}</span>
                    </div>
                  </div>
                </div>

                <p className="creator-bio">{activeHeroCreator.bio}</p>

                <div className="creator-card-metrics">
                  <div>
                    <b>{(activeHeroCreator.followersCount / 1000).toFixed(0)}K</b>
                    <small>Followers</small>
                  </div>
                  <div>
                    <b>{activeHeroCreator.engagementRate}%</b>
                    <small>Engagement</small>
                  </div>
                  <div>
                    <b>₹{activeHeroCreator.rateCard.reel.toLocaleString()}</b>
                    <small>Starting / Reel</small>
                  </div>
                </div>

                <div className="creator-card-actions">
                  <Button
                    variant="primary"
                    size="md"
                    className="full"
                    onClick={() => navigate('/auth/signup')}
                  >
                    Message {activeHeroCreator.name.split(' ')[0]}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. INTERACTIVE INFLUENCER SEARCH (BENTO SEARCH PANEL) */}
        <section className="bento-search-section">
          <form className="bento-search-panel" onSubmit={handleSearchSubmit}>
            <div className="search-field-item">
              <label>Keyword</label>
              <input
                type="text"
                placeholder="Name, niche, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search keyword"
              />
            </div>

            <div className="search-field-item">
              <label>Niche</label>
              <select
                value={searchNiche}
                onChange={(e) => setSearchNiche(e.target.value)}
                aria-label="Niche filter"
              >
                {CATEGORY_TABS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="search-field-item">
              <label>Location</label>
              <select
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                aria-label="Location filter"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div className="search-field-item">
              <label>Followers</label>
              <select
                value={searchFollowers}
                onChange={(e) => setSearchFollowers(e.target.value)}
                aria-label="Followers filter"
              >
                {FOLLOWER_RANGES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="search-field-item">
              <label>Budget</label>
              <select
                value={searchBudget}
                onChange={(e) => setSearchBudget(e.target.value)}
                aria-label="Budget filter"
              >
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <Button type="submit" variant="primary">
              Find Creators
            </Button>
          </form>
        </section>

        {/* 4. BRAND / INFLUENCER BENTO CARDS */}
        <section className="section fade-in-up" id="roles-bento">
          <div className="page-heading">
            <div>
              <span className="eyebrow">Two Sides of the Marketplace</span>
              <h2>Built for Both Creators and Brands</h2>
            </div>
            <p>Clear expectations, verified metrics, and direct messaging without the agency bloat.</p>
          </div>

          <div className="roles-bento-grid">
            <article className="role-bento-card role-bento-card--brand">
              <div className="role-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                  <path d="M3 6h18"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <Badge variant="secondary">For Growing Brands</Badge>
              <h3>Find Voices That Convert</h3>
              <p>
                Filter by verified engagement rate, starting reel rate, and exact city. Reach creators directly and coordinate deliverables in one place.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/auth/signup')}>
                Explore as a Brand →
              </Button>
            </article>

            <article className="role-bento-card role-bento-card--creator">
              <div className="role-icon-box">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
              </div>
              <Badge variant="accent">For Independent Creators</Badge>
              <h3>Get Discovered On Your Terms</h3>
              <p>
                Set your upfront reel rates, showcase your portfolio links, and receive qualified collaboration requests from brands that value your creative voice.
              </p>
              <Button variant="accent" size="sm" onClick={() => navigate('/auth/signup')}>
                Join as a Creator →
              </Button>
            </article>
          </div>
        </section>

        {/* 5. INFLUENCER DISCOVERY SHOWCASE (ASYMMETRIC BENTO GRID) */}
        <section className="section fade-in-up" id="marketplace">
          <div className="page-heading">
            <div>
              <span className="eyebrow">Curated Showcase</span>
              <h2>Featured Independent Talent</h2>
            </div>
            <p>Select a category or use the search controls above to filter in real-time.</p>
          </div>

          {/* CATEGORY TABS */}
          <Tabs
            tabs={CATEGORY_TABS}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab)}
          />

          <div className="bento-grid bento-grid--3" style={{ marginTop: '28px' }}>
            {filteredCreators.length > 0 ? (
              filteredCreators.map((creator, index) => (
                <InfluencerCard
                  key={creator.id}
                  creator={creator}
                  size={index === 0 ? 'large' : index > 3 ? 'compact' : 'medium'}
                  onSelect={() => navigate('/auth/signup')}
                  onMessage={() => navigate('/auth/signup')}
                />
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center' }}>
                <p>No creators match your current filter criteria.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  style={{ marginTop: '14px' }}
                  onClick={() => {
                    setActiveTab('All')
                    setSearchQuery('')
                    setSearchNiche('All')
                    setSearchLocation('All locations')
                    setSearchFollowers('Any audience')
                    setSearchBudget('Any budget')
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* 6. HOW IT WORKS (BENTO WORKFLOW) */}
        <section className="section fade-in-up" id="how-it-works">
          <div className="center">
            <span className="eyebrow">Simple, By Design</span>
            <h2>How Brand2Influence Works</h2>
            <p style={{ maxWidth: '500px', margin: '12px auto 0' }}>
              From initial creative discovery to confirmed collaboration in four clear steps.
            </p>
          </div>

          <div className="workflow-grid">
            {[
              { step: '01', title: 'Discover', desc: 'Search independent creators by niche, location, audience demographics, and upfront rates.' },
              { step: '02', title: 'Filter', desc: 'Drill down by verified engagement rates and transparent pricing to find the perfect fit.' },
              { step: '03', title: 'Compare', desc: 'Inspect portfolio reels, past collaboration examples, and audience insight cards.' },
              { step: '04', title: 'Connect', desc: 'Start a direct conversation thread with clear deliverables and agreed timelines.' }
            ].map(({ step, title, desc }) => (
              <article key={step} className="workflow-card">
                <span className="workflow-step">{step}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 7. MARKETPLACE PREVIEW */}
        <section className="section fade-in-up">
          <div className="page-heading">
            <div>
              <span className="eyebrow">Product Experience</span>
              <h2>A Clean, Uncluttered Workspace</h2>
            </div>
            <p>Every tool you need to evaluate, communicate, and track creator partnerships.</p>
          </div>

          <div className="preview-bento-composition">
            <div>
              <Badge variant="primary" style={{ marginBottom: '14px' }}>Marketplace Engine</Badge>
              <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Real-Time Creator Discovery</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.7, marginBottom: '20px' }}>
                Quickly compare key creator metrics, rates, and portfolio media with instant search feedback. Filter by location down to specific metropolitan hubs.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button size="sm" variant="primary" onClick={() => navigate('/influencers')}>
                  Launch Live Directory
                </Button>
                <Button size="sm" variant="secondary" onClick={() => navigate('/auth/signup')}>
                  Create Account
                </Button>
              </div>
            </div>

            <div style={{ background: 'var(--color-surface-2)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>Live Preview</span>
              <h4 style={{ margin: '8px 0 14px' }}>Active Collaboration Inquiry</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                "Hi Aanya, we love your sustainable styling reels. We are launching an organic cotton capsule next month and would love to partner on 2 reels."
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <small style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Status: In Conversation</small>
                <Badge variant="accent">Budget: ₹9,000</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* 8. PHASE-2 CAMPAIGN PREVIEW */}
        <section className="section fade-in-up">
          <div className="campaign-phase2-card">
            <div>
              <span className="campaign-phase2-badge">Coming in Phase 2</span>
              <h3 style={{ fontSize: '28px', marginBottom: '10px' }}>Open Campaign Briefs</h3>
              <p style={{ maxWidth: '540px', color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>
                Post a structured project brief with your exact budget, deliverables, and aesthetic requirements. Relevant creators apply directly with customized concepts.
              </p>
            </div>
            <div className="campaign-phase2-action">
              <Button variant="ghost" disabled size="md" style={{ border: '1px dashed var(--color-border)', width: '100%' }}>
                Phase 2 In Development
              </Button>
            </div>
          </div>
        </section>

        {/* 9. VALUE PROPOSITION (4-CARD BENTO GRID) */}
        <section className="section fade-in-up">
          <div className="center">
            <span className="eyebrow">Why Brand2Influence</span>
            <h2>Built on Radical Transparency</h2>
          </div>

          <div className="bento-grid bento-grid--4" style={{ marginTop: '40px' }}>
            {[
              { title: 'Zero Cold DMs', desc: 'Stop sending Instagram DMs that get lost in request folders. Creators here are actively seeking partnerships.' },
              { title: 'Upfront Pricing', desc: 'Know reel and story starting rates before sending an inquiry. No guessing games or awkward budget mismatches.' },
              { title: 'Verified Audience', desc: 'Engagement rates and audience geographic distribution verified directly to protect marketing spend.' },
              { title: 'Dedicated Messages', desc: 'Unified inbox for brief discussions, deliverable approvals, and conversation history.' }
            ].map(({ title, desc }) => (
              <div key={title} className="bento-card bento-card--elevated bento-pad--md">
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>{title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 10. FINAL CTA */}
        <section className="final-cta-bento">
          <div className="final-cta-content">
            <span className="eyebrow" style={{ color: 'var(--color-accent)' }}>Your Next Collaboration Starts Here</span>
            <h2 style={{ fontSize: 'clamp(38px, 4.5vw, 56px)', margin: '16px 0 20px' }}>
              Find your next creator.
            </h2>
            <p style={{ color: 'var(--color-neutral-muted)', fontSize: '15px' }}>
              Join hundreds of independent brands and influential creators shaping modern commerce.
            </p>
            <div className="final-cta-buttons">
              <Button size="lg" variant="primary" onClick={() => navigate('/auth/signup')}>
                I’m a Brand
              </Button>
              <Button size="lg" variant="accent" onClick={() => navigate('/auth/signup')}>
                I’m an Influencer
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 11. FOOTER */}
      <footer>
        <div>
          <div>
            <Link to="/" className="brand">
              Brand2Influence
            </Link>
            <p style={{ marginTop: '12px' }}>
              India’s premier marketplace for independent creators and forward-thinking brands.
            </p>
          </div>
          <div />
          <nav>
            <button type="button" onClick={() => scrollTo('marketplace')}>Discover</button>
            <button type="button" onClick={() => scrollTo('how-it-works')}>How it works</button>
            <button type="button" onClick={() => navigate('/auth/signup')}>Join</button>
            <button type="button" onClick={() => navigate('/auth/login')}>Log in</button>
          </nav>
        </div>
        <small>
          <span>© 2026 Brand2Influence. All rights reserved.</span>
          <i>Designed for meaningful creator partnerships.</i>
        </small>
      </footer>
    </div>
  )
}
