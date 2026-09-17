import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import './FocusCardSlider.css';

/**
 * FocusCardSlider:
 * A 3D Coverflow-style horizontal card slider with focal depth.
 * - Center card: in sharp focus (scale 1.02, blur 0px, opacity 1, high z-index).
 * - Side cards: blurred (scale down, blur 4px - 8px, opacity 0.6 - 0.35, lower z-index).
 * - Supports drag/swipe, arrow controls, dot navigation, and click-to-focus on side cards.
 */
export default function FocusCardSlider({
  items = [],
  renderItem,
  cardWidth = 340,
  cardGap = 28,
  initialIndex = 0,
  className = '',
  id,
}) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  // Measure container width for precise centering
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Ensure activeIndex is within bounds when items change
  useEffect(() => {
    if (activeIndex >= items.length && items.length > 0) {
      setActiveIndex(Math.max(0, items.length - 1));
    }
  }, [items.length, activeIndex]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  const handleCardClick = (index, e) => {
    if (isDragging) return;
    if (index !== activeIndex) {
      e.stopPropagation();
      setActiveIndex(index);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  // Calculate dynamic responsive card width for mobile
  const responsiveCardWidth = Math.min(cardWidth, containerWidth > 0 ? Math.max(containerWidth * 0.78, 270) : cardWidth);
  const itemTotalSpan = responsiveCardWidth + cardGap;
  const centerOffset = (containerWidth - responsiveCardWidth) / 2;
  const trackTranslateX = centerOffset - activeIndex * itemTotalSpan;

  return (
    <div
      ref={containerRef}
      id={id}
      className={`focus-slider-container ${className}`.trim()}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label="Interactive Card Slider"
    >
      {/* Top Slider Navigation & Controls */}
      <div className="focus-slider-controls-top">
        <div className="focus-slider-counter">
          <span className="current-num">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span className="divider">/</span>
          <span className="total-num">{String(items.length).padStart(2, '0')}</span>
        </div>

        <div className="focus-slider-arrows">
          <button
            type="button"
            className="focus-slider-arrow-btn"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button
            type="button"
            className="focus-slider-arrow-btn"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Slider Viewport & Moving Track */}
      <div className="focus-slider-viewport">
        {/* Soft edge gradient fades for seamless depth */}
        <div className="focus-slider-edge-fade edge-fade-left" aria-hidden="true" />
        <div className="focus-slider-edge-fade edge-fade-right" aria-hidden="true" />

        <motion.div
          className="focus-slider-track"
          drag="x"
          dragConstraints={{ left: -((items.length - 1) * itemTotalSpan), right: 0 }}
          dragElastic={0.15}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(_, info) => {
            setTimeout(() => setIsDragging(false), 50);
            const offset = info.offset.x;
            const velocity = info.velocity.x;
            if (offset < -40 || velocity < -300) {
              if (activeIndex < items.length - 1) setActiveIndex(activeIndex + 1);
            } else if (offset > 40 || velocity > 300) {
              if (activeIndex > 0) setActiveIndex(activeIndex - 1);
            }
          }}
          animate={{ x: trackTranslateX }}
          transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.8 }}
          style={{ gap: `${cardGap}px` }}
        >
          {items.map((item, index) => {
            const distance = Math.abs(index - activeIndex);
            const isActive = index === activeIndex;

            // Compute focus depth styling
            let cardScale = 1;
            let cardBlur = 0;
            let cardOpacity = 1;
            let cardZIndex = 10;

            if (distance === 0) {
              cardScale = 1.03;
              cardBlur = 0;
              cardOpacity = 1;
              cardZIndex = 12;
            } else if (distance === 1) {
              cardScale = 0.90;
              cardBlur = 4.5;
              cardOpacity = 0.65;
              cardZIndex = 8;
            } else if (distance === 2) {
              cardScale = 0.80;
              cardBlur = 7.5;
              cardOpacity = 0.38;
              cardZIndex = 4;
            } else {
              cardScale = 0.72;
              cardBlur = 10;
              cardOpacity = 0.2;
              cardZIndex = 1;
            }

            return (
              <motion.div
                key={item.id || index}
                className={`focus-slider-item ${isActive ? 'is-active' : 'is-blurred-side'}`}
                style={{
                  width: `${responsiveCardWidth}px`,
                  zIndex: cardZIndex,
                }}
                animate={{
                  scale: cardScale,
                  filter: `blur(${cardBlur}px)`,
                  opacity: cardOpacity,
                }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => handleCardClick(index, e)}
              >
                {renderItem ? renderItem(item, { isActive, distance, index }) : null}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom Dot Indicators */}
      <div className="focus-slider-dots-container">
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`focus-slider-dot ${activeIndex === idx ? 'is-active' : ''}`}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to card ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
