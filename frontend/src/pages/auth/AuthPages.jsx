import React, { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { authService } from '../../services/auth'
import { useAuth } from '../../context/AuthContext'
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

export function LoginPage() {
  const nav = useNavigate()
  const location = useLocation()
  const { user, profile, refreshProfile } = useAuth()
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
      await refreshProfile()
      if (res?.user?.role === 'admin') {
        nav('/admin')
      } else {
        nav(location.state?.from || '/dashboard')
      }
    } catch (err) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Your email has not been confirmed yet. Please verify your inbox or contact support.')
      } else {
        setError(msg || 'Invalid login credentials. Please check your email and password.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to manage your creator collaborations, rate card, and messages.">
      <form onSubmit={submit}>
        <Input
          label="Email address"
          type="email"
          required
          placeholder="name@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength="6"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <ErrorState error={error} />}
        <Button disabled={busy} loading={busy} size="lg" className="full">
          {busy ? 'Signing in…' : 'Log in'}
        </Button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px' }}>
        <Link to="/auth/forgot-password">Forgot password?</Link>
        <Link to="/auth/signup" style={{ fontWeight: 600 }}>Create an account</Link>
      </div>
    </AuthCard>
  )
}

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
    email: '',
    password: '',
    phone: '',
    city: '',
    pincode: ''
  })

  // Influencer details state
  const [influencerData, setInfluencerData] = useState({
    niche: 'Fashion & Lifestyle',
    instagram_handle: '',
    instagram_followers: '',
    facebook_followers: '',
    youtube_subscribers: '',
    other_platform: '',
    other_followers: '',
    reel_price: '',
    story_price: '',
    post_price: '',
    bio: ''
  })

  // Brand details state
  const [brandData, setBrandData] = useState({
    business_name: '',
    category: 'E-commerce & Retail',
    budget_range: '₹25,000 – ₹1,00,000',
    website: '',
    description: ''
  })

  const validateStep2 = () => {
    if (!basics.name.trim()) return 'Please enter your full name.'
    if (!basics.email.trim() || !basics.email.includes('@')) return 'Please enter a valid email address.'
    if (!basics.password || basics.password.length < 6) return 'Password must be at least 6 characters.'
    if (!basics.phone.trim() || basics.phone.length < 10) return 'Please enter a valid 10-digit mobile number.'
    if (!basics.pincode.trim() || basics.pincode.length < 5) return 'Please enter a valid pincode.'
    return null
  }

  const handleNextStep = (e) => {
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
      setStep(3)
      return
    }
  }

  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      const payload = {
        name: basics.name.trim(),
        email: basics.email.trim().toLowerCase(),
        password: basics.password,
        phone: basics.phone.trim(),
        pincode: basics.pincode.trim(),
        location: basics.city.trim() || 'India',
        role,
        roleData: role === 'influencer' ? {
          ...influencerData,
          instagram_followers: Number(influencerData.instagram_followers || 0),
          facebook_followers: Number(influencerData.facebook_followers || 0),
          youtube_subscribers: Number(influencerData.youtube_subscribers || 0),
          reel_price: Number(influencerData.reel_price || 0),
          story_price: Number(influencerData.story_price || 0),
          post_price: Number(influencerData.post_price || 0)
        } : {
          ...brandData,
          business_name: brandData.business_name || basics.name
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
      title={step === 1 ? 'Join Brand2Influence' : step === 2 ? 'Account & Contact Details' : role === 'influencer' ? 'Creator Stats & Rate Card' : 'Brand Profile & Budget'}
      subtitle={step === 1 ? 'Choose your role to get started with instant access.' : step === 2 ? 'Enter your personal contact and location information.' : role === 'influencer' ? 'Tell brands what you charge and showcase your audience reach.' : 'Set up your company profile and campaign parameters.'}
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
          <span className="step-number">3</span> {role === 'influencer' ? 'Rates & Stats' : 'Brand Info'}
        </div>
      </div>

      {error && <div style={{ marginBottom: '16px' }}><ErrorState error={error} /></div>}
      {successMsg && (
        <div className="state" style={{ background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
          {successMsg}
        </div>
      )}

      {/* STEP 1: ROLE SELECTION */}
      {step === 1 && (
        <div>
          <div className="choice-grid" style={{ marginTop: '16px', marginBottom: '24px' }}>
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
              <span>Showcase your Instagram/YouTube reach, set your rate card (Reel, Story, Post), and get paid sponsorships.</span>
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
              <span>Discover verified creators, compare rates, post collaboration briefs, and run marketing campaigns.</span>
            </button>
          </div>

          <Button size="lg" className="full" onClick={() => setStep(2)}>
            Continue as {role === 'influencer' ? 'Influencer' : 'Brand'} →
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
              label="Full Name"
              required
              placeholder="e.g. Wasim Khan"
              value={basics.name}
              onChange={(e) => setBasics({ ...basics, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="name@example.com"
              value={basics.email}
              onChange={(e) => setBasics({ ...basics, email: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <Input
              label="Create Password (min 6 chars)"
              type="password"
              minLength="6"
              required
              placeholder="••••••••"
              value={basics.password}
              onChange={(e) => setBasics({ ...basics, password: e.target.value })}
            />
            <Input
              label="Mobile / WhatsApp Number"
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={basics.phone}
              onChange={(e) => setBasics({ ...basics, phone: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <Input
              label="City / Location"
              required
              placeholder="e.g. Mumbai, Delhi, Bangalore"
              value={basics.city}
              onChange={(e) => setBasics({ ...basics, city: e.target.value })}
            />
            <Input
              label="Pincode"
              required
              placeholder="e.g. 400050"
              value={basics.pincode}
              onChange={(e) => setBasics({ ...basics, pincode: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => setStep(1)} style={{ flex: '0 0 auto' }}>
              ← Back
            </Button>
            <Button type="submit" size="lg" style={{ flex: '1 1 auto' }}>
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
              <div className="form-row-2">
                <label className="field">
                  <span className="field-label">Content Niche</span>
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

                <Input
                  label="Instagram Handle"
                  required
                  placeholder="@yourhandle"
                  value={influencerData.instagram_handle}
                  onChange={(e) => setInfluencerData({ ...influencerData, instagram_handle: e.target.value })}
                />
              </div>

              <div className="form-row-3">
                <Input
                  label="Instagram Followers"
                  type="number"
                  required
                  placeholder="e.g. 25000"
                  value={influencerData.instagram_followers}
                  onChange={(e) => setInfluencerData({ ...influencerData, instagram_followers: e.target.value })}
                />
                <Input
                  label="Facebook Followers"
                  type="number"
                  placeholder="e.g. 5000"
                  value={influencerData.facebook_followers}
                  onChange={(e) => setInfluencerData({ ...influencerData, facebook_followers: e.target.value })}
                />
                <Input
                  label="YouTube Subscribers"
                  type="number"
                  placeholder="e.g. 10000"
                  value={influencerData.youtube_subscribers}
                  onChange={(e) => setInfluencerData({ ...influencerData, youtube_subscribers: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '8px', marginBottom: '12px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-neutral)', marginBottom: '8px' }}>
                  Pricing & Rate Card (₹ INR)
                </p>
                <div className="form-row-3">
                  <Input
                    label="Reel Rate (₹)"
                    type="number"
                    placeholder="e.g. 5000"
                    value={influencerData.reel_price}
                    onChange={(e) => setInfluencerData({ ...influencerData, reel_price: e.target.value })}
                  />
                  <Input
                    label="Story Rate (₹)"
                    type="number"
                    placeholder="e.g. 2000"
                    value={influencerData.story_price}
                    onChange={(e) => setInfluencerData({ ...influencerData, story_price: e.target.value })}
                  />
                  <Input
                    label="Post Rate (₹)"
                    type="number"
                    placeholder="e.g. 3500"
                    value={influencerData.post_price}
                    onChange={(e) => setInfluencerData({ ...influencerData, post_price: e.target.value })}
                  />
                </div>
              </div>

              <Textarea
                label="Bio & Short Pitch"
                rows={3}
                placeholder="Tell brands what makes your content unique and how you engage your audience..."
                value={influencerData.bio}
                onChange={(e) => setInfluencerData({ ...influencerData, bio: e.target.value })}
              />
            </>
          ) : (
            <>
              <div className="form-row-2">
                <Input
                  label="Brand / Company Name"
                  required
                  placeholder="e.g. Blue Tokai Roasters"
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
                <label className="field">
                  <span className="field-label">Typical Campaign Budget</span>
                  <div className="field-input-wrap">
                    <select
                      className="field-input"
                      value={brandData.budget_range}
                      onChange={(e) => setBrandData({ ...brandData, budget_range: e.target.value })}
                    >
                      <option value="₹5,000 – ₹25,000">₹5,000 – ₹25,000</option>
                      <option value="₹25,000 – ₹1,00,000">₹25,000 – ₹1,00,000</option>
                      <option value="₹1,00,000 – ₹5,00,000">₹1,00,000 – ₹5,00,000</option>
                      <option value="₹5,00,000+">₹5,00,000+</option>
                    </select>
                  </div>
                </label>

                <Input
                  label="Website / Social URL"
                  placeholder="https://yourbrand.com or @brand"
                  value={brandData.website}
                  onChange={(e) => setBrandData({ ...brandData, website: e.target.value })}
                />
              </div>

              <Textarea
                label="Brand Overview / Collaboration Goals"
                rows={3}
                placeholder="Describe your brand and the types of creators or campaigns you look for..."
                value={brandData.description}
                onChange={(e) => setBrandData({ ...brandData, description: e.target.value })}
              />
            </>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <Button type="button" variant="secondary" onClick={() => setStep(2)} disabled={busy} style={{ flex: '0 0 auto' }}>
              ← Back
            </Button>
            <Button type="submit" size="lg" disabled={busy} loading={busy} style={{ flex: '1 1 auto' }}>
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
