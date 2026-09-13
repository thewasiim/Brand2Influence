import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth'
import { api } from '../services/api'
import { Button, Input, Textarea, Badge, LoadingState, ErrorState } from '../components/ui'

export default function ProfileManagementPage() {
  const { user, profile: authProfile, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [syncingPlatform, setSyncingPlatform] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [syncNotice, setSyncNotice] = useState('')

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
    instagram_url: '',
    instagram_followers: '',
    facebook_followers: '',
    youtube_url: '',
    youtube_subscribers: '',
    snapchat_url: '',
    snapchat_subscribers: '',
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
            instagram_url: rateCard.instagram_url || (rateCard.instagram_handle ? `https://instagram.com/${rateCard.instagram_handle.replace('@', '')}` : ''),
            instagram_followers: rateCard.instagram_followers || inf.followers_count || '',
            facebook_followers: rateCard.facebook_followers || '',
            youtube_url: rateCard.youtube_url || '',
            youtube_subscribers: rateCard.youtube_subscribers || '',
            snapchat_url: rateCard.snapchat_url || '',
            snapchat_subscribers: rateCard.snapchat_subscribers || '',
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

  const handleSyncSocial = async (platform, urlOrHandle, manualCount) => {
    if (!urlOrHandle) {
      setErrorMsg(`Please enter a valid ${platform} URL or handle first.`)
      return
    }
    setSyncingPlatform(platform)
    setSyncNotice('')
    setErrorMsg('')

    try {
      const res = await api('/influencers/social-sync', {
        method: 'POST',
        body: JSON.stringify({
          platform,
          urlOrHandle,
          manualFollowers: manualCount ? Number(manualCount) : undefined
        })
      })

      if (res && res.success && res.stats) {
        const stats = res.stats
        if (platform === 'instagram') {
          setFormData(prev => ({
            ...prev,
            instagram_handle: stats.handle || prev.instagram_handle,
            instagram_url: stats.url || prev.instagram_url,
            instagram_followers: stats.followers || prev.instagram_followers
          }))
        } else if (platform === 'youtube') {
          setFormData(prev => ({
            ...prev,
            youtube_url: stats.url || prev.youtube_url,
            youtube_subscribers: stats.subscribers || prev.youtube_subscribers
          }))
        } else if (platform === 'snapchat') {
          setFormData(prev => ({
            ...prev,
            snapchat_url: stats.url || prev.snapchat_url,
            snapchat_subscribers: stats.subscribers || prev.snapchat_subscribers
          }))
        }

        setSyncNotice(`✨ ${platform.toUpperCase()} synced successfully! (${stats.followers || stats.subscribers || 0} followers/subscribers updated)`)
        await refreshProfile()
      }
    } catch (err) {
      console.error(`Error syncing ${platform}:`, err)
      setErrorMsg(err.message || `Failed to sync ${platform} account.`)
    } finally {
      setSyncingPlatform(null)
    }
  }

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
          followers_count: Number(formData.instagram_followers || 0) + Number(formData.youtube_subscribers || 0) + Number(formData.snapchat_subscribers || 0),
          reel_price: Number(formData.reel_price || 0),
          story_price: Number(formData.story_price || 0),
          post_price: Number(formData.post_price || 0),
          instagram_handle: formData.instagram_handle.trim(),
          instagram_url: formData.instagram_url.trim(),
          instagram_followers: Number(formData.instagram_followers || 0),
          facebook_followers: Number(formData.facebook_followers || 0),
          youtube_url: formData.youtube_url.trim(),
          youtube_subscribers: Number(formData.youtube_subscribers || 0),
          snapchat_url: formData.snapchat_url.trim(),
          snapchat_subscribers: Number(formData.snapchat_subscribers || 0),
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
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Social Media Accounts & Sync</h2>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0 }}>
                  Enter your social media URLs or handles and click <strong>Sync & Verify</strong> to auto-pull live stats and feature clickable social badges on your creator card.
                </p>
              </div>

              {syncNotice && (
                <div
                  style={{
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>{syncNotice}</span>
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
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
              </div>

              {/* 📸 INSTAGRAM SYNC BLOCK */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px' }}>
                    <span style={{ fontSize: '18px' }}>📸</span> Instagram Account
                  </div>
                  <Badge variant="neutral" style={{ fontSize: '11px' }}>Meta Graph API</Badge>
                </div>

                <div className="form-row-2">
                  <Input
                    label="Instagram URL or Handle"
                    placeholder="https://instagram.com/yourhandle or @yourhandle"
                    value={formData.instagram_url || formData.instagram_handle}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData({ ...formData, instagram_url: val, instagram_handle: val })
                    }}
                  />

                  <Input
                    label="Followers Count"
                    type="number"
                    placeholder="e.g. 25000"
                    value={formData.instagram_followers}
                    onChange={(e) => setFormData({ ...formData, instagram_followers: e.target.value })}
                  />
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={syncingPlatform === 'instagram'}
                    disabled={syncingPlatform === 'instagram'}
                    onClick={() => handleSyncSocial('instagram', formData.instagram_url || formData.instagram_handle, formData.instagram_followers)}
                  >
                    {syncingPlatform === 'instagram' ? 'Syncing Instagram…' : '🔄 Sync & Verify Instagram'}
                  </Button>
                </div>
              </div>

              {/* ▶️ YOUTUBE SYNC BLOCK */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px' }}>
                    <span style={{ fontSize: '18px' }}>▶️</span> YouTube Channel
                  </div>
                  <Badge variant="neutral" style={{ fontSize: '11px' }}>YouTube Data API v3</Badge>
                </div>

                <div className="form-row-2">
                  <Input
                    label="YouTube Channel URL or Handle"
                    placeholder="https://youtube.com/@yourchannel or @yourchannel"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  />

                  <Input
                    label="Subscribers Count"
                    type="number"
                    placeholder="e.g. 50000"
                    value={formData.youtube_subscribers}
                    onChange={(e) => setFormData({ ...formData, youtube_subscribers: e.target.value })}
                  />
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={syncingPlatform === 'youtube'}
                    disabled={syncingPlatform === 'youtube'}
                    onClick={() => handleSyncSocial('youtube', formData.youtube_url, formData.youtube_subscribers)}
                  >
                    {syncingPlatform === 'youtube' ? 'Syncing YouTube…' : '🔄 Sync & Verify YouTube'}
                  </Button>
                </div>
              </div>

              {/* 👻 SNAPCHAT SYNC BLOCK */}
              <div
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '18px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px' }}>
                    <span style={{ fontSize: '18px' }}>👻</span> Snapchat Public Profile
                  </div>
                  <Badge variant="neutral" style={{ fontSize: '11px' }}>Public Profile Scraper</Badge>
                </div>

                <div className="form-row-2">
                  <Input
                    label="Snapchat Public Profile URL or Handle"
                    placeholder="https://www.snapchat.com/add/yourhandle"
                    value={formData.snapchat_url}
                    onChange={(e) => setFormData({ ...formData, snapchat_url: e.target.value })}
                  />

                  <Input
                    label="Subscribers Count"
                    type="number"
                    placeholder="e.g. 15000"
                    value={formData.snapchat_subscribers}
                    onChange={(e) => setFormData({ ...formData, snapchat_subscribers: e.target.value })}
                  />
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    loading={syncingPlatform === 'snapchat'}
                    disabled={syncingPlatform === 'snapchat'}
                    onClick={() => handleSyncSocial('snapchat', formData.snapchat_url, formData.snapchat_subscribers)}
                  >
                    {syncingPlatform === 'snapchat' ? 'Syncing Snapchat…' : '🔄 Sync & Verify Snapchat'}
                  </Button>
                </div>
              </div>

              {/* OTHER SOCIAL PLATFORMS */}
              <div className="form-row-3" style={{ marginTop: '16px' }}>
                <Input
                  label="Facebook Followers"
                  type="number"
                  placeholder="e.g. 10000"
                  value={formData.facebook_followers}
                  onChange={(e) => setFormData({ ...formData, facebook_followers: e.target.value })}
                />

                <Input
                  label="Other Platform (Twitter / LinkedIn)"
                  placeholder="e.g. Twitter / X"
                  value={formData.other_platform}
                  onChange={(e) => setFormData({ ...formData, other_platform: e.target.value })}
                />

                <Input
                  label="Other Followers"
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
