import React from 'react'
import './ProfileCard.css'

export default function CampaignCard({
  id,
  brandId,
  title = 'Campaign Brief',
  productName,
  brand = 'Verified Brand',
  brandLogoUrl = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300',
  budget = '₹25,000 – ₹45,000',
  budgetRange,
  description = 'Looking for authentic creators to showcase upcoming product deliverables.',
  onSelect,
  className = ''
}) {
  const displayProduct = productName || title
  const displayBudget = budget || budgetRange || '₹25,000 – ₹45,000'

  const handleCardClick = (e) => {
    if (onSelect) {
      onSelect(e)
    }
  }

  return (
    <article
      className={`campaign-showcase-card ${className}`.trim()}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick(e)
        }
      }}
    >
      {/* 1. Top: Brand Logo and Brand Name */}
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
          <div className="campaign-brand-meta">
            <h4 className="campaign-brand-name">
              {brand}
              <span className="brand-verified-icon" title="Verified Brand">✓</span>
            </h4>
            <span className="campaign-brand-tag">Verified Brand Partner</span>
          </div>
        </div>
      </div>

      {/* 2. Product Name & 3. Short detail in 2 lines */}
      <div className="campaign-card-body">
        <div className="campaign-product-wrap">
          <span className="campaign-product-kicker">Featured Product Advert</span>
          <h3 className="campaign-title">{displayProduct}</h3>
        </div>

        <p className="campaign-desc-2lines" title={description}>
          {description}
        </p>
      </div>

      {/* 4. Amount Brand Pays & Action Button (That's it!) */}
      <div className="campaign-card-footer">
        <div className="campaign-budget-box">
          <span className="campaign-budget-label">Brand Pays</span>
          <strong className="campaign-budget-val">{displayBudget}</strong>
        </div>

        <button
          type="button"
          className="campaign-action-btn"
          onClick={(e) => {
            e.stopPropagation()
            handleCardClick(e)
          }}
        >
          <span>View Campaign</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  )
}
