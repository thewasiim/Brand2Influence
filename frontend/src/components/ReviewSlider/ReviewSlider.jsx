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
          minHeight: '320px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={review.id}
            initial={{ opacity: 0, x: 28, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -28, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              padding: '36px 32px',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Background Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0) 70%)',
                pointerEvents: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              {/* Star Rating & Type */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', color: '#FBBF24', fontSize: '18px', letterSpacing: '2px' }}>
                  {'★'.repeat(review.rating)}
                </div>
                <Badge variant={review.type === 'Brand Partner' ? 'primary' : 'accent'}>
                  {review.type}
                </Badge>
              </div>

              {/* Verified Metric Pill */}
              <div
                style={{
                  background: 'var(--color-surface-3)',
                  border: '1px solid var(--color-border)',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  textAlign: 'right',
                }}
              >
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-secondary)' }}>
                  📈 {review.metric}
                </span>
                <small style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {review.metricSub}
                </small>
              </div>
            </div>

            {/* Quote Text */}
            <blockquote
              style={{
                fontSize: '17px',
                lineHeight: 1.65,
                color: 'var(--color-text-primary)',
                fontStyle: 'italic',
                margin: '0 0 24px 0',
                position: 'relative',
              }}
            >
              "{review.quote}"
            </blockquote>

            {/* Reviewer Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', borderTop: '1px solid var(--color-border)', paddingTop: '18px' }}>
              <Avatar
                name={review.name}
                src={review.avatar}
                size="lg"
                tone="secondary"
              />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{review.name}</h4>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
                  {review.role} • <b>{review.company}</b>
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
          marginTop: '20px',
          padding: '0 8px',
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
                width: current === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: current === idx ? 'var(--color-secondary)' : 'var(--color-border)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                padding: 0,
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
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next Review"
            onClick={next}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  )
}
