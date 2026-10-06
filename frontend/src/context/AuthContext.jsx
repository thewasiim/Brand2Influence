import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { authService } from '../services/auth'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (activeSession) => {
    let currentSession = activeSession
    if (!currentSession && supabase) {
      try {
        const { data } = await supabase.auth.getSession()
        currentSession = data?.session
      } catch (sessErr) {
        console.warn('getSession error:', sessErr)
      }
    }
    if (!currentSession || !supabase) {
      setProfile(null)
      return null
    }
    try {
      const p = await authService.me()
      setProfile(p)
      return p
    } catch {
      setProfile(null)
      return null
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      loadProfile(data.session).finally(() => setLoading(false))
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      loadProfile(nextSession)
    })
    return () => subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    refreshProfile: async () => await loadProfile(),
    signOut: async () => {
      await authService.signOut()
      setProfile(null)
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
