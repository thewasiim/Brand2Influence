import React, { useState, useEffect, useRef } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { influencersService } from '../../services/influencers'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { requireSupabase } from '../../lib/supabase'
import { Button, ErrorState, Input, Textarea, Badge } from '../../components/ui'


function AuthCard({ eyebrow = 'Brand2Influence Access', title, subtitle = null, wide = false, children }) {
  return (
    <section className={`auth-card ${wide ? 'auth-card--wide' : ''}`}>
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

export function LoginPage() {
  const nav = useNavigate()
  const location = useLocation()
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })
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
          nav('/onboarding/influencer')
        } else {
          nav(location.state?.from || '/dashboard')
        }
      } else if (freshProfile?.role === 'brand') {
        if (freshProfile?.onboarding_completed === false) {
          nav('/onboarding/brand')
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
    <AuthCard title="Welcome back" subtitle="Log in with your username or email address to access your workspace.">
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
        <div style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', marginTop: '-6px', marginBottom: '14px' }}>
          💡 Tip: You can sign in using your registered email address or your chosen <strong>@username</strong>.
        </div>
        {error && <ErrorState error={error} />}
        <Button disabled={busy} loading={busy} size="lg" className="full">
          {busy ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
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

export function SignupPage() {
  const nav = useNavigate()
  const { refreshProfile } = useAuth()
  const [step, setStep] = useState(1) // 1: Role, 2: Basics & Contact, 3: Creator / Brand details
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form State
  const [role, setRole] = useState('influencer') // 'influencer' | 'brand'
  const [basics, setBasics] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    pincode: ''
  })

  // Skippable social platforms for creators
  const [skipYoutube, setSkipYoutube] = useState(false)
  const [skipSnapchat, setSkipSnapchat] = useState(false)
  const [skipFacebook, setSkipFacebook] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  // Profile Photo / Brand Logo state
  const [profileImage, setProfileImage] = useState('')
  const [profileImageFile, setProfileImageFile] = useState(null)
  const photoInputRef = useRef(null)

  // Instagram Phone OTP Verification state
  const [instaPhone, setInstaPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpMaskedPhone, setOtpMaskedPhone] = useState('')
  const [testOtp, setTestOtp] = useState('')
  const [otpError, setOtpError] = useState('')
  const [otpSuccess, setOtpSuccess] = useState('')
  const [isInstaVerified, setIsInstaVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  // Real-time unique username availability check
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' })

  useEffect(() => {
    const raw = (basics.username || '').trim()
    if (!raw) {
      setUsernameStatus({ checking: false, available: null, message: '' })
      return
    }
    if (raw.length < 3) {
      setUsernameStatus({ checking: false, available: false, message: 'Username must be at least 3 characters' })
      return
    }
    if (!/^[a-z0-9_]{3,30}$/.test(raw)) {
      setUsernameStatus({ checking: false, available: false, message: 'Username can only contain letters, numbers, and underscores (max 30 chars)' })
      return
    }

    setUsernameStatus({ checking: true, available: null, message: 'Checking availability...' })
    const timer = setTimeout(async () => {
      try {
        const res = await authService.checkUsername(raw)
        setUsernameStatus({
          checking: false,
          available: res.available,
          message: res.message
        })
      } catch (err) {
        setUsernameStatus({
          checking: false,
          available: null,
          message: ''
        })
      }
    }, 350)

    return () => clearTimeout(timer)
  }, [basics.username])

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }
    setProfileImageFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setProfileImage(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSendInstaOtp = async () => {
    setOtpError('')
    setOtpSuccess('')
    const handleOrUrl = influencerData.instagram_url || influencerData.instagram_handle
    if (!handleOrUrl || !handleOrUrl.trim()) {
      setOtpError('Please enter your Instagram handle or profile URL first.')
      return
    }
    const phone = (instaPhone || basics.phone || '').trim().replace(/\D/g, '')
    if (phone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number connected to your Instagram account.')
      return
    }

    setSendingOtp(true)
    try {
      const res = await influencersService.sendSocialOtp({
        platform: 'instagram',
        urlOrHandle: handleOrUrl.trim(),
        phone
      })
      setOtpSent(true)
      setOtpMaskedPhone(res.maskedPhone)
      setTestOtp(res.testOtp || '')
      setResendCooldown(45)
      setOtpSuccess(`Verification code sent to ${res.maskedPhone}!`)
    } catch (err) {
      setOtpError(err.message || 'Failed to send OTP. Please check the handle and phone number.')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyInstaOtp = async () => {
    setOtpError('')
    setOtpSuccess('')
    if (!otpCode || otpCode.trim().length < 6) {
      setOtpError('Please enter the full 6-digit OTP code.')
      return
    }
    const handleOrUrl = influencerData.instagram_url || influencerData.instagram_handle
    const phone = (instaPhone || basics.phone || '').trim().replace(/\D/g, '')

    setVerifyingOtp(true)
    try {
      const res = await influencersService.verifySocialOtp({
        platform: 'instagram',
        urlOrHandle: handleOrUrl.trim(),
        phone,
        otp: otpCode.trim()
      })
      setIsInstaVerified(true)
      setOtpSuccess(res.message || 'Instagram account ownership verified!')
      const count = res.stats?.followers ?? res.stats?.subscribers ?? 0
      if (count) {
        setInfluencerData((prev) => ({
          ...prev,
          instagram_followers: String(count)
        }))
      }
    } catch (err) {
      setOtpError(err.message || 'Invalid or expired OTP. Verification failed.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  // Influencer details state
  const [influencerData, setInfluencerData] = useState({
    niche: 'Fashion & Lifestyle',
    instagram_handle: '',
    instagram_url: '',
    instagram_followers: '',
    youtube_url: '',
    youtube_subscribers: '',
    snapchat_url: '',
    snapchat_subscribers: '',
    facebook_url: '',
    facebook_followers: '',
    other_platform: '',
    other_followers: '',
    reel_price: '',
    story_price: '',
    post_price: '',
    bio: ''
  })

  // Social Fetch State (Live Auto-Fetch from Meta, YouTube, Snapchat)
  const [fetchingSocial, setFetchingSocial] = useState(null) // 'instagram' | 'youtube' | 'snapchat' | null
  const [fetchMsg, setFetchMsg] = useState({}) // { [platform]: { type: 'success' | 'error', text: string } }

  const handleFetchSocial = async (platform) => {
    let inputVal = ''
    if (platform === 'instagram') {
      inputVal = influencerData.instagram_url || influencerData.instagram_handle
    } else if (platform === 'youtube') {
      inputVal = influencerData.youtube_url
    } else if (platform === 'snapchat') {
      inputVal = influencerData.snapchat_url
    }

    if (!inputVal || !inputVal.trim()) {
      setFetchMsg((prev) => ({
        ...prev,
        [platform]: { type: 'error', text: `Please enter a ${platform} handle or profile URL first.` }
      }))
      return
    }

    setFetchingSocial(platform)
    setFetchMsg((prev) => ({ ...prev, [platform]: null }))

    try {
      const res = await api('/influencers/fetch-social', {
        method: 'POST',
        body: JSON.stringify({
          platform,
          urlOrHandle: inputVal.trim()
        })
      })

      const data = res?.data || res?.stats || res
      if (data) {
        const count = data.followers ?? data.subscribers ?? 0
        if (platform === 'instagram') {
          setInfluencerData((prev) => ({
            ...prev,
            instagram_followers: count !== undefined ? String(count) : prev.instagram_followers,
            instagram_handle: data.handle || prev.instagram_handle || inputVal.replace(/^@/, ''),
            instagram_url: data.url || prev.instagram_url || (inputVal.startsWith('http') ? inputVal : `https://instagram.com/${inputVal.replace(/^@/, '')}`)
          }))
          setFetchMsg((prev) => ({
            ...prev,
            instagram: { type: 'success', text: `✓ Fetched: ${Number(count).toLocaleString()} followers` }
          }))
        } else if (platform === 'youtube') {
          setInfluencerData((prev) => ({
            ...prev,
            youtube_subscribers: count !== undefined ? String(count) : prev.youtube_subscribers,
            youtube_url: data.url || prev.youtube_url || (inputVal.startsWith('http') ? inputVal : `https://youtube.com/@${inputVal.replace(/^@/, '')}`)
          }))
          setFetchMsg((prev) => ({
            ...prev,
            youtube: { type: 'success', text: `✓ Fetched: ${Number(count).toLocaleString()} subscribers` }
          }))
        } else if (platform === 'snapchat') {
          setInfluencerData((prev) => ({
            ...prev,
            snapchat_subscribers: count !== undefined ? String(count) : prev.snapchat_subscribers,
            snapchat_url: data.url || prev.snapchat_url || (inputVal.startsWith('http') ? inputVal : `https://snapchat.com/add/${inputVal.replace(/^@/, '')}`)
          }))
          setFetchMsg((prev) => ({
            ...prev,
            snapchat: { type: 'success', text: `✓ Fetched: ${Number(count).toLocaleString()} subscribers` }
          }))
        }
      }
    } catch (err) {
      setFetchMsg((prev) => ({
        ...prev,
        [platform]: {
          type: 'error',
          text: err.message ? `${err.message} (You can enter follower count manually below)` : 'Could not auto-fetch. Please enter count manually.'
        }
      }))
    } finally {
      setFetchingSocial(null)
    }
  }

  // Brand details state (Completely separate from influencer)
  const [brandData, setBrandData] = useState({
    business_name: '',
    category: 'E-commerce & Retail',
    budget_range: '₹25,000 – ₹1,00,000',
    website: '',
    goals: ['🎥 Instagram Reels & Reach', '🌟 Brand Awareness & PR'],
    preferred_niches: ['Fashion & Lifestyle', 'Beauty & Skincare'],
    description: ''
  })

  const toggleBrandGoal = (goal) => {
    setBrandData((prev) => {
      const exists = prev.goals.includes(goal)
      return {
        ...prev,
        goals: exists ? prev.goals.filter((g) => g !== goal) : [...prev.goals, goal]
      }
    })
  }

  const toggleBrandNiche = (niche) => {
    setBrandData((prev) => {
      const exists = prev.preferred_niches.includes(niche)
      return {
        ...prev,
        preferred_niches: exists ? prev.preferred_niches.filter((n) => n !== niche) : [...prev.preferred_niches, niche]
      }
    })
  }

  const validateStep2 = () => {
    if (!basics.name.trim()) return 'Please enter your full name.'
    const u = (basics.username || '').trim().toLowerCase()
    if (!u || u.length < 3) return 'Please choose a username of at least 3 characters (letters, numbers, underscores).'
    if (!/^[a-z0-9_]{3,30}$/.test(u)) return 'Username can only contain letters, numbers, and underscores (3-30 characters).'
    if (usernameStatus.available === false) {
      return usernameStatus.message || 'This username is already taken. Please choose another one.'
    }
    if (usernameStatus.checking) {
      return 'Please wait while we verify username availability...'
    }
    const cleanEmail = (basics.email || '').trim().toLowerCase()
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return 'Please enter a valid email address.'
    if (!basics.password || basics.password.length < 6) return 'Password must be at least 6 characters.'
    const cleanPhone = (basics.phone || '').replace(/\D/g, '')
    if (cleanPhone.length < 10) return 'Please enter a valid 10-digit mobile number (digits only).'
    const cleanPin = (basics.pincode || '').replace(/\D/g, '')
    if (cleanPin.length < 5 || cleanPin.length > 6) return 'Please enter a valid 5 or 6 digit pincode (digits only).'
    return null
  }

  const handleNextStep = async (e) => {
    e?.preventDefault()
    setError('')
    if (step === 1) {
      setStep(2)
      return
    }
    if (step === 2) {
      const err = validateStep2()
      if (err) {
        setError(err)
        return
      }

      // Ensure username availability is confirmed before proceeding to Step 3
      if (usernameStatus.available !== true) {
        setBusy(true)
        try {
          const res = await authService.checkUsername(basics.username)
          if (!res.available) {
            setError(res.message || 'This username is already taken. Please choose another.')
            setUsernameStatus({ checking: false, available: false, message: res.message })
            setBusy(false)
            return
          }
          setUsernameStatus({ checking: false, available: true, message: res.message })
        } catch (checkErr) {
          // If check error occurs, allow progressing and rely on backend validation
        } finally {
          setBusy(false)
        }
      }

      if (!instaPhone && basics.phone) {
        setInstaPhone(basics.phone)
      }
      if (role === 'brand' && !brandData.business_name) {
        setBrandData((prev) => ({ ...prev, business_name: basics.name }))
      }
      setStep(3)
      return
    }
  }

  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      const cleanUsername = (basics.username || basics.name || basics.email.split('@')[0])
        .replace(/^@/, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_]/g, '')

      const toInt = (val) => {
        if (val === undefined || val === null || val === '') return 0
        const n = parseInt(String(val).replace(/\D/g, ''), 10)
        return isNaN(n) || n < 0 ? 0 : n
      }

      const cleanPhone = (basics.phone || '').replace(/\D/g, '')
      const cleanPin = (basics.pincode || '').replace(/\D/g, '')

      const payload = {
        name: basics.name.trim(),
        username: cleanUsername,
        email: basics.email.trim().toLowerCase(),
        password: basics.password,
        phone: cleanPhone,
        pincode: cleanPin,
        location: basics.city.trim() || 'India',
        role,
        roleData: role === 'influencer' ? {
          ...influencerData,
          username: cleanUsername,
          profile_image_url: profileImage || null,
          profileImageUrl: profileImage || null,
          is_instagram_verified: isInstaVerified,
          instagram_handle: influencerData.instagram_handle || (influencerData.instagram_url ? influencerData.instagram_url.split('/').filter(Boolean).pop() : ''),
          instagram_url: influencerData.instagram_url,
          instagram_followers: toInt(influencerData.instagram_followers),
          youtube_skipped: skipYoutube,
          youtube_url: skipYoutube ? '' : influencerData.youtube_url,
          youtube_subscribers: skipYoutube ? 0 : toInt(influencerData.youtube_subscribers),
          snapchat_skipped: skipSnapchat,
          snapchat_url: skipSnapchat ? '' : influencerData.snapchat_url,
          snapchat_subscribers: skipSnapchat ? 0 : toInt(influencerData.snapchat_subscribers),
          facebook_skipped: skipFacebook,
          facebook_url: skipFacebook ? '' : influencerData.facebook_url,
          facebook_followers: skipFacebook ? 0 : toInt(influencerData.facebook_followers),
          reel_price: toInt(influencerData.reel_price),
          story_price: toInt(influencerData.story_price),
          post_price: toInt(influencerData.post_price)
        } : {
          ...brandData,
          username: cleanUsername,
          business_name: brandData.business_name || basics.name,
          business_type: brandData.category,
          budget_range: brandData.budget_range,
          website: brandData.website,
          description: brandData.description,
          goals: brandData.goals,
          preferred_niches: brandData.preferred_niches,
          profile_image_url: profileImage || null,
          logo_url: profileImage || null
        }
      }

      // 1. Call Backend auto-confirmed registration
      await authService.register(payload)

      // 2. Log in immediately with the new credentials
      await authService.signIn({
        email: basics.email.trim().toLowerCase(),
        password: basics.password
      })

      // 3. Refresh user profile in context and redirect
      await refreshProfile()
      setSuccessMsg('Account created successfully! Taking you to your dashboard...')
      setTimeout(() => {
        nav('/dashboard')
      }, 900)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard
      wide={true}
      title={step === 1 ? 'Join Brand2Influence' : step === 2 ? 'Account & Contact Details' : role === 'influencer' ? 'Creator Stats & Rate Card' : 'Brand Profile & Marketing Goals'}
      subtitle={step === 1 ? 'Choose your role to get started with instant access.' : step === 2 ? 'Set your unique username, email, password, and location.' : role === 'influencer' ? 'Showcase your audience reach, set rate card, and link social channels.' : 'Set up your company profile, industry, marketing budget, and campaign goals.'}
    >
      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step-item ${step === 1 ? 'is-active' : 'is-done'}`}>
          <span className="step-number">1</span> Role
        </div>
        <div className={`step-item ${step === 2 ? 'is-active' : step > 2 ? 'is-done' : ''}`}>
          <span className="step-number">2</span> Basics
        </div>
        <div className={`step-item ${step === 3 ? 'is-active' : ''}`}>
          <span className="step-number">3</span> {role === 'influencer' ? 'Rates & Stats' : 'Brand Setup'}
        </div>
      </div>

      {error && <div style={{ marginBottom: '16px' }}><ErrorState error={error} /></div>}
      {successMsg && (
        <div className="state" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', marginBottom: '16px' }}>
          {successMsg}
        </div>
      )}

      {/* STEP 1: ROLE SELECTION */}
      {step === 1 && (
        <div>
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '10px',
            padding: '12px 14px',
            marginTop: '12px',
            marginBottom: '16px',
            fontSize: '12.5px',
            color: '#c7d2fe',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>🔒</span>
            <span><strong>Role Notice:</strong> Once chosen, your account role (Creator vs Brand) is permanently locked to keep collaboration workflows and rate cards separated.</span>
          </div>

          <div className="choice-grid" style={{ marginBottom: '24px' }}>
            <button
              type="button"
              className={`role-choice-card ${role === 'influencer' ? 'selected' : ''}`}
              onClick={() => setRole('influencer')}
            >
              <div className="choice-card-header">
                <div className="choice-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                  </svg>
                </div>
                {role === 'influencer' && <Badge variant="accent">Selected</Badge>}
              </div>
              <b>I’m an Influencer / Creator</b>
              <span>Showcase your Instagram reach, verify account ownership via SMS OTP, set your rate card (Reel, Story, Post), and get sponsored brand deals.</span>
            </button>

            <button
              type="button"
              className={`role-choice-card ${role === 'brand' ? 'selected' : ''}`}
              onClick={() => setRole('brand')}
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
              <b>I’m a Brand / Business</b>
              <span>Set up your company profile, hire top verified creators, compare rates, define campaign goals, and launch marketing collaborations.</span>
            </button>
          </div>

          {/* Google Sign Up Quick Option */}
          <button
            type="button"
            className="btn-google"
            onClick={() => authService.signInWithGoogle(role)}
            style={{ marginBottom: '16px' }}
          >
            <GoogleIcon />
            <span>Sign up with Google as {role === 'influencer' ? 'Creator' : 'Brand'}</span>
          </button>

          <div className="auth-divider">
            <span>or continue with email setup</span>
          </div>

          <Button size="lg" className="full" onClick={() => setStep(2)}>
            Continue with Email Setup →
          </Button>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            Already registered? <Link to="/auth/login" style={{ fontWeight: 600 }}>Log in here</Link>
          </p>
        </div>
      )}

      {/* STEP 2: BASIC ACCOUNT & CONTACT */}
      {step === 2 && (
        <form onSubmit={handleNextStep}>
          <div className="form-row-2">
            <Input
              label={role === 'influencer' ? 'Creator Full Name' : 'Contact Person Full Name'}
              required
              placeholder={role === 'influencer' ? 'e.g. Rahul Sharma' : 'e.g. Wasim Khan'}
              value={basics.name}
              onChange={(e) => setBasics({ ...basics, name: e.target.value })}
            />
            <div>
              <Input
                label="Choose Username (@handle)"
                required
                maxLength={30}
                placeholder={role === 'influencer' ? 'e.g. rahul_creates' : 'e.g. brand_official'}
                value={basics.username}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase().slice(0, 30)
                  setBasics({ ...basics, username: cleaned })
                }}
              />
              {usernameStatus.checking && (
                <span style={{ fontSize: '11.5px', color: '#6366f1', display: 'block', marginTop: '3px', fontWeight: 600 }}>
                  ⏳ Checking availability for @{basics.username}...
                </span>
              )}
              {!usernameStatus.checking && usernameStatus.available === true && (
                <span style={{ fontSize: '11.5px', color: '#34d399', display: 'block', marginTop: '3px', fontWeight: 700 }}>
                  ✓ @{basics.username} is available!
                </span>
              )}
              {!usernameStatus.checking && usernameStatus.available === false && (
                <span style={{ fontSize: '11.5px', color: '#f87171', display: 'block', marginTop: '3px', fontWeight: 700 }}>
                  ⚠️ {usernameStatus.message || `@${basics.username} is already taken!`}
                </span>
              )}
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '3px' }}>
                🔑 Unique handle for your account. You can log in using <strong>@{basics.username || 'username'}</strong> or your email!
              </span>
            </div>
          </div>

          <div className="form-row-2">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="name@example.com"
              value={basics.email}
              onChange={(e) => setBasics({ ...basics, email: e.target.value })}
            />
            <div style={{ position: 'relative' }}>
              <Input
                label="Create Password (min 6 chars)"
                type={showPassword ? 'text' : 'password'}
                minLength="6"
                required
                placeholder="••••••••"
                value={basics.password}
                onChange={(e) => setBasics({ ...basics, password: e.target.value })}
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  opacity: 0.7,
                  padding: 0
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-row-2">
            <Input
              label="Mobile / WhatsApp Number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              placeholder="e.g. 9876543210"
              value={basics.phone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                setBasics({ ...basics, phone: digits })
              }}
            />
            <Input
              label="City / Location"
              required
              placeholder="e.g. Mumbai, Delhi, Bangalore"
              value={basics.city}
              onChange={(e) => setBasics({ ...basics, city: e.target.value })}
            />
          </div>

          <div style={{ maxWidth: '280px', marginBottom: '8px' }}>
            <Input
              label="Pincode (6 digits)"
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="e.g. 400050"
              value={basics.pincode}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
                setBasics({ ...basics, pincode: digits })
              }}
            />
          </div>

          <div className="auth-actions-row">
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button type="submit" size="lg">
              Continue to {role === 'influencer' ? 'Creator Details' : 'Brand Details'} →
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: ROLE DETAILS */}
      {step === 3 && (
        <form onSubmit={handleFinalSubmit}>
          {role === 'influencer' ? (
            <>
              {/* INSTAGRAM-STYLE PROFILE PHOTO SETUP */}
              <div className="insta-photo-setup">
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <div
                  className="insta-avatar-ring"
                  title="Click to set or change profile photo"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <div className="insta-avatar-inner">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile preview" className="insta-avatar-img" />
                    ) : (
                      <div className="insta-avatar-placeholder">📸</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="insta-avatar-camera-btn"
                    title="Upload profile picture"
                    onClick={(e) => {
                      e.stopPropagation()
                      photoInputRef.current?.click()
                    }}
                  >
                    📷
                  </button>
                </div>

                <h4 className="insta-photo-title">
                  {profileImage ? 'Creator Photo Added' : 'Add Profile Photo'}
                </h4>
                <p className="insta-photo-desc">
                  Set a high-quality creator photo like Instagram to build instant trust with top brands.
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    📁 Upload from Device
                  </Button>
                  {profileImage && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setProfileImage('')
                        setProfileImageFile(null)
                      }}
                      style={{ color: '#ef4444' }}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* Quick Avatar Presets */}
                <div className="insta-preset-container">
                  <span className="insta-preset-label">Or choose a stylish creator avatar</span>
                  <div className="insta-preset-row">
                    {CREATOR_AVATAR_PRESETS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`insta-preset-avatar ${profileImage === presetUrl ? 'is-active' : ''}`}
                        onClick={() => {
                          setProfileImage(presetUrl)
                          setProfileImageFile(null)
                        }}
                        title={`Select avatar ${idx + 1}`}
                      >
                        <img src={presetUrl} alt={`Avatar option ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="field">
                  <span className="field-label">Primary Content Niche</span>
                  <div className="field-input-wrap">
                    <select
                      className="field-input"
                      value={influencerData.niche}
                      onChange={(e) => setInfluencerData({ ...influencerData, niche: e.target.value })}
                    >
                      <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
                      <option value="Tech & Gadgets">Tech & Gadgets</option>
                      <option value="Fitness & Health">Fitness & Health</option>
                      <option value="Food & Travel">Food & Travel</option>
                      <option value="Beauty & Skincare">Beauty & Skincare</option>
                      <option value="Comedy & Entertainment">Comedy & Entertainment</option>
                      <option value="Education & Finance">Education & Finance</option>
                      <option value="Gaming & Esports">Gaming & Esports</option>
                      <option value="Parenting & Family">Parenting & Family</option>
                      <option value="Other / Multi-niche">Other / Multi-niche</option>
                    </select>
                  </div>
                </label>
              </div>

              {/* SOCIAL ACCOUNTS & LIVE SYNC SECTION */}
              <div className="social-sync-container">
                <div className="social-sync-header">
                  <div className="social-sync-title-row">
                    <h3 className="social-sync-title">
                      <span>🔗</span> Social Media Accounts & Reach
                    </h3>
                    <span className="social-sync-badge">
                      🛡️ SMS OTP Verified
                    </span>
                  </div>
                  <p className="social-sync-desc">
                    Connect your real Instagram account. You can skip any platforms you don't use (Snapchat, YouTube, Facebook).
                  </p>
                </div>

                {/* 1. INSTAGRAM WITH PHONE OTP VERIFICATION */}
                <div
                  className={`social-platform-card ${isInstaVerified ? 'is-verified' : ''}`}
                  style={{
                    borderColor: isInstaVerified ? 'rgba(52, 211, 153, 0.6)' : undefined,
                    background: isInstaVerified ? 'rgba(16, 185, 129, 0.04)' : undefined
                  }}
                >
                  <div className="social-card-header">
                    <div className="social-platform-label">
                      <span style={{ fontSize: '15px' }}>📸</span> Instagram Profile (Primary Channel)
                      {isInstaVerified && (
                        <span style={{ fontSize: '11px', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          ✓ Ownership Verified
                        </span>
                      )}
                    </div>
                    <span className="social-platform-api-tag">Meta Security</span>
                  </div>

                  <div className="social-fetch-row">
                    <Input
                      label="Instagram Handle or URL"
                      placeholder="e.g. @username or https://instagram.com/username"
                      disabled={isInstaVerified}
                      value={influencerData.instagram_url || influencerData.instagram_handle}
                      onChange={(e) => {
                        const val = e.target.value
                        setInfluencerData((prev) => ({
                          ...prev,
                          instagram_handle: val.startsWith('http') ? (val.split('/').filter(Boolean).pop() || val) : val,
                          instagram_url: val
                        }))
                        setIsInstaVerified(false)
                        setOtpSent(false)
                        setOtpError('')
                        setOtpSuccess('')
                      }}
                    />
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <Input
                      label="Instagram-Connected Mobile Number (For Ownership OTP)"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      disabled={isInstaVerified}
                      value={instaPhone}
                      onChange={(e) => {
                        setInstaPhone(e.target.value)
                        setIsInstaVerified(false)
                        setOtpSent(false)
                        setOtpError('')
                        setOtpSuccess('')
                      }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', display: 'block', marginTop: '4px' }}>
                      🔒 An OTP verification code is sent to your registered mobile number to confirm you are the true owner of this account.
                    </span>
                  </div>

                  {!isInstaVerified ? (
                    <div style={{ marginTop: '12px' }}>
                      <Button
                        type="button"
                        size="md"
                        className="full"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                          color: '#fff',
                          fontWeight: 700
                        }}
                        loading={sendingOtp}
                        disabled={sendingOtp}
                        onClick={handleSendInstaOtp}
                      >
                        ⚡ Fetch Followers & Send Verification OTP
                      </Button>
                    </div>
                  ) : null}

                  {/* OTP Verification Prompt Card */}
                  {otpSent && !isInstaVerified && (
                    <div className="otp-verify-card">
                      <div className="otp-verify-header">
                        <span className="otp-verify-title">
                          🛡️ Authenticate Instagram Ownership
                        </span>
                        {resendCooldown > 0 ? (
                          <span style={{ fontSize: '11.5px', color: 'rgba(255, 255, 255, 0.6)' }}>
                            Resend in {resendCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendInstaOtp}
                            style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer' }}
                          >
                            Resend Code
                          </button>
                        )}
                      </div>

                      <p className="otp-verify-desc">
                        A 6-digit security OTP was sent to <strong>{otpMaskedPhone}</strong> to verify that you own <strong>@{influencerData.instagram_handle || 'this account'}</strong>.
                      </p>

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

                      <div className="otp-input-row">
                        <input
                          type="text"
                          maxLength="6"
                          className="otp-code-field"
                          placeholder="••••••"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                        <Button
                          type="button"
                          size="md"
                          loading={verifyingOtp}
                          disabled={verifyingOtp || otpCode.length < 6}
                          onClick={handleVerifyInstaOtp}
                          style={{
                            background: '#10b981',
                            borderColor: '#10b981',
                            color: '#fff',
                            fontWeight: 700
                          }}
                        >
                          Verify OTP
                        </Button>
                      </div>

                      {otpError && (
                        <div style={{ color: '#f87171', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>
                          ⚠️ {otpError}
                        </div>
                      )}
                      {otpSuccess && (
                        <div style={{ color: '#34d399', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>
                          ✓ {otpSuccess}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verified Success Badge */}
                  {isInstaVerified && (
                    <div className="verified-badge-card">
                      <div>
                        <div className="verified-badge-text">
                          <span>🛡️✓</span>
                          <span>Ownership Verified for @{influencerData.instagram_handle}</span>
                        </div>
                        <div className="verified-badge-sub">
                          100% Authentic Creator · Followers verified and locked via OTP authentication
                        </div>
                      </div>
                      <Badge variant="accent">Verified ✓</Badge>
                    </div>
                  )}

                  <div style={{ marginTop: '12px' }}>
                    <Input
                      label="Instagram Followers"
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="e.g. 25000"
                      disabled={isInstaVerified}
                      value={influencerData.instagram_followers}
                      onChange={(e) => setInfluencerData({ ...influencerData, instagram_followers: e.target.value.replace(/\D/g, '') })}
                    />
                    {!isInstaVerified && (
                      <span style={{ fontSize: '11.5px', color: '#f59e0b', marginTop: '4px', display: 'block' }}>
                        ⚠️ Followers must be verified via OTP to receive the authentic creator badge and unlock brand sponsorships.
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. YOUTUBE WITH SKIP TOGGLE */}
                <div className="social-platform-card">
                  <div className="social-card-header">
                    <div className="social-platform-label">
                      <span style={{ fontSize: '15px' }}>▶️</span> YouTube Channel
                    </div>
                    <button
                      type="button"
                      className={`skip-toggle-btn ${skipYoutube ? 'is-skipped' : ''}`}
                      onClick={() => {
                        setSkipYoutube(!skipYoutube)
                        if (!skipYoutube) {
                          setInfluencerData((prev) => ({ ...prev, youtube_url: '', youtube_subscribers: '' }))
                        }
                      }}
                    >
                      {skipYoutube ? '✓ Skipped (No YouTube)' : 'I don’t have a YouTube channel (Skip)'}
                    </button>
                  </div>

                  {skipYoutube ? (
                    <div className="skipped-platform-notice">
                      <span>ℹ️</span> YouTube skipped. It won’t be shown as required on your creator profile.
                    </div>
                  ) : (
                    <>
                      <div className="social-fetch-row">
                        <Input
                          label="YouTube Handle or Channel URL"
                          placeholder="e.g. @channel or https://youtube.com/@channel"
                          value={influencerData.youtube_url}
                          onChange={(e) => setInfluencerData({ ...influencerData, youtube_url: e.target.value })}
                        />
                        <div className="social-fetch-btn-wrap">
                          <Button
                            type="button"
                            size="sm"
                            className="btn-fetch"
                            loading={fetchingSocial === 'youtube'}
                            disabled={fetchingSocial === 'youtube'}
                            onClick={() => handleFetchSocial('youtube')}
                          >
                            ⚡ Fetch
                          </Button>
                        </div>
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <Input
                          label="YouTube Subscribers"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="e.g. 10000"
                          value={influencerData.youtube_subscribers}
                          onChange={(e) => setInfluencerData({ ...influencerData, youtube_subscribers: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>

                      {fetchMsg.youtube && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: fetchMsg.youtube.type === 'success' ? '#34d399' : '#f87171'
                          }}
                        >
                          {fetchMsg.youtube.text}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 3. SNAPCHAT WITH SKIP TOGGLE */}
                <div className="social-platform-card">
                  <div className="social-card-header">
                    <div className="social-platform-label">
                      <span style={{ fontSize: '15px' }}>👻</span> Snapchat Profile
                    </div>
                    <button
                      type="button"
                      className={`skip-toggle-btn ${skipSnapchat ? 'is-skipped' : ''}`}
                      onClick={() => {
                        setSkipSnapchat(!skipSnapchat)
                        if (!skipSnapchat) {
                          setInfluencerData((prev) => ({ ...prev, snapchat_url: '', snapchat_subscribers: '' }))
                        }
                      }}
                    >
                      {skipSnapchat ? '✓ Skipped (No Snapchat)' : 'I don’t have Snapchat (Skip)'}
                    </button>
                  </div>

                  {skipSnapchat ? (
                    <div className="skipped-platform-notice">
                      <span>ℹ️</span> Snapchat skipped. Top brands can still hire you based on your verified Instagram reach.
                    </div>
                  ) : (
                    <>
                      <div className="social-fetch-row">
                        <Input
                          label="Snapchat Username or Profile URL"
                          placeholder="e.g. username or https://snapchat.com/add/username"
                          value={influencerData.snapchat_url}
                          onChange={(e) => setInfluencerData({ ...influencerData, snapchat_url: e.target.value })}
                        />
                        <div className="social-fetch-btn-wrap">
                          <Button
                            type="button"
                            size="sm"
                            className="btn-fetch"
                            loading={fetchingSocial === 'snapchat'}
                            disabled={fetchingSocial === 'snapchat'}
                            onClick={() => handleFetchSocial('snapchat')}
                          >
                            ⚡ Fetch
                          </Button>
                        </div>
                      </div>

                      <div style={{ marginTop: '10px' }}>
                        <Input
                          label="Snapchat Subscribers / Audience"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="e.g. 15000"
                          value={influencerData.snapchat_subscribers}
                          onChange={(e) => setInfluencerData({ ...influencerData, snapchat_subscribers: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>

                      {fetchMsg.snapchat && (
                        <div
                          style={{
                            marginTop: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: fetchMsg.snapchat.type === 'success' ? '#34d399' : '#f87171'
                          }}
                        >
                          {fetchMsg.snapchat.text}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* 4. FACEBOOK WITH SKIP TOGGLE */}
                <div className="social-platform-card">
                  <div className="social-card-header">
                    <div className="social-platform-label">
                      <span style={{ fontSize: '15px' }}>📘</span> Facebook Page / Profile (Optional)
                    </div>
                    <button
                      type="button"
                      className={`skip-toggle-btn ${skipFacebook ? 'is-skipped' : ''}`}
                      onClick={() => {
                        setSkipFacebook(!skipFacebook)
                        if (!skipFacebook) {
                          setInfluencerData((prev) => ({ ...prev, facebook_url: '', facebook_followers: '' }))
                        }
                      }}
                    >
                      {skipFacebook ? '✓ Skipped' : 'I don’t have Facebook (Skip)'}
                    </button>
                  </div>
                  {!skipFacebook && (
                    <div className="form-row-2" style={{ marginTop: '10px' }}>
                      <Input
                        label="Facebook Page URL"
                        placeholder="https://facebook.com/yourpage"
                        value={influencerData.facebook_url}
                        onChange={(e) => setInfluencerData({ ...influencerData, facebook_url: e.target.value })}
                      />
                      <Input
                        label="Facebook Followers"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g. 5000"
                        value={influencerData.facebook_followers}
                        onChange={(e) => setInfluencerData({ ...influencerData, facebook_followers: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* PRICING & RATE CARD */}
              <div style={{ marginTop: '8px', marginBottom: '14px' }}>
                <p className="rate-card-title">
                  Pricing & Rate Card (₹ INR)
                </p>
                <div className="form-row-3">
                  <Input
                    label="Reel Rate (₹)"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 5000"
                    value={influencerData.reel_price}
                    onChange={(e) => setInfluencerData({ ...influencerData, reel_price: e.target.value.replace(/\D/g, '') })}
                  />
                  <Input
                    label="Story Rate (₹)"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 2000"
                    value={influencerData.story_price}
                    onChange={(e) => setInfluencerData({ ...influencerData, story_price: e.target.value.replace(/\D/g, '') })}
                  />
                  <Input
                    label="Post Rate (₹)"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 3500"
                    value={influencerData.post_price}
                    onChange={(e) => setInfluencerData({ ...influencerData, post_price: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <Textarea
                label="Creator Bio & Pitch"
                rows={3}
                placeholder="Tell brands what makes your content unique and how you engage your audience..."
                value={influencerData.bio}
                onChange={(e) => setInfluencerData({ ...influencerData, bio: e.target.value })}
              />
            </>
          ) : (
            /* BRAND QUESTIONS - DEDICATED COMPANY & CAMPAIGN DETAILS */
            <>
              {/* BRAND LOGO SETUP */}
              <div className="insta-photo-setup" style={{ marginBottom: '20px' }}>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <div
                  className="insta-avatar-ring"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)' }}
                  title="Click to set Brand Logo"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <div className="insta-avatar-inner" style={{ borderRadius: '16px' }}>
                    {profileImage ? (
                      <img src={profileImage} alt="Brand Logo preview" className="insta-avatar-img" />
                    ) : (
                      <div className="insta-avatar-placeholder" style={{ fontSize: '32px' }}>🏢</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="insta-avatar-camera-btn"
                    title="Upload Brand Logo"
                    onClick={(e) => {
                      e.stopPropagation()
                      photoInputRef.current?.click()
                    }}
                  >
                    📷
                  </button>
                </div>

                <h4 className="insta-photo-title">
                  {profileImage ? 'Brand Logo Added' : 'Upload Brand Logo'}
                </h4>
                <p className="insta-photo-desc">
                  Showcase your official brand or company logo to stand out in creator discovery and campaign briefs.
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    📁 Upload Brand Logo
                  </Button>
                  {profileImage && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setProfileImage('')
                        setProfileImageFile(null)
                      }}
                      style={{ color: '#ef4444' }}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* Brand Logo Presets */}
                <div className="insta-preset-container">
                  <span className="insta-preset-label">Or choose a brand icon preset</span>
                  <div className="insta-preset-row">
                    {BRAND_LOGO_PRESETS.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`insta-preset-avatar ${profileImage === presetUrl ? 'is-active' : ''}`}
                        onClick={() => {
                          setProfileImage(presetUrl)
                          setProfileImageFile(null)
                        }}
                        title={`Select logo preset ${idx + 1}`}
                      >
                        <img src={presetUrl} alt={`Logo preset ${idx + 1}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row-2">
                <Input
                  label="Brand / Business Name"
                  required
                  placeholder="e.g. Blue Tokai Coffee Roasters"
                  value={brandData.business_name}
                  onChange={(e) => setBrandData({ ...brandData, business_name: e.target.value })}
                />

                <label className="field">
                  <span className="field-label">Industry Category</span>
                  <div className="field-input-wrap">
                    <select
                      className="field-input"
                      value={brandData.category}
                      onChange={(e) => setBrandData({ ...brandData, category: e.target.value })}
                    >
                      <option value="E-commerce & Retail">E-commerce & Retail</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Fashion & Apparel">Fashion & Apparel</option>
                      <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                      <option value="Technology & SaaS">Technology & SaaS</option>
                      <option value="Fitness & Health">Fitness & Health</option>
                      <option value="Education & EdTech">Education & EdTech</option>
                      <option value="Travel & Hospitality">Travel & Hospitality</option>
                      <option value="Marketing Agency">Marketing Agency</option>
                    </select>
                  </div>
                </label>
              </div>

              <div className="form-row-2">
                <Input
                  label="Official Website or Store URL"
                  placeholder="https://yourbrand.com or @brandhandle"
                  value={brandData.website}
                  onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
                />

                <label className="field">
                  <span className="field-label">Typical Monthly Campaign Budget</span>
                  <div className="field-input-wrap">
                    <select
                      className="field-input"
                      value={brandData.budget_range}
                      onChange={(e) => setBrandData({ ...brandData, budget_range: e.target.value })}
                    >
                      <option value="₹10,000 – ₹25,000">₹10,000 – ₹25,000</option>
                      <option value="₹25,000 – ₹1,00,000">₹25,000 – ₹1,00,000</option>
                      <option value="₹1,00,000 – ₹5,00,000">₹1,00,000 – ₹5,00,000</option>
                      <option value="₹5,00,000+">₹5,00,000+</option>
                    </select>
                  </div>
                </label>
              </div>

              {/* Primary Collaboration Goals */}
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label" style={{ display: 'block', marginBottom: '4px' }}>
                  Primary Collaboration Goals (Select all that apply)
                </label>
                <div className="brand-goals-grid">
                  {BRAND_GOAL_OPTIONS.map((goal, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`brand-goal-pill ${brandData.goals.includes(goal) ? 'is-active' : ''}`}
                      onClick={() => toggleBrandGoal(goal)}
                    >
                      {brandData.goals.includes(goal) ? '✓ ' : ''}{goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Creator Categories */}
              <div style={{ marginBottom: '16px' }}>
                <label className="field-label" style={{ display: 'block', marginBottom: '4px' }}>
                  Target Creator Niches
                </label>
                <div className="brand-goals-grid">
                  {BRAND_NICHE_OPTIONS.map((niche, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`brand-goal-pill ${brandData.preferred_niches.includes(niche) ? 'is-active' : ''}`}
                      onClick={() => toggleBrandNiche(niche)}
                    >
                      {brandData.preferred_niches.includes(niche) ? '✓ ' : ''}{niche}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                label="Brand Overview & Campaign Expectations"
                rows={3}
                placeholder="Describe your brand and the types of content, deliverables, or creators you look for..."
                value={brandData.description}
                onChange={(e) => setBrandData({ ...brandData, description: e.target.value })}
              />
            </>
          )}

          <div className="auth-actions-row">
            <Button type="button" variant="secondary" size="lg" onClick={() => setStep(2)} disabled={busy}>
              ← Back
            </Button>
            <Button type="submit" size="lg" disabled={busy} loading={busy}>
              {busy ? 'Creating Your Account…' : 'Complete Registration & Enter Dashboard'}
            </Button>
          </div>
        </form>
      )}
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
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Link to="/auth/login">Back to log in</Link>
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

