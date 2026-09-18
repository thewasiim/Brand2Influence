import React from 'react'
import { Badge, Button } from '../ui'
import './ProfileCard.css'

export default function CampaignCard({
  id,
  title = 'Campaign Brief',
  brand = 'Verified Brand',
  brandLogoUrl = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300',
  niche = 'Fashion',
  platform = 'Instagram',
  budget = '₹25,000 – ₹45,000',
  deliverables = ['2x Reels', '3x Stories'],
  targetFollowers = '20,000+',
  location = 'Pan-India',
  description = 'Looking for authentic creators to showcase upcoming campaign deliverables.',
  onSelect,
  className = ''
}) {
  return (
    <article
      className={`campaign-showcase-card ${className}`.trim()}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(e)
        }
      }}
    >
      {/* Top Header: Brand & Badges */}
      <div className="campaign-card-header">
        <div className="campaign-brand-info">
          <div className="campaign-brand-logo">
            <img
              src={brandLogoUrl}
              alt={`${brand} logo`}
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300'
              }}
            />
          </div>
          <div>
            <h4 className="campaign-brand-name">{brand}</h4>
            <span className="campaign-location-text">{location}</span>
          </div>
        </div>

        <div className="campaign-badge-group">
          <Badge variant="primary" size="sm">{platform}</Badge>
          <Badge variant="accent" size="sm">{niche}</Badge>
        </div>
      </div>

      {/* Campaign Title & Description */}
      <div className="campaign-card-body">
        <h3 className="campaign-title">{title}</h3>
        <p className="campaign-desc">{description}</p>

        {/* Deliverables Tags */}
        {deliverables?.length > 0 && (
          <div className="campaign-deliverables-wrap">
            {deliverables.map((item, idx) => (
              <span key={idx} className="campaign-deliverable-chip">
                ✓ {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Footer: Budget & CTA */}
      <div className="campaign-card-footer">
        <div className="campaign-budget-box">
          <span className="campaign-budget-label">Sponsorship Budget</span>
          <strong className="campaign-budget-val">{budget}</strong>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="campaign-action-btn"
          onClick={(e) => {
            e.stopPropagation()
            onSelect?.(e)
          }}
        >
          View Brief →
        </Button>
      </div>
    </article>
  )
}
