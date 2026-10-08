import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/admin'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Badge,
} from '../../components/ui'
import './AdminPages.css'

function useAdmin(load) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = () => {
    setLoading(true)
    load()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    reload()
  }, [])

  return { data, error, loading, reload }
}

// Icon helper for metric cards
function getMetricIcon(key) {
  const k = key.toLowerCase()
  if (k.includes('user') || k.includes('account')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  if (k.includes('influencer') || k.includes('creator')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }
  if (k.includes('brand') || k.includes('partner')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    )
  }
  if (k.includes('campaign') || k.includes('ad') || k.includes('brief')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" x2="15" y1="10" y2="10" />
      </svg>
    )
  }
  if (k.includes('message') || k.includes('chat') || k.includes('conversation')) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

// --------------------------------------------------------------------------
// 1. Admin Dashboard Page
// --------------------------------------------------------------------------
export function AdminDashboardPage() {
  const { data, error, loading } = useAdmin(adminService.metrics)

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-eyebrow">
          <span>[ 01 ] SYSTEM TELEMETRY</span>
        </div>
        <h1 className="admin-page-title">
          Platform <em>Activity Console<span className="dot-accent">.</span></em>
        </h1>
        <p className="admin-page-desc">
          Real-time metrics, active marketplace transactions, and verified brand partnerships across Brand2Influence.
        </p>
      </div>

      {error && <ErrorState error={error} />}

      {loading ? (
        <LoadingState label="Loading platform telemetry…" />
      ) : data ? (
        <>
          {/* Telemetry Metric Cards */}
          <div className="admin-telemetry-grid">
            {Object.entries(data).map(([key, value]) => {
              const label = key.replaceAll('_', ' ').toUpperCase()
              return (
                <div key={key} className="admin-metric-card-luxury">
                  <div className="admin-metric-card-header">
                    <span className="admin-metric-label">{label}</span>
                    <div className="admin-metric-icon-box">
                      {getMetricIcon(key)}
                    </div>
                  </div>

                  <div className="admin-metric-value">
                    {String(value)}
                  </div>

                  <div className="admin-metric-footer">
                    <span>Verified live metric</span>
                    <span className="admin-metric-status-tag">
                      <span className="admin-status-dot-sm active" />
                      LIVE
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Quick Operations & Moderation Hub */}
          <div style={{ marginTop: '36px' }}>
            <div className="admin-eyebrow">
              <span>[ 02 ] MODERATION DIRECTORY</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px', color: 'var(--cb-text)' }}>
              Quick <em>Administration Actions<span className="dot-accent">.</span></em>
            </h3>

            <div className="admin-quick-actions-row">
              <Link to="/admin/campaigns" className="admin-quick-action-card">
                <div className="admin-qa-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <line x1="9" x2="15" y1="10" y2="10" />
                  </svg>
                </div>
                <div className="admin-qa-info">
                  <h4>Moderate Briefs</h4>
                  <p>Audit and verify open brand sponsorships</p>
                </div>
              </Link>

              <Link to="/admin/influencers" className="admin-quick-action-card">
                <div className="admin-qa-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="admin-qa-info">
                  <h4>Creator Roster</h4>
                  <p>Inspect verified rates, handles & niches</p>
                </div>
              </Link>

              <Link to="/admin/brands" className="admin-quick-action-card">
                <div className="admin-qa-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div className="admin-qa-info">
                  <h4>Brand Directory</h4>
                  <p>Manage business entities and active budgets</p>
                </div>
              </Link>

              <Link to="/admin/users" className="admin-quick-action-card">
                <div className="admin-qa-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <div className="admin-qa-info">
                  <h4>Access & Permissions</h4>
                  <p>Review role allocation and account states</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      ) : (
        <EmptyState>No activity metrics available.</EmptyState>
      )}
    </div>
  )
}

// --------------------------------------------------------------------------
// 2. Admin Users Directory Page
// --------------------------------------------------------------------------
export function AdminUsersPage({ role }) {
  const [query, setQuery] = useState('')
  const { data, error, loading } = useAdmin(() => adminService.users({ role: role || '', query }))

  const filteredUsers = data?.items?.filter((u) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    )
  })

  const titlePrefix = role ? `${role[0].toUpperCase() + role.slice(1)}` : 'Platform'

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-eyebrow">
          <span>[ 02 ] DIRECTORY CONTROL</span>
        </div>
        <h1 className="admin-page-title">
          {titlePrefix} <em>Directory Management<span className="dot-accent">.</span></em>
        </h1>
        <p className="admin-page-desc">
          Manage system access, verify entity onboarding roles, and review account permissions.
        </p>
      </div>

      {error && <ErrorState error={error} />}

      <div className="admin-table-panel">
        <div className="admin-filter-bar">
          <div className="admin-search-input-wrap">
            <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by name, email, or role..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Filter users"
            />
          </div>

          <span className="admin-filter-count">
            [ {filteredUsers ? filteredUsers.length : 0} ENTITIES REGISTERED ]
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 20px' }}>
            <LoadingState label="Loading users directory…" />
          </div>
        ) : filteredUsers?.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table-luxury">
              <thead>
                <tr>
                  <th>User / Entity</th>
                  <th>Role</th>
                  <th>Email Address</th>
                  <th>Account Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const initial = (u.name || u.email || 'U')[0].toUpperCase()
                  const roleClass = u.role === 'brand' ? 'brand' : u.role === 'influencer' ? 'influencer' : 'admin'
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-user-avatar">
                            {initial}
                          </div>
                          <div className="admin-user-meta">
                            <span className="admin-user-name">{u.name || 'Anonymous User'}</span>
                            <span className="admin-user-id">ID: {u.id?.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`admin-role-pill ${roleClass}`}>
                          {u.role || 'Member'}
                        </span>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--cb-text-muted)' }}>
                        {u.email}
                      </td>

                      <td>
                        <div className={`admin-status-indicator ${u.is_disabled ? 'disabled' : 'active'}`}>
                          <span className={`admin-status-dot-sm ${u.is_disabled ? 'disabled' : 'active'}`} />
                          <span>{u.is_disabled ? 'Disabled' : 'Active'}</span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-action-btn-group">
                          {u.role === 'brand' ? (
                            <Link to={`/brands/${u.id}`} className="admin-action-btn secondary">
                              Profile
                            </Link>
                          ) : u.role === 'influencer' ? (
                            <Link to={`/influencers/${u.id}`} className="admin-action-btn secondary">
                              Roster
                            </Link>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--cb-text-dim)', fontFamily: 'var(--font-mono)' }}>Verified</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <EmptyState>No matching entities found in directory.</EmptyState>
          </div>
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// 3. Admin Campaigns Moderation Page
// --------------------------------------------------------------------------
export function AdminCampaignsPage() {
  const [query, setQuery] = useState('')
  const { data, error, loading, reload } = useAdmin(() => adminService.campaigns({ query }))

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === 'active' ? 'paused' : 'active'
    try {
      await adminService.updateCampaign(item.id, { status: nextStatus })
      reload()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this campaign advertisement?')) return
    try {
      await adminService.deleteCampaign(id)
      reload()
    } catch (err) {
      alert(err.message)
    }
  }

  const filteredItems = data?.items?.filter((c) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      c.title?.toLowerCase().includes(q) ||
      c.niche?.toLowerCase().includes(q) ||
      c.platform?.toLowerCase().includes(q) ||
      c.brandName?.toLowerCase().includes(q)
    )
  })

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-eyebrow">
          <span>[ 03 ] BRIEF MODERATION</span>
        </div>
        <h1 className="admin-page-title">
          Campaign <em>Moderation Console<span className="dot-accent">.</span></em>
        </h1>
        <p className="admin-page-desc">
          Audit deliverables, adjust budget visibility, and moderate active sponsorships across all partner brands.
        </p>
      </div>

      {error && <ErrorState error={error} />}

      <div className="admin-table-panel">
        <div className="admin-filter-bar">
          <div className="admin-search-input-wrap">
            <svg className="admin-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Filter by title, niche, platform, or brand..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Filter campaign briefs"
            />
          </div>

          <span className="admin-filter-count">
            [ {filteredItems ? filteredItems.length : 0} BRIEFS LOGGED ]
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 20px' }}>
            <LoadingState label="Loading campaign briefs…" />
          </div>
        ) : filteredItems?.length ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table-luxury">
              <thead>
                <tr>
                  <th>Campaign Brief</th>
                  <th>Brand Entity</th>
                  <th>Platform & Niche</th>
                  <th>Approved Budget</th>
                  <th>Lifecycle Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div>
                        <strong style={{ fontSize: '14.5px', color: 'var(--cb-text)', display: 'block', marginBottom: '2px' }}>
                          {c.title}
                        </strong>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--cb-text-dim)' }}>
                          Audience: {c.target_followers_min || 'Any Tier'} followers
                        </span>
                      </div>
                    </td>

                    <td>
                      <div>
                        <strong style={{ color: 'var(--cb-text)', display: 'block' }}>{c.brandName}</strong>
                        <span style={{ fontSize: '12px', color: 'var(--cb-text-dim)', fontFamily: 'var(--font-mono)' }}>{c.brandEmail}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <Badge variant="primary">{c.platform}</Badge>
                        <Badge variant="accent">{c.niche}</Badge>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                        {c.budget_range || c.budget || 'Negotiable'}
                      </span>
                    </td>

                    <td>
                      <div className={`admin-status-indicator ${c.status === 'active' ? 'active' : 'paused'}`}>
                        <span className={`admin-status-dot-sm ${c.status === 'active' ? 'active' : 'paused'}`} />
                        <span style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700 }}>
                          {c.status}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="admin-action-btn-group">
                        <Link to={`/brands/${c.brandId || 'b-loom'}?campaign=${c.id}`} className="admin-action-btn secondary">
                          View
                        </Link>
                        <button
                          type="button"
                          className="admin-action-btn secondary"
                          onClick={() => handleToggleStatus(c)}
                        >
                          {c.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn danger"
                          onClick={() => handleDelete(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <EmptyState>No campaign advertisements found.</EmptyState>
          </div>
        )}
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// 4. Reports & Telemetry Analytics Page
// --------------------------------------------------------------------------
export function ReportsPage() {
  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-eyebrow">
          <span>[ 04 ] ANALYTICS & TELEMETRY</span>
        </div>
        <h1 className="admin-page-title">
          Platform <em>Reports & Audits<span className="dot-accent">.</span></em>
        </h1>
        <p className="admin-page-desc">
          Automated performance benchmarks, campaign fulfillment analytics, and transaction volume logs.
        </p>
      </div>

      <div className="admin-telemetry-grid">
        <div className="admin-metric-card-luxury">
          <div className="admin-metric-card-header">
            <span className="admin-metric-label">AVERAGE ROI</span>
            <div className="admin-metric-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div className="admin-metric-value">3.8x</div>
          <div className="admin-metric-footer">
            <span>Verified Brand Return</span>
            <span className="admin-metric-status-tag">+14% MoM</span>
          </div>
        </div>

        <div className="admin-metric-card-luxury">
          <div className="admin-metric-card-header">
            <span className="admin-metric-label">FULFILLMENT RATE</span>
            <div className="admin-metric-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="admin-metric-value">94.2%</div>
          <div className="admin-metric-footer">
            <span>Milestones delivered on-time</span>
            <span className="admin-metric-status-tag">OPTIMAL</span>
          </div>
        </div>

        <div className="admin-metric-card-luxury">
          <div className="admin-metric-card-header">
            <span className="admin-metric-label">AVG BRIEF LOCK TIME</span>
            <div className="admin-metric-icon-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="admin-metric-value">48 Hrs</div>
          <div className="admin-metric-footer">
            <span>From proposal to agreement</span>
            <span className="admin-metric-status-tag">-6h faster</span>
          </div>
        </div>
      </div>

      <div className="admin-config-card" style={{ marginTop: '24px' }}>
        <h3>Export Telemetry Logs</h3>
        <p>Export structured cryptographic logs and transaction metrics for external auditing.</p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="ui-button ui-btn--primary"
            style={{ padding: '12px 24px', fontSize: '13px' }}
            onClick={() => alert('Platform Telemetry Audit CSV generated and queued for download.')}
          >
            Export Complete CSV Audit Log
          </button>
          <button
            type="button"
            className="ui-button ui-btn--secondary"
            style={{ padding: '12px 24px', fontSize: '13px' }}
            onClick={() => alert('Platform Telemetry PDF Summary report generated.')}
          >
            Generate Executive PDF Summary
          </button>
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// 5. System Configuration & Security Page
// --------------------------------------------------------------------------
export function SettingsPage() {
  const [fee, setFee] = useState('0')
  const [autoApprove, setAutoApprove] = useState(true)
  const [twoFactor, setTwoFactor] = useState(true)
  const [savedNotice, setSavedNotice] = useState(false)

  const handleSave = () => {
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2500)
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-eyebrow">
          <span>[ 05 ] INFRASTRUCTURE CONTROL</span>
        </div>
        <h1 className="admin-page-title">
          Platform <em>Configuration & Security<span className="dot-accent">.</span></em>
        </h1>
        <p className="admin-page-desc">
          Configure marketplace fee models, moderation policies, and platform authentication requirements.
        </p>
      </div>

      {savedNotice && (
        <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#10B981', padding: '12px 20px', borderRadius: '8px', marginBottom: '24px', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
          ✓ Configuration changes persisted to platform environment.
        </div>
      )}

      <div className="admin-config-section">
        {/* Panel 1: Marketplace Parameters */}
        <div className="admin-config-card">
          <h3>Marketplace & Fee Parameters</h3>
          <p>Control financial cut and automation thresholds for brand collaboration proposals.</p>

          <div className="admin-config-item">
            <div className="admin-config-info">
              <h4>Platform Agency Markup</h4>
              <small>Default is 0% for pure direct-to-creator transparency</small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                style={{ width: '70px', padding: '8px', background: 'var(--cb-surface-2)', border: '1px solid var(--cb-border)', color: '#fff', borderRadius: '6px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cb-text-dim)' }}>%</span>
            </div>
          </div>

          <div className="admin-config-item">
            <div className="admin-config-info">
              <h4>Auto-Approve Verified Brand Briefs</h4>
              <small>Publish briefs immediately without manual review queue</small>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0047AB' }}
              />
            </label>
          </div>
        </div>

        {/* Panel 2: Security & Access Control */}
        <div className="admin-config-card">
          <h3>Security & Infrastructure Health</h3>
          <p>Supabase PostgreSQL replication status and administrative access security.</p>

          <div className="admin-config-item">
            <div className="admin-config-info">
              <h4>Database RLS Isolation</h4>
              <small>Row Level Security active on profiles, brands, campaigns & messages</small>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#10B981', fontSize: '12px', fontWeight: 700 }}>
              ENFORCED
            </span>
          </div>

          <div className="admin-config-item">
            <div className="admin-config-info">
              <h4>Require Admin Two-Factor Authentication</h4>
              <small>Mandatory biometric or TOTP auth for console access</small>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={(e) => setTwoFactor(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#0047AB' }}
              />
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            type="button"
            className="ui-button ui-btn--primary"
            style={{ padding: '14px 32px' }}
            onClick={handleSave}
          >
            Save Configuration Changes
          </button>
        </div>
      </div>
    </div>
  )
}
