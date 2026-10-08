import React, { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { UserAvatarMenu } from '../components/UserAvatarMenu'
import '../pages/admin/AdminPages.css'

export function AdminLayout() {
  const { signOut } = useAuth?.() || {}
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

  const navItems = [
    { to: '/admin', label: 'Overview', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    )},
    { to: '/admin/users', label: 'All Users', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )},
    { to: '/admin/influencers', label: 'Influencer Directory', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )},
    { to: '/admin/brands', label: 'Brand Directory', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    )},
    { to: '/admin/campaigns', label: 'Campaign Moderation', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" x2="15" y1="10" y2="10" />
      </svg>
    )},
    { to: '/admin/reports', label: 'Telemetry & Reports', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="18" y1="20" y2="10" />
        <line x1="12" x2="12" y1="20" y2="4" />
        <line x1="6" x2="6" y1="20" y2="14" />
      </svg>
    )},
    { to: '/admin/settings', label: 'System Configuration', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )}
  ]

  // Determine current page title for breadcrumb
  const currentNav = navItems.find((item) => 
    item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to)
  )
  const currentLabel = currentNav ? currentNav.label : 'Control Panel'

  const navLinksContent = (
    <>
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-logo-row">
          <Link to="/" className="admin-brand-link">
            BRAND2INFLUENCE
          </Link>
          <span className="admin-console-pill">
            <span className="admin-status-dot" />
            LIVE
          </span>
        </div>
      </div>

      <span className="admin-nav-group-label">[ 01 ] CONTROL CONSOLE</span>
      <div className="admin-nav-links">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            end={to === '/admin'}
            to={to}
            key={to}
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <span className="admin-nav-group-label">[ 02 ] NAVIGATION</span>
      <div className="admin-nav-links">
        <NavLink to="/dashboard" className="admin-nav-item" onClick={() => setMobileMenuOpen(false)}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" x2="5" y1="12" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Return to App</span>
        </NavLink>
      </div>

      <div className="admin-sidebar-footer">
        {signOut && (
          <button
            type="button"
            className="admin-sidebar-logout-btn"
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
            <span>Terminate Session</span>
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className="portal admin">
      {/* Mobile Top Header Bar (< 1024px) */}
      <header className="portal-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/" className="admin-brand-link">
            BRAND2INFLUENCE
          </Link>
          <span className="admin-console-pill">
            <span className="admin-status-dot" />
            ADMIN
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserAvatarMenu />
          <button
            type="button"
            className="menu"
            aria-label="Toggle Admin Navigation"
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

        {mobileMenuOpen && (
          <div className="nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
        )}

        {mobileMenuOpen && (
          <nav className="portal-mobile-drawer open" style={{ background: '#0e0e0d' }}>
            <div className="nav-drawer-header">
              <span className="nav-drawer-title" style={{ fontFamily: 'var(--font-mono)' }}>[ ADMIN CONSOLE ]</span>
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
            {navLinksContent}
          </nav>
        )}
      </header>

      {/* Desktop Left Sidebar (>= 1024px) */}
      <aside className="portal-desktop-aside">
        {navLinksContent}
      </aside>

      {/* Main Administrative Viewport */}
      <section className="portal-main-section">
        <header className="admin-topbar-luxury">
          <div className="admin-topbar-breadcrumbs">
            <span>ADMIN</span>
            <span className="divider">/</span>
            <span className="current">{currentLabel.toUpperCase()}</span>
          </div>

          <div className="admin-topbar-actions">
            <div className="admin-system-health-badge">
              <span className="admin-status-dot" />
              <span>100% OPERATIONAL</span>
            </div>

            <Link to="/dashboard" className="admin-back-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" x2="5" y1="12" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to App</span>
            </Link>

            <UserAvatarMenu />
          </div>
        </header>

        <div className="admin-main-viewport">
          <Outlet />
        </div>
      </section>
    </div>
  )
}

export default AdminLayout
