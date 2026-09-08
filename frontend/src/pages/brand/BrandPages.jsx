import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { brandsService } from '../../services/brands'
import { Button, ErrorState, Input } from '../../components/ui'

export function BrandOnboardingPage() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    budgetRange: '',
    location: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await brandsService.saveProfile(form)
      nav('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="setup">
      <div className="overline">
        <i /> Brand Profile Setup
      </div>
      <h1 style={{ marginTop: '8px' }}>Tell creators about your brand.</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
        This profile helps creators understand your industry, target aesthetic, and collaboration scale.
      </p>

      <form onSubmit={submit}>
        <Input
          label="Business / Brand Name"
          required
          placeholder="e.g. Blue Tokai, Kiro Beauty, Mokobara"
          value={form.businessName}
          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
        />

        <Input
          label="Industry / Business Category"
          required
          placeholder="e.g. Specialty Café, Organic Skincare, Travel Luggage"
          value={form.businessType}
          onChange={(e) => setForm({ ...form, businessType: e.target.value })}
        />

        <div className="form-row-2">
          <Input
            label="Estimated Campaign Budget"
            required
            placeholder="e.g. ₹2,000–₹10,000"
            value={form.budgetRange}
            onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
          />
          <Input
            label="Primary City / Headquarters"
            required
            placeholder="e.g. Mumbai, Bengaluru"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>

        {error && <ErrorState error={error} />}

        <Button
          disabled={busy}
          loading={busy}
          size="lg"
          className="full"
          style={{ marginTop: '16px' }}
        >
          {busy ? 'Saving profile…' : 'Complete Setup & Enter Workspace'}
        </Button>
      </form>
    </main>
  )
}
