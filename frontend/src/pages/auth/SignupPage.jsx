import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { useAuth } from '../../context/AuthContext'
import { Button, ErrorState, Input, Select, Badge } from '../../components/ui'
import {
  validateFullName,
  validateEmail,
  validatePhone,
  formatPhoneInput,
  validatePassword,
  validateConfirmPassword,
  validateUsername,
  formatUsernameInput
} from '../../utils/validation'
import { AuthCard, OtpInputGrid } from './AuthPages'

export const COUNTRY_OPTIONS = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'United Arab Emirates',
  'Australia',
  'Germany',
  'Singapore',
  'France',
  'Spain',
  'Brazil',
  'Japan',
  'Other'
]


export const STEP_LABELS = {
  1: 'Account Type',
  2: 'Contact Details',
  3: 'Verification',
  4: 'Security',
  5: 'Profile Setup',
  6: 'Congratulations'
}

export function SignupPage() {
  const nav = useNavigate()
  const { refreshProfile } = useAuth()

  // 5 Step Flow:
  // Step 1: Choose Account Type (Brand vs Creator)
  // Step 2: Contact Details (Email, Phone)
  // Step 3: Verify Email or Phone (6-digit OTP)
  // Step 4: Create a Password (8+ chars, strength, confirm)
  // Step 5: Basic Profile & Complete Registration (Full Name, Username live check, Avatar, Country)
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Step 1: Contact
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Step 2: Account Type
  const [selectedRole, setSelectedRole] = useState('influencer') // 'brand' | 'influencer'

  // Step 3: OTP
  const [otp, setOtp] = useState('')
  const [maskedContact, setMaskedContact] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  // Step 4: Password
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 5: Basic Profile
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' })
  const [country, setCountry] = useState('India')
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const photoInputRef = useRef(null)

  // Validation touched states for displaying inline errors appropriately
  const [touched, setTouched] = useState({
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    fullName: false,
    username: false
  })

  // Real-time validation results
  const emailValidation = validateEmail(email)
  const phoneValidation = validatePhone(phone)
  const passValidation = validatePassword(password)
  const confirmValidation = validateConfirmPassword(password, confirmPassword)
  const nameValidation = validateFullName(fullName, selectedRole === 'brand', selectedRole === 'brand' ? 'Brand name' : 'Full name')
  const usernameValidation = validateUsername(username)

  // Countdown for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Debounced username availability check
  useEffect(() => {
    const clean = username.trim().toLowerCase().replace(/^@/, '')
    if (!clean || clean.length < 3) {
      setUsernameStatus({ checking: false, available: null, message: '' })
      return
    }

    setUsernameStatus({ checking: true, available: null, message: 'Checking username…' })
    const timer = setTimeout(async () => {
      try {
        const res = await authService.checkUsername(clean)
        setUsernameStatus({
          checking: false,
          available: res.available,
          message: res.available ? `✓ @${clean} is available!` : `✕ @${clean} is already taken`
        })
      } catch (err) {
        setUsernameStatus({
          checking: false,
          available: false,
          message: err.message || 'Error checking username'
        })
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [username])

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'transparent' }
    let score = 0
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1
    if (/\d/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    if (score <= 1) return { score: 1, label: 'Weak', color: '#EF4444' }
    if (score <= 3) return { score: 2, label: 'Medium', color: '#F59E0B' }
    return { score: 3, label: 'Strong', color: '#10B981' }
  }
  const passwordStrength = getPasswordStrength(password)

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile image must be less than 5MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      setProfileImageUrl(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  // --- Step 1: Choose Account Type Submit ---
  const handleSelectRole = (roleChoice) => {
    setSelectedRole(roleChoice)
    setError('')
    setSuccessMsg('')
    setStep(2)
  }

  // --- Step 2: Contact Submit (Dispatches OTP and advances to Step 3) ---
  const handleStep2ContactSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setTouched((t) => ({ ...t, email: true, phone: true }))

    if (!emailValidation.isValid) {
      setError(emailValidation.error)
      return
    }

    if (!phoneValidation.isValid) {
      setError(phoneValidation.error)
      return
    }

    const cleanEmail = emailValidation.value
    const cleanPhone = phoneValidation.value

    setBusy(true)
    try {
      const res = await authService.sendOtp({ email: cleanEmail, phone: cleanPhone })
      setMaskedContact(res.maskedEmail || res.maskedPhone || cleanEmail)
      setResendCooldown(30)
      setStep(3)
      setSuccessMsg(`Verification code dispatched to ${res.maskedEmail || res.maskedPhone || cleanEmail}`)
    } catch (err) {
      console.warn('Backend sendOtp notice:', err.message)
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError(err.message || 'Failed to send verification code. Please try again.')
      } else {
        setError(err.message || 'Failed to send verification code. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  // --- Step 3: Resend OTP ---
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || busy) return
    setError('')
    setSuccessMsg('')
    setBusy(true)
    try {
      const res = await authService.sendOtp({ email: email.trim(), phone: phone.trim() })
      setResendCooldown(30)
      setSuccessMsg('A new verification code has been dispatched!')
    } catch (err) {
      setError(err.message || 'Failed to resend verification code.')
    } finally {
      setBusy(false)
    }
  }

  // --- Step 3: Verify OTP Submit ---
  const handleStep3VerifyOtp = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!otp || otp.length < 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }

    setBusy(true)
    try {
      await authService.verifyOtp({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        otp: otp.trim()
      })
      setStep(4)
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  // --- Step 4: Password Submit ---
  const handleStep4Password = (e) => {
    e.preventDefault()
    setError('')
    setTouched((t) => ({ ...t, password: true, confirmPassword: true }))

    if (!passValidation.isValid) {
      setError(passValidation.error)
      return
    }
    if (!confirmValidation.isValid) {
      setError(confirmValidation.error)
      return
    }

    setStep(5)
  }

  // --- Step 5: Basic Profile & Complete Registration ---
  const handleStep5FinalSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setTouched((t) => ({ ...t, fullName: true, username: true }))

    if (!nameValidation.isValid) {
      setError(nameValidation.error)
      return
    }

    if (!usernameValidation.isValid) {
      setError(usernameValidation.error)
      return
    }

    if (usernameStatus.available === false) {
      setError('Please choose an available username before continuing.')
      return
    }

    const clean = usernameValidation.value

    setBusy(true)
    const payload = {
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      username: clean,
      phone: phone.trim(),
      location: country,
      role: selectedRole,
      profile_image_url: profileImageUrl || null
    }

    // Persist draft for onboarding pre-filling
    try {
      localStorage.setItem('brandhub_onboarding_draft', JSON.stringify({
        ...payload,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        username: clean,
        country,
        profileImageUrl
      }))
    } catch (err) {
      console.warn('LocalStorage save notice:', err)
    }

    try {
      // 1. Register account in backend
      await authService.register(payload)

      // 2. Sign in to obtain active Supabase / JWT session
      try {
        await authService.signIn({
          email: email.trim().toLowerCase(),
          password
        })
      } catch (signInErr) {
        console.warn('Session sign-in notice:', signInErr)
      }

      if (typeof refreshProfile === 'function') {
        await refreshProfile()
      }

      // 3. Registration complete -> show Congratulations screen with 'Go to Profile'
      setStep(6)
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already registered')) {
        try {
          await authService.signIn({
            email: email.trim().toLowerCase(),
            password
          })
          setStep(6)
          return
        } catch (loginErr) {
          setError('An account with this email already exists. Please log in.')
        }
      } else {
        setError(err.message || 'Registration failed. Please check your information.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard
      eyebrow={null}
      title={
        step === 6 ? null :
        step === 1 ? 'Choose Account Type' :
          step === 2 ? 'Create an Account' :
            step === 3 ? 'Verify Email or Phone' :
              step === 4 ? 'Create a Password' :
                'Set Up Your Profile'
      }
      subtitle={
        step === 6 ? null :
        step === 1 ? null :
          step === 2 ? `Enter your contact details to register as a ${selectedRole === 'brand' ? 'Brand' : 'Creator'}.` :
            step === 3 ? null :
              step === 4 ? 'Choose a secure password to protect your account.' :
                null
      }
      wide={false}
      showBack={false}
    >
      {/* Step Progress Pill Indicator — hidden on congratulations screen */}
      {step < 6 && (
        <div className="signup-progress-wrap">
          <div className="signup-progress-header">
            <span className="signup-progress-label">
              Step {step} of 5 &bull; {STEP_LABELS[step]}
            </span>
            <span className="signup-progress-pct">
              {Math.round((Math.min(step, 5) / 5) * 100)}% Completed
            </span>
          </div>
          <div className="signup-progress-track">
            <div
              className="signup-progress-fill"
              style={{ width: `${(Math.min(step, 5) / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && <ErrorState error={error} />}
      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', padding: '10px 14px', borderRadius: '6px', fontSize: '12.5px', marginBottom: '16px' }}>
          {successMsg}
        </div>
      )}

      {/* ================= STEP 1: CHOOSE ACCOUNT TYPE ================= */}
      {step === 1 && (
        <div className="signup-step-container" style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'stretch', width: '100%' }}>
          <Button
            type="button"
            size="lg"
            className="full"
            onClick={() => {
              setSelectedRole('influencer')
              setStep(2)
            }}
            style={{
              padding: '16px',
              fontSize: '15px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.16) 0%, rgba(245, 158, 11, 0.26) 100%)',
              border: '1px solid rgba(251, 191, 36, 0.45)',
              color: '#FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <span>✨</span>
            <span>As a Creator</span>
          </Button>

          <Button
            type="button"
            size="lg"
            className="full"
            onClick={() => {
              setSelectedRole('brand')
              setStep(2)
            }}
            style={{
              padding: '16px',
              fontSize: '15px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.16) 0%, rgba(59, 130, 246, 0.26) 100%)',
              border: '1px solid rgba(96, 165, 250, 0.45)',
              color: '#BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer'
            }}
          >
            <span>🏢</span>
            <span>As a Brand</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="full"
            onClick={() => nav('/login')}
            style={{
              marginTop: '4px'
            }}
          >
            ← Back
          </Button>
        </div>
      )}

      {/* ================= STEP 2: CONTACT DETAILS ================= */}
      {step === 2 && (
        <form onSubmit={handleStep2ContactSubmit} className="signup-step-form">
          {/* Active Role Confirmation Badge */}
          <div className="signup-role-badge-row" style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{selectedRole === 'brand' ? '🏢' : '✨'}</span>
              <span style={{ fontSize: '12.5px', color: '#F4F1E8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Joining as:{' '}
                <strong style={{ color: selectedRole === 'brand' ? '#60A5FA' : '#FBBF24', textTransform: 'capitalize' }}>
                  {selectedRole === 'brand' ? 'Brand / Business' : 'Creator / Influencer'}
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: '#60A5FA', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', flexShrink: 0 }}
            >
              Change
            </button>
          </div>

          <Input
            label="Email Address"
            type="email"
            required
            autoCapitalize="none"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={touched.email && !emailValidation.isValid ? emailValidation.error : ''}
          />

          <Input
            label="Mobile Number"
            type="tel"
            required
            placeholder="9876543210"
            value={phone}
            onChange={(e) => {
              setPhone(formatPhoneInput(e.target.value))
              if (error) setError('')
            }}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            error={touched.phone && !phoneValidation.isValid ? phoneValidation.error : ''}
            hint="Enter 10-digit Indian mobile number (e.g. 9876543210)"
          />

          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '-4px', marginBottom: '16px', lineHeight: 1.5 }}>
            🔒 We'll send a 6-digit verification code to confirm your email or mobile.
          </div>

          <div className="auth-actions-row">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setStep(1)}
              style={{ minWidth: '85px', padding: '12px 16px' }}
            >
              ← Back
            </Button>
            <Button
              disabled={busy || !emailValidation.isValid || !phoneValidation.isValid}
              loading={busy}
              size="md"
              type="submit"
              style={{ flex: 1, minWidth: 0, padding: '12px 18px', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              {busy ? 'Sending Code…' : 'Continue to Verification →'}
            </Button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#60A5FA', fontWeight: 600, textDecoration: 'none' }}>
              Log In →
            </Link>
          </div>
        </form>
      )}

      {/* ================= STEP 3: VERIFY EMAIL OR PHONE ================= */}
      {step === 3 && (
        <form onSubmit={handleStep3VerifyOtp} className="signup-step-form">
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(244, 241, 232, 0.04)',
              border: '1px solid rgba(244, 241, 232, 0.1)',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              marginBottom: '10px',
              maxWidth: '100%',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <span>Code sent to:</span>
              <strong style={{ color: '#F4F1E8', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
                {maskedContact || email}
              </strong>
            </div>


          </div>

          <div style={{ marginBottom: '16px' }}>
            <OtpInputGrid
              value={otp}
              onChange={setOtp}
              length={6}
              disabled={busy}
            />
          </div>

          <div className="signup-verify-actions">
            <button
              type="button"
              onClick={() => setStep(2)}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}
            >
              Change email or phone
            </button>

            {resendCooldown > 0 ? (
              <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                Resend in {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={busy}
                style={{ background: 'none', border: 'none', color: '#60A5FA', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
              >
                Resend Code
              </button>
            )}
          </div>

          <div className="auth-actions-row">
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button type="submit" size="lg" disabled={otp.length !== 6 || busy} loading={busy}>
              {busy ? 'Verifying…' : 'Verify & Continue →'}
            </Button>
          </div>
        </form>
      )}

      {/* ================= STEP 4: CREATE A PASSWORD ================= */}
      {step === 4 && (
        <form onSubmit={handleStep4Password} className="signup-step-form">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength="8"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError('')
            }}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={touched.password && !passValidation.isValid ? passValidation.error : ''}
            suffix={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            }
          />

          {password && (
            <div style={{ marginTop: '-8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                  Password Strength
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: passValidation.color }}>
                  {passValidation.label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: '100%',
                      borderRadius: '2px',
                      background: level <= passValidation.score ? passValidation.color : 'rgba(244, 241, 232, 0.1)'
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            minLength="8"
            placeholder="••••••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (error) setError('')
            }}
            onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
            error={touched.confirmPassword && !confirmValidation.isValid ? confirmValidation.error : ''}
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? '👁️' : '🙈'}
              </button>
            }
          />

          <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
            • Minimum 8 characters<br />
            • Include numbers and special characters for a stronger rating
          </div>

          <div className="auth-actions-row">
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(3)}>
              ← Back
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={!passValidation.isValid || !confirmValidation.isValid}
            >
              Continue to Profile →
            </Button>
          </div>
        </form>
      )}

      {/* ================= STEP 5: BASIC PROFILE & COMPLETE ================= */}
      {step === 5 && (
        <form onSubmit={handleStep5FinalSubmit} className="signup-step-form">
          {/* Active Role Confirmation Badge */}
          <div className="signup-role-badge-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{selectedRole === 'brand' ? '🏢' : '✨'}</span>
              <span style={{ fontSize: '12.5px', color: '#F4F1E8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Account Type:{' '}
                <strong style={{ color: selectedRole === 'brand' ? '#60A5FA' : '#FBBF24', textTransform: 'capitalize' }}>
                  {selectedRole === 'brand' ? 'Brand' : 'Creator'}
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              style={{ background: 'none', border: 'none', color: '#60A5FA', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', flexShrink: 0 }}
            >
              Change
            </button>
          </div>

          {/* Avatar Upload / Preview */}
          <div className="signup-avatar-row">
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: profileImageUrl ? `url(${profileImageUrl}) center/cover no-repeat` : 'rgba(244, 241, 232, 0.08)',
                border: '2px solid rgba(244, 241, 232, 0.16)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F4F1E8',
                fontSize: '20px',
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              {!profileImageUrl && (fullName ? fullName[0]?.toUpperCase() : (selectedRole === 'brand' ? '🏢' : '👤'))}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => photoInputRef.current?.click()}
                >
                  {profileImageUrl ? 'Change Photo' : (selectedRole === 'brand' ? 'Upload Logo' : 'Upload Photo')}
                </Button>
                {profileImageUrl && (
                  <button
                    type="button"
                    onClick={() => setProfileImageUrl('')}
                    style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', cursor: 'pointer', padding: '4px 6px' }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
                Optional. Max 5MB JPEG or PNG.
              </p>
            </div>
          </div>

          <Input
            label={selectedRole === 'brand' ? 'Brand / Business Name' : 'Full Name / Display Name'}
            type="text"
            required
            placeholder={selectedRole === 'brand' ? 'e.g. Aura Studio' : 'e.g. Alex Morgan'}
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value)
              if (error) setError('')
            }}
            onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
            error={touched.fullName && !nameValidation.isValid ? nameValidation.error : ''}
          />

          <div>
            <Input
              label="Username"
              type="text"
              required
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="e.g. aurastudio"
              value={username}
              onChange={(e) => {
                setUsername(formatUsernameInput(e.target.value))
                if (error) setError('')
              }}
              onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              error={touched.username && !usernameValidation.isValid ? usernameValidation.error : ''}
            />
            {username.trim().length >= 3 && (
              <div style={{
                fontSize: '12px',
                marginTop: '-8px',
                marginBottom: '10px',
                color: usernameStatus.available ? '#10B981' : usernameStatus.available === false ? '#EF4444' : 'var(--color-text-secondary)'
              }}>
                {usernameStatus.message}
              </div>
            )}
          </div>

          <Select
            label="Country / Region"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <div className="auth-actions-row">
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(4)} disabled={busy}>
              ← Back
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={!nameValidation.isValid || !usernameValidation.isValid || usernameStatus.available === false || busy}
              loading={busy}
            >
              {busy
                ? 'Creating Account…'
                : selectedRole === 'brand'
                  ? 'Continue to Setup →'
                  : 'Connect Social Media →'}
            </Button>
          </div>
        </form>
      )}

      {/* ================= STEP 6: CONGRATULATIONS ================= */}
      {step === 6 && (
        <div className="signup-congrats-wrap">
          {/* Animated Trophy/Confetti Emoji */}
          <div className="signup-congrats-emoji" aria-hidden="true">
            🎉
          </div>

          <h2 className="signup-congrats-heading">Congratulations!</h2>
          <p className="signup-congrats-sub">
            Your account has been created successfully.
            {selectedRole === 'brand'
              ? ' Welcome aboard — start exploring creators and launching campaigns!'
              : ' You're all set to connect with brands and grow your influence!'}
          </p>

          {/* Role badge */}
          <div className="signup-congrats-badge">
            <span>{selectedRole === 'brand' ? '🏢' : '✨'}</span>
            <span>{selectedRole === 'brand' ? 'Brand / Business' : 'Creator / Influencer'}</span>
          </div>

          {/* Primary CTA */}
          <Button
            type="button"
            size="lg"
            className="full"
            onClick={() => nav('/profile')}
            style={{
              marginTop: '8px',
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '15px',
              padding: '14px 20px',
              width: '100%',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Go to Profile →
          </Button>

          <button
            type="button"
            onClick={() => nav('/dashboard')}
            style={{
              marginTop: '12px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Go to Dashboard instead
          </button>
        </div>
      )}
    </AuthCard>
  )
}
