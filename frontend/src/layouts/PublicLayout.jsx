import React, { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui'

export function PublicLayout() {
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

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
    <>
      <header className={`navbar ${mobileMenuOpen ? 'menu-open' : ''}`}>
        <Link to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          Brand2Influence
        </Link>

        {mobileMenuOpen && (
          <div className="nav-backdrop" onClick={() => setMobileMenuOpen(false)} />
        )}

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

          {mobileMenuOpen && (
            <nav className="open">
              <div className="nav-drawer-header">
                <span className="nav-drawer-title">Navigation</span>
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

              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/campaigns" onClick={() => setMobileMenuOpen(false)}>Brand Deals</Link>
              <Link to="/influencers" onClick={() => setMobileMenuOpen(false)}>Discover Creators</Link>
              {user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link to="/conversations" onClick={() => setMobileMenuOpen(false)}>Messages</Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                  <button
                    type="button"
                    className="nav-login"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut()
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="nav-login"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      navigate('/auth/login')
                    }}
                  >
                    Log in
                  </button>
                  <button
                    type="button"
                    className="nav-join"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      navigate('/auth/signup')
                    }}
                  >
                    Get started
                  </button>
                </>
              )}
            </nav>
          )}
        </div>
      </header>
      <Outlet />
    </>
  )
}
