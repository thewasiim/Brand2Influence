import React from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserAvatarMenu } from '../components/UserAvatarMenu'
import StaggeredMenu from '../components/StaggeredMenu/StaggeredMenu'

// Exactly matches Desktop Navbar items (Creators, Brands, Campaigns, Reviews, FAQ)
const menuItems = [
  { label: 'Creators', ariaLabel: 'Find and browse creator profiles', link: '/influencers' },
  { label: 'Brands', ariaLabel: 'Find and explore brand profiles', link: '/brands' },
  { label: 'Campaigns', ariaLabel: 'View open sponsorship briefs', link: '/campaigns' },
  { label: 'Reviews', ariaLabel: 'Read verified creator and brand reviews', link: '/#reviews' },
  { label: 'FAQ', ariaLabel: 'Frequently asked questions', link: '/#faq' }
]

const socialItems = [
  { label: 'GitHub', link: 'https://github.com' },
  { label: 'Twitter', link: 'https://twitter.com' },
  { label: 'LinkedIn', link: 'https://linkedin.com' }
]

export function PublicLayout({ children }) {
  const { user, profile } = useAuth()

  return (
    <div className="public-layout-root">
      <div className="site-pill-wrap">
        <header className="navbar site-pill">
          <Link to={user ? "/?view=site" : "/"} className="brand">
            <span className="brand-dot" />
            <span className="brand-text">Brand2Influence</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-desktop-links" aria-label="Main Navigation">
            <NavLink to="/influencers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Creators
            </NavLink>
            <NavLink to="/brands" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Brands
            </NavLink>
            <NavLink to="/campaigns" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Campaigns
            </NavLink>
            <a href="/#reviews" className="nav-link">
              Reviews
            </a>
            <a href="/#faq" className="nav-link">
              FAQ
            </a>
          </nav>

          <div className="nav-actions">
            {user ? (
              <>
                <Link
                  to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="nav-dashboard-pill"
                >
                  <span>Dashboard</span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
                <UserAvatarMenu />
              </>
            ) : (
              <div className="desktop-auth-actions">
                <Link to="/login" className="nav-login-link">
                  Sign In
                </Link>
                <Link to="/auth/portal" className="nav-signup-button">
                  Go Beyond →
                </Link>
              </div>
            )}

            {/* Strictly mobile-only drawer menu — matches exact desktop items & Obsidian/Warm Cream design */}
            <div className="mobile-only-nav">
              <StaggeredMenu
                items={menuItems}
                socialItems={socialItems}
                displaySocials={true}
                displayItemNumbering={true}
                colors={['#181816', '#121211', '#0b0b0a']}
                panelBg="#0b0b0a"
                textColor="#f4f1e8"
                accentColor="#f4f1e8"
                menuButtonColor="#f4f1e8"
                openMenuButtonColor="#0b0b0a"
                loginLabel={user ? 'Dashboard' : 'Sign In'}
                loginLink={user ? (profile?.role === 'admin' ? '/admin' : '/dashboard') : '/login'}
                ctaLabel={user ? 'My Profile' : 'Go Beyond →'}
                ctaLink={user ? '/profile' : '/auth/portal'}
              />
            </div>
          </div>
        </header>
      </div>
      {children || <Outlet />}
    </div>
  )
}
