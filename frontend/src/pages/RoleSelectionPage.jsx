import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth'
import { useAuth } from '../context/AuthContext'
import { Button, ErrorState, Badge } from '../components/ui'

export default function RoleSelectionPage() {
  const nav = useNavigate()
  const { refreshProfile } = useAuth()
  const [role, setRole] = useState('brand')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    setError('')
    try {
      await authService.chooseRole(role)
      await refreshProfile()
      nav(role === 'brand' ? '/onboarding/brand' : '/onboarding/influencer')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="setup">
      <p className="eyebrow">Account Personalization</p>
      <h1>How will you use Brand2Influence?</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '6px' }}>
        Select your role on the platform. This tailors your workspace and discovery features.
      </p>

      <div className="choice-grid">
        <button
          type="button"
          className={`role-choice-card ${role === 'brand' ? 'selected' : ''}`}
          onClick={() => setRole('brand')}
          aria-pressed={role === 'brand'}
        >
          <div className="choice-card-header">
            <div className="choice-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            {role === 'brand' && <Badge variant="accent">Selected</Badge>}
          </div>
          <b>I’m a Brand</b>
          <span>Find independent creators, compare rates, and manage collaboration briefs.</span>
        </button>

        <button
          type="button"
          className={`role-choice-card ${role === 'influencer' ? 'selected' : ''}`}
          onClick={() => setRole('influencer')}
          aria-pressed={role === 'influencer'}
        >
          <div className="choice-card-header">
            <div className="choice-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            {role === 'influencer' && <Badge variant="accent">Selected</Badge>}
          </div>
          <b>I’m an Influencer</b>
          <span>Publish your rate card, showcase your reels, and get discovered by top brands.</span>
        </button>
      </div>

      {error && <ErrorState error={error} />}

      <Button
        onClick={submit}
        disabled={busy}
        loading={busy}
        size="lg"
        className="full"
        style={{ marginTop: '16px' }}
      >
        {busy ? 'Saving selection…' : `Continue as ${role === 'brand' ? 'Brand' : 'Influencer'}`}
      </Button>
    </main>
  )
}
