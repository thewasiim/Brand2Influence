import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import VantaCellsBackground from '../components/VantaCellsBackground'

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
    brandLogoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300',
    budget: '₹15,000–₹50,000',
  },
  {
    id: 'b-2',
    brand: 'Kiro Clean Beauty',
    brandLogoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=300',
    budget: '₹20,000–₹60,000',
  },
  {
    id: 'b-3',
    brand: 'Mokobara Luggage',
    brandLogoUrl: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?auto=format&fit=crop&q=80&w=300',
    budget: '₹30,000–₹1,00,000',
  },
  {
    id: 'b-4',
    brand: 'Sleepy Owl Coffee',
    brandLogoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=300',
    budget: '₹18,000–₹45,000',
  },
  {
    id: 'b-5',
    brand: 'Pilgrim Beauty Secrets',
    brandLogoUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300',
    budget: '₹25,000–₹70,000',
  },
  {
    id: 'b-6',
    brand: 'Supertails Pet Care',
    brandLogoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=300',
    budget: '₹12,000–₹35,000',
  },
]

const SHOWCASE_CAMPAIGNS = [
  {
    id: 'camp-1',
    title: 'Summer Organic Linen & Cotton Capsule',
    brand: 'The Loom Co.',
    brandLogoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=300',
    niche: 'Fashion',
    platform: 'Instagram',
    budget: '₹25,000 – ₹45,000',
    deliverables: ['2x Reels', '3x Stories'],
    targetFollowers: '20,000+',
    location: 'Mumbai / Delhi NCR',
    description: 'Looking for sustainable fashion stylists for styling reels featuring our handcrafted summer linen collection.',
  },
  {
    id: 'camp-2',
    title: 'Cold Brew Starter Kit Unboxing & Recipe',
    brand: 'Blue Tokai Roasters',
    brandLogoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300',
    niche: 'Food & Beverage',
    platform: 'Instagram / YouTube',
    budget: '₹15,000 – ₹35,000',
    deliverables: ['1x Reel', '1x Carousel'],
    targetFollowers: '15,000+',
    location: 'Pan-India',
    description: 'Seeking food & coffee creators to craft creative iced coffee recipes using our specialty cold brew blends.',
  },
  {
    id: 'camp-3',
    title: 'Clean Barrier Repair Serum Campaign',
    brand: 'Kiro Botanicals',
    brandLogoUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=300',
    niche: 'Beauty & Skincare',
    platform: 'Instagram',
    budget: '₹20,000 – ₹50,000',
    deliverables: ['1x Reel', '2x Story Highlights'],
    targetFollowers: '25,000+',
    location: 'Bengaluru / Mumbai',
    description: 'Ingredient-first skincare review educating followers on ceramides, hydration, and skin barrier health.',
  },
  {
    id: 'camp-4',
    title: 'Minimalist Travel Backpack Durability Showcase',
    brand: 'Mokobara',
    brandLogoUrl: 'https://images.unsplash.com/photo-1553531384-397c80973a0b?auto=format&fit=crop&q=80&w=300',
    niche: 'Travel & Lifestyle',
    platform: 'YouTube / Instagram',
    budget: '₹35,000 – ₹80,000',
    deliverables: ['1x Vlog Integration', '1x Reel'],
    targetFollowers: '40,000+',
    location: 'Pan-India',
    description: 'Calling travel and lifestyle creators to test and showcase transit durability on upcoming weekend trips.',
  },
  {
    id: 'camp-5',
    title: 'Plant-Based Protein Daily Smoothie Routine',
    brand: 'Cosmix Wellness',
    brandLogoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=300',
    niche: 'Fitness & Health',
    platform: 'Instagram',
    budget: '₹18,000 – ₹40,000',
    deliverables: ['1x Reel', '2x Stories with Link'],
    targetFollowers: '15,000+',
    location: 'Pan-India',
    description: 'Partnering with fitness enthusiasts and nutritionists to showcase clean gut-friendly daily protein routines.',
  },
  {
    id: 'camp-6',
    title: 'Workstation Aesthetic & Ergonomic Desk Setup',
    brand: 'Sleepy Owl Goods',
    brandLogoUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=300',
    niche: 'Tech & Lifestyle',
    platform: 'Instagram / YouTube',
    budget: '₹20,000 – ₹45,000',
    deliverables: ['1x Reel', '1x Community Post'],
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
      <main>
        {/* 2. BENTO HERO */}
        <section className="bento-hero" id="top">
          <VantaCellsBackground
            color1={0x000039}
            color2={0x3b82f6}
            size={1.5}
            speed={1.0}
            className="hero-vanta-bg"
          />
          <div className="hero-vanta-overlay" />
          <div className="bento-hero-content">
            <FadeIn delay={0.05} distance={16}>
              <div className="hero-badge">
                <i /> INDIA'S CREATOR & BRAND MARKETPLACE
              </div>
            </FadeIn>
            <FadeIn delay={0.12} distance={22}>
              <h1 className="hero-title">
                Make work that <em>moves people.</em>
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
              <p className="quiet" style={{ marginTop: '16px' }}>
                Are you a creator? <b onClick={() => navigate('/auth/signup')} style={{ cursor: 'pointer' }}>Join the community →</b>
              </p>
            </FadeIn>
          </div>
        </section>


        {/* 3. INTERACTIVE INFLUENCER SEARCH (BENTO SEARCH PANEL) */}
        <section className="landing-search-stripe">
          <FadeIn as="div" className="bento-search-section" distance={24} duration={0.75}>
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
            <div>
              <span className="eyebrow">Two Sides of the Marketplace</span>
              <h2>Built for Both Creators and Brands</h2>
            </div>
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
                <Button variant="secondary" size="md" onClick={() => navigate('/brands')}>
                  Search Brands & Deals →
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
            <div>
              <span className="eyebrow">Curated Showcase</span>
              <h2>Featured Independent Talent</h2>
            </div>
            <p>Select a category or use the search controls above to filter in real-time.</p>
          </FadeIn>

          {/* CATEGORY TABS */}
          <FadeIn delay={0.08} distance={14}>
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
            <div>
              <span className="eyebrow">Verified Partners</span>
              <h2>Featured Brands & Collaborations</h2>
            </div>
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
                  budget={brand.budget}
                  onClick={() => navigate(`/brands/${brand.id}`)}
                />
              )}
            />
          </div>
        </section>

        {/* 7. OPEN CAMPAIGN BRIEFS & SPONSORSHIPS (DIRECTLY UNDER BRANDS) */}
        <section className="section" id="campaign-deals">
          <FadeIn className="page-heading">
            <div>
              <span className="eyebrow">Active Sponsorships</span>
              <h2>Open Brand Campaigns & Briefs</h2>
            </div>
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
                  title={camp.title}
                  brand={camp.brand}
                  brandLogoUrl={camp.brandLogoUrl}
                  niche={camp.niche}
                  platform={camp.platform}
                  budget={camp.budget}
                  deliverables={camp.deliverables}
                  targetFollowers={camp.targetFollowers}
                  location={camp.location}
                  description={camp.description}
                  onSelect={() => navigate(`/campaigns/${camp.id}`)}
                />
              )}
            />
          </div>

          <FadeIn delay={0.15} style={{ textAlign: 'center', marginTop: '28px' }}>
            <Button variant="secondary" size="md" onClick={() => navigate('/campaigns')}>
              Explore All Open Brand Campaigns ({'>'} 6 Available) →
            </Button>
          </FadeIn>
        </section>

        {/* 8. HOW IT WORKS (BENTO WORKFLOW) */}
        <section className="section" id="how-it-works">
          <FadeIn className="page-heading">
            <div>
              <span className="eyebrow">Simple, By Design</span>
              <h2>How Brand2Influence Works</h2>
            </div>
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
                  <span className="workflow-step">{step}</span>
                  <h3 style={{ marginTop: '12px', fontSize: '20px', fontWeight: 700 }}>{title}</h3>
                  <p style={{ marginTop: '8px', fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </PixelCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* 8.5 PLATFORM METRICS & TRUST INDICATORS (CENTERED MIDDLE SECTION) */}
        <section className="landing-metrics-stripe">
          <div className="section landing-metrics-wrapper">
            <FadeIn distance={20} duration={0.65}>
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
            <div>
              <span className="eyebrow">Product Experience</span>
              <h2>A Clean, Uncluttered Workspace</h2>
            </div>
            <p>Every tool you need to evaluate, communicate, and track creator partnerships.</p>
          </FadeIn>

          <StaggerContainer className="preview-bento-composition" staggerDelay={0.12}>
            <StaggerItem>
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
            </StaggerItem>

            <StaggerItem style={{ background: 'var(--color-surface-2)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>Live Preview</span>
              <h4 style={{ margin: '8px 0 14px' }}>Active Collaboration Inquiry</h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                "Hi Aanya, we love your sustainable styling reels. We are launching an organic cotton capsule next month and would love to partner on 2 reels."
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                <small style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>Status: In Conversation</small>
                <Badge variant="accent">Budget: ₹9,000</Badge>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>


        {/* 10. REVIEWS & TESTIMONIALS SLIDER */}
        <section className="section" id="reviews">
          <FadeIn className="page-heading">
            <div>
              <span className="eyebrow">Real Stories & Proven Results</span>
              <h2>Loved by Growing Brands & Top Creators</h2>
            </div>
            <p>Discover how verified partnerships drive authentic audience engagement and predictable growth.</p>
          </FadeIn>

          <FadeIn delay={0.1} distance={20} style={{ marginTop: '36px' }}>
            <ReviewSlider />
          </FadeIn>
        </section>

        {/* 11. FAQ ACCORDION (QUESTION ANSWERING) */}
        <section className="section" id="faq">
          <FadeIn className="page-heading">
            <div>
              <span className="eyebrow">Got Questions?</span>
              <h2>Frequently Asked Questions</h2>
            </div>
            <p>Everything you need to know about navigating the Brand2Influence marketplace.</p>
          </FadeIn>

          <FadeIn delay={0.1} distance={20} style={{ marginTop: '36px' }}>
            <FaqAccordion />
          </FadeIn>
        </section>

        {/* 12. FINAL CTA */}
        <section className="landing-final-cta-stripe">
          <div className="final-cta-bento">
            <FadeIn className="final-cta-content" distance={24} duration={0.75} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span className="eyebrow" style={{ color: 'var(--color-accent)', textAlign: 'center' }}>Your Next Collaboration Starts Here</span>
              <h2 style={{ fontSize: 'clamp(38px, 4.5vw, 56px)', margin: '16px 0 20px', textAlign: 'center' }}>
                Find your next creator.
              </h2>
              <p style={{ color: 'var(--color-neutral-muted)', fontSize: '15px', textAlign: 'center', maxWidth: '560px' }}>
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

      {/* 11. FOOTER */}
      <FadeIn as="footer" className="landing-footer" distance={16} delay={0.1}>
        <div className="footer-main">
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand-logo">
              Brand2Influence
            </Link>
            <p className="footer-brand-desc">
              India’s premier marketplace for independent creators and forward-thinking brands.
            </p>
          </div>
          <nav className="footer-nav">
            <button type="button" onClick={() => scrollTo('marketplace')}>Discover</button>
            <button type="button" onClick={() => scrollTo('reviews')}>Reviews</button>
            <button type="button" onClick={() => scrollTo('faq')}>FAQ</button>
            <button type="button" onClick={() => scrollTo('how-it-works')}>How it works</button>
            <button type="button" onClick={() => navigate('/auth/signup')}>Join</button>
            <button type="button" onClick={() => navigate('/auth/login')}>Log in</button>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Brand2Influence. All rights reserved.</span>
          <span className="footer-credit">
            Made by{' '}
            <a
              href="https://www.instagram.com/thewasiim/"
              target="_blank"
              rel="noopener noreferrer"
            >
              thewasiim
            </a>
          </span>
          <span className="footer-tagline">Designed for meaningful creator partnerships.</span>
        </div>
      </FadeIn>
    </div>
  )
}
