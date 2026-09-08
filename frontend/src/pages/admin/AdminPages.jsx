import React, { useEffect, useState } from 'react'
import { adminService } from '../../services/admin'
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  BentoGrid,
  Badge,
  Input,
} from '../../components/ui'

function useAdmin(load) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    load()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { data, error, loading }
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
          <p>Real-time metrics for users, onboarding submissions, and collaboration activity.</p>
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
        <div style={{ overflowX: 'auto', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-1)' }}>
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
