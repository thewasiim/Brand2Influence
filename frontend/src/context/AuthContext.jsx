import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { authService } from '../services/auth'

const AuthContext = createContext(null)
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null), [profile, setProfile] = useState(null), [loading, setLoading] = useState(true)
  const loadProfile = async activeSession => {
    if (!activeSession || !supabase) return setProfile(null)
    try { setProfile(await authService.me()) } catch { setProfile(null) }
  }
  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); loadProfile(data.session).finally(() => setLoading(false)) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => { setSession(nextSession); loadProfile(nextSession) })
    return () => subscription.unsubscribe()
  }, [])
  const value = { session, user: session?.user ?? null, profile, loading, refreshProfile: () => loadProfile(session), signOut: async () => { await authService.signOut(); setProfile(null) } }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
