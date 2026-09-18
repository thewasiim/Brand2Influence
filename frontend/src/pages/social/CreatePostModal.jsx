import React, { useState, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { socialService } from '../../services/social'
import './CreatePostModal.css'

export default function CreatePostModal({ onClose, onPosted }) {
  const { user } = useAuth()
  const [step, setStep] = useState('pick') // 'pick' | 'edit' | 'posting' | 'done'
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [mediaType, setMediaType] = useState('image')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleFile = useCallback((f) => {
    if (!f) return
    const type = f.type.startsWith('video') ? 'video' : 'image'
    setFile(f)
    setMediaType(type)
    setPreview(URL.createObjectURL(f))
    setStep('edit')
    setError('')
  }, [])

  const onFileChange = (e) => handleFile(e.target.files?.[0])

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  const handlePost = async () => {
    if (!file || uploading) return
    setUploading(true)
    setStep('posting')
    setError('')
    try {
      const mediaUrl = await socialService.uploadPostMedia(file, user.id)
      const post = await socialService.createPost({ mediaUrl, mediaType, caption })
      setStep('done')
      setTimeout(() => {
        onPosted && onPosted(post)
        onClose()
      }, 1200)
    } catch (e) {
      setError(e.message || 'Upload failed')
      setStep('edit')
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setCaption('')
    setStep('pick')
    setError('')
  }

  return (
    <div className="cpm-overlay" onClick={onClose} role="dialog" aria-label="Create new post">
      <div className="cpm-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cpm-header">
          <h2 className="cpm-title">
            {step === 'pick' ? 'Create New Post' : step === 'done' ? '✓ Posted!' : 'New Post'}
          </h2>
          <div className="cpm-header-actions">
            {step === 'edit' && (
              <button className="cpm-back-btn" onClick={reset} aria-label="Back">
                ← Back
              </button>
            )}
            <button className="cpm-close-btn" onClick={onClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Step: Pick */}
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
              aria-label="Upload media"
            />
            <div className="cpm-dz-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p className="cpm-dz-title">Drop photo or video here</p>
            <p className="cpm-dz-sub">or click to browse · JPG, PNG, MP4, MOV</p>
            <div className="cpm-dz-types">
              <span className="cpm-type-badge">📷 Photo</span>
              <span className="cpm-type-badge">🎬 Video</span>
            </div>
          </div>
        )}

        {/* Step: Edit */}
        {(step === 'edit' || step === 'posting') && preview && (
          <div className="cpm-edit-area">
            {/* Preview */}
            <div className="cpm-preview-wrap">
              {mediaType === 'video'
                ? <video src={preview} controls playsInline className="cpm-preview-video" />
                : <img src={preview} alt="Preview" className="cpm-preview-img" />
              }
            </div>

            {/* Caption */}
            <div className="cpm-caption-wrap">
              <textarea
                className="cpm-caption-input"
                placeholder="Write a caption… tag creators, add hashtags"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                maxLength={2200}
                rows={4}
                disabled={step === 'posting'}
                aria-label="Caption"
              />
              <div className="cpm-char-count">{caption.length}/2200</div>

              {error && (
                <div className="cpm-error">⚠️ {error}</div>
              )}

              <button
                className="cpm-post-btn"
                onClick={handlePost}
                disabled={step === 'posting'}
              >
                {step === 'posting'
                  ? <><span className="cpm-spinner" />Uploading…</>
                  : 'Share Post'
                }
              </button>
            </div>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div className="cpm-done">
            <div className="cpm-done-icon">✓</div>
            <p>Your post has been shared!</p>
          </div>
        )}
      </div>
    </div>
  )
}
