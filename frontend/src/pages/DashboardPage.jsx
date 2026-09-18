import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import HomeFeedPage from './social/HomeFeedPage'

// DashboardPage now renders the social home feed.
// The old stats/bento dashboard is preserved inside HomeFeedPage as a sidebar widget.
export default function DashboardPage() {
  const { profile } = useAuth()
  if (!profile?.role) return <Navigate to="/onboarding/role" replace />
  return <HomeFeedPage />
}
