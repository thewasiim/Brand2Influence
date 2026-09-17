import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import './StaggeredMenu.css';

// Helper to determine if a hex/color string is light or dark
const checkIsLightColor = colorStr => {
  if (!colorStr) return false;
  let hex = colorStr.trim().replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) {
    if (colorStr.toLowerCase() === 'white' || colorStr.toLowerCase() === '#fff') return true;
    return false;
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 160;
};

export const StaggeredMenu = ({
  position = 'right',
  colors = ['#18181B', '#09090B'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  logoUrl,
  menuButtonColor = '#FFFFFF',
  openMenuButtonColor = '#FFFFFF',
  accentColor = '#FFFFFF',
  panelBg = '#09090B',
  changeMenuColorOnOpen = true,
  isFixed = false,
  closeOnClickAway = true,
  ctaLabel,
  ctaLink,
  onCtaClick,
  loginLabel,
  loginLink,
  onLoginClick,
  onMenuOpen,
  onMenuClose
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const openRef = useRef(false);

  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const textWrapRef = useRef(null);
  const toggleBtnRef = useRef(null);

  const tlRef = useRef(null);
  const isLightPanel = checkIsLightColor(panelBg);

  /* Lock body scroll while menu is open */
  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  // Initial layout setup - ensures element is positioned offscreen by GSAP as well
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    const backdrop = backdropRef.current;
    const plusH = plusHRef.current;
    const plusV = plusVRef.current;
    const icon = iconRef.current;
    const textInner = textInnerRef.current;

    if (!panel) return;

    const layers = preContainer ? Array.from(preContainer.querySelectorAll('.sm-prelayer')) : [];
    const offscreen = position === 'left' ? -100 : 100;

    gsap.set([panel, ...layers], { xPercent: offscreen });
    if (backdrop) gsap.set(backdrop, { opacity: 0 });
    if (plusH) gsap.set(plusH, { rotate: 0 });
    if (plusV) gsap.set(plusV, { rotate: 90 });
    if (icon) gsap.set(icon, { rotate: 0 });
    if (textInner) gsap.set(textInner, { yPercent: 0 });
    if (toggleBtnRef.current) {
      gsap.set(toggleBtnRef.current, { color: menuButtonColor || '#FFFFFF' });
    }
  }, [position, menuButtonColor]);

  // Animate Open Timeline
  const animateOpen = useCallback(() => {
    tlRef.current?.kill();

    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    const backdrop = backdropRef.current;
    const plusH = plusHRef.current;
    const plusV = plusVRef.current;
    const icon = iconRef.current;
    const textInner = textInnerRef.current;
    const btn = toggleBtnRef.current;

    if (!panel) return;

    const layers = preContainer ? Array.from(preContainer.querySelectorAll('.sm-prelayer')) : [];
    const itemLabels = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const numbers = Array.from(panel.querySelectorAll('.sm-panel-item'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
    const actionsRow = panel.querySelector('.sm-actions');

    const offscreen = position === 'left' ? -100 : 100;
    const tl = gsap.timeline();

    // 0. Ensure panel, layers and content are visible before sliding
    gsap.set([panel, ...layers], { visibility: 'visible' });
    if (itemLabels.length) gsap.set(itemLabels, { opacity: 1, y: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 1 });
    if (socialLinks.length) gsap.set(socialLinks, { opacity: 1, y: 0 });
    if (actionsRow) gsap.set(actionsRow, { opacity: 1, y: 0 });

    // 1. Fade backdrop
    if (backdrop) {
      tl.to(backdrop, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0);
    }

    // 2. Slide prelayers
    layers.forEach((layer, i) => {
      tl.fromTo(layer, { xPercent: offscreen }, { xPercent: 0, duration: 0.35, ease: 'power3.out' }, i * 0.04);
    });

    // 3. Slide drawer panel
    const panelDelay = layers.length ? 0.06 : 0;
    tl.fromTo(panel, { xPercent: offscreen }, { xPercent: 0, duration: 0.4, ease: 'power3.out' }, panelDelay);

    // 4. Stagger menu item entrance
    if (itemLabels.length) {
      tl.fromTo(
        itemLabels,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out', stagger: 0.04 },
        panelDelay + 0.05
      );
    }
    if (numbers.length) {
      tl.to(
        numbers,
        { '--sm-num-opacity': 1, duration: 0.3, ease: 'power2.out', stagger: 0.04 },
        panelDelay + 0.05
      );
    }

    // 5. Socials & Action buttons entrance
    if (socialTitle || socialLinks.length || actionsRow) {
      const extraStart = panelDelay + 0.1;
      if (socialTitle) {
        tl.fromTo(socialTitle, { opacity: 0 }, { opacity: 1, duration: 0.3 }, extraStart);
      }
      if (socialLinks.length) {
        tl.fromTo(
          socialLinks,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out', stagger: 0.03 },
          extraStart
        );
      }
      if (actionsRow) {
        tl.fromTo(
          actionsRow,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
          extraStart
        );
      }
    }

    // 6. Icon spin (Plus to X)
    if (icon && plusH && plusV) {
      tl.to(icon, { rotate: 225, duration: 0.6, ease: 'power3.out' }, 0);
    }

    // 7. Button text flip (Menu -> Close)
    if (textInner) {
      tl.to(textInner, { yPercent: -50, duration: 0.4, ease: 'power3.out' }, 0);
    }

    // 8. Toggle button color
    if (btn && changeMenuColorOnOpen) {
      tl.to(btn, { color: openMenuButtonColor || '#FFFFFF', duration: 0.3 }, 0);
    }

    tlRef.current = tl;
  }, [position, changeMenuColorOnOpen, openMenuButtonColor]);

  // Animate Close Timeline
  const animateClose = useCallback(onDone => {
    tlRef.current?.kill();

    const panel = panelRef.current;
    const preContainer = preLayersRef.current;
    const backdrop = backdropRef.current;
    const icon = iconRef.current;
    const textInner = textInnerRef.current;
    const btn = toggleBtnRef.current;

    if (!panel) {
      onDone?.();
      return;
    }

    const layers = preContainer ? Array.from(preContainer.querySelectorAll('.sm-prelayer')) : [];
    const offscreen = position === 'left' ? -100 : 100;
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set([panel, ...layers], { visibility: 'hidden' });
        onDone?.();
      }
    });

    // 1. Backdrop fade out
    if (backdrop) {
      tl.to(backdrop, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0);
    }

    // 2. Slide drawer panel out
    tl.to(panel, { xPercent: offscreen, duration: 0.35, ease: 'power3.in' }, 0);

    // 3. Slide prelayers out
    layers.forEach((layer, i) => {
      tl.to(layer, { xPercent: offscreen, duration: 0.3, ease: 'power3.in' }, 0.03 * i);
    });

    // 4. Icon spin back
    if (icon) {
      tl.to(icon, { rotate: 0, duration: 0.35, ease: 'power3.inOut' }, 0);
    }

    // 5. Button text flip back
    if (textInner) {
      tl.to(textInner, { yPercent: 0, duration: 0.35, ease: 'power3.inOut' }, 0);
    }

    // 6. Button color back
    if (btn && changeMenuColorOnOpen) {
      tl.to(btn, { color: menuButtonColor || '#FFFFFF', duration: 0.3 }, 0);
    }

    tlRef.current = tl;
  }, [position, changeMenuColorOnOpen, menuButtonColor]);

  const toggleMenu = useCallback(() => {
    const target = !openRef.current;
    openRef.current = target;

    if (target) {
      setOpen(true);
      onMenuOpen?.();
      animateOpen();
    } else {
      onMenuClose?.();
      animateClose(() => {
        setOpen(false);
      });
    }
  }, [animateOpen, animateClose, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback(() => {
    if (openRef.current) {
      openRef.current = false;
      onMenuClose?.();
      animateClose(() => {
        setOpen(false);
      });
    }
  }, [animateClose, onMenuClose]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = event => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnClickAway, open, closeMenu]);

  const handleItemClick = (e, item) => {
    if (item.onClick) item.onClick(e);
    closeMenu();

    if (item.link) {
      if (item.link.startsWith('#')) {
        e.preventDefault();
        const targetEl = document.getElementById(item.link.slice(1));
        targetEl?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      if (item.link.startsWith('/') && !item.link.startsWith('http')) {
        e.preventDefault();
        if (item.link === '/how-it-works' && location.pathname === '/') {
          document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        if ((item.link === '/for-brands' || item.link === '/for-influencers') && location.pathname === '/') {
          document.getElementById('roles-bento')?.scrollIntoView({ behavior: 'smooth' });
          return;
        }
        navigate(item.link);
      }
    }
  };

  const handleActionClick = (e, link, customOnClick) => {
    if (customOnClick) customOnClick(e);
    closeMenu();
    if (link && link.startsWith('/') && !link.startsWith('http')) {
      e.preventDefault();
      navigate(link);
    }
  };

  // Dynamic CSS Variables based on panelBg lightness
  const isLightAccent = checkIsLightColor(accentColor || '#FFFFFF');
  const panelStyle = {
    '--sm-bg': panelBg || '#09090B',
    '--sm-text': isLightPanel ? '#0A0A0A' : '#FFFFFF',
    '--sm-text-muted': isLightPanel ? '#71717A' : 'rgba(255, 255, 255, 0.6)',
    '--sm-border': isLightPanel ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)',
    '--sm-btn-sec-bg': isLightPanel ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
    '--sm-btn-sec-text': isLightPanel ? '#0A0A0A' : '#FFFFFF',
    '--sm-btn-sec-border': isLightPanel ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.25)',
    '--sm-accent': accentColor || '#FFFFFF',
    '--sm-btn-pri-bg': accentColor || '#FFFFFF',
    '--sm-btn-pri-text': isLightAccent ? '#09090B' : '#FFFFFF'
  };

  return (
    <div
      className={(className ? className + ' ' : '') + 'staggered-menu-wrapper' + (isFixed ? ' fixed-wrapper' : '')}
      style={{ ['--sm-accent']: accentColor }}
      data-position={position}
      data-open={open || undefined}
    >
      {/* Translucent backdrop dimming for main page area */}
      <div
        ref={backdropRef}
        className="sm-backdrop"
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Pre-layers constrained strictly to drawer panel width */}
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {(() => {
          const raw = colors && colors.length ? colors.slice(0, 4) : ['#18181B', '#09090B'];
          let arr = [...raw];
          if (arr.length >= 3) {
            const mid = Math.floor(arr.length / 2);
            arr.splice(mid, 1);
          }
          return arr.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />);
        })()}
      </div>

      <header className="staggered-menu-header" aria-label="Main navigation header">
        {logoUrl && (
          <div className="sm-logo" aria-label="Logo">
            <img
              src={logoUrl}
              alt="Logo"
              className="sm-logo-img"
              draggable={false}
            />
          </div>
        )}
        <button
          ref={toggleBtnRef}
          className="sm-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="staggered-menu-panel"
          onClick={toggleMenu}
          type="button"
        >
          <span ref={textWrapRef} className="sm-toggle-textWrap" aria-hidden="true">
            <span ref={textInnerRef} className="sm-toggle-textInner">
              <span className="sm-toggle-line">Menu</span>
              <span className="sm-toggle-line">Close</span>
            </span>
          </span>
          <span ref={iconRef} className="sm-icon" aria-hidden="true">
            <span ref={plusHRef} className="sm-icon-line" />
            <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
          </span>
        </button>
      </header>

      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        style={panelStyle}
        aria-hidden={!open}
      >
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" role="list" data-numbering={displayItemNumbering || undefined}>
            {items && items.length ? (
              items.map((it, idx) => (
                <li className="sm-panel-itemWrap" key={it.label + idx}>
                  <a
                    className="sm-panel-item"
                    href={it.link || '#'}
                    aria-label={it.ariaLabel || it.label}
                    data-index={idx + 1}
                    onClick={e => handleItemClick(e, it)}
                  >
                    <span className="sm-panel-itemLabel">{it.label}</span>
                  </a>
                </li>
              ))
            ) : (
              <li className="sm-panel-itemWrap" aria-hidden="true">
                <span className="sm-panel-item">
                  <span className="sm-panel-itemLabel">No items</span>
                </span>
              </li>
            )}
          </ul>

          {(displaySocials && socialItems && socialItems.length > 0) || (loginLabel || ctaLabel) ? (
            <div className="sm-socials" aria-label="Social links & actions">
              {displaySocials && socialItems && socialItems.length > 0 && (
                <>
                  <h3 className="sm-socials-title">Socials</h3>
                  <ul className="sm-socials-list" role="list">
                    {socialItems.map((s, i) => (
                      <li key={s.label + i} className="sm-socials-item">
                        <a href={s.link} target="_blank" rel="noopener noreferrer" className="sm-socials-link">
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {(loginLabel || ctaLabel) && (
                <div className="sm-actions">
                  {loginLabel && (
                    <a
                      href={loginLink || '#'}
                      className="sm-btn-secondary"
                      style={{
                        color: isLightPanel ? '#0A0A0A' : '#FFFFFF',
                        borderColor: isLightPanel ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.25)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        padding: '0.75rem 1.25rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                      onClick={e => handleActionClick(e, loginLink, onLoginClick)}
                    >
                      <span
                        className="sm-btn-label"
                        style={{
                          color: isLightPanel ? '#0A0A0A' : '#FFFFFF',
                          fontWeight: 600,
                          fontSize: '0.95rem'
                        }}
                      >
                        {loginLabel}
                      </span>
                    </a>
                  )}
                  {ctaLabel && (
                    <a
                      href={ctaLink || '#'}
                      className="sm-btn-primary"
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#09090B',
                        border: '1px solid rgba(255, 255, 255, 0.9)',
                        borderRadius: 'var(--radius-pill, 9999px)',
                        padding: '0.75rem 1.25rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                      onClick={e => handleActionClick(e, ctaLink, onCtaClick)}
                    >
                      <span
                        className="sm-btn-label"
                        style={{
                          color: '#09090B',
                          fontWeight: 700,
                          fontSize: '0.95rem'
                        }}
                      >
                        {ctaLabel}
                      </span>
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
};

export default StaggeredMenu;
