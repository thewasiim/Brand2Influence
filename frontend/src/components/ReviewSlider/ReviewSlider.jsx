import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge, Avatar } from '../ui'

const REVIEWS = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Marketing Lead',
    company: 'Kiro Beauty & Skincare',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    type: 'Brand Partner',
    rating: 5,
    metric: '3.8x Campaign ROI',
    metricSub: 'Over 8 creator partnerships',
    quote: 'Brand2Influence simplified our entire influencer outreach. We locked 8 beauty creators in under 3 days with 100% transparent rates and zero agency markup. The direct messaging made briefing effortless.'
  },
  {
    id: 2,
    name: 'Aanya Kapoor',
    role: 'Fashion Stylist & Creator',
    company: '185K Audience (Mumbai)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    type: 'Verified Creator',
    rating: 5,
    metric: '₹75,000+ Earned',
    metricSub: '5 confirmed collaborations',
    quote: 'As an independent creator, pitching brands used to mean endless unanswered DMs. Here, verified brands reach out directly with clear deliverables and upfront budgets. It gives creators genuine control.'
  },
  {
    id: 3,
    name: 'Rohan Varma',
    role: 'Co-Founder & Brand Head',
    company: 'Blue Tokai Roasters',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    type: 'Brand Partner',
    rating: 5,
    metric: '+46% Engagement',
    metricSub: 'Cold brew launch campaign',
    quote: 'The verified engagement rates saved us from vanity metrics. The food & lifestyle creators we collaborated with brought genuine coffee enthusiasts straight to our cafes and website.'
  },
  {
    id: 4,
    name: 'Kabir Mehta',
    role: 'Tech & Lifestyle Creator',
    company: '320K Audience (Delhi NCR)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    type: 'Verified Creator',
    rating: 5,
    metric: '12 Brand Deals',
    metricSub: '100% on-time milestone delivery',
    quote: 'The campaign brief and proposal workflow is the cleanest I have ever seen. You know the exact deliverables and expectations before even typing a message. A game changer for Indian creators.'
  }
]

export default function ReviewSlider() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef(null)

  const next = () => {
    setCurrent((prev) => (prev + 1) % REVIEWS.length)
  }

  const prev = () => {
    setCurrent((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length)
  }

  useEffect(() => {
    if (isPaused) return
    timerRef.current = setInterval(() => {
      next()
    }, 5000)

    return () => clearInterval(timerRef.current)
  }, [isPaused, current])

  const review = REVIEWS[current]

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        position: 'relative',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Active Review Slide Container */}
      <div
        style={{
          minHeight: '300px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(18, 18, 17, 0.95) 0%, rgba(11, 11, 10, 0.98) 100%)',
              border: '1px solid rgba(244, 241, 232, 0.12)',
              borderRadius: '24px',
              padding: '40px 38px',
              boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(244, 241, 232, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Background Glow & Watermark Quote */}
            <div
              style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '260px',
                height: '260px',
                background: 'radial-gradient(circle, rgba(244, 241, 232, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <svg
              style={{
                position: 'absolute',
                top: '24px',
                right: '28px',
                width: '72px',
                height: '72px',
                color: 'rgba(244, 241, 232, 0.04)',
                pointerEvents: 'none',
              }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              {/* Star Rating & Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', color: '#eab308', fontSize: '18px', letterSpacing: '3px', textShadow: '0 0 12px rgba(234, 179, 8, 0.35)' }}>
                  {'★'.repeat(review.rating)}
                </div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    background: 'rgba(244, 241, 232, 0.06)',
                    color: '#f4f1e8',
                    border: '1px solid rgba(244, 241, 232, 0.16)',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {review.type}
                </span>
              </div>

              {/* Verified Metric Pill */}
              <div
                style={{
                  background: 'rgba(244, 241, 232, 0.035)',
                  border: '1px solid rgba(244, 241, 232, 0.12)',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#f4f1e8', fontFamily: 'var(--font-display)' }}>
                  📈 {review.metric}
                </span>
                <span style={{ color: 'rgba(244, 241, 232, 0.2)' }}>•</span>
                <small style={{ fontSize: '11.5px', color: 'rgba(244, 241, 232, 0.55)', fontFamily: 'var(--font-mono)' }}>
                  {review.metricSub}
                </small>
              </div>
            </div>

            {/* Quote Text */}
            <p
              style={{
                fontSize: '19px',
                lineHeight: 1.7,
                color: 'var(--cb-text)',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                margin: '0 0 28px 0',
                position: 'relative',
                zIndex: 1,
                fontFamily: 'var(--font-display)',
              }}
            >
              "{review.quote}"
            </p>

            {/* Reviewer Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(244, 241, 232, 0.08)', paddingTop: '20px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid rgba(244, 241, 232, 0.25)',
                  boxShadow: '0 0 16px rgba(244, 241, 232, 0.1)',
                  flexShrink: 0,
                }}
              >
                <img
                  src={review.avatar}
                  alt={review.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <h4 style={{ fontSize: '16.5px', fontWeight: 700, color: 'var(--cb-text)', margin: 0, fontFamily: 'var(--font-display)' }}>
                  {review.name}
                </h4>
                <p style={{ fontSize: '13px', color: 'rgba(244, 241, 232, 0.6)', margin: '3px 0 0', fontFamily: 'var(--font-mono)' }}>
                  {review.role} • <strong style={{ color: '#f4f1e8', fontWeight: 600 }}>{review.company}</strong>
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls & Indicator Dots */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '22px',
          padding: '0 6px',
        }}
      >
        {/* Slider Dots */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setCurrent(idx)}
              style={{
                width: current === idx ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: current === idx ? '#f4f1e8' : 'rgba(244, 241, 232, 0.18)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0,
                boxShadow: current === idx ? '0 0 12px rgba(244, 241, 232, 0.4)' : 'none',
              }}
            />
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            aria-label="Previous Review"
            onClick={prev}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(244, 241, 232, 0.04)',
              border: '1px solid rgba(244, 241, 232, 0.14)',
              color: '#f4f1e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f4f1e8';
              e.currentTarget.style.color = '#0b0b0a';
              e.currentTarget.style.borderColor = '#f4f1e8';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 241, 232, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(244, 241, 232, 0.04)';
              e.currentTarget.style.color = '#f4f1e8';
              e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.14)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.4)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next Review"
            onClick={next}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(244, 241, 232, 0.04)',
              border: '1px solid rgba(244, 241, 232, 0.14)',
              color: '#f4f1e8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f4f1e8';
              e.currentTarget.style.color = '#0b0b0a';
              e.currentTarget.style.borderColor = '#f4f1e8';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(244, 241, 232, 0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(244, 241, 232, 0.04)';
              e.currentTarget.style.color = '#f4f1e8';
              e.currentTarget.style.borderColor = 'rgba(244, 241, 232, 0.14)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.4)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
