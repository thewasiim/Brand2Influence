import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserAvatarMenu } from '../components/UserAvatarMenu'
import {
  Button,
  Badge,
  Avatar,
  Tabs,
  InfluencerCard,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CountUp,
  ReviewSlider,
  FaqAccordion,
  FocusCardSlider,
} from '../components/ui'
import BrandCard from '../components/ProfileCard/BrandCard'
import CampaignCard from '../components/ProfileCard/CampaignCard'
import PixelCard from '../components/PixelCard/PixelCard'
import GlowCursor from '../components/GlowCursor/GlowCursor'
import { useEffect as useIntroEffect } from 'react'

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
    profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
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
    profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
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
    profileImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
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
    profileImageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
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
    profileImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800',
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
    profileImageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
    bio: 'Minimalist living, coffee brewing rituals, and desk setup aesthetician.',
    featured: false,
  }
]

const SHOWCASE_BRANDS = [
  {
    id: 'b-1',
    brand: 'Blue Tokai Coffee Roasters',
    brandLogoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b-2',
    brand: 'Kiro Clean Beauty',
    brandLogoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b-3',
    brand: 'Mokobara Luggage',
    brandLogoUrl: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b-4',
    brand: 'Sleepy Owl Coffee',
    brandLogoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b-5',
    brand: 'Pilgrim Beauty Secrets',
    brandLogoUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'b-6',
    brand: 'Supertails Pet Care',
    brandLogoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
  },
]

const SHOWCASE_CAMPAIGNS = [
  {
    id: 'camp-1',
    brandId: 'b-loom',
    productName: 'Handcrafted Summer Linen & Cotton Apparel',
    title: 'Summer Organic Linen & Cotton Capsule',
    brand: 'The Loom Co.',
    brandLogoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400',
    niche: 'Fashion',
    platform: 'Instagram',
    budget: '₹25,000 – ₹45,000',
    deliverables: ['2x Dedicated Reels', '1x Carousel Post', '3x Stories'],
    reelsCount: 2,
    postsCount: 1,
    storiesCount: 3,
    deadline: '30 Apr 2026',
    targetFollowers: '20,000+',
    location: 'Mumbai / Delhi NCR',
    description: 'Looking for sustainable fashion stylists for styling reels featuring our handcrafted summer linen collection.',
  },
  {
    id: 'camp-2',
    brandId: 'b-1',
    productName: 'Cold Brew Specialty Starter Kit & Tumbler',
    title: 'Cold Brew Starter Kit Unboxing & Recipe',
    brand: 'Blue Tokai Coffee Roasters',
    brandLogoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=400',
    niche: 'Food & Beverage',
    platform: 'Instagram / YouTube',
    budget: '₹15,000 – ₹35,000',
    deliverables: ['1x Reel', '1x Carousel', '2x Stories'],
    reelsCount: 1,
    postsCount: 1,
    storiesCount: 2,
    deadline: '28 Apr 2026',
    targetFollowers: '15,000+',
    location: 'Pan-India',
    description: 'Seeking food & coffee creators to craft creative iced coffee recipes using our specialty cold brew blends.',
  },
  {
    id: 'camp-3',
    brandId: 'b-2',
    productName: 'Botanical Ceramide Skin Barrier Repair Serum',
    title: 'Clean Barrier Repair Serum Campaign',
    brand: 'Kiro Clean Beauty',
    brandLogoUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400',
    niche: 'Beauty & Skincare',
    platform: 'Instagram',
    budget: '₹20,000 – ₹50,000',
    deliverables: ['1x Reel', '1x Post', '2x Stories'],
    reelsCount: 1,
    postsCount: 1,
    storiesCount: 2,
    deadline: '25 Apr 2026',
    targetFollowers: '25,000+',
    location: 'Bengaluru / Mumbai',
    description: 'Ingredient-first skincare review educating followers on ceramides, hydration, and skin barrier health.',
  },
  {
    id: 'camp-4',
    brandId: 'b-3',
    productName: 'Cabin Pro Minimalist Travel Backpack',
    title: 'Minimalist Travel Backpack Durability Showcase',
    brand: 'Mokobara Luggage',
    brandLogoUrl: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?auto=format&fit=crop&q=80&w=400',
    niche: 'Travel & Lifestyle',
    platform: 'YouTube / Instagram',
    budget: '₹35,000 – ₹80,000',
    deliverables: ['1x Vlog Reel', '1x Feed Post', '3x Stories'],
    reelsCount: 1,
    postsCount: 1,
    storiesCount: 3,
    deadline: '05 May 2026',
    targetFollowers: '40,000+',
    location: 'Pan-India',
    description: 'Calling travel and lifestyle creators to test and showcase transit durability on upcoming weekend trips.',
  },
  {
    id: 'camp-5',
    brandId: 'b-cosmix',
    productName: 'Clean Plant Protein & Gut Superfood Blend',
    title: 'Plant-Based Protein Daily Smoothie Routine',
    brand: 'Cosmix Wellness',
    brandLogoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400',
    niche: 'Fitness & Health',
    platform: 'Instagram',
    budget: '₹18,000 – ₹40,000',
    deliverables: ['1x Reel', '1x Recipe Post', '2x Stories'],
    reelsCount: 1,
    postsCount: 1,
    storiesCount: 2,
    deadline: '02 May 2026',
    targetFollowers: '15,000+',
    location: 'Pan-India',
    description: 'Partnering with fitness enthusiasts and nutritionists to showcase clean gut-friendly daily protein routines.',
  },
  {
    id: 'camp-6',
    brandId: 'b-sleepyowl',
    productName: 'Minimalist Aluminum Laptop Riser & Desk Mat',
    title: 'Workstation Aesthetic & Ergonomic Desk Setup',
    brand: 'Sleepy Owl Goods',
    brandLogoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=400',
    niche: 'Tech & Lifestyle',
    platform: 'Instagram / YouTube',
    budget: '₹20,000 – ₹45,000',
    deliverables: ['1x Reel', '1x Community Post', '2x Stories'],
    reelsCount: 1,
    postsCount: 1,
    storiesCount: 2,
    deadline: '08 May 2026',
    targetFollowers: '30,000+',
    location: 'Delhi NCR / Bengaluru',
    description: 'Showcase productivity rituals, desk aesthetics, and slow coffee routines with tech & lifestyle creators.',
  },
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
  const [searchParams] = useSearchParams()
  const { user, profile, loading } = useAuth()



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

  const [introVisible, setIntroVisible] = useState(() => !sessionStorage.getItem('b2i-home-intro-seen'))
  const [preloaderProgress, setPreloaderProgress] = useState(0)

  useIntroEffect(() => {
    if (!introVisible) return undefined
    const start = performance.now()
    const duration = 1200

    let rafId
    const step = (now) => {
      const elapsed = now - start
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100))
      setPreloaderProgress(progress)
      if (elapsed < duration) {
        rafId = requestAnimationFrame(step)
      } else {
        sessionStorage.setItem('b2i-home-intro-seen', 'true')
        setIntroVisible(false)
      }
    }
    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [introVisible])

  // If user is logged in, redirect them to /dashboard
  // (Only stay on landing page if they clicked 'Return to website' with ?view=site)
  if (!loading && user && !searchParams.get('view') && !searchParams.get('stay')) {
    return <Navigate to={profile?.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }


  return (
    <div className="landing-page-root">
      {introVisible && (
        <div className="experience-preloader" role="status" aria-live="polite">
          <div className="experience-preloader__top">Brand2Influence / System online</div>
          <div className="experience-preloader__center">
            <span>INITIALIZING</span>
            <strong>EXPERIENCE</strong>
          </div>
          <div className="experience-preloader__bottom">
            <span className="experience-preloader__count">{String(preloaderProgress).padStart(3, '0')} — 100</span>
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('b2i-home-intro-seen', 'true')
                setIntroVisible(false)
              }}
            >
              Skip intro
            </button>
          </div>
        </div>
      )}
      <main>
        {/* 2. BENTO HERO */}
        <section className="bento-hero" id="top">
          <div className="bento-hero-content">
            <FadeIn delay={0.05} distance={16}>
              <div className="hero-badge">
                <span className="hero-badge__dot" />
                <span className="hero-badge__code"><span className="num-accent">[ 00 ]</span> // PLATFORM : ONLINE</span>
                <span className="hero-badge__label">DIRECT CREATOR &amp; BRAND MARKETPLACE</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12} distance={22}>
              <h1 className="hero-title">
                <span className="hero-title__line">TURN INFLUENCE</span>
                <span className="hero-title__line hero-title__line--accent">
                  <em>into</em> <strong>IMPACT<span className="dot-accent">.</span></strong>
                </span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2} distance={20}>
              <p className="hero-desc">
                Discover independent creators who truly understand your brand, and explore verified sponsorship campaigns. Direct messaging, upfront rates, zero middleman markups.
              </p>
            </FadeIn>
            <FadeIn delay={0.28} distance={18}>
              <div className="hero-cta-group">
                <Button size="lg" variant="primary" onClick={() => scrollTo('marketplace')}>
                  Explore Creators
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/campaigns')}>
                  Browse Brand Deals
                </Button>
              </div>
            </FadeIn>
            <FadeIn delay={0.34} distance={14}>
              <div className="hero-tech-specs">
                <div className="hero-tech-spec-item">
                  <span className="hero-tech-spec-num">[ 01 ]</span>
                  <span className="hero-tech-spec-label">0% Agency Markups</span>
                  <span className="hero-tech-spec-sub">Direct Creator Pricing</span>
                </div>
                <div className="hero-tech-spec-item">
                  <span className="hero-tech-spec-num">[ 02 ]</span>
                  <span className="hero-tech-spec-label">100% Upfront Rates</span>
                  <span className="hero-tech-spec-sub">Zero Hidden Retainers</span>
                </div>
                <div className="hero-tech-spec-item">
                  <span className="hero-tech-spec-num">[ 03 ]</span>
                  <span className="hero-tech-spec-label">Verified Direct Inquiries</span>
                  <span className="hero-tech-spec-sub">Real Audience Data</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* INFINITE MARQUEE TICKER 1 */}
        <div className="editorial-marquee" aria-hidden="true">
          <div className="editorial-marquee__track">
            <div className="editorial-marquee__group">
              <span>CREATORS</span>
              <b>///</b>
              <span>BRANDS</span>
              <b>///</b>
              <span>COLLABORATE</span>
              <b>///</b>
              <span>DISCOVER</span>
              <b>///</b>
              <span>CREATE</span>
              <b>///</b>
              <span>SCALE</span>
              <b>///</b>
              <span>VERIFIED METRICS</span>
              <b>///</b>
              <span>UPFRONT RATES</span>
              <b>///</b>
            </div>
            <div className="editorial-marquee__group">
              <span>CREATORS</span>
              <b>///</b>
              <span>BRANDS</span>
              <b>///</b>
              <span>COLLABORATE</span>
              <b>///</b>
              <span>DISCOVER</span>
              <b>///</b>
              <span>CREATE</span>
              <b>///</b>
              <span>SCALE</span>
              <b>///</b>
              <span>VERIFIED METRICS</span>
              <b>///</b>
              <span>UPFRONT RATES</span>
              <b>///</b>
            </div>
          </div>
        </div>


        {/* 3. INTERACTIVE INFLUENCER SEARCH (BENTO SEARCH PANEL) */}
        <section className="landing-search-stripe">
          <FadeIn as="div" className="bento-search-section" distance={24} duration={0.75}>
            <div style={{ marginBottom: '14px' }}>
              <span className="eyebrow"><span className="num-accent">[ 01 ]</span> Direct Search &amp; Filters</span>
            </div>
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
        </FadeIn>
      </section>

        {/* 4. BRAND / INFLUENCER BENTO CARDS */}
        <section className="section" id="roles-bento">
          <FadeIn className="page-heading">
            <span className="eyebrow"><span className="num-accent">[ 02 ]</span> Two Sides of the Marketplace</span>
            <h2>Built for Both <em>Creators &amp; Brands<span className="dot-accent">.</span></em></h2>
            <p>Clear expectations, verified metrics, and direct messaging without the agency bloat.</p>
          </FadeIn>

          <StaggerContainer className="roles-bento-grid" staggerDelay={0.12}>
            {/* Card 1: For Brands */}
            <StaggerItem className="role-bento-card role-bento-card--brand" as="article">
              <div className="role-card-top">
                <div className="role-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <span className="role-tag">For Growing Brands</span>
              </div>

              <h3>Find Voices That Convert</h3>
              <p className="role-card-desc">
                Hire verified creators directly with zero agency markup.
              </p>

              <ul className="role-features-list">
                <li>
                  <span className="role-feature-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span><strong>Verified Metrics:</strong> Real engagement & city demographics</span>
                </li>
                <li>
                  <span className="role-feature-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span><strong>Upfront Rates:</strong> Transparent pricing for reels & stories</span>
                </li>
                <li>
                  <span className="role-feature-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span><strong>Direct Inbox:</strong> Chat 1-on-1 with 0% hidden fees</span>
                </li>
              </ul>

              <div className="role-card-footer">
                <Button variant="primary" size="md" onClick={() => navigate('/brands')}>
                  Search Brands &amp; Deals →
                </Button>
              </div>
            </StaggerItem>

            {/* Card 2: For Creators */}
            <StaggerItem className="role-bento-card role-bento-card--creator" as="article">
              <div className="role-card-top">
                <div className="role-icon-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z" />
                  </svg>
                </div>
                <span className="role-tag">For Independent Creators</span>
              </div>

              <h3>Get Discovered On Your Terms</h3>
              <p className="role-card-desc">
                Set your rates and get inbound sponsorships from top brands.
              </p>

              <ul className="role-features-list">
                <li>
                  <span className="role-feature-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span><strong>Keep 100%:</strong> Zero commission or middleman cuts</span>
                </li>
                <li>
                  <span className="role-feature-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span><strong>Live Insights:</strong> Auto-synced Instagram & YouTube stats</span>
                </li>
                <li>
                  <span className="role-feature-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span><strong>Direct Inbound:</strong> Sponsorship briefs from verified brands</span>
                </li>
              </ul>

              <div className="role-card-footer">
                <Button variant="primary" size="md" onClick={() => navigate('/influencers')}>
                  Search Verified Creators →
                </Button>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* 5. INFLUENCER DISCOVERY SHOWCASE (ASYMMETRIC BENTO GRID) */}
        <section className="section" id="marketplace">
          <FadeIn className="page-heading">
            <span className="eyebrow"><span className="num-accent">[ 03 ]</span> Curated Showcase</span>
            <h2>Featured <em>Independent Talent<span className="dot-accent">.</span></em></h2>
            <p>Select a category or use the search controls above to filter in real-time.</p>
          </FadeIn>

          {/* CATEGORY TABS */}
          <FadeIn delay={0.08} distance={14} className="marketplace-tabs-wrap">
            <Tabs
              tabs={CATEGORY_TABS}
              activeTab={activeTab}
              onChange={(tab) => setActiveTab(tab)}
            />
          </FadeIn>

          {filteredCreators.length > 0 ? (
            <div style={{ marginTop: '28px' }}>
              <FocusCardSlider
                key={activeTab + searchNiche + searchLocation + searchFollowers + searchBudget + searchQuery}
                items={filteredCreators}
                cardWidth={330}
                cardGap={26}
                renderItem={(creator) => (
                  <InfluencerCard
                    creator={creator}
                    onSelect={() => navigate(`/influencers/${creator.id}`)}
                    onMessage={() => navigate(`/influencers/${creator.id}`)}
                  />
                )}
              />
            </div>
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
        </section>

        {/* 6. FEATURED BRANDS SHOWCASE (DIRECTLY UNDER CREATORS) */}
        <section className="section" id="brand-deals">
          <FadeIn className="page-heading">
            <span className="eyebrow"><span className="num-accent">[ 04 ]</span> Verified Partners</span>
            <h2>Featured <em>Brand Partnerships<span className="dot-accent">.</span></em></h2>
            <p>Explore verified businesses offering active sponsorship budgets for creators.</p>
          </FadeIn>

          <div style={{ marginTop: '24px' }}>
            <FocusCardSlider
              items={SHOWCASE_BRANDS}
              cardWidth={330}
              cardGap={26}
              renderItem={(brand) => (
                <BrandCard
                  id={brand.id}
                  brand={brand.brand}
                  brandLogoUrl={brand.brandLogoUrl}
                  onClick={() => navigate(`/brands/${brand.id}`)}
                />
              )}
            />
          </div>
        </section>

        {/* 7. OPEN CAMPAIGN BRIEFS & SPONSORSHIPS (DIRECTLY UNDER BRANDS) */}
        <section className="section" id="campaign-deals">
          <FadeIn className="page-heading">
            <span className="eyebrow"><span className="num-accent">[ 05 ]</span> Active Sponsorships</span>
            <h2>Open <em>Campaign Briefs<span className="dot-accent">.</span></em></h2>
            <p>Pitch deliverables directly to brands with approved budgets and clear requirements.</p>
          </FadeIn>

          <div style={{ marginTop: '24px' }}>
            <FocusCardSlider
              items={SHOWCASE_CAMPAIGNS}
              cardWidth={340}
              cardGap={24}
              renderItem={(camp) => (
                <CampaignCard
                  key={camp.id}
                  id={camp.id}
                  brandId={camp.brandId}
                  productName={camp.productName}
                  title={camp.title}
                  brand={camp.brand}
                  brandLogoUrl={camp.brandLogoUrl}
                  budget={camp.budget}
                  description={camp.description}
                  onSelect={() => navigate(`/brands/${camp.brandId || 'b-loom'}?campaign=${camp.id}`)}
                />
              )}
            />
          </div>
        </section>

        {/* 8. HOW IT WORKS (BENTO WORKFLOW) */}
        <section className="section" id="how-it-works">
          <FadeIn className="page-heading">
            <span className="eyebrow"><span className="num-accent">[ 06 ]</span> Simple, By Design</span>
            <h2>How Brand2Influence <em>Works<span className="dot-accent">.</span></em></h2>
            <p>From initial creative discovery to confirmed collaboration in four clear steps.</p>
          </FadeIn>

          <StaggerContainer className="workflow-grid" staggerDelay={0.09}>
            {[
              { step: '01', title: 'Discover', desc: 'Search independent creators by niche, location, audience demographics, and upfront rates.', variant: 'purple' },
              { step: '02', title: 'Filter', desc: 'Drill down by verified engagement rates and transparent pricing to find the perfect fit.', variant: 'blue' },
              { step: '03', title: 'Compare', desc: 'Inspect portfolio reels, past collaboration examples, and audience insight cards.', variant: 'yellow' },
              { step: '04', title: 'Connect', desc: 'Start a direct conversation thread with clear deliverables and agreed timelines.', variant: 'pink' }
            ].map(({ step, title, desc, variant }) => (
              <StaggerItem key={step}>
                <PixelCard variant={variant} className="workflow-card" style={{ padding: '24px 20px', minHeight: '220px', width: '100%', height: '100%' }}>
                  <span className="workflow-step"><span className="num-accent">[ {step} ]</span></span>
                  <h3 style={{ marginTop: '12px', fontSize: '20px', fontWeight: 700 }}>{title}</h3>
                  <p style={{ marginTop: '8px', fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </PixelCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* INFINITE MARQUEE TICKER 2 (REVERSE) */}
        <div className="editorial-marquee editorial-marquee--reverse" aria-hidden="true">
          <div className="editorial-marquee__track">
            <div className="editorial-marquee__group">
              <span>DIRECT INBOX</span>
              <b>///</b>
              <span>VERIFIED METRICS</span>
              <b>///</b>
              <span>TRANSPARENT RATES</span>
              <b>///</b>
              <span>COMMISSION FREE</span>
              <b>///</b>
              <span>CAMPAIGN BRIEFS</span>
              <b>///</b>
              <span>INSTANT ESCROW</span>
              <b>///</b>
            </div>
            <div className="editorial-marquee__group">
              <span>DIRECT INBOX</span>
              <b>///</b>
              <span>VERIFIED METRICS</span>
              <b>///</b>
              <span>TRANSPARENT RATES</span>
              <b>///</b>
              <span>COMMISSION FREE</span>
              <b>///</b>
              <span>CAMPAIGN BRIEFS</span>
              <b>///</b>
              <span>INSTANT ESCROW</span>
              <b>///</b>
            </div>
          </div>
        </div>

        {/* 8.5 PLATFORM METRICS & TRUST INDICATORS (CENTERED MIDDLE SECTION) */}
        <section className="landing-metrics-stripe">
          <div className="section landing-metrics-wrapper">
            <FadeIn distance={20} duration={0.65}>
              <div style={{ marginBottom: '18px', textAlign: 'center' }}>
                <span className="eyebrow"><span className="num-accent">[ 07 ]</span> Platform Scale</span>
              </div>
              <div className="landing-metrics-card">
                <div className="landing-metrics-item">
                  <b className="landing-metrics-number">
                    <CountUp from={0} to={500} duration={1.8} separator="," suffix="+" />
                  </b>
                  <span className="landing-metrics-label">Verified Creators</span>
                </div>

                <div className="landing-metrics-item">
                  <b className="landing-metrics-number">
                    <CountUp from={0} to={100} duration={1.6} suffix="%" />
                  </b>
                  <span className="landing-metrics-label">Upfront Rates</span>
                </div>

                <div className="landing-metrics-item">
                  <b className="landing-metrics-number">Direct</b>
                  <span className="landing-metrics-label">Brand Messaging</span>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* 9. MARKETPLACE PREVIEW */}
        <section className="section">
          <FadeIn className="page-heading">
            <span className="eyebrow"><span className="num-accent">[ 08 ]</span> Product Experience</span>
            <h2>A Clean, <em>Uncluttered Workspace<span className="dot-accent">.</span></em></h2>
            <p>Every tool you need to evaluate, communicate, and track creator partnerships.</p>
          </FadeIn>

          <StaggerContainer className="preview-bento-composition" staggerDelay={0.12}>
            <StaggerItem className="preview-bento-left">
              <span className="preview-bento-badge">
                Marketplace Engine
              </span>
              <h3>Real-Time Creator Discovery</h3>
              <p>
                Quickly compare key creator metrics, rates, and portfolio media with instant search feedback. Filter by location down to specific metropolitan hubs.
              </p>
              
              <div className="preview-feature-pills">
                <div className="preview-feature-pill">
                  <span className="preview-feature-pill-icon">✓</span>
                  <span>Instant verified engagement rates &amp; demographic data</span>
                </div>
                <div className="preview-feature-pill">
                  <span className="preview-feature-pill-icon">✓</span>
                  <span>Direct brand-to-creator messaging &amp; inquiry locks</span>
                </div>
                <div className="preview-feature-pill">
                  <span className="preview-feature-pill-icon">✓</span>
                  <span>Transparent milestone-based budget agreements</span>
                </div>
              </div>

              <div className="preview-bento-actions">
                <Button size="md" variant="primary" onClick={() => navigate('/influencers')}>
                  Launch Live Directory
                </Button>
                <Button size="md" variant="secondary" onClick={() => navigate('/auth/signup')}>
                  Create Account
                </Button>
              </div>
            </StaggerItem>

            <StaggerItem className="creator-mockup-card">
              <div className="creator-mockup-header">
                <div className="creator-mockup-avatar-wrap">
                  <img
                    src="/creator-aanya.jpg"
                    alt="Aanya Kapoor"
                    className="creator-mockup-avatar"
                  />
                  <span className="creator-mockup-online-dot" title="Active now" />
                </div>
                <div className="creator-mockup-info">
                  <div className="creator-mockup-name-row">
                    <span className="creator-mockup-name">Aanya Kapoor</span>
                    <svg className="creator-mockup-verified" width="16" height="16" viewBox="0 0 24 24" fill="#38BDF8">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div className="creator-mockup-niche">@aanyakapoor • Sustainable Fashion • Mumbai</div>
                </div>
              </div>

              <div className="creator-mockup-stats-bar">
                <div>
                  <div className="creator-mockup-stat-val">185K</div>
                  <div className="creator-mockup-stat-lbl">Followers</div>
                </div>
                <div>
                  <div className="creator-mockup-stat-val" style={{ color: '#34D399' }}>4.8%</div>
                  <div className="creator-mockup-stat-lbl">Avg. Eng.</div>
                </div>
                <div>
                  <div className="creator-mockup-stat-val">₹4,500</div>
                  <div className="creator-mockup-stat-lbl">Reel Rate</div>
                </div>
              </div>

              <div className="creator-mockup-inquiry-box">
                <div className="creator-mockup-inquiry-sender">
                  <span className="creator-mockup-brand-tag">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#818CF8', display: 'inline-block' }}></span>
                    UrbanKnit Apparel Co.
                  </span>
                  <span className="creator-mockup-time">Just now</span>
                </div>
                <p className="creator-mockup-message">
                  "Hi Aanya, we love your sustainable styling reels! We're launching an organic capsule next month and would love to partner on 2 reels."
                </p>
              </div>

              <div className="creator-mockup-footer">
                <div className="creator-mockup-status-pill">
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                  <span>In Conversation</span>
                </div>
                <div className="creator-mockup-budget-badge">
                  <span>Budget: ₹9,000</span>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>


        {/* 10. REVIEWS & TESTIMONIALS SLIDER */}
        <section className="section" id="reviews">
          <FadeIn className="page-heading">
            <span className="eyebrow"><span className="num-accent">[ 09 ]</span> Real Stories &amp; Proven Results</span>
            <h2>Proven Results from <em>Top Creators<span className="dot-accent">.</span></em></h2>
            <p>Discover how verified partnerships drive authentic audience engagement and predictable growth.</p>
          </FadeIn>

          <FadeIn delay={0.1} distance={20} style={{ marginTop: '36px' }}>
            <ReviewSlider />
          </FadeIn>
        </section>

        {/* 11. FAQ ACCORDION (QUESTION ANSWERING) */}
        <section className="section" id="faq">
          <FadeIn className="page-heading">
            <span className="eyebrow"><span className="num-accent">[ 10 ]</span> Got Questions?</span>
            <h2>Frequently <em>Asked Questions<span className="dot-accent">.</span></em></h2>
            <p>Everything you need to know about navigating the Brand2Influence marketplace.</p>
          </FadeIn>

          <FadeIn delay={0.1} distance={20} style={{ marginTop: '36px' }}>
            <FaqAccordion />
          </FadeIn>
        </section>

        {/* 12. FINAL CTA */}
        <section className="landing-final-cta-stripe">
          <div className="final-cta-bento">
            <FadeIn className="final-cta-content" distance={24} duration={0.75}>
              <span className="eyebrow"><span className="num-accent">[ 11 ]</span> Your Next Collaboration Starts Here</span>
              <h2>
                Find your next <em>creator<span className="dot-accent">.</span></em>
              </h2>
              <p>
                Join hundreds of independent brands and influential creators shaping modern commerce.
              </p>
              <div className="final-cta-buttons">
                <Button size="lg" variant="primary" onClick={() => navigate('/auth/signup')}>
                  I’m a Brand
                </Button>
                <Button size="lg" variant="secondary" onClick={() => navigate('/auth/signup')}>
                  I’m an Influencer
                </Button>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      {/* 11. CODEASTRA EDITORIAL FOOTER */}
      <footer className="codeastra-footer" role="contentinfo">
        <div className="codeastra-footer-inner">
          <div className="codeastra-footer-grid">
            {/* Left Hero Column */}
            <div className="codeastra-footer-hero">
              <h2 className="codeastra-footer-title">
                Go beyond
              </h2>
              <p className="codeastra-footer-desc">
                There is always a line between an idea and reality.<br />
                Brand2Influence invites you to cross it.
              </p>
              <button
                type="button"
                className="codeastra-footer-btn"
                onClick={() => navigate('/auth/signup')}
              >
                GO BEYOND <span className="codeastra-footer-btn-arrow">→</span>
              </button>
            </div>

            {/* Right Navigation Columns */}
            <div className="codeastra-footer-links-wrap">
              <div className="codeastra-footer-col">
                <span className="codeastra-footer-col-title">PLATFORM</span>
                <nav className="codeastra-footer-nav" aria-label="Platform Links">
                  <button type="button" onClick={() => scrollTo('marketplace')}>THE CREATORS</button>
                  <button type="button" onClick={() => navigate('/brands')}>BRAND DIRECTORY</button>
                  <button type="button" onClick={() => navigate('/campaigns')}>ACTIVE BRIEFS</button>
                  <button type="button" onClick={() => scrollTo('how-it-works')}>WORKFLOW</button>
                  <button type="button" onClick={() => scrollTo('reviews')}>COMMUNITY REVIEWS</button>
                  <button type="button" onClick={() => scrollTo('faq')}>FAQ &amp; PROTOCOL</button>
                </nav>
              </div>

              <div className="codeastra-footer-col">
                <span className="codeastra-footer-col-title">BRAND2INFLUENCE</span>
                <nav className="codeastra-footer-nav" aria-label="Company Links">
                  <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>HOME</button>
                  <button type="button" onClick={() => navigate('/influencers')}>ALL CREATORS</button>
                  <a href="https://www.instagram.com/thewasiim/" target="_blank" rel="noopener noreferrer">TEAM</a>
                  <button type="button" onClick={() => navigate('/auth/login')}>LOG IN</button>
                  <button type="button" onClick={() => navigate('/auth/signup')}>GET ACCESS</button>
                </nav>
              </div>
            </div>
          </div>

          {/* Metadata & Sub-footer Row */}
          <div className="codeastra-footer-meta">
            <span className="codeastra-footer-copy">
              © 2026 BRAND2INFLUENCE · PLATFORM FOR INDEPENDENT CREATORS &amp; BRANDS
            </span>

            <div className="codeastra-footer-meta-right">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="codeastra-footer-backtop"
              >
                · BACK TO TOP ↑
              </button>
              <span className="codeastra-footer-badge">
                ✺ LIVE
              </span>
            </div>
          </div>
        </div>

        {/* Massive Bottom Obsidian Typography: GO BEYOND */}
        <div className="codeastra-footer-giant-wrap" aria-hidden="true">
          <span className="codeastra-footer-giant-text">GO BEYOND</span>
        </div>
      </footer>
    </div>
  )
}
