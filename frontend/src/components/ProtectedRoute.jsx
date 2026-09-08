import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LoadingState } from './ui'
export function ProtectedRoute() { const { user, loading } = useAuth(), location = useLocation(); if (loading) return <LoadingState/>; return user ? <Outlet/> : <Navigate to="/auth/login" replace state={{ from: location.pathname }}/> }
export function RoleProtectedRoute({ roles }) { const { profile, loading } = useAuth(); if (loading) return <LoadingState/>; if (!profile?.role) return <Navigate to="/onboarding/role" replace/>; return roles.includes(profile.role) ? <Outlet/> : <Navigate to="/dashboard" replace/> }
export function AdminRoute() { return <RoleProtectedRoute roles={['admin']}/> }
