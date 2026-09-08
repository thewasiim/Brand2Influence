import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth'
import { Button, Input, Textarea, Badge, LoadingState, ErrorState } from '../components/ui'

export default function ProfileManagementPage() {
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    pincode: '',
    role: '',

    // Influencer specific
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
    bio: '',

    // Brand specific
    business_name: '',
    business_type: 'E-commerce & Retail',
    budget_range: '₹25,000 – ₹1,00,000'
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setErrorMsg('')
        const res = await authService.getProfile()
        if (res) {
          const isInfluencer = res.role === 'influencer'
          const isBrand = res.role === 'brand'
          const inf = res.influencer_profile || {}
          const br = res.brand_profile || {}
          const rateCard = inf.rate_card || {}

          // Parse location and pincode if stored as "City - Pincode"
          const rawLoc = isInfluencer ? (inf.location || '') : isBrand ? (br.location || '') : ''
          let parsedCity = rawLoc
          let parsedPincode = rateCard.pincode || ''
          if (rawLoc.includes(' - ')) {
            const parts = rawLoc.split(' - ')
            parsedCity = parts[0]?.trim() || ''
            if (!parsedPincode && parts[1]) {
              parsedPincode = parts[1].trim()
            }
          }

          setFormData({
            name: res.name || authProfile?.name || '',
            email: res.email || user?.email || '',
            phone: res.phone || '',
            city: parsedCity || rateCard.city || '',
            pincode: parsedPincode || '',
            role: res.role || authProfile?.role || 'influencer',

            // Influencer
            niche: inf.niche || 'Fashion & Lifestyle',
            instagram_handle: rateCard.instagram_handle || '',
            instagram_followers: rateCard.instagram_followers || inf.followers_count || '',
            facebook_followers: rateCard.facebook_followers || '',
            youtube_subscribers: rateCard.youtube_subscribers || '',
            other_platform: rateCard.other_platform || '',
            other_followers: rateCard.other_followers || '',
            reel_price: rateCard.reel ?? '',
            story_price: rateCard.story ?? '',
            post_price: rateCard.post ?? '',
            bio: inf.bio || '',

            // Brand
            business_name: br.business_name || res.name || '',
            business_type: br.business_type || 'E-commerce & Retail',
            budget_range: br.budget_range || '₹25,000 – ₹1,00,000'
          })
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
        setErrorMsg(err.message || 'Could not load your profile details.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user, authProfile])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      const isInfluencer = formData.role === 'influencer'

      const updatePayload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        location: [formData.city.trim(), formData.pincode.trim()].filter(Boolean).join(' - ') || 'India',
        role: formData.role
      }

      if (isInfluencer) {
        updatePayload.influencer_profile = {
          niche: formData.niche,
          bio: formData.bio,
          followers_count: Number(formData.instagram_followers || 0),
          reel_price: Number(formData.reel_price || 0),
          story_price: Number(formData.story_price || 0),
          post_price: Number(formData.post_price || 0),
          instagram_handle: formData.instagram_handle.trim(),
          instagram_followers: Number(formData.instagram_followers || 0),
          facebook_followers: Number(formData.facebook_followers || 0),
          youtube_subscribers: Number(formData.youtube_subscribers || 0),
          other_platform: formData.other_platform.trim(),
          other_followers: Number(formData.other_followers || 0)
        }
      } else if (formData.role === 'brand') {
        updatePayload.brand_profile = {
          business_name: formData.business_name.trim(),
          business_type: formData.business_type.trim(),
          budget_range: formData.budget_range.trim()
        }
      }

      await authService.updateProfile(updatePayload)
      await refreshProfile()
      setSuccessMsg('Your profile has been saved successfully!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Save profile error:', err)
      setErrorMsg(err.message || 'Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <LoadingState message="Loading your profile data..." />
      </div>
    )
  }

  const isInfluencer = formData.role === 'influencer'
  const isBrand = formData.role === 'brand'

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 20px 60px' }}>
      {/* Profile Banner Card */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-2xl)',
          padding: '28px 32px',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{formData.name || 'My Profile'}</h1>
            <Badge variant={isInfluencer ? 'accent' : isBrand ? 'primary' : 'neutral'}>
              {isInfluencer ? 'Creator' : isBrand ? 'Brand' : 'Admin'}
            </Badge>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>
            {formData.email} • {formData.city ? `${formData.city}${formData.pincode ? ` (${formData.pincode})` : ''}` : 'Location not set'}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleSave}
          disabled={saving}
          loading={saving}
          size="md"
        >
          {saving ? 'Saving Changes…' : 'Save Changes'}
        </Button>
      </div>

      {successMsg && (
        <div
          className="state"
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '14px 18px',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{ marginBottom: '20px' }}>
          <ErrorState error={errorMsg} />
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* SECTION 1: Personal & Contact Details */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-bento)'
          }}
        >
          <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Personal & Contact Details</h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
              Your verified identity, phone number, and location information.
            </p>
          </div>

          <div className="form-row-2">
            <Input
              label="Full Name / Display Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <Input
              label="Email Address"
              type="email"
              disabled
              value={formData.email}
              hint="Email address cannot be changed."
            />
          </div>

          <div className="form-row-3" style={{ marginTop: '12px' }}>
            <Input
              label="Mobile / WhatsApp Number"
              type="tel"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              label="City / District"
              placeholder="e.g. Mumbai, Delhi"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />

            <Input
              label="Pincode"
              placeholder="e.g. 400050"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>
        </div>

        {/* SECTION 2: INFLUENCER SOCIAL METRICS & RATE CARD */}
        {isInfluencer && (
          <>
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px 28px',
                boxShadow: 'var(--shadow-bento)'
              }}
            >
              <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Social Media & Audience Reach</h2>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
                  Update your followers and handles across platforms so brands can evaluate your profile.
                </p>
              </div>

              <div className="form-row-2">
                <label className="field">
                  <span className="field-label">Content Niche</span>
                  <div className="field-input-wrap">
                    <select
                      className="field-input"
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
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
                  placeholder="@yourhandle"
                  value={formData.instagram_handle}
                  onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })}
                />
              </div>

              <div className="form-row-3" style={{ marginTop: '12px' }}>
                <Input
                  label="Instagram Followers"
                  type="number"
                  placeholder="e.g. 25000"
                  value={formData.instagram_followers}
                  onChange={(e) => setFormData({ ...formData, instagram_followers: e.target.value })}
                />

                <Input
                  label="Facebook Followers"
                  type="number"
                  placeholder="e.g. 10000"
                  value={formData.facebook_followers}
                  onChange={(e) => setFormData({ ...formData, facebook_followers: e.target.value })}
                />

                <Input
                  label="YouTube Subscribers"
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.youtube_subscribers}
                  onChange={(e) => setFormData({ ...formData, youtube_subscribers: e.target.value })}
                />
              </div>

              <div className="form-row-2" style={{ marginTop: '12px' }}>
                <Input
                  label="Other Platform (e.g. Twitter / LinkedIn)"
                  placeholder="e.g. Twitter / X"
                  value={formData.other_platform}
                  onChange={(e) => setFormData({ ...formData, other_platform: e.target.value })}
                />
                <Input
                  label="Other Platform Followers"
                  type="number"
                  placeholder="e.g. 3500"
                  value={formData.other_followers}
                  onChange={(e) => setFormData({ ...formData, other_followers: e.target.value })}
                />
              </div>
            </div>

            {/* Rate Card Section */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px 28px',
                boxShadow: 'var(--shadow-bento)'
              }}
            >
              <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Pricing & Rate Card (₹ INR)</h2>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
                  Set your collaboration fees so brands can send direct booking proposals with accurate budgets.
                </p>
              </div>

              <div className="form-row-3">
                <Input
                  label="Reel Rate (₹)"
                  type="number"
                  placeholder="e.g. 10000"
                  value={formData.reel_price}
                  onChange={(e) => setFormData({ ...formData, reel_price: e.target.value })}
                />

                <Input
                  label="Story Rate (₹)"
                  type="number"
                  placeholder="e.g. 3000"
                  value={formData.story_price}
                  onChange={(e) => setFormData({ ...formData, story_price: e.target.value })}
                />

                <Input
                  label="Post Rate (₹)"
                  type="number"
                  placeholder="e.g. 6000"
                  value={formData.post_price}
                  onChange={(e) => setFormData({ ...formData, post_price: e.target.value })}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <Textarea
                  label="Creator Bio & Collaboration Pitch"
                  rows={4}
                  placeholder="Share details about your audience demographics, past brand work, or creative style..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        {/* SECTION 2: BRAND DETAILS */}
        {isBrand && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px 28px',
              boxShadow: 'var(--shadow-bento)'
            }}
          >
            <div style={{ marginBottom: '18px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Brand Information</h2>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
                Information visible to creators when negotiating deals or viewing campaign briefs.
              </p>
            </div>

            <div className="form-row-2">
              <Input
                label="Company / Brand Name"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
              />

              <label className="field">
                <span className="field-label">Industry Category</span>
                <div className="field-input-wrap">
                  <select
                    className="field-input"
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
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

            <div style={{ marginTop: '12px' }}>
              <label className="field">
                <span className="field-label">Typical Campaign Budget</span>
                <div className="field-input-wrap">
                  <select
                    className="field-input"
                    value={formData.budget_range}
                    onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                  >
                    <option value="₹5,000 – ₹25,000">₹5,000 – ₹25,000</option>
                    <option value="₹25,000 – ₹1,00,000">₹25,000 – ₹1,00,000</option>
                    <option value="₹1,00,000 – ₹5,00,000">₹1,00,000 – ₹5,00,000</option>
                    <option value="₹5,00,000+">₹5,00,000+</option>
                  </select>
                </div>
              </label>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button
            type="submit"
            disabled={saving}
            loading={saving}
            size="lg"
            style={{ minWidth: '180px' }}
          >
            {saving ? 'Saving…' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
