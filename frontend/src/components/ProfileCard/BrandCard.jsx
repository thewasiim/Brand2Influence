import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import './ProfileCard.css';

const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v, precision = 3) => parseFloat(v.toFixed(precision));
const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

export const BrandCard = ({
  title = 'Specialty Coffee & Cold Brew Reels',
  brand = 'Blue Tokai Coffee Roasters',
  brandLogoUrl = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=300',
  brandImageUrl = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800',
  niche = 'Food & Beverage',
  platform = 'Instagram',
  budget = '₹6,000–₹12,000',
  location = 'Mumbai / Delhi NCR',
  deliverables = ['1 Reel (30-60s)', '2 Stories'],
  desc = 'Looking for coffee enthusiast creators to feature our new cold brew cans.',
  onApplyClick,
  className = ''
}) => {
  const wrapRef = useRef(null);
  const shellRef = useRef(null);
  const enterTimerRef = useRef(null);
  const leaveRafRef = useRef(null);

  const tiltEngine = useMemo(() => {
    let rafId = null;
    let running = false;
    let lastTs = 0;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const DEFAULT_TAU = 0.14;
    const INITIAL_TAU = 0.6;
    let initialUntil = 0;

    const setVarsFromXY = (x, y) => {
      const shell = shellRef.current;
      const wrap = wrapRef.current;
      if (!shell || !wrap) return;

      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;

      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);

      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        '--pointer-from-top': `${percentY / 100}`,
        '--pointer-from-left': `${percentX / 100}`,
        '--rotate-x': `${round(-(centerX / 8))}deg`,
        '--rotate-y': `${round(centerY / 6)}deg`
      };

      for (const [k, v] of Object.entries(properties)) wrap.style.setProperty(k, v);
    };

    const step = ts => {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      const k = 1 - Math.exp(-dt / tau);

      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;

      setVarsFromXY(currentX, currentY);

      const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;

      if (stillFar || document.hasFocus()) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setImmediate(x, y) {
        currentX = x;
        currentY = y;
        setVarsFromXY(currentX, currentY);
      },
      setTarget(x, y) {
        targetX = x;
        targetY = y;
        start();
      },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      beginInitial(durationMs) {
        initialUntil = performance.now() + durationMs;
        start();
      },
      getCurrent() {
        return { x: currentX, y: currentY, tx: targetX, ty: targetY };
      },
      cancel() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
        lastTs = 0;
      }
    };
  }, []);

  const getOffsets = (evt, el) => {
    const rect = el.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const handlePointerMove = useCallback(
    event => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;
      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine]
  );

  const handlePointerEnter = useCallback(
    event => {
      const shell = shellRef.current;
      if (!shell || !tiltEngine) return;

      shell.classList.add('active');
      shell.classList.add('entering');
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      enterTimerRef.current = window.setTimeout(() => {
        shell.classList.remove('entering');
      }, 180);

      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    },
    [tiltEngine]
  );

  const handlePointerLeave = useCallback(() => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine) return;

    tiltEngine.toCenter();

    const checkSettle = () => {
      const { x, y, tx, ty } = tiltEngine.getCurrent();
      const settled = Math.hypot(tx - x, ty - y) < 0.6;
      if (settled) {
        shell.classList.remove('active');
        leaveRafRef.current = null;
      } else {
        leaveRafRef.current = requestAnimationFrame(checkSettle);
      }
    };
    if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
    leaveRafRef.current = requestAnimationFrame(checkSettle);
  }, [tiltEngine]);

  useEffect(() => {
    if (!tiltEngine) return;
    const shell = shellRef.current;
    if (!shell) return;

    shell.addEventListener('pointerenter', handlePointerEnter);
    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', handlePointerLeave);

    const initialX = (shell.clientWidth || 0) - 70;
    const initialY = 60;
    tiltEngine.setImmediate(initialX, initialY);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(1200);

    return () => {
      shell.removeEventListener('pointerenter', handlePointerEnter);
      shell.removeEventListener('pointermove', handlePointerMove);
      shell.removeEventListener('pointerleave', handlePointerLeave);
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
      if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
      tiltEngine.cancel();
    };
  }, [tiltEngine, handlePointerMove, handlePointerEnter, handlePointerLeave]);

  return (
    <div ref={wrapRef} className={`pc-card-wrapper ${className}`.trim()}>
      <div className="pc-behind" style={{ ['--behind-glow-color']: 'rgba(59, 130, 246, 0.4)' }} />
      <div ref={shellRef} className="pc-card-shell">
        <article className="pc-card">
          <div className="pc-inside">
            {/* Background Cover Image */}
            <img
              className="pc-avatar-bg"
              src={brandImageUrl}
              alt={brand}
              loading="lazy"
              onError={e => {
                e.target.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800';
              }}
            />

            {/* Gradient Overlay */}
            <div className="pc-gradient-overlay" />

            {/* Holographic Shine & Glare */}
            <div className="pc-shine" />
            <div className="pc-glare" />

            {/* Top Bar (Platform + Niche Tag) */}
            <div className="pc-top-bar">
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <span className="pc-niche-tag">{platform}</span>
                <span className="pc-niche-tag" style={{ background: 'rgba(124, 58, 237, 0.75)' }}>{niche}</span>
              </div>
              <span className="pc-rate-tag" style={{ background: 'rgba(34, 197, 94, 0.85)' }}>{budget}</span>
            </div>

            {/* Bottom Overlay Info */}
            <div className="pc-bottom-info">
              {/* Brand Profile Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <div className="pc-mini-avatar" style={{ width: '40px', height: '40px' }}>
                  <img
                    src={brandLogoUrl || brandImageUrl}
                    alt={brand}
                    onError={e => { e.target.src = brandImageUrl; }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FDFAE2', lineHeight: 1.1 }}>
                    {brand} ✓
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(253, 250, 226, 0.7)' }}>
                    📍 {location}
                  </span>
                </div>
              </div>

              {/* Campaign Title */}
              <div className="pc-user-text-main">
                <h3 className="pc-name" style={{ fontSize: '1.2rem', lineHeight: 1.25 }}>
                  {title}
                </h3>
              </div>

              {/* Deliverables & Apply Button */}
              <div className="pc-metrics-row" style={{ marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="pc-metric-lbl">Deliverables</span>
                  <span className="pc-metric-val" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {deliverables.join(' • ')}
                  </span>
                </div>
                <button
                  type="button"
                  className="pc-contact-btn"
                  style={{ background: '#22C55E', boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)' }}
                  onClick={onApplyClick}
                >
                  Apply Brief
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BrandCard;
