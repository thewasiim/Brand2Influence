import React, { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function UserLayout() {
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent background scroll when mobile drawer is open
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

  const roleLabel = profile?.role === 'brand' ? 'Brand' : profile?.role === 'influencer' ? 'Creator' : 'Member'

  const navLinks = (
    <>
      <b>Navigation</b>
      <NavLink to="/dashboard" end onClick={() => setMobileMenuOpen(false)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1" />
          <rect width="7" height="5" x="14" y="3" rx="1" />
          <rect width="7" height="9" x="14" y="12" rx="1" />
          <rect width="7" height="5" x="3" y="16" rx="1" />
        </svg>
        Dashboard
      </NavLink>

      {profile?.role === 'brand' ? (
        <NavLink to="/brand/campaigns" onClick={() => setMobileMenuOpen(false)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <line x1="3" x2="21" y1="9" y2="9" />
            <line x1="9" x2="9" y1="21" y2="9" />
          </svg>
          My Ad Briefs
        </NavLink>
      ) : (
        <NavLink to="/campaigns" onClick={() => setMobileMenuOpen(false)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" x2="15" y1="10" y2="10" />
          </svg>
          Brand Deals
        </NavLink>
      )}

      <NavLink to="/influencers" onClick={() => setMobileMenuOpen(false)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
        Discover
      </NavLink>

      <NavLink to="/conversations" onClick={() => setMobileMenuOpen(false)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Messages
      </NavLink>

      <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        My profile
      </NavLink>

      {profile?.role === 'admin' && (
        <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          </svg>
          Admin
        </NavLink>
      )}

      <button
        type="button"
        className="portal-logout-btn"
        onClick={() => {
          setMobileMenuOpen(false)
          signOut()
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
        Log out
      </button>
    </>
  )

  return (
    <div className="portal">
      {/* Mobile Top Header Bar (< 1024px) */}
      <header className="portal-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" className="brand">
            Brand2Influence
          </Link>
          <span className="portal-role-badge">{roleLabel}</span>
        </div>

        <button
          type="button"
          className="menu"
          aria-label="Toggle Navigation"
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

        {mobileMenuOpen && (
          <div className="nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
        )}

        {mobileMenuOpen && (
          <nav className="portal-mobile-drawer open">
            <div className="nav-drawer-header">
              <span className="nav-drawer-title">{roleLabel} Workspace</span>
              <button
                type="button"
                className="nav-drawer-close"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {navLinks}
          </nav>
        )}
      </header>

      {/* Desktop Left Sidebar (>= 1024px) */}
      <aside className="portal-desktop-aside">
        <Link to="/" className="brand">
          Brand2Influence
        </Link>
        {navLinks}
      </aside>

      <section className="portal-main-section">
        <Outlet />
      </section>
    </div>
  )
}
