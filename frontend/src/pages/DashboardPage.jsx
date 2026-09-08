import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Button,
  MetricCard,
  Badge,
  Card,
  BentoGrid,
  BentoCell,
} from '../components/ui'

export default function DashboardPage() {
  const { profile } = useAuth()
  const role = profile?.role

  if (!role) return <Navigate to="/onboarding/role" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />

  const isBrand = role === 'brand'

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="overline">
            <i /> {isBrand ? 'Brand Workspace' : 'Creator Workspace'}
          </div>
          <h1 style={{ marginTop: '6px' }}>Welcome back, {profile?.name || 'Collaborator'}.</h1>
          <p>
            {isBrand
              ? 'Discover independent creators, monitor ongoing inquiries, and manage your partnerships.'
              : 'Keep your media kit and rate card current so brands can discover and contact you directly.'}
          </p>
        </div>
        <div>
          {isBrand ? (
            <Link to="/influencers" className="ui-button ui-btn--primary">
              Discover Creators
            </Link>
          ) : (
            <Link to="/profile" className="ui-button ui-btn--secondary">
              Edit Rate Card
            </Link>
          )}
        </div>
      </div>

      {/* BENTO METRIC CARDS */}
      <BentoGrid cols={4} gap="md" style={{ marginBottom: '28px' }}>
        {isBrand ? (
          <>
            <MetricCard
              label="Active Conversations"
              value="3"
              delta="+1 this week"
              deltaType="positive"
              subtext="Unread messages in inbox"
            />
            <MetricCard
              label="Saved Creators"
              value="12"
              subtext="Added to shortlist"
            />
            <MetricCard
              label="Avg Reel Rate"
              value="₹3,200"
              subtext="Across your saved talent"
            />
            <MetricCard
              label="Campaigns"
              value="Phase 2"
              subtext="Open briefs coming soon"
            />
          </>
        ) : (
          <>
            <MetricCard
              label="Profile Status"
              value="Active"
              delta="Published"
              deltaType="positive"
              subtext="Discoverable in marketplace"
            />
            <MetricCard
              label="Starting Reel Rate"
              value={profile?.rateCard?.reel ? `₹${profile.rateCard.reel}` : 'Set Rate'}
              subtext="Direct quote on profile"
            />
            <MetricCard
              label="Incoming Inquiries"
              value="2"
              delta="Pending"
              deltaType="positive"
              subtext="Check conversations"
            />
            <MetricCard
              label="Engagement Score"
              value={profile?.engagementRate ? `${profile.engagementRate}%` : '5.2%'}
              subtext="Verified rate"
            />
          </>
        )}
      </BentoGrid>

      {/* ASYMMETRIC BENTO WORKSPACE */}
      <div className="bento-grid bento-grid--asymmetric">
        {/* Left: Main Action Card */}
        <Card variant="elevated" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Badge variant="primary">{isBrand ? 'Talent Directory' : 'Media Kit'}</Badge>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Quick Actions
            </span>
          </div>

          {isBrand ? (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Search & Compare Creators</h2>
              <p style={{ marginBottom: '24px', fontSize: '14px', lineHeight: 1.7 }}>
                Browse verified creators filtered by city, starting reel rates, and engagement performance. Review their portfolios and connect without intermediary fees.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/influencers" className="ui-button ui-btn--primary">
                  Open Creator Discovery
                </Link>
                <Link to="/conversations" className="ui-button ui-btn--outline">
                  Open Messages
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Optimize Your Discoverability</h2>
              <p style={{ marginBottom: '24px', fontSize: '14px', lineHeight: 1.7 }}>
                Profiles with transparent starting rates receive up to 3x more qualified brand inquiries. Add your recent reel portfolio links and exact location.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/profile" className="ui-button ui-btn--primary">
                  Update Profile Details
                </Link>
                <Link to="/conversations" className="ui-button ui-btn--outline">
                  View Message Inbox
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Right: Informational Bento Card */}
        <Card variant="glass" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Badge variant="accent">Marketplace Note</Badge>
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
            {isBrand ? 'Transparent Rates Upfront' : 'Direct Brand Connections'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            {isBrand
              ? 'Every creator listed on Brand2Influence sets their minimum deliverables upfront, saving hours of cold reachout and negotiations.'
              : 'Brands reach out directly with brief proposals. Ensure your notifications and message inbox are checked regularly.'}
          </p>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
            <small style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>
              PRO TIP
            </small>
            <span style={{ fontSize: '12px', color: 'var(--color-neutral-muted)' }}>
              {isBrand
                ? 'Specify campaign dates and sample reel concepts in your first message for faster turnaround.'
                : 'Keep your portfolio links active with your latest viral or highest engagement reels.'}
            </span>
          </div>
        </Card>
      </div>
    </main>
  )
}
