import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Avatar, Badge } from './ui'

export function UserAvatarMenu() {
  const { user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [open])

  if (!user) return null

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''
  const role = profile?.role || 'influencer'

  let roleLabel = 'Influencer'
  let roleBadgeVariant = 'secondary'
  if (role === 'admin') {
    roleLabel = 'Admin'
    roleBadgeVariant = 'accent'
  } else if (role === 'brand') {
    roleLabel = 'Brand'
    roleBadgeVariant = 'primary'
  }

  const handleLogout = () => {
    setOpen(false)
    signOut()
  }

  return (
    <div className="nav-user-menu-wrap" ref={menuRef}>
      <button
        type="button"
        className="nav-user-avatar-btn"
        onClick={() => setOpen(!open)}
        aria-label="User Account Menu"
        aria-expanded={open}
      >
        <Avatar name={displayName} size="sm" tone={role === 'admin' ? 'accent' : role === 'brand' ? 'primary' : 'secondary'} />
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--color-text-secondary)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="nav-backdrop" style={{ background: 'transparent' }} onClick={() => setOpen(false)} />
          <div className="nav-user-dropdown">
            <div className="user-dropdown-header">
              <Avatar name={displayName} size="md" tone={role === 'admin' ? 'accent' : role === 'brand' ? 'primary' : 'secondary'} />
              <div className="user-dropdown-info">
                <div className="user-dropdown-name">{displayName}</div>
                <div className="user-dropdown-email">{email}</div>
                <div style={{ marginTop: '4px' }}>
                  <Badge variant={roleBadgeVariant} size="sm">
                    {roleLabel}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="user-dropdown-links">
              <Link
                to={role === 'admin' ? '/admin' : '/dashboard'}
                className="user-dropdown-item"
                onClick={() => setOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
                Dashboard
              </Link>

              <Link
                to="/profile"
                className="user-dropdown-item"
                onClick={() => setOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                My Profile
              </Link>

              {role === 'brand' && (
                <Link
                  to="/brand/campaigns"
                  className="user-dropdown-item"
                  onClick={() => setOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <line x1="3" x2="21" y1="9" y2="9" />
                    <line x1="9" x2="9" y1="21" y2="9" />
                  </svg>
                  My Ad Briefs
                </Link>
              )}

              {role === 'influencer' && (
                <Link
                  to="/campaigns"
                  className="user-dropdown-item"
                  onClick={() => setOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <line x1="9" x2="15" y1="10" y2="10" />
                  </svg>
                  Brand Deals
                </Link>
              )}

              {role === 'admin' && (
                <Link
                  to="/admin"
                  className="user-dropdown-item"
                  onClick={() => setOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  Admin Panel
                </Link>
              )}

              <Link
                to="/conversations"
                className="user-dropdown-item"
                onClick={() => setOpen(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Messages
              </Link>
            </div>

            <div className="user-dropdown-divider" />

            <button
              type="button"
              className="user-dropdown-item user-dropdown-logout"
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Log Out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
