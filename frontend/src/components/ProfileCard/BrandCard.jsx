import React from 'react';
import './ProfileCard.css';

export const BrandCard = ({
  id,
  brand = 'Blue Tokai Coffee Roasters',
  brandLogoUrl = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300',
  niche = 'Food & Beverage',
  platform = 'Instagram',
  budget = '₹6,000–₹12,000',
  location = 'Mumbai / Delhi NCR',
  onClick,
  onApplyClick,
  className = ''
}) => {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (onApplyClick) {
      onApplyClick(e);
    }
  };

  return (
    <article
      className={`brand-showcase-card ${className}`.trim()}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      {/* Brand Logo & Core Identity */}
      <div className="brand-card-identity">
        <div className="brand-logo-frame">
          <img
            src={brandLogoUrl}
            alt={`${brand} logo`}
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300';
            }}
          />
        </div>

        <div className="brand-name-group">
          <h3 className="brand-card-title">
            {brand}
            <span className="brand-verified-icon" title="Verified Brand">✓</span>
          </h3>
        </div>
      </div>

      {/* Budget & Price Banner */}
      <div className="brand-card-price-box">
        <span className="brand-price-label">Sponsorship Budget</span>
        <span className="brand-price-value">{budget}</span>
      </div>

      {/* Footer CTA */}
      <div className="brand-card-footer">
        <span className="brand-view-link">
          View Brand Campaigns
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"/>
            <path d="m12 5 7 7-7 7"/>
          </svg>
        </span>
      </div>
    </article>
  );
};

export default BrandCard;
