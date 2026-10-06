import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <main className="auth-layout">
      <Link to="/" className="brand" aria-label="Brand2Influence Home">
        <span className="brand-dot" />
        <span className="brand-text">Brand2Influence</span>
      </Link>
      <Outlet />
    </main>
  )
}
