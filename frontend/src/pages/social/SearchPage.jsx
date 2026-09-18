import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { socialService } from '../../services/social'
import { CURATED_CREATORS, CURATED_BRANDS } from '../../data/curatedData'
import './SearchPage.css'

function UserCard({ user, type }) {
  const [following, setFollowing] = useState(false)
  const handleFollow = async () => {
    try {
      await socialService.followUser(user.userId || user.id)
      setFollowing(true)
    } catch {/* ignore */}
  }
  const initials = (user.name || 'U').slice(0, 1).toUpperCase()

  return (
    <div className="sp-user-card">
      <div className="sp-user-avatar">
        {user.profileImageUrl
          ? <img src={user.profileImageUrl} alt={user.name} />
          : <span>{initials}</span>
        }
        <div className={`sp-role-dot ${type}`} />
      </div>
      <div className="sp-user-info">
        <h3 className="sp-user-name">{user.name}</h3>
        <p className="sp-user-sub">
          {type === 'influencer'
            ? `${user.niche || ''}${user.location ? ` · ${user.location}` : ''}`
            : `${user.businessType || ''}${user.location ? ` · ${user.location}` : ''}`}
        </p>
        {user.followersCount > 0 && (
          <p className="sp-user-followers">
            {user.followersCount >= 1000000
              ? `${(user.followersCount / 1000000).toFixed(1)}M followers`
              : user.followersCount >= 1000
              ? `${(user.followersCount / 1000).toFixed(0)}K followers`
              : `${user.followersCount} followers`}
            {user.engagementRate ? ` · ${user.engagementRate}% engagement` : ''}
          </p>
        )}
        {user.bio && <p className="sp-user-bio">{user.bio.slice(0, 80)}{user.bio.length > 80 ? '…' : ''}</p>}
      </div>
      <div className="sp-user-actions">
        {!following
          ? <button className="hfp-follow-btn" onClick={handleFollow}>Follow</button>
          : <span className="hfp-following-label">Following</span>
        }
        <Link
          to={type === 'influencer' ? `/influencers/${user.userId || user.id}` : `/brands/${user.userId || user.id}`}
          className="sp-view-btn"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('all') // 'all' | 'influencers' | 'brands'
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  const defaultInfluencers = CURATED_CREATORS.map(c => ({ ...c, role: 'influencer' }))
  const defaultBrands = CURATED_BRANDS.map(b => ({ ...b, name: b.businessName, role: 'brand' }))

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    try {
      const res = await socialService.search(q)
      setResults(res)
    } catch {
      // fallback to curated
      const ql = q.toLowerCase()
      setResults({
        influencers: defaultInfluencers.filter(c =>
          c.name.toLowerCase().includes(ql) || c.niche?.toLowerCase().includes(ql) || c.location?.toLowerCase().includes(ql)
        ),
        brands: defaultBrands.filter(b =>
          b.name?.toLowerCase().includes(ql) || b.businessType?.toLowerCase().includes(ql)
        ),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInput = (e) => {
    const v = e.target.value
    setQuery(v)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(v), 400)
  }

  const influencers = results?.influencers || (query ? [] : defaultInfluencers)
  const brands = results?.brands || (query ? [] : defaultBrands)

  const showInfluencers = tab === 'all' || tab === 'influencers'
  const showBrands = tab === 'all' || tab === 'brands'

  return (
    <div className="sp-root">
      {/* Search bar */}
      <div className="sp-search-bar-wrap">
        <div className="sp-search-bar">
          <svg className="sp-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            className="sp-search-input"
            placeholder="Search creators, brands, niches…"
            value={query}
            onChange={handleInput}
            autoFocus
            aria-label="Search creators and brands"
            id="explore-search-input"
          />
          {query && (
            <button className="sp-clear-btn" onClick={() => { setQuery(''); setResults(null) }} aria-label="Clear search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sp-tabs">
        {[
          { key: 'all', label: 'All' },
          { key: 'influencers', label: `✨ Creators (${influencers.length})` },
          { key: 'brands', label: `🏷️ Brands (${brands.length})` },
        ].map(t => (
          <button
            key={t.key}
            className={`sp-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="sp-loading">
          {[1,2,3].map(i => <div key={i} className="sp-skel-card" />)}
        </div>
      )}

      {!loading && !query && (
        <div className="sp-hint">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p>Search creators, brands, or niches to connect</p>
        </div>
      )}

      {showInfluencers && influencers.length > 0 && !loading && (
        <section className="sp-section">
          {(tab === 'all') && (
            <div className="sp-section-header">
              <h2 className="sp-section-title">✨ Creators</h2>
              {influencers.length > 4 && (
                <button className="sp-see-all" onClick={() => setTab('influencers')}>See all →</button>
              )}
            </div>
          )}
          <div className="sp-user-list">
            {(tab === 'all' ? influencers.slice(0, 4) : influencers).map(u => (
              <UserCard key={u.id} user={u} type="influencer" />
            ))}
          </div>
        </section>
      )}

      {showBrands && brands.length > 0 && !loading && (
        <section className="sp-section">
          {(tab === 'all') && (
            <div className="sp-section-header">
              <h2 className="sp-section-title">🏷️ Brands</h2>
              {brands.length > 4 && (
                <button className="sp-see-all" onClick={() => setTab('brands')}>See all →</button>
              )}
            </div>
          )}
          <div className="sp-user-list">
            {(tab === 'all' ? brands.slice(0, 4) : brands).map(u => (
              <UserCard key={u.id} user={u} type="brand" />
            ))}
          </div>
        </section>
      )}

      {!loading && query && influencers.length === 0 && brands.length === 0 && (
        <div className="sp-no-results">
          No results found for "<strong>{query}</strong>"
        </div>
      )}
    </div>
  )
}
