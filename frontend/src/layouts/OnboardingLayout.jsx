import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function OnboardingLayout() {
  const { signOut, user } = useAuth()

  return (
    <div className="onboarding-layout">
      <header className="onboarding-header">
        <Link to="/" className="brand">
          Brand2Influence
        </Link>
        <div className="onboarding-user-actions">
          {user?.email && <span className="onboarding-email">{user.email}</span>}
          <button type="button" className="onboarding-logout-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      <div className="onboarding-container">
        <Outlet />
      </div>
    </div>
  )
}
