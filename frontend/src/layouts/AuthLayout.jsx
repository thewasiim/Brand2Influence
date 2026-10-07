import React from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

export function AuthLayout() {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <main className="auth-layout">
      <header className="auth-top-nav">
        <Link to="/" className="brand" aria-label="Brand2Influence Home">
          <span className="brand-dot" />
          <span className="brand-text">Brand2Influence</span>
        </Link>
        <button
          type="button"
          onClick={handleBack}
          className="auth-back-nav-btn"
          aria-label="Go back"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Back to Website</span>
        </button>
      </header>
      <Outlet />
    </main>
  )
}
