import React, { useState, useEffect, useRef } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { influencersService } from '../../services/influencers'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { requireSupabase } from '../../lib/supabase'
import { Button, ErrorState, Input, Textarea, Badge } from '../../components/ui'


export function AuthCard({
  eyebrow = 'Brand2Influence Access',
  title,
  subtitle = null,
  wide = false,
  showBack = true,
  onBack = null,
  children
}) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <section className={`auth-card ${wide ? 'auth-card--wide' : ''}`}>
      {showBack && (
        <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleBack}
            style={{
              background: 'rgba(244, 241, 232, 0.04)',
              border: '1px solid rgba(244, 241, 232, 0.14)',
              borderRadius: '0px',
              color: 'rgba(244, 241, 232, 0.75)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '6px 12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(244, 241, 232, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.3)'
              e.currentTarget.style.color = '#ffffff'
              e.currentTarget.style.transform = 'translateX(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(244, 241, 232, 0.04)'
              e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.14)'
              e.currentTarget.style.color = 'rgba(244, 241, 232, 0.75)'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
            aria-label="Go back"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back</span>
          </button>
        </div>
      )}
      <div className="auth-card-header">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export function AuthModeSwitcher({ current = 'login' }) {
  return (
    <div className="auth-mode-switcher">
      <Link
        to="/auth/login"
        className={`auth-mode-tab ${current === 'login' ? 'is-active' : ''}`}
      >
        Sign In
      </Link>
      <Link
        to="/auth/signup"
        className={`auth-mode-tab ${current === 'signup' ? 'is-active' : ''}`}
      >
        Create Account
      </Link>
    </div>
  )
}

export function OtpInputGrid({ value = '', onChange, length = 6, disabled = false }) {
  const inputsRef = useRef([])
  const digits = Array.from({ length }, (_, i) => value[i] || '')

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) {
      const next = digits.slice()
      next[index] = ''
      onChange(next.join(''))
      return
    }
    const char = val[val.length - 1]
    const next = digits.slice()
    next[index] = char
    onChange(next.join(''))
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (pasted) {
      onChange(pasted)
      const nextIndex = Math.min(pasted.length, length - 1)
      inputsRef.current[nextIndex]?.focus()
    }
  }

  return (
    <div className="otp-digits-wrapper" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={`otp-digit-input ${digits[i] ? 'has-value' : ''}`}
          autoFocus={i === 0}
        />
      ))}
    </div>
  )
}

export function AuthPortalPage() {
  const nav = useNavigate()

  return (
    <AuthCard
      wide={false}
      eyebrow="[ 01 ] AUTHENTICATION PORTAL"
      title="Brand2Influence"
      showBack={false}
    >
      <div className="auth-portal-hero">

        <div className="auth-portal-actions-stack">
          <button
            type="button"
            className="auth-portal-btn-primary"
            onClick={() => nav('/auth/signup')}
          >
            <div className="auth-portal-btn-content">
              <span className="auth-portal-btn-title">Create New Account</span>

            </div>
            <span className="auth-portal-btn-arrow">→</span>
          </button>

          <button
            type="button"
            className="auth-portal-btn-secondary"
            onClick={() => nav('/auth/login')}
          >
            <div className="auth-portal-btn-content">
              <span className="auth-portal-btn-title">Sign In</span>
            </div>
            <span className="auth-portal-btn-arrow">→</span>
          </button>
        </div>
      </div>
    </AuthCard>
  )
}

export function LoginPage() {

  const nav = useNavigate()
  const location = useLocation()
  const { user, profile, refreshProfile } = useAuth()
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('brandhub_remember_me') === 'true')
  const [form, setForm] = useState(() => ({
    identifier: localStorage.getItem('brandhub_remember_identifier') || '',
    password: ''
  }))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Check url error parameter
  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    const errParam = params.get('error')
    if (errParam) {
      setError(decodeURIComponent(errParam))
    }
  }, [location.search])

  if (user) {
    if (profile?.role === 'admin') return <Navigate to="/admin" replace />
    if (!profile?.role) return <Navigate to="/role-select" replace />
    if (profile?.role === 'influencer' && profile.onboarding_completed === false) {
      return <Navigate to="/onboarding/influencer" replace />
    }
    if (profile?.role === 'brand' && profile.onboarding_completed === false) {
      return <Navigate to="/onboarding/brand" replace />
    }
    return <Navigate to={location.state?.from || '/dashboard'} replace />
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const raw = (form.identifier || '').trim()
      if (!raw) {
        throw new Error('Please enter your email address or username.')
      }

      if (rememberMe) {
        localStorage.setItem('brandhub_remember_me', 'true')
        localStorage.setItem('brandhub_remember_identifier', raw)
      } else {
        localStorage.removeItem('brandhub_remember_me')
        localStorage.removeItem('brandhub_remember_identifier')
      }

      let emailToUse = raw
      // If user typed username instead of an email (no @ or no domain .)
      if (!raw.includes('@') || !raw.includes('.')) {
        try {
          const resolved = await authService.resolveIdentifier(raw)
          if (!resolved || !resolved.email) {
            throw new Error(`No account found with username "@${raw.replace(/^@/, '')}".`)
          }
          emailToUse = resolved.email
        } catch (resolveErr) {
          throw new Error(resolveErr.message || `No account found with username "@${raw.replace(/^@/, '')}". Please sign in with your email address.`)
        }
      }

      const res = await authService.signIn({
        email: emailToUse.toLowerCase(),
        password: form.password
      })

      const freshProfile = await refreshProfile()

      if (res?.user?.role === 'admin' || freshProfile?.role === 'admin') {
        nav('/admin')
      } else if (!freshProfile?.role) {
        nav('/role-select')
      } else if (freshProfile?.role === 'influencer') {
        if (freshProfile?.onboarding_completed === false) {
          nav('/signup/creator')
        } else {
          nav(location.state?.from || '/dashboard')
        }
      } else if (freshProfile?.role === 'brand') {
        if (freshProfile?.onboarding_completed === false) {
          nav('/signup/brand')
        } else {
          nav(location.state?.from || '/dashboard')
        }
      } else {
        nav(location.state?.from || '/dashboard')
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Your email has not been confirmed yet. Please verify your inbox or contact support.')
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Incorrect password or credentials. Please check and try again.')
      } else {
        setError(msg || 'Invalid login credentials. Please check your email or username and password.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard
      title="Sign In to Brand2Influence"
      subtitle="Enter the username or email used during account creation and your password."
      showBack={true}
      onBack={() => nav('/')}
    >
      <AuthModeSwitcher current="login" />

      <button
        type="button"
        className="btn-google"
        onClick={() => authService.signInWithGoogle()}
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      <div className="auth-divider">
        <span>or sign in with email / username</span>
      </div>

      <form onSubmit={submit}>
        <Input
          label="Email address or Username"
          type="text"
          required
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="name@example.com or @username"
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
        />
        <div style={{ position: 'relative' }}>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength="6"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={{ paddingRight: '42px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '38px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontSize: '15px',
              padding: '4px',
              lineHeight: 1
            }}
            title={showPassword ? 'Hide password' : 'Show password'}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '👁️' : '🙈'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', fontSize: '12.5px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--color-accent)', width: '15px', height: '15px', cursor: 'pointer' }}
            />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
            Forgot password?
          </Link>
        </div>

        <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '-4px', marginBottom: '14px' }}>
          💡 Tip: You can sign in using your registered email address or your chosen <strong>@username</strong>.
        </div>
        {error && <ErrorState error={error} />}
        <Button disabled={busy} loading={busy} size="lg" className="full">
          {busy ? 'Logging in…' : 'Log In →'}
        </Button>
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>
            Create an Account →
          </Link>
        </div>
      </form>

      {/* Admin Demo Shortcut */}
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(244, 241, 232, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
          🔑 Quick Access:
        </span>
        <button
          type="button"
          onClick={() => setForm({ identifier: 'admin@brand2influence.com', password: 'admin123' })}
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '5px 12px',
            borderRadius: '4px',
            background: 'rgba(0, 71, 171, 0.15)',
            border: '1px solid rgba(0, 71, 171, 0.35)',
            color: '#60A5FA',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'all 0.2s ease'
          }}
        >
          Fill Admin Credentials
        </button>
      </div>

      <div className="auth-card-links">
        <Link to="/auth/forgot-password">Forgot password?</Link>
        <Link to="/auth/signup" style={{ fontWeight: 600 }}>Create an account</Link>
      </div>
    </AuthCard>
  )
}

const CREATOR_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400'
]

const BRAND_LOGO_PRESETS = [
  'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=300'
]

const BRAND_GOAL_OPTIONS = [
  '🎥 Instagram Reels & Reach',
  '📦 Product Reviews & Unboxing',
  '🛒 Sales & Direct Conversions',
  '🌟 Brand Awareness & PR',
  '📱 UGC Content Creation',
  '🤝 Long-Term Ambassador'
]

const BRAND_NICHE_OPTIONS = [
  'Fashion & Lifestyle',
  'Beauty & Skincare',
  'Tech & Gadgets',
  'Food & Beverages',
  'Fitness & Wellness',
  'Comedy & Entertainment'
]

export { SignupPage } from './SignupPage'


export function ForgotPasswordPage() {
  const nav = useNavigate()
  const [mode, setMode] = useState('otp') // 'otp' | 'link'
  const [identifier, setIdentifier] = useState('')
  const [resolvedEmail, setResolvedEmail] = useState('')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [otpStage, setOtpStage] = useState(1) // 1 = identifier, 2 = code & new password
  const [otpCode, setOtpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [testOtp, setTestOtp] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // Request OTP
  const handleRequestOtp = async (e) => {
    e?.preventDefault?.()
    if (!identifier.trim()) {
      setError('Please enter your account email, username, or phone number.')
      return
    }
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const res = await authService.forgotPasswordOtp({ identifier: identifier.trim() })
      setResolvedEmail(res.email)
      setMaskedEmail(res.maskedEmail)
      setTestOtp(res.testOtp || '')
      setCountdown(res.cooldownSeconds || 60)
      setOtpStage(2)
      setMessage(res.message || 'Verification code sent to your contact!')
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please check your account details.')
    } finally {
      setBusy(false)
    }
  }

  // Verify OTP and update password
  const handleResetWithOtp = async (e) => {
    e?.preventDefault?.()
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.')
      return
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please re-enter.')
      return
    }
    setError('')
    setMessage('')
    setBusy(true)
    try {
      const res = await authService.resetPasswordOtp({
        email: resolvedEmail,
        otp: otpCode,
        newPassword
      })
      setMessage(res.message || 'Password reset successfully! Redirecting to login...')
      setTimeout(() => {
        nav('/auth/login')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please verify the code.')
    } finally {
      setBusy(false)
    }
  }

  // Classic magic link submission
  const handleSendLink = async (e) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setError('Please enter your account email.')
      return
    }
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await authService.forgotPassword(identifier.trim())
      setMessage('Password reset link sent! Please check your email inbox.')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard
      title="Reset Your Password"
      subtitle={
        otpStage === 2
          ? `Enter the 6-digit code sent to ${maskedEmail || 'your email'} to choose a new password.`
          : 'Recover access to your BrandHUB account via 6-digit security OTP or reset link.'
      }
      showBack={true}
      onBack={() => {
        if (otpStage === 2) {
          setOtpStage(1)
          setOtpCode('')
          setError('')
        } else {
          nav('/auth/login')
        }
      }}
    >
      {/* Mode switcher */}
      {otpStage === 1 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            className={`auth-mode-tab ${mode === 'otp' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('otp')
              setError('')
              setMessage('')
            }}
            style={{ flex: 1, padding: '10px' }}
          >
            ⚡ 6-Digit OTP (Fast)
          </button>
          <button
            type="button"
            className={`auth-mode-tab ${mode === 'link' ? 'is-active' : ''}`}
            onClick={() => {
              setMode('link')
              setError('')
              setMessage('')
            }}
            style={{ flex: 1, padding: '10px' }}
          >
            ✉️ Email Reset Link
          </button>
        </div>
      )}

      {error && <ErrorState error={error} />}

      {message && (
        <div
          className="state"
          style={{
            background: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            color: '#34d399',
            padding: '12px 14px',
            borderRadius: '8px',
            marginBottom: '18px',
            fontSize: '13px'
          }}
        >
          ✓ {message}
        </div>
      )}

      {mode === 'otp' && otpStage === 1 && (
        <form onSubmit={handleRequestOtp}>
          <Input
            label="Account Email, Username, or Phone Number"
            type="text"
            required
            placeholder="e.g. alex_creator, alex@example.com, or 9876543210"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <div style={{ marginTop: '16px' }}>
            <Button disabled={busy} loading={busy} size="lg" className="full">
              {busy ? 'Locating Account & Sending Code…' : 'Send 6-Digit Verification Code →'}
            </Button>
          </div>
        </form>
      )}

      {mode === 'otp' && otpStage === 2 && (
        <form onSubmit={handleResetWithOtp}>
          <div className="otp-standalone-container" style={{ marginBottom: '16px' }}>
            <div className="otp-target-info">
              Enter the 6-digit verification code sent to <strong>{maskedEmail}</strong>
            </div>

            <OtpInputGrid
              value={otpCode}
              onChange={setOtpCode}
              length={6}
              disabled={busy}
            />

            {/* Dev / Test OTP quick fill */}
            {testOtp && (
              <div
                className="dev-test-otp-chip"
                onClick={() => setOtpCode(testOtp)}
                title="Click to auto-fill test code"
              >
                <span>🧪 Dev / Test OTP: <b>{testOtp}</b></span>
                <span style={{ opacity: 0.7 }}>(Click to fill)</span>
              </div>
            )}

            <div className="otp-timer-row">
              {countdown > 0 ? (
                <span>Resend new code in <strong>{countdown}s</strong></span>
              ) : (
                <button
                  type="button"
                  className="otp-resend-btn"
                  onClick={handleRequestOtp}
                  disabled={busy}
                >
                  ↻ Resend 6-Digit Code
                </button>
              )}
            </div>
          </div>

          <Input
            label="New Password"
            type="password"
            minLength="6"
            required
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <div style={{ marginTop: '12px' }}>
            <Input
              label="Confirm New Password"
              type="password"
              minLength="6"
              required
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="auth-actions-row" style={{ marginTop: '20px' }}>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                setOtpStage(1)
                setOtpCode('')
                setError('')
              }}
              disabled={busy}
            >
              ← Back
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={busy || otpCode.length < 6 || !newPassword}
              loading={busy}
            >
              {busy ? 'Updating Password…' : 'Reset Password & Log In →'}
            </Button>
          </div>
        </form>
      )}

      {mode === 'link' && (
        <form onSubmit={handleSendLink}>
          <Input
            label="Account Registered Email"
            type="email"
            required
            placeholder="name@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <div style={{ marginTop: '16px' }}>
            <Button disabled={busy} loading={busy} size="lg" className="full">
              {busy ? 'Sending Reset Link…' : 'Send Reset Link via Email'}
            </Button>
          </div>
        </form>
      )}

      <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
        <Link to="/auth/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Sign In
        </Link>
      </div>
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
    <AuthCard title="Choose a new password" subtitle="Must be at least 6 characters.">
      <form onSubmit={submit}>
        <Input
          label="New password"
          type="password"
          minLength="6"
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

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refreshProfile } = useAuth()
  const [error, setError] = useState('')

  React.useEffect(() => {
    let active = true

    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(location.search)
        const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''))

        const email = searchParams.get('email')
        const token = searchParams.get('token') || searchParams.get('token_hash')
        const code = searchParams.get('code')
        const role = searchParams.get('role')
        const errParam = searchParams.get('error') || searchParams.get('error_description')

        if (errParam) {
          if (active) setError(decodeURIComponent(errParam))
          return
        }

        const supabase = requireSupabase()

        // 1. If tokens arrived in hash from direct OAuth/Supabase verify redirect
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken) {
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            })
          } catch (sessionErr) {
            console.warn('Set session warning:', sessionErr)
          }
        } else if (code) {
          // 2. PKCE code exchange
          try {
            await supabase.auth.exchangeCodeForSession(code)
          } catch (codeErr) {
            console.warn('Exchange code warning:', codeErr)
          }
        } else if (token) {
          // 3. OTP / Magiclink token verify
          try {
            await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'magiclink'
            })
          } catch (verifyErr) {
            try {
              if (email) {
                await supabase.auth.verifyOtp({
                  email,
                  token,
                  type: 'magiclink'
                })
              }
            } catch (fallbackErr) {
              console.warn('Verify OTP warning:', fallbackErr)
            }
          }
        }

        let freshProfile = await refreshProfile()

        // If user profile role is not set yet, assign the role chosen before login
        if (!freshProfile?.role && role) {
          try {
            await authService.chooseRole(role)
            freshProfile = await refreshProfile()
          } catch (roleErr) {
            console.warn('Auto assign role warning:', roleErr)
          }
        }

        const finalRole = freshProfile?.role || role

        if (active) {
          if (finalRole === 'admin') {
            navigate('/admin', { replace: true })
          } else if (!finalRole) {
            navigate('/role-select', { replace: true })
          } else if (finalRole === 'influencer' && freshProfile?.onboarding_completed === false) {
            navigate('/onboarding/influencer', { replace: true })
          } else if (finalRole === 'brand' && freshProfile?.onboarding_completed === false) {
            navigate('/onboarding/brand', { replace: true })
          } else {
            navigate('/dashboard', { replace: true })
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        if (active) setError(err.message || 'Failed to complete Google authentication.')
      }
    }

    handleCallback()

    return () => {
      active = false
    }
  }, [location])

  if (error) {
    return (
      <AuthCard title="Authentication Failed" subtitle="There was an issue signing in with Google.">
        <ErrorState error={error} />
        <Button size="lg" className="full" style={{ marginTop: '16px' }} onClick={() => navigate('/auth/login')}>
          ← Back to Login
        </Button>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Authenticating…" subtitle="Connecting your Google account. Just a moment…">
      <div style={{ textAlign: 'center', padding: '36px 0' }}>
        <div style={{ fontSize: '36px', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⚡</div>
        <p style={{ marginTop: '16px', color: 'var(--color-text-secondary)', fontSize: '14px', fontWeight: 500 }}>
          Verifying credentials with Brand2Influence…
        </p>
      </div>
    </AuthCard>
  )
}

