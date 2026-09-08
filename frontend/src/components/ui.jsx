import React, { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Brand2Influence Reusable UI Primitives
 * Design System: Premium Bento + Minimal UI
 * Brand Palette: Pure White Minimal
 *   Background: #FFFFFF
 *   Text:       #0A0A0A
 *   Surfaces:   #F5F5F5 / #FAFAFA
 *   Borders:    rgba(0, 0, 0, 0.08)
 */

// 1. Button
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  className = '',
  ...props
}) {
  const variantClass = variant === 'secondary'
    ? 'ui-btn--secondary'
    : variant === 'accent'
    ? 'ui-btn--accent'
    : variant === 'ghost'
    ? 'ui-btn--ghost'
    : variant === 'outline'
    ? 'ui-btn--outline'
    : 'ui-btn--primary'

  const sizeClass = size === 'sm' ? 'ui-btn--sm' : size === 'lg' ? 'ui-btn--lg' : 'ui-btn--md'

  return (
    <button
      className={`ui-button ${variantClass} ${sizeClass} ${loading ? 'is-loading' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="ui-btn-spinner" aria-hidden="true" />}
      {!loading && icon && <span className="ui-btn-icon">{icon}</span>}
      <span className="ui-btn-text">{children}</span>
    </button>
  )
}

// 2. Input
export function Input({ label, error, hint, icon, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined)
  return (
    <label className={`field ${error ? 'has-error' : ''} ${className}`} htmlFor={inputId}>
      {label && <span className="field-label">{label}</span>}
      <div className="field-input-wrap">
        {icon && <span className="field-icon">{icon}</span>}
        <input id={inputId} className={`field-input ${icon ? 'has-icon' : ''}`} {...props} />
      </div>
      {hint && !error && <small className="field-hint">{hint}</small>}
      {error && <small className="field-error" role="alert">{error}</small>}
    </label>
  )
}

// 3. Textarea
export function Textarea({ label, error, hint, className = '', id, ...props }) {
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined)
  return (
    <label className={`field ${error ? 'has-error' : ''} ${className}`} htmlFor={inputId}>
      {label && <span className="field-label">{label}</span>}
      <textarea id={inputId} className="field-input field-textarea" {...props} />
      {hint && !error && <small className="field-hint">{hint}</small>}
      {error && <small className="field-error" role="alert">{error}</small>}
    </label>
  )
}

// 4. Bento Card / Surface Card
export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  as: Component = 'div',
  ...props
}) {
  const variantClass = variant === 'glass'
    ? 'bento-card--glass'
    : variant === 'elevated'
    ? 'bento-card--elevated'
    : variant === 'interactive'
    ? 'bento-card--interactive'
    : 'bento-card--default'

  const padClass = padding === 'none'
    ? 'bento-pad--none'
    : padding === 'sm'
    ? 'bento-pad--sm'
    : padding === 'lg'
    ? 'bento-pad--lg'
    : 'bento-pad--md'

  return (
    <Component className={`bento-card ${variantClass} ${padClass} ${className}`} {...props}>
      {children}
    </Component>
  )
}

// 5. Bento Grid System
export function BentoGrid({
  children,
  cols = 3,
  gap = 'md',
  asymmetric = false,
  className = '',
  ...props
}) {
  const colClass = cols === 2
    ? 'bento-grid--2'
    : cols === 4
    ? 'bento-grid--4'
    : cols === 'asymmetric' || asymmetric
    ? 'bento-grid--asymmetric'
    : 'bento-grid--3'

  const gapClass = gap === 'sm' ? 'bento-gap--sm' : gap === 'lg' ? 'bento-gap--lg' : 'bento-gap--md'

  return (
    <div className={`bento-grid ${colClass} ${gapClass} ${className}`} {...props}>
      {children}
    </div>
  )
}

// 6. Bento Cell (for Asymmetric span)
export function BentoCell({
  children,
  span = 1,
  rowSpan = 1,
  className = '',
  ...props
}) {
  const colSpanClass = span === 2
    ? 'bento-span--2'
    : span === 3
    ? 'bento-span--3'
    : span === 4
    ? 'bento-span--4'
    : ''

  const rowSpanClass = rowSpan === 2 ? 'bento-row--2' : ''

  return (
    <div className={`bento-cell ${colSpanClass} ${rowSpanClass} ${className}`} {...props}>
      {children}
    </div>
  )
}

// 7. Badge
export function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const variantClass = variant === 'secondary'
    ? 'ui-badge--secondary'
    : variant === 'accent'
    ? 'ui-badge--accent'
    : variant === 'outline'
    ? 'ui-badge--outline'
    : variant === 'neutral'
    ? 'ui-badge--neutral'
    : 'ui-badge--primary'

  const sizeClass = size === 'sm' ? 'ui-badge--sm' : 'ui-badge--md'

  return (
    <span className={`ui-badge ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </span>
  )
}

// 8. Chip (Filter / tag pill)
export function Chip({
  children,
  active = false,
  onRemove = null,
  onClick = null,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      className={`ui-chip ${active ? 'is-active' : ''} ${onRemove ? 'has-remove' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      <span className="ui-chip-text">{children}</span>
      {onRemove && (
        <span
          className="ui-chip-remove"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          aria-label="Remove"
        >
          ×
        </span>
      )}
    </button>
  )
}

// 9. Tabs Component
export function Tabs({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`ui-tabs ${className}`} role="tablist">
      {tabs.map((tab) => {
        const id = typeof tab === 'string' ? tab : tab.id
        const label = typeof tab === 'string' ? tab : tab.label
        const isActive = activeTab === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`ui-tab-btn ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

// 10. Avatar
export function Avatar({
  name = 'User',
  src = null,
  size = 'md',
  tone = 'purple',
  className = '',
  ...props
}) {
  const sizeClass = size === 'sm'
    ? 'ui-avatar--sm'
    : size === 'lg'
    ? 'ui-avatar--lg'
    : size === 'xl'
    ? 'ui-avatar--xl'
    : 'ui-avatar--md'

  const toneClass = tone === 'secondary'
    ? 'ui-avatar--secondary'
    : tone === 'accent'
    ? 'ui-avatar--accent'
    : tone === 'neutral'
    ? 'ui-avatar--neutral'
    : 'ui-avatar--primary'

  const initials = name
    ? name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('')
    : 'U'

  return (
    <div className={`avatar ui-avatar ${sizeClass} ${toneClass} ${className}`} {...props}>
      {src ? (
        <img src={src} alt={name} className="ui-avatar-img" />
      ) : (
        <span className="ui-avatar-initials">{initials}</span>
      )}
    </div>
  )
}

// 11. StatsCard / MetricCard
export function MetricCard({
  label,
  value,
  delta = null,
  deltaType = 'positive',
  icon = null,
  subtext = null,
  className = '',
  ...props
}) {
  return (
    <div className={`bento-metric ${className}`} {...props}>
      <div className="bento-metric-header">
        <span className="bento-metric-label">{label}</span>
        {icon && <span className="bento-metric-icon">{icon}</span>}
      </div>
      <div className="bento-metric-body">
        <b className="bento-metric-value">{value}</b>
        {delta && (
          <span className={`bento-metric-delta delta--${deltaType}`}>
            {delta}
          </span>
        )}
      </div>
      {subtext && <small className="bento-metric-subtext">{subtext}</small>}
    </div>
  )
}
export const StatsCard = MetricCard

// 12. InfluencerCard (Asymmetric layout: large, medium, compact)
export function InfluencerCard({
  creator,
  size = 'medium', // 'large' | 'medium' | 'compact'
  onSelect = null,
  onMessage = null,
  className = '',
}) {
  const {
    id,
    name,
    username,
    niche,
    followersCount,
    engagementRate,
    location,
    rateCard,
    profileImageUrl,
    bio,
  } = creator

  const handle = username || (name ? `@${name.toLowerCase().replace(/\s+/g, '')}` : '@creator')
  const formattedFollowers = typeof followersCount === 'number'
    ? followersCount >= 1000000
      ? `${(followersCount / 1000000).toFixed(1)}M`
      : followersCount >= 1000
      ? `${(followersCount / 1000).toFixed(0)}K`
      : followersCount.toLocaleString()
    : followersCount || '10K+'

  const reelRate = rateCard?.reel || creator.budget || 2500

  if (size === 'compact') {
    return (
      <article className={`creator-card creator-card--compact ${className}`}>
        <Avatar name={name} src={profileImageUrl} size="sm" tone="secondary" />
        <div className="creator-card-main">
          <h4>{name}</h4>
          <p>{niche} · {location}</p>
        </div>
        <div className="creator-card-rate">
          <b>₹{Number(reelRate).toLocaleString()}</b>
          <small>/ reel</small>
        </div>
        <Link to={`/influencers/${id}`} className="ui-button ui-btn--ghost ui-btn--sm">
          View
        </Link>
      </article>
    )
  }

  if (size === 'large') {
    return (
      <article className={`creator-card creator-card--large ${className}`}>
        <div className="creator-card-badge-row">
          <Badge variant="accent">Featured Creator</Badge>
          <span className="creator-card-available">Available</span>
        </div>
        <div className="creator-card-header">
          <Avatar name={name} src={profileImageUrl} size="lg" tone="secondary" />
          <div>
            <h3>{name} <span className="verified-check" title="Verified Creator">✓</span></h3>
            <p className="creator-handle">{handle}</p>
            <div className="creator-meta-pills">
              <span className="meta-pill">{niche}</span>
              <span className="meta-pill">{location}</span>
            </div>
          </div>
        </div>

        {bio && <p className="creator-bio">{bio}</p>}

        <div className="creator-card-metrics">
          <div>
            <b>{formattedFollowers}</b>
            <small>Followers</small>
          </div>
          <div>
            <b>{engagementRate}%</b>
            <small>Engagement</small>
          </div>
          <div>
            <b>₹{Number(reelRate).toLocaleString()}</b>
            <small>Starting / Reel</small>
          </div>
        </div>

        <div className="creator-card-actions">
          <Link to={`/influencers/${id}`} className="ui-button ui-btn--secondary ui-btn--sm">
            View Profile
          </Link>
          <button
            type="button"
            className="ui-button ui-btn--primary ui-btn--sm"
            onClick={() => onMessage ? onMessage(creator) : onSelect ? onSelect(creator) : null}
          >
            Message
          </button>
        </div>
      </article>
    )
  }

  // Medium (Default)
  return (
    <article className={`creator-card creator-card--medium ${className}`}>
      <div className="creator-card-header">
        <Avatar name={name} src={profileImageUrl} size="md" tone="secondary" />
        <div>
          <h3>{name} <span className="verified-check">✓</span></h3>
          <p className="creator-handle">{handle}</p>
        </div>
        <span className="creator-card-pill">{niche}</span>
      </div>

      <div className="creator-card-metrics">
        <div>
          <b>{formattedFollowers}</b>
          <small>Followers</small>
        </div>
        <div>
          <b>{engagementRate}%</b>
          <small>Engagement</small>
        </div>
        <div>
          <b>₹{Number(reelRate).toLocaleString()}</b>
          <small>Reel</small>
        </div>
      </div>

      <div className="creator-card-footer">
        <span className="creator-location">{location}</span>
        <div className="creator-card-actions">
          <Link to={`/influencers/${id}`} className="ui-button ui-btn--ghost ui-btn--sm">
            Profile
          </Link>
          <button
            type="button"
            className="ui-button ui-btn--outline ui-btn--sm"
            onClick={() => onMessage ? onMessage(creator) : onSelect ? onSelect(creator) : null}
          >
            Connect
          </button>
        </div>
      </div>
    </article>
  )
}
export const ProfileCard = InfluencerCard

// 13. SectionHeading
export function SectionHeading({
  eyebrow = null,
  title,
  description = null,
  align = 'left',
  action = null,
  className = '',
  ...props
}) {
  return (
    <div className={`section-heading section-heading--${align} ${className}`} {...props}>
      <div className="section-heading-content">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-desc">{description}</p>}
      </div>
      {action && <div className="section-heading-action">{action}</div>}
    </div>
  )
}

// 14. Divider
export function Divider({ label = null, className = '' }) {
  return (
    <div className={`ui-divider ${label ? 'has-label' : ''} ${className}`}>
      {label ? <span>{label}</span> : null}
    </div>
  )
}

// 15. Modal
export function Modal({ isOpen = true, onClose, title, children, className = '' }) {
  if (!isOpen) return null
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true" onClick={onClose}>
      <div className={`modal ${className}`} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="x" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {title && <h2 className="modal-title">{title}</h2>}
        {children}
      </div>
    </div>
  )
}

// 16. States
export function LoadingState({ label = 'Loading…', className = '' }) {
  return (
    <div className={`state loading ${className}`} role="status">
      <span className="state-spinner" aria-hidden="true" />
      <span className="state-text">{label}</span>
    </div>
  )
}

export function ErrorState({ error, onRetry = null, className = '' }) {
  return (
    <div className={`state error ${className}`} role="alert">
      <div className="state-error-icon">!</div>
      <div className="state-error-body">
        <span className="state-error-title">Error</span>
        <span className="state-text">{typeof error === 'string' ? error : error?.message || 'An error occurred'}</span>
      </div>
      {onRetry && (
        <button type="button" onClick={onRetry} className="state-retry-btn">
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title = null,
  children = 'Nothing to show yet.',
  icon = null,
  action = null,
  className = '',
}) {
  return (
    <div className={`state empty ${className}`}>
      {icon && <div className="state-empty-icon">{icon}</div>}
      {title && <h3 className="state-empty-title">{title}</h3>}
      <div className="state-text">{children}</div>
      {action && <div className="state-empty-action">{action}</div>}
    </div>
  )
}
