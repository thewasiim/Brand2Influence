import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import './FocusCardSlider.css';

/**
 * FocusCardSlider:
 * A 3D Coverflow-style horizontal card slider with focal depth.
 * - Center card: in sharp focus (scale 1.02, blur 0px, opacity 1, high z-index).
 * - Side cards: blurred (scale down, blur 4px - 8px, opacity 0.6 - 0.35, lower z-index).
 * - Supports native touch swipe & flick, smooth drag, arrow controls, dot navigation,
 *   keyboard navigation, trackpad horizontal swipe, and click-to-focus on side cards.
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

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const isDraggingRef = useRef(false);
  const justSwipedRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0, startTrackX: 0 });
  const isHorizontalGestureRef = useRef(null); // null = unknown, true = horizontal swipe, false = vertical page scroll
  const wheelLockRef = useRef(false);

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

  // Dynamic responsive card width
  const responsiveCardWidth = Math.min(
    cardWidth,
    containerWidth > 0 ? Math.max(containerWidth * 0.78, 270) : cardWidth
  );
  const itemTotalSpan = responsiveCardWidth + cardGap;
  const centerOffset = (containerWidth - responsiveCardWidth) / 2;
  const trackTranslateX = centerOffset - activeIndex * itemTotalSpan;

  const trackX = useMotionValue(trackTranslateX);

  // Animate track translation when activeIndex or dimensions change, unless actively dragging
  useEffect(() => {
    if (!isDraggingRef.current) {
      animate(trackX, trackTranslateX, {
        type: 'spring',
        stiffness: 280,
        damping: 30,
        mass: 0.8,
      });
    }
  }, [trackTranslateX, activeIndex]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  const handleCardClick = (index, e) => {
    if (justSwipedRef.current || isDraggingRef.current) {
      e.stopPropagation();
      return;
    }
    if (index !== activeIndex) {
      e.stopPropagation();
      setActiveIndex(index);
    }
  };

  const handleClickCapture = (e) => {
    // Intercept clicks during or immediately following a swipe gesture to prevent accidental navigation
    if (justSwipedRef.current || isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  // Trackpad / Horizontal Wheel scroll
  const handleWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 20) {
      if (wheelLockRef.current) return;
      wheelLockRef.current = true;
      if (e.deltaX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 380);
    }
  };

  // ==========================================
  // Direct Touch Event Handlers (Mobile / Touch)
  // ==========================================
  const handleTouchStart = (e) => {
    if (items.length <= 1) return;
    const touch = e.touches[0];
    isHorizontalGestureRef.current = null;
    isDraggingRef.current = false;
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      startTrackX: trackX.get(),
    };
  };

  const handleTouchMove = (e) => {
    if (items.length <= 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Detect gesture direction early
    if (isHorizontalGestureRef.current === null) {
      if (Math.hypot(deltaX, deltaY) > 8) {
        if (Math.abs(deltaX) >= Math.abs(deltaY)) {
          // Horizontal swipe on card slider
          isHorizontalGestureRef.current = true;
          isDraggingRef.current = true;
          setIsDragging(true);
        } else {
          // Vertical swipe for page scroll - do not intervene
          isHorizontalGestureRef.current = false;
          return;
        }
      } else {
        return;
      }
    }

    if (isHorizontalGestureRef.current === false) {
      return;
    }

    // Prevent vertical jitter when horizontally swiping the carousel
    if (e.cancelable) {
      e.preventDefault();
    }

    // Apply soft elastic resistance at slider ends
    let effectiveDeltaX = deltaX;
    const currIdx = activeIndexRef.current;
    if ((currIdx === 0 && deltaX > 0) || (currIdx === items.length - 1 && deltaX < 0)) {
      effectiveDeltaX = deltaX * 0.35;
    }

    trackX.set(touchStartRef.current.startTrackX + effectiveDeltaX);
  };

  const handleTouchEnd = (e) => {
    if (isHorizontalGestureRef.current === true) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaTime = Math.max(1, Date.now() - touchStartRef.current.time);
      const velocity = deltaX / deltaTime;

      justSwipedRef.current = true;
      setTimeout(() => {
        justSwipedRef.current = false;
        isDraggingRef.current = false;
        setIsDragging(false);
      }, 160);

      let targetIndex = activeIndexRef.current;
      const threshold = Math.min(responsiveCardWidth * 0.16, 42);

      if (Math.abs(deltaX) > threshold || Math.abs(velocity) > 0.22) {
        if (deltaX < 0) {
          // Swiped left -> advance forward
          const spanJump = Math.max(1, Math.round(Math.abs(deltaX) / itemTotalSpan));
          targetIndex = Math.min(items.length - 1, activeIndexRef.current + spanJump);
        } else {
          // Swiped right -> go backward
          const spanJump = Math.max(1, Math.round(Math.abs(deltaX) / itemTotalSpan));
          targetIndex = Math.max(0, activeIndexRef.current - spanJump);
        }
      }

      const finalTrackX = centerOffset - targetIndex * itemTotalSpan;
      animate(trackX, finalTrackX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      });

      if (targetIndex !== activeIndexRef.current) {
        setActiveIndex(targetIndex);
      }
    } else {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
    isHorizontalGestureRef.current = null;
  };

  // ==========================================
  // Mouse Drag Handlers (Desktop Mouse Users)
  // ==========================================
  const handleMouseDown = (e) => {
    if (e.button !== 0 || items.length <= 1) return; // Only left click
    const startX = e.clientX;
    const startTime = Date.now();
    const startTrackX = trackX.get();
    let hasMoved = false;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      if (!hasMoved && Math.abs(deltaX) > 5) {
        hasMoved = true;
        isDraggingRef.current = true;
        setIsDragging(true);
      }

      if (hasMoved) {
        let effectiveDeltaX = deltaX;
        const currIdx = activeIndexRef.current;
        if ((currIdx === 0 && deltaX > 0) || (currIdx === items.length - 1 && deltaX < 0)) {
          effectiveDeltaX = deltaX * 0.35;
        }
        trackX.set(startTrackX + effectiveDeltaX);
      }
    };

    const onMouseUp = (upEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (hasMoved) {
        const deltaX = upEvent.clientX - startX;
        const deltaTime = Math.max(1, Date.now() - startTime);
        const velocity = deltaX / deltaTime;

        justSwipedRef.current = true;
        setTimeout(() => {
          justSwipedRef.current = false;
          isDraggingRef.current = false;
          setIsDragging(false);
        }, 160);

        let targetIndex = activeIndexRef.current;
        const threshold = Math.min(responsiveCardWidth * 0.16, 42);

        if (Math.abs(deltaX) > threshold || Math.abs(velocity) > 0.22) {
          if (deltaX < 0) {
            const spanJump = Math.max(1, Math.round(Math.abs(deltaX) / itemTotalSpan));
            targetIndex = Math.min(items.length - 1, activeIndexRef.current + spanJump);
          } else {
            const spanJump = Math.max(1, Math.round(Math.abs(deltaX) / itemTotalSpan));
            targetIndex = Math.max(0, activeIndexRef.current - spanJump);
          }
        }

        const finalTrackX = centerOffset - targetIndex * itemTotalSpan;
        animate(trackX, finalTrackX, {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        });

        if (targetIndex !== activeIndexRef.current) {
          setActiveIndex(targetIndex);
        }
      } else {
        isDraggingRef.current = false;
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      id={id}
      className={`focus-slider-container ${className}`.trim()}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      role="region"
      aria-label="Interactive Card Slider"
    >
      {/* Top Slider Navigation & Controls */}
      <div className="focus-slider-controls-top">
        <div className="focus-slider-hint">
          <span className="focus-slider-hint-dot" />
          <span>Spotlight Showcase • Click or swipe cards</span>
        </div>

        <div className="focus-slider-right-cluster">
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
      </div>

      {/* Slider Viewport & Moving Track */}
      <div className="focus-slider-viewport">
        {/* Soft edge gradient fades for seamless depth */}
        <div className="focus-slider-edge-fade edge-fade-left" aria-hidden="true" />
        <div className="focus-slider-edge-fade edge-fade-right" aria-hidden="true" />

        <motion.div
          className={`focus-slider-track ${isDragging ? 'is-dragging' : ''}`}
          style={{ x: trackX, gap: `${cardGap}px` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onClickCapture={handleClickCapture}
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
              cardScale = 1.02;
              cardBlur = 0;
              cardOpacity = 1;
              cardZIndex = 12;
            } else if (distance === 1) {
              cardScale = 0.96;
              cardBlur = 0;
              cardOpacity = 0.9;
              cardZIndex = 8;
            } else if (distance === 2) {
              cardScale = 0.88;
              cardBlur = 2;
              cardOpacity = 0.65;
              cardZIndex = 4;
            } else {
              cardScale = 0.8;
              cardBlur = 4;
              cardOpacity = 0.35;
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
