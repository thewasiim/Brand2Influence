import React from 'react';
import './ProfileCard.css';

export const BrandCard = ({
  id,
  brand = 'Blue Tokai Coffee Roasters',
  brandLogoUrl = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
  coverUrl,
  imageUrl,
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

  const displayImage = coverUrl || imageUrl || brandLogoUrl;

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
      {/* Full-Card Brand Image */}
      <img
        className="brand-card-bg-img"
        src={displayImage}
        alt={`${brand}`}
        loading="lazy"
        draggable={false}
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800';
        }}
      />

      {/* High-Contrast Gradient Overlay */}
      <div className="brand-card-gradient-overlay" />

      {/* Card Overlay Content: Brand Name & Button */}
      <div className="brand-card-body">
        <div className="brand-name-group">
          <h3 className="brand-card-title">
            {brand}
            <span className="brand-verified-icon" title="Verified Brand">✓</span>
          </h3>
        </div>

        <button
          type="button"
          className="brand-view-btn"
          onClick={(e) => {
            e.stopPropagation();
            handleClick(e);
          }}
        >
          <span>View Brand Campaigns</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </article>
  );
};

export default BrandCard;
