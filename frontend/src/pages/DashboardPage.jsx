import React, { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { campaignsService } from '../services/campaigns'
import { conversationsService } from '../services/conversations'
import {
  Button,
  MetricCard,
  Badge,
  Card,
  BentoGrid,
} from '../components/ui'

export default function DashboardPage() {
  const { profile } = useAuth()
  const role = profile?.role

  const [activeCampaignsCount, setActiveCampaignsCount] = useState(0)
  const [conversationsCount, setConversationsCount] = useState(0)

  useEffect(() => {
    if (role === 'brand') {
      campaignsService.listMine().then(res => {
        setActiveCampaignsCount(res.items?.filter(x => x.status === 'active')?.length || 0)
      }).catch(() => {})
    } else if (role === 'influencer') {
      campaignsService.list().then(res => {
        setActiveCampaignsCount(res.items?.length || 0)
      }).catch(() => {})
    }

    conversationsService.list().then(res => {
      setConversationsCount(res.items?.length || 0)
    }).catch(() => {})
  }, [role])

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
              ? 'Post campaign advertisement briefs, discover independent creators, and manage ongoing inquiries.'
              : 'Browse open brand sponsorship ads, pitch your content deliverables, and chat directly with brands.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {isBrand ? (
            <>
              <Link to="/brand/campaigns" className="ui-button ui-btn--primary">
                + Post Ad Brief
              </Link>
              <Link to="/influencers" className="ui-button ui-btn--secondary">
                Discover Creators
              </Link>
            </>
          ) : (
            <>
              <Link to="/campaigns" className="ui-button ui-btn--primary">
                Browse Brand Deals
              </Link>
              <Link to="/profile" className="ui-button ui-btn--secondary">
                Edit Media Kit
              </Link>
            </>
          )}
        </div>
      </div>

      {/* BENTO METRIC CARDS */}
      <BentoGrid cols={4} gap="md" style={{ marginBottom: '28px' }}>
        {isBrand ? (
          <>
            <MetricCard
              label="My Active Ads"
              value={String(activeCampaignsCount)}
              delta="Live briefs"
              deltaType="positive"
              subtext="Open for creator proposals"
            />
            <MetricCard
              label="Active Conversations"
              value={String(conversationsCount)}
              delta="Inbox"
              deltaType="positive"
              subtext="Messages & pitches"
            />
            <MetricCard
              label="Saved Creators"
              value="Verified"
              subtext="Direct discovery ready"
            />
            <MetricCard
              label="Budget Type"
              value={profile?.budgetRange || 'Flexible'}
              subtext="Standard campaign scale"
            />
          </>
        ) : (
          <>
            <MetricCard
              label="Open Brand Deals"
              value={String(activeCampaignsCount)}
              delta="Active Ads"
              deltaType="positive"
              subtext="Available to pitch today"
            />
            <MetricCard
              label="Active Chats"
              value={String(conversationsCount)}
              delta="Inbox"
              deltaType="positive"
              subtext="Brand conversation threads"
            />
            <MetricCard
              label="Starting Reel Rate"
              value={profile?.rateCard?.reel ? `₹${profile.rateCard.reel}` : 'Set Rate'}
              subtext="Direct quote on profile"
            />
            <MetricCard
              label="Profile Status"
              value="Active"
              delta="Published"
              deltaType="positive"
              subtext="Discoverable in marketplace"
            />
          </>
        )}
      </BentoGrid>

      {/* ASYMMETRIC BENTO WORKSPACE */}
      <div className="bento-grid bento-grid--asymmetric">
        {/* Left: Main Action Card */}
        <Card variant="elevated" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Badge variant="primary">{isBrand ? 'Campaign Briefs & Talent' : 'Opportunities & Media Kit'}</Badge>
            <span style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              Quick Actions
            </span>
          </div>

          {isBrand ? (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Post Advertisements & Discover Creators</h2>
              <p style={{ marginBottom: '24px', fontSize: '14px', lineHeight: 1.7 }}>
                Publish detailed campaign briefs (deliverables, budgets, target metrics). Creators can discover your listing and apply directly with custom pitches and quotes.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/brand/campaigns" className="ui-button ui-btn--primary">
                  Manage My Advertisements
                </Link>
                <Link to="/influencers" className="ui-button ui-btn--secondary">
                  Browse Creators Directory
                </Link>
                <Link to="/conversations" className="ui-button ui-btn--outline">
                  Open Messages ({conversationsCount})
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Find Brand Sponsorships & Pitch Direct</h2>
              <p style={{ marginBottom: '24px', fontSize: '14px', lineHeight: 1.7 }}>
                Explore open advertisements posted by brands looking for creators. Submit your proposals, ask questions, and chat directly in real-time.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/campaigns" className="ui-button ui-btn--primary">
                  Explore Open Brand Deals
                </Link>
                <Link to="/conversations" className="ui-button ui-btn--secondary">
                  View Message Inbox
                </Link>
                <Link to="/profile" className="ui-button ui-btn--outline">
                  Update Media Kit
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Right: Informational Bento Card */}
        <Card variant="glass" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Badge variant="accent">Collaboration Best Practice</Badge>
          </div>
          <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
            {isBrand ? 'Structured Briefs = Better Pitches' : 'Stand Out With Your Pitch'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            {isBrand
              ? 'Include exact deliverables (e.g. 1 Reel + 2 Stories) and target follower ranges in your advertisement to attract the most suitable talent.'
              : 'When pitching to an ad, mention your average view metrics and include a direct link to a past reel matching the brand’s niche.'}
          </p>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
            <small style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '4px' }}>
              DIRECT CHAT
            </small>
            <span style={{ fontSize: '12px', color: 'var(--color-neutral-muted)' }}>
              {isBrand
                ? 'Applications create direct messaging threads linked to your campaign brief.'
                : 'Brands receive your initial proposal immediately in their collaboration inbox.'}
            </span>
          </div>
        </Card>
      </div>
    </main>
  )
}

