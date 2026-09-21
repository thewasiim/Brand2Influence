import React, { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { socialService } from '../../services/social'
import CreatePostModal from '../../pages/social/CreatePostModal'
import './InstagramSidebar.css'

export function InstagramSidebar() {
  const { user, profile, signOut } = useAuth()
  const [isHovered, setIsHovered] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const moreRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const isBrand = profile?.role === 'brand'
  const isInfluencer = profile?.role === 'influencer'
  const roleLabel = isBrand ? 'Brand' : isInfluencer ? 'Creator' : 'Member'
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url

  // Close 'More' dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreMenuOpen(false)
      }
    }
    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [moreMenuOpen])

  // Load notifications
  useEffect(() => {
    if (!user) return
    socialService.getNotifications()
      .then(res => {
        setNotifications(res.items || [])
        setUnreadCount((res.items || []).filter(n => !n.read).length)
      })
      .catch(() => {})
  }, [user])

  // Close menus on route change
  useEffect(() => {
    setMoreMenuOpen(false)
    setNotificationsOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    setMoreMenuOpen(false)
    await signOut()
    navigate('/login')
  }

  return (
    <>
      <aside
        className={`ig-sidebar ${isHovered ? 'is-expanded' : 'is-collapsed'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setMoreMenuOpen(false)
        }}
        aria-label="Instagram Style Workspace Navigation"
      >
        <div className="ig-sidebar-inner">
          {/* Top Brand Logo */}
          <div className="ig-sidebar-header">
            <Link to="/dashboard" className="ig-brand-link" aria-label="Brand2Influence Home">
              {/* Collapsed Monogram */}
              <div className="ig-brand-icon-wrap" title="Brand2Influence">
                <span className="ig-brand-monogram">B</span>
              </div>

              {/* Expanded Wordmark */}
              <div className="ig-brand-text">
                <span className="ig-brand-title">Brand2Influence</span>
                <span className="ig-brand-badge">{roleLabel}</span>
              </div>
            </Link>
          </div>

          {/* Main Navigation Links */}
          <nav className="ig-nav-list" role="navigation">
            {/* 1. Home / Dashboard */}
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => `ig-nav-item ${isActive ? 'is-active' : ''}`}
              title="Home"
            >
              <div className="ig-item-icon-box">
                <svg className="ig-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="ig-item-label">Home</span>
            </NavLink>

            {/* 2. Search */}
            <NavLink
              to="/search"
              className={({ isActive }) => `ig-nav-item ${isActive ? 'is-active' : ''}`}
              title="Search"
            >
              <div className="ig-item-icon-box">
                <svg className="ig-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <span className="ig-item-label">Search</span>
            </NavLink>

            {/* 3. Explore */}
            <NavLink
              to="/explore"
              className={({ isActive }) => `ig-nav-item ${isActive ? 'is-active' : ''}`}
              title="Explore"
            >
              <div className="ig-item-icon-box">
                <svg className="ig-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </div>
              <span className="ig-item-label">Explore</span>
            </NavLink>

            {/* 4. Messages */}
            <NavLink
              to="/conversations"
              className={({ isActive }) => `ig-nav-item ${isActive ? 'is-active' : ''}`}
              title="Messages"
            >
              <div className="ig-item-icon-box">
                <svg className="ig-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <span className="ig-item-label">Messages</span>
            </NavLink>

            {/* 5. Notifications */}
            <button
              type="button"
              className={`ig-nav-item ${notificationsOpen ? 'is-active' : ''}`}
              onClick={() => {
                setNotificationsOpen(!notificationsOpen)
                if (!notificationsOpen && unreadCount > 0) {
                  socialService.markNotificationsRead().catch(() => {})
                  setUnreadCount(0)
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                }
              }}
              title="Notifications"
            >
              <div className="ig-item-icon-box">
                <svg className="ig-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
                {unreadCount > 0 && <span className="ig-badge-count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                {unreadCount === 0 && <span className="ig-badge-dot" />}
              </div>
              <span className="ig-item-label">Notifications</span>
            </button>

            {/* 6. Create (+) */}
            <button
              type="button"
              className="ig-nav-item ig-create-btn"
              onClick={() => {
                if (isBrand) {
                  navigate('/brand/campaigns')
                } else {
                  setShowCreateModal(true)
                }
              }}
              title={isBrand ? 'Create Brief' : 'Create Post'}
            >
              <div className="ig-item-icon-box">
                <svg className="ig-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <span className="ig-item-label">{isBrand ? 'Create Brief' : 'Create Post'}</span>
            </button>

            {/* 7. Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) => `ig-nav-item ${isActive ? 'is-active' : ''}`}
              title="Profile"
            >
              <div className="ig-item-icon-box">
                <div className="ig-avatar-ring">
                  {userAvatar ? (
                    <img src={userAvatar} alt={displayName} className="ig-avatar-img" />
                  ) : (
                    <div className="ig-avatar-fallback">
                      {displayName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span className="ig-item-label">Profile</span>
            </NavLink>
          </nav>

          {/* Bottom Controls */}
          <div className="ig-sidebar-footer" ref={moreRef}>
            {/* More Menu Dropup Popup */}
            {moreMenuOpen && (
              <div className="ig-more-popover" role="menu">
                <div className="ig-popover-header">
                  <span className="ig-popover-name">{displayName}</span>
                  <span className="ig-popover-role">{roleLabel}</span>
                </div>
                <div className="ig-popover-divider" />
                <Link to="/profile" className="ig-popover-item" onClick={() => setMoreMenuOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Settings</span>
                </Link>
                <Link to="/how-it-works" className="ig-popover-item" onClick={() => setMoreMenuOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Help & How It Works</span>
                </Link>
                <Link to="/?view=site" className="ig-popover-item" onClick={() => setMoreMenuOpen(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span>Return to Website</span>
                </Link>
                <div className="ig-popover-divider" />
                <button type="button" className="ig-popover-item ig-popover-logout" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Log out</span>
                </button>
              </div>
            )}

            {/* Hamburger More Button */}
            <button
              type="button"
              className={`ig-nav-item ${moreMenuOpen ? 'is-active' : ''}`}
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              title="More"
            >
              <div className="ig-item-icon-box">
                <svg className="ig-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
              </div>
              <span className="ig-item-label">More</span>
            </button>

            {/* Return to Website */}
            <Link to="/?view=site" className="ig-nav-item ig-meta-link" title="Return to Website">
              <div className="ig-item-icon-box">
                <svg className="ig-item-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <span className="ig-item-label">Return to Website</span>
            </Link>
          </div>
        </div>

        {/* Notifications Slide-out Flyout */}
        {notificationsOpen && (
          <div className="ig-flyout-panel" role="dialog" aria-label="Notifications">
            <div className="ig-flyout-header">
              <h3>Notifications</h3>
              <button
                type="button"
                className="ig-flyout-close"
                onClick={() => setNotificationsOpen(false)}
                aria-label="Close notifications"
              >
                ✕
              </button>
            </div>
            <div className="ig-flyout-content">
              {notifications.length === 0 ? (
                <>
                  <div className="ig-notification-card">
                    <div className="ig-notif-dot" />
                    <div className="ig-notif-body">
                      <p className="ig-notif-text">
                        Welcome to <strong>Brand2Influence</strong>! Complete your profile to get discovered.
                      </p>
                      <span className="ig-notif-time">Just now</span>
                    </div>
                  </div>
                  <div className="ig-notification-card">
                    <div className="ig-notif-dot read" />
                    <div className="ig-notif-body">
                      <p className="ig-notif-text">
                        New creator sponsorships available in your niche.
                      </p>
                      <span className="ig-notif-time">2 hours ago</span>
                    </div>
                  </div>
                </>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="ig-notification-card">
                    <div className={`ig-notif-dot ${n.read ? 'read' : ''}`} />
                    <div className="ig-notif-body">
                      <p className="ig-notif-text">
                        {n.type === 'follow' && <><strong>{n.actor?.name || 'Someone'}</strong> started following you</>}
                        {n.type === 'like' && <><strong>{n.actor?.name || 'Someone'}</strong> liked your post</>}
                        {n.type === 'comment' && <><strong>{n.actor?.name || 'Someone'}</strong> commented on your post</>}
                      </p>
                      <span className="ig-notif-time">
                        {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Top Header (< 768px) */}
      <header className="ig-mobile-topbar" aria-label="Mobile Navigation Bar">
        <Link to="/dashboard" className="ig-mobile-brand">
          <span className="ig-mobile-logo-title">Brand2Influence</span>
          <span className="ig-mobile-role-pill">{roleLabel}</span>
        </Link>
        <div className="ig-mobile-actions">
          <Link to="/?view=site" className="ig-mobile-website-btn" title="Return to Website">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>Website</span>
          </Link>
          <button
            type="button"
            className="ig-mobile-icon-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-label="Notifications"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span className="ig-mobile-badge-dot" />
          </button>
          <button
            type="button"
            className="ig-mobile-icon-btn"
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            aria-label="Account Settings"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      {/* Order: Home | Explore (video/play) | Messages (send) | Search | Profile — matches design spec */}
      <nav className="ig-mobile-bottombar" aria-label="Mobile Bottom Navigation">

        {/* 1. Home */}
        <NavLink to="/dashboard" end className={({ isActive }) => `ig-mobile-tab ${isActive ? 'is-active' : ''}`} aria-label="Home">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </NavLink>

        {/* 2. Explore — rounded-rect with play (like screenshot) */}
        <NavLink to="/explore" className={({ isActive }) => `ig-mobile-tab ${isActive ? 'is-active' : ''}`} aria-label="Explore">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="4" />
            <polygon points="10 8 16 12 10 16 10 8" />
          </svg>
        </NavLink>

        {/* 3. Messages — paper-plane send (like screenshot) */}
        <NavLink to="/conversations" className={({ isActive }) => `ig-mobile-tab ${isActive ? 'is-active' : ''}`} aria-label="Messages">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </NavLink>

        {/* 4. Search */}
        <NavLink to="/search" className={({ isActive }) => `ig-mobile-tab ${isActive ? 'is-active' : ''}`} aria-label="Search">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </NavLink>

        {/* 5. Profile — circular avatar */}
        <NavLink to="/profile" className={({ isActive }) => `ig-mobile-tab ig-mobile-tab-profile ${isActive ? 'is-active' : ''}`} aria-label="Profile">
          <div className="ig-mobile-avatar">
            {userAvatar ? (
              <img src={userAvatar} alt={displayName} />
            ) : (
              <span>{displayName.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
        </NavLink>

      </nav>
      {/* Create Post Modal (influencers) */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPosted={() => setShowCreateModal(false)}
        />
      )}
    </>
  )
}

export default InstagramSidebar
