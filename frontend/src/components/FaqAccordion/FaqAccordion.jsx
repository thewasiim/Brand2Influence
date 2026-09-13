import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQS = [
  {
    id: 'faq-1',
    category: 'General',
    question: 'How does Brand2Influence work for brands and creators?',
    answer: 'Brand2Influence is a direct creator marketplace. Brands can discover verified creators across specific niches, cities, and budgets, or post sponsorship campaign briefs with clear deliverables. Creators can showcase their media kit, publish upfront rates, apply to open brand deals, or receive direct collaboration inquiries without any agency middleman.'
  },
  {
    id: 'faq-2',
    category: 'For Brands',
    question: 'How are creator metrics and engagement rates verified?',
    answer: 'We connect directly to platform APIs (Instagram, YouTube) and verify creator audience demographics, authentic engagement percentages, and recent reel performance. This eliminates inflated vanity metrics and ensures brands get transparent ROI on every collaboration.'
  },
  {
    id: 'faq-3',
    category: 'For Creators',
    question: 'How do collaboration pricing and rate cards work?',
    answer: 'Creators set their starting reel and story rates transparently on their profile. When a brand posts an advertisement or sends a message inquiry, deliverables and custom quotes can be discussed and confirmed directly inside our dedicated message thread.'
  },
  {
    id: 'faq-4',
    category: 'Pricing',
    question: 'Are there any hidden fees or agency commissions?',
    answer: 'Zero middleman commission. Traditional influencer agencies take 25% to 40% in markups. Brand2Influence allows brands and creators to connect and transact transparently.'
  },
  {
    id: 'faq-5',
    category: 'Discovery',
    question: 'Can any user search and view brand and creator profiles?',
    answer: 'Yes! Both the Creator Directory (/influencers) and Search Brands directory (/brands) are open to all users. Influencers can inspect brand campaign history, and brands can search creators by followers, city location, and creative aesthetic.'
  },
  {
    id: 'faq-6',
    category: 'Getting Started',
    question: 'How quickly can I get started on the platform?',
    answer: 'Signup takes under 60 seconds. Brands can post their first campaign advertisement immediately, and creators can connect their media kit to start appearing in search results and receive pitches today.'
  }
]

export default function FaqAccordion() {
  const [openId, setOpenId] = useState('faq-1')

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '860px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {FAQS.map((faq) => {
        const isOpen = openId === faq.id
        return (
          <div
            key={faq.id}
            style={{
              background: isOpen ? 'var(--color-surface-2)' : 'var(--color-surface-1)',
              border: `1px solid ${isOpen ? 'var(--color-secondary)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)',
              transition: 'all 0.2s ease',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'var(--color-text-primary)',
              }}
            >
              <span style={{ fontSize: '16.5px', fontWeight: 600, paddingRight: '16px' }}>
                {faq.question}
              </span>
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isOpen ? 'var(--color-secondary)' : 'var(--color-surface-3)',
                  color: isOpen ? '#fff' : 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 700,
                  flexShrink: 0,
                  transition: 'transform 0.25s ease, background 0.2s ease',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                }}
              >
                +
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div
                    style={{
                      padding: '0 24px 22px 24px',
                      color: 'var(--color-text-secondary)',
                      fontSize: '14.5px',
                      lineHeight: 1.7,
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '16px',
                    }}
                  >
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
