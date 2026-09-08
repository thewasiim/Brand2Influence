import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../../services/admin'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  BentoGrid,
  Badge,
  Input,
  Button,
} from '../../components/ui'

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

export function AdminDashboardPage() {
  const { data, error, loading } = useAdmin(adminService.metrics)

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="overline">
            <i /> System Overview
          </div>
          <h1 style={{ marginTop: '6px' }}>Platform Activity</h1>
          <p>Real-time metrics for users, open brand advertisements, and collaboration activity.</p>
        </div>
      </div>

      {error && <ErrorState error={error} />}

      {loading ? (
        <LoadingState label="Loading admin metrics…" />
      ) : data ? (
        <BentoGrid cols={4} gap="md">
          {Object.entries(data).map(([key, value]) => (
            <MetricCard
              key={key}
              label={key.replaceAll('_', ' ')}
              value={String(value)}
              subtext="Platform total"
            />
          ))}
        </BentoGrid>
      ) : (
        <EmptyState>No activity metrics available.</EmptyState>
      )}
    </main>
  )
}

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

  const title = role ? `${role[0].toUpperCase() + role.slice(1)} Directory` : 'Platform Users'

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="overline">
            <i /> User Management
          </div>
          <h1 style={{ marginTop: '6px' }}>{title}</h1>
          <p>Manage access, verify onboarding roles, and review creator statuses.</p>
        </div>
      </div>

      <div style={{ maxWidth: '400px', marginBottom: '24px' }}>
        <Input
          placeholder="Filter by name, email, or role..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search users"
        />
      </div>

      {error && <ErrorState error={error} />}

      {loading ? (
        <LoadingState label="Loading users…" />
      ) : filteredUsers?.length ? (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>User / Entity</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.name}</b>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{u.email}</td>
                  <td>
                    <Badge variant={u.role === 'brand' ? 'primary' : u.role === 'influencer' ? 'secondary' : 'accent'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={u.is_disabled ? 'outline' : 'accent'}>
                      {u.is_disabled ? 'Disabled' : 'Active'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>No matching users found.</EmptyState>
      )}
    </main>
  )
}

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
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="overline">
            <i /> Campaign Moderation
          </div>
          <h1 style={{ marginTop: '6px' }}>Brand Advertisements</h1>
          <p>Review, pause, or remove sponsored ad briefs across all brands.</p>
        </div>
      </div>

      <div style={{ maxWidth: '400px', marginBottom: '24px' }}>
        <Input
          placeholder="Filter by title, niche, platform, or brand..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search campaigns"
        />
      </div>

      {error && <ErrorState error={error} />}

      {loading ? (
        <LoadingState label="Loading campaign advertisements…" />
      ) : filteredItems?.length ? (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Campaign Title</th>
                <th>Brand Name</th>
                <th>Platform & Niche</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>{c.title}</b>
                    <small style={{ display: 'block', color: 'var(--color-text-tertiary)' }}>
                      Min: {c.target_followers_min || 'Any'} followers
                    </small>
                  </td>
                  <td>
                    <div>{c.brandName}</div>
                    <small style={{ color: 'var(--color-text-tertiary)' }}>{c.brandEmail}</small>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <Badge variant="primary">{c.platform}</Badge>
                      <Badge variant="accent">{c.niche}</Badge>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                    {c.budget_range}
                  </td>
                  <td>
                    <Badge variant={c.status === 'active' ? 'secondary' : 'outline'}>
                      {c.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <Link to={`/campaigns/${c.id}`} className="ui-button ui-btn--secondary ui-btn--sm" style={{ padding: '4px 10px', fontSize: '12px' }}>
                        View
                      </Link>
                      <button
                        type="button"
                        className="ui-button ui-btn--outline ui-btn--sm"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => handleToggleStatus(c)}
                      >
                        {c.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="ui-button ui-btn--outline ui-btn--sm"
                        style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--color-error)' }}
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
        <EmptyState>No campaign advertisements found.</EmptyState>
      )}
    </main>
  )
}

export function ReportsPage() {
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="overline">
            <i /> Analytics & Reporting
          </div>
          <h1 style={{ marginTop: '6px' }}>Platform Reports</h1>
        </div>
      </div>
      <EmptyState title="Reports In Development">
        Reporting and automated analytics export are reserved for a future release. No report data is fabricated here.
      </EmptyState>
    </main>
  )
}

export function SettingsPage() {
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="overline">
            <i /> Platform Configuration
          </div>
          <h1 style={{ marginTop: '6px' }}>System Settings</h1>
        </div>
      </div>
      <EmptyState title="Settings Reserved">
        Administrative configuration settings and webhooks are intentionally preserved for future system migrations.
      </EmptyState>
    </main>
  )
}

