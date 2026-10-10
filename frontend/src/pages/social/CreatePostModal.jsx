import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { socialService } from '../../services/social'
import './CreatePostModal.css'

export default function CreatePostModal({ onClose, onPosted }) {
  const { user, profile } = useAuth()
  const isBrand = profile?.role === 'brand'
  const isInfluencer = profile?.role === 'influencer' || !isBrand

  const [step, setStep] = useState('pick') // 'pick' | 'edit' | 'posting' | 'done'
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [mediaType, setMediaType] = useState('image') // 'image' | 'video'
  const [aspectRatio, setAspectRatio] = useState('1/1') // '1/1' | '4/5' | '16/9' | 'auto'

  // Video playback state
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef(null)

  // Core Form State
  const [caption, setCaption] = useState('')
  const [category, setCategory] = useState(isBrand ? 'D2C & Retail' : 'Fashion & Style')
  const [location, setLocation] = useState('')
  
  // Creator-specific basis
  const [creatorPostType, setCreatorPostType] = useState('Showcase Reel')
  const [brandTag, setBrandTag] = useState('')

  // Brand-specific basis
  const [brandIntent, setBrandIntent] = useState('Campaign Callout')
  const [targetCreators, setTargetCreators] = useState('')
  const [budgetPerk, setBudgetPerk] = useState('')
  const [campaignUrl, setCampaignUrl] = useState('')

  // Advanced toggles (like Instagram)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [hideLikes, setHideLikes] = useState(false)
  const [disableComments, setDisableComments] = useState(false)
  const [altText, setAltText] = useState('')

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || (isBrand ? 'Brand Partner' : 'Creator')
  const userAvatar = profile?.avatar_url || profile?.profile_image_url || user?.user_metadata?.avatar_url

  // Unified single media handler (BOTH video and image without separate buttons!)
  const handleFile = useCallback((f) => {
    if (!f) return
    const isVid = f.type.startsWith('video') || /\.(mp4|mov|webm|mkv)$/i.test(f.name)
    setFile(f)
    setMediaType(isVid ? 'video' : 'image')
    setPreview(URL.createObjectURL(f))
    setStep('edit')
    setError('')
    setIsPlaying(true)
    setIsMuted(true)
  }, [])

  const onFileChange = (e) => {
    handleFile(e.target.files?.[0])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  // Toggle video play / pause
  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  // Toggle video audio mute
  const toggleMute = (e) => {
    e.stopPropagation()
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  // Insert emoji
  const insertEmoji = (emoji) => {
    setCaption(prev => prev + emoji)
  }

  const handlePost = async () => {
    if (!file || uploading) return
    setUploading(true)
    setStep('posting')
    setError('')

    try {
      // 1. Upload media (with local fallback if storage is offline)
      const mediaUrl = await socialService.uploadPostMedia(file, user?.id)

      // 2. Build tailored caption with metadata
      let finalCaption = caption.trim()

      if (isBrand) {
        const metadataParts = []
        if (brandIntent) metadataParts.push(`📌 [${brandIntent}]`)
        if (targetCreators) metadataParts.push(`🎯 Target: ${targetCreators}`)
        if (budgetPerk) metadataParts.push(`💰 Compensation: ${budgetPerk}`)
        if (campaignUrl) metadataParts.push(`🔗 Link: ${campaignUrl}`)
        
        if (metadataParts.length > 0) {
          finalCaption = `${finalCaption}\n\n${metadataParts.join('\n')}`.trim()
        }
      } else {
        const creatorParts = []
        if (creatorPostType) creatorParts.push(`✨ Format: ${creatorPostType}`)
        if (brandTag) creatorParts.push(`🤝 Collab: ${brandTag}`)
        if (location) creatorParts.push(`📍 ${location}`)

        if (creatorParts.length > 0) {
          finalCaption = `${finalCaption}\n\n${creatorParts.join(' • ')}`.trim()
        }
      }

      // 3. Create post via backend
      const post = await socialService.createPost({
        mediaUrl,
        mediaType,
        caption: finalCaption,
        thumbnailUrl: mediaType === 'video' ? mediaUrl : null,
        category,
        role: isBrand ? 'brand' : 'influencer'
      })

      setStep('done')
      setTimeout(() => {
        onPosted && onPosted(post)
        onClose()
      }, 1200)
    } catch (e) {
      console.error('Post creation error:', e)
      setError(e.message || 'Upload failed. Please check your network and try again.')
      setStep('edit')
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(null)
    setCaption('')
    setLocation('')
    setBrandTag('')
    setTargetCreators('')
    setBudgetPerk('')
    setCampaignUrl('')
    setStep('pick')
    setError('')
  }

  return (
    <div className="cpm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Create new post">
      <div className={`cpm-modal ${step === 'edit' || step === 'posting' ? 'is-edit-mode' : ''}`} onClick={e => e.stopPropagation()}>
        
        {/* Instagram Modal Header */}
        <div className="cpm-header">
          {step === 'edit' ? (
            <button className="cpm-header-back-btn" onClick={reset} aria-label="Discard media and go back">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
          ) : (
            <div className="cpm-header-spacer" />
          )}

          <h2 className="cpm-title">
            {step === 'pick'
              ? (isBrand ? 'Create Brand Post' : 'Create new post')
              : step === 'done'
              ? '✓ Shared'
              : (isBrand ? 'New Brand Campaign Update' : 'New Post')}
          </h2>

          <div className="cpm-header-actions">
            {(step === 'edit' || step === 'posting') && (
              <button
                className="cpm-header-share-btn"
                onClick={handlePost}
                disabled={step === 'posting'}
              >
                {step === 'posting' ? (
                  <>
                    <span className="cpm-spinner" />
                    <span>Sharing…</span>
                  </>
                ) : (
                  'Share'
                )}
              </button>
            )}

            <button className="cpm-close-btn" onClick={onClose} aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── STEP 1: PICK MEDIA (Unified Image & Video Upload - Exactly Like Instagram) ── */}
        {step === 'pick' && (
          <div
            className={`cpm-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={onFileChange}
              aria-label="Upload photos and videos"
            />

            {/* Instagram Style Media Glyph (Photo & Reel Unified) */}
            <div className="cpm-dz-icon-wrap">
              <svg width="78" height="78" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="4" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
                <path d="m14 14 2 2" />
                <polygon points="16 7 16 11 19 9" fill="currentColor" stroke="none" />
              </svg>
            </div>

            <p className="cpm-dz-title">Drag photos and videos here</p>
            <p className="cpm-dz-sub">Supports JPG, PNG, WEBP, MP4, MOV, WEBM</p>

            <button
              type="button"
              className="cpm-select-device-btn"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
            >
              Select from device
            </button>
          </div>
        )}

        {/* ── STEP 2: 2-COLUMN INSTAGRAM EDIT & PUBLISH INTERFACE ── */}
        {(step === 'edit' || step === 'posting') && preview && (
          <div className="cpm-split-layout">
            
            {/* Left Column: Media Preview */}
            <div className={`cpm-media-column aspect-${aspectRatio.replace('/', '-')}`} onClick={mediaType === 'video' ? togglePlay : undefined}>
              {mediaType === 'video' ? (
                <div className="cpm-video-container">
                  <video
                    ref={videoRef}
                    src={preview}
                    playsInline
                    autoPlay
                    loop
                    muted={isMuted}
                    className="cpm-preview-video"
                  />
                  {/* Video Overlay Controls */}
                  <div className="cpm-video-overlay-bar">
                    <button
                      type="button"
                      className="cpm-video-ctl-btn"
                      onClick={togglePlay}
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>

                    <button
                      type="button"
                      className="cpm-video-ctl-btn"
                      onClick={toggleMute}
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="1" y1="1" x2="23" y2="23" />
                          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                      )}
                    </button>
                    <span className="cpm-video-badge">Reel / Video</span>
                  </div>
                </div>
              ) : (
                <div className="cpm-image-container">
                  <img src={preview} alt="Upload preview" className="cpm-preview-img" />
                </div>
              )}

              {/* Instagram Aspect Ratio Control */}
              <div className="cpm-aspect-control" onClick={e => e.stopPropagation()}>
                <button
                  type="button"
                  className={`cpm-aspect-pill ${aspectRatio === '1/1' ? 'active' : ''}`}
                  onClick={() => setAspectRatio('1/1')}
                  title="Square 1:1"
                >
                  1:1
                </button>
                <button
                  type="button"
                  className={`cpm-aspect-pill ${aspectRatio === '4/5' ? 'active' : ''}`}
                  onClick={() => setAspectRatio('4/5')}
                  title="Portrait 4:5"
                >
                  4:5
                </button>
                <button
                  type="button"
                  className={`cpm-aspect-pill ${aspectRatio === '16/9' ? 'active' : ''}`}
                  onClick={() => setAspectRatio('16/9')}
                  title="Landscape 16:9"
                >
                  16:9
                </button>
              </div>
            </div>

            {/* Right Column: Author, Caption & Role-Specific Details */}
            <div className="cpm-details-column">
              
              {/* Author Header */}
              <div className="cpm-author-header">
                <div className="cpm-author-avatar">
                  {userAvatar ? (
                    <img src={userAvatar} alt={displayName} />
                  ) : (
                    <span>{displayName.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="cpm-author-meta">
                  <span className="cpm-author-name">{displayName}</span>
                  <span className={`cpm-role-badge ${isBrand ? 'is-brand' : 'is-creator'}`}>
                    {isBrand ? '🏢 Verified Brand' : '🎨 Creator'}
                  </span>
                </div>
              </div>

              {/* Caption Area */}
              <div className="cpm-caption-section">
                <textarea
                  className="cpm-caption-input"
                  placeholder={
                    isBrand
                      ? "Write a campaign brief, product highlight, or creator collaboration callout..."
                      : "Write a caption... share your vibe, outfit details, review or creative concept (#hashtags, @mentions)"
                  }
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  maxLength={2200}
                  rows={4}
                  disabled={step === 'posting'}
                  aria-label="Caption"
                />

                {/* Quick Emoji Bar */}
                <div className="cpm-emoji-bar">
                  <div className="cpm-emoji-chips">
                    {['✨', '🔥', '📸', '🚀', '💼', '❤️', '🙌', '💯'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className="cpm-emoji-btn"
                        onClick={() => insertEmoji(emoji)}
                        disabled={step === 'posting'}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div className="cpm-char-count">{caption.length}/2200</div>
                </div>
              </div>

              {/* Role-Based Basis Fields (CREATOR vs BRAND) */}
              <div className="cpm-custom-fields">
                
                {/* ── CREATOR BASIS ── */}
                {isInfluencer && (
                  <div className="cpm-role-group">
                    <div className="cpm-field-row">
                      <label className="cpm-field-label">Post Format</label>
                      <div className="cpm-pill-options">
                        {['Showcase Reel', 'Product Review', 'Collab Lookbook', 'BTS', 'Tutorial'].map(fmt => (
                          <button
                            key={fmt}
                            type="button"
                            className={`cpm-option-pill ${creatorPostType === fmt ? 'is-selected' : ''}`}
                            onClick={() => setCreatorPostType(fmt)}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="cpm-field-row">
                      <label className="cpm-field-label">Primary Niche / Category</label>
                      <select
                        className="cpm-select"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                      >
                        {['Fashion & Style', 'Tech & Gadgets', 'Fitness & Health', 'Food & Dining', 'Travel & Lifestyle', 'Beauty & Makeup', 'Gaming', 'Entertainment'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="cpm-field-row">
                      <label className="cpm-field-label">Tag Brand / Sponsor (Optional)</label>
                      <div className="cpm-input-with-icon">
                        <span className="cpm-input-icon">🤝</span>
                        <input
                          type="text"
                          className="cpm-text-input"
                          placeholder="e.g. Paid partnership with @nike"
                          value={brandTag}
                          onChange={e => setBrandTag(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="cpm-field-row">
                      <label className="cpm-field-label">Location (Optional)</label>
                      <div className="cpm-input-with-icon">
                        <span className="cpm-input-icon">📍</span>
                        <input
                          type="text"
                          className="cpm-text-input"
                          placeholder="Add location (e.g. Mumbai, India)"
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── BRAND BASIS ── */}
                {isBrand && (
                  <div className="cpm-role-group">
                    <div className="cpm-field-row">
                      <label className="cpm-field-label">Post Intent</label>
                      <div className="cpm-pill-options">
                        {['Campaign Callout', 'Product Launch', 'Creator Collab Deal', 'Brand Update', 'UGC Requirement'].map(intent => (
                          <button
                            key={intent}
                            type="button"
                            className={`cpm-option-pill is-brand-pill ${brandIntent === intent ? 'is-selected' : ''}`}
                            onClick={() => setBrandIntent(intent)}
                          >
                            {intent}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="cpm-field-row">
                      <label className="cpm-field-label">Industry Sector</label>
                      <select
                        className="cpm-select"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                      >
                        {['D2C & Retail', 'Fashion & Apparel', 'Tech & SaaS', 'Beauty & Personal Care', 'Food & Beverage', 'Fitness & Health', 'Automotive'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="cpm-field-row">
                      <label className="cpm-field-label">Target Creator Criteria</label>
                      <div className="cpm-input-with-icon">
                        <span className="cpm-input-icon">🎯</span>
                        <input
                          type="text"
                          className="cpm-text-input"
                          placeholder="e.g. Looking for 5+ creators in Tech/Fashion (10k+ reach)"
                          value={targetCreators}
                          onChange={e => setTargetCreators(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="cpm-field-row">
                      <label className="cpm-field-label">Collab Compensation / Budget</label>
                      <div className="cpm-input-with-icon">
                        <span className="cpm-input-icon">💰</span>
                        <input
                          type="text"
                          className="cpm-text-input"
                          placeholder="e.g. ₹15,000 / Reel or Free Gifting + Commercials"
                          value={budgetPerk}
                          onChange={e => setBudgetPerk(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="cpm-field-row">
                      <label className="cpm-field-label">Campaign / Store Link (Optional)</label>
                      <div className="cpm-input-with-icon">
                        <span className="cpm-input-icon">🔗</span>
                        <input
                          type="url"
                          className="cpm-text-input"
                          placeholder="https://yourbrand.com/campaign"
                          value={campaignUrl}
                          onChange={e => setCampaignUrl(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Collapsible Instagram Advanced Settings */}
                <div className="cpm-advanced-section">
                  <button
                    type="button"
                    className="cpm-advanced-toggle"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    <span>Advanced settings</span>
                    <span className="cpm-advanced-chevron">{showAdvanced ? '▲' : '▼'}</span>
                  </button>

                  {showAdvanced && (
                    <div className="cpm-advanced-body">
                      <label className="cpm-toggle-row">
                        <div>
                          <div className="cpm-toggle-title">Hide like count</div>
                          <div className="cpm-toggle-desc">Only you will see the total number of likes on this post</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={hideLikes}
                          onChange={e => setHideLikes(e.target.checked)}
                          className="cpm-checkbox"
                        />
                      </label>

                      <label className="cpm-toggle-row">
                        <div>
                          <div className="cpm-toggle-title">Turn off commenting</div>
                          <div className="cpm-toggle-desc">You can change this later from your post options</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={disableComments}
                          onChange={e => setDisableComments(e.target.checked)}
                          className="cpm-checkbox"
                        />
                      </label>

                      <div className="cpm-field-row" style={{ marginTop: '12px' }}>
                        <label className="cpm-field-label">Accessibility Alt Text</label>
                        <input
                          type="text"
                          className="cpm-text-input"
                          placeholder="Write alt text describing your media..."
                          value={altText}
                          onChange={e => setAltText(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="cpm-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Bottom Mobile Share Action */}
              <div className="cpm-mobile-share-bar">
                <button
                  type="button"
                  className="cpm-mobile-share-btn"
                  onClick={handlePost}
                  disabled={step === 'posting'}
                >
                  {step === 'posting' ? (
                    <>
                      <span className="cpm-spinner" />
                      <span>Publishing to BrandHUB…</span>
                    </>
                  ) : (
                    <span>Share Post</span>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ── STEP 3: DONE / SUCCESS STATE ── */}
        {step === 'done' && (
          <div className="cpm-done">
            <div className="cpm-done-icon">✓</div>
            <h3 className="cpm-done-title">Your post has been shared!</h3>
            <p className="cpm-done-sub">It is now live on BrandHUB Explore and your profile.</p>
          </div>
        )}

      </div>
    </div>
  )
}
