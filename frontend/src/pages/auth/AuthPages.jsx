import React, { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { useAuth } from '../../context/AuthContext'
import { Button, ErrorState, Input } from '../../components/ui'

function AuthCard({ eyebrow = 'Brand2Influence Access', title, subtitle = null, children }) {
  return (
    <section className="auth-card">
      <div className="auth-card-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

export function LoginPage() {
  const nav = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) {
    if (profile?.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to={location.state?.from || '/dashboard'} replace />
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await authService.signIn(form)
      if (res?.user?.role === 'admin') {
        nav('/admin')
      } else {
        nav(location.state?.from || '/dashboard')
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Your email has not been confirmed yet. Please verify your inbox or try logging in again.')
      } else {
        setError(msg)
      }
    } finally {
      setBusy(false)
    }
  }


  return (
    <AuthCard title="Welcome back" subtitle="Log in to manage your creator collaborations and messages.">
      <form onSubmit={submit}>
        <Input
          label="Email address"
          type="email"
          required
          placeholder="name@company.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength="8"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <ErrorState error={error} />}
        <Button disabled={busy} loading={busy} size="lg" className="full">
          {busy ? 'Signing in…' : 'Log in'}
        </Button>
      </form>
      <Link to="/auth/forgot-password">Forgot your password?</Link>
      <p>
        Don't have an account yet? <Link to="/auth/signup">Create an account</Link>
      </p>
    </AuthCard>
  )
}

export function SignupPage() {
  const nav = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await authService.signUp(form)
      nav('/onboarding/role')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Create your account" subtitle="Join Brand2Influence as an independent creator or brand.">
      <form onSubmit={submit}>
        <Input
          label="Full name or company"
          required
          placeholder="Aanya Kapoor / Studio Blend"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Email address"
          type="email"
          required
          placeholder="name@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password (min 8 chars)"
          type="password"
          minLength="8"
          required
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <ErrorState error={error} />}
        <Button disabled={busy} loading={busy} size="lg" className="full">
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p>
        Already have an account? <Link to="/auth/login">Log in here</Link>
      </p>
    </AuthCard>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await authService.forgotPassword(email)
      setMessage('Password reset link sent! Check your inbox.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Reset your password" subtitle="Enter your email to receive recovery instructions.">
      <form onSubmit={submit}>
        <Input
          label="Account email"
          type="email"
          required
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <ErrorState error={error} />}
        <Button disabled={busy} loading={busy} size="lg" className="full">
          {busy ? 'Sending link…' : 'Send reset link'}
        </Button>
      </form>
      {message && (
        <div className="state" style={{ background: 'var(--color-primary-subtle)', color: 'var(--color-accent)' }}>
          {message}
        </div>
      )}
      <Link to="/auth/login">Back to log in</Link>
    </AuthCard>
  )
}

export function ResetPasswordPage() {
  const nav = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await authService.resetPassword(password)
      nav('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Choose a new password" subtitle="Must be at least 8 characters.">
      <form onSubmit={submit}>
        <Input
          label="New password"
          type="password"
          minLength="8"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <ErrorState error={error} />}
        <Button disabled={busy} loading={busy} size="lg" className="full">
          {busy ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </AuthCard>
  )
}
