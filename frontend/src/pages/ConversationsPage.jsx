import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { conversationsService } from '../services/conversations'
import { messagesService } from '../services/messages'
import { supabase } from '../lib/supabase'
import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Avatar,
  Badge,
} from '../components/ui'

export function ConversationsPage() {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    conversationsService
      .list()
      .then((x) => setItems(x.items))
      .catch((e) => setError(e.message))
  }, [])

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <div className="overline">
            <i /> Direct Inquiries
          </div>
          <h1 style={{ marginTop: '6px' }}>Collaboration Messages</h1>
        </div>
      </div>

      <div className="conversations">
        <aside>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px' }}>Inbox</h3>
            <Badge variant="secondary">{items ? `${items.length} active` : '...'}</Badge>
          </div>

          {error && <ErrorState error={error} />}

          {!items ? (
            <LoadingState label="Loading inbox…" />
          ) : items.length ? (
            items.map((c) => (
              <Link key={c.id} to={`/conversations/${c.id}`} className="conversation-item">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <Avatar name={c.otherParticipant?.name || 'User'} size="sm" tone="secondary" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px' }}>
                      <b style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.otherParticipant?.name || 'Collaboration Thread'}
                      </b>
                      {c.campaign && (
                        <span style={{ fontSize: '10px', color: 'var(--color-secondary)', fontWeight: 600, background: 'var(--color-surface-3)', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                          📢 Ad
                        </span>
                      )}
                    </div>
                    {c.campaign && (
                      <div style={{ fontSize: '11px', color: 'var(--color-neutral-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Brief: {c.campaign.title}
                      </div>
                    )}
                    <small style={{ color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                      {c.lastMessage?.content || 'No messages yet'}
                    </small>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState>No messages yet.</EmptyState>
          )}
        </aside>

        <section className="chat-placeholder">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Select a Conversation</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              Choose a creator or brand thread from the left to read messages and align on deliverables.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export function ConversationThreadPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [messages, setMessages] = useState(null)
  const [activeConv, setActiveConv] = useState(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // Fetch conversation info
    conversationsService
      .list()
      .then((res) => {
        const found = res.items?.find((x) => x.id === id)
        if (found) setActiveConv(found)
      })
      .catch(() => {})

    messagesService
      .list(id)
      .then((x) => setMessages(x.items))
      .catch((e) => setError(e.message))

    if (!supabase) return

    const channel = supabase
      .channel(`conversation:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
        (payload) => setMessages((current) => [...(current || []), payload.new])
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    try {
      const item = await messagesService.send({ conversationId: id, content: text.trim() })
      setMessages((current) => (current?.some((x) => x.id === item.id) ? current : [...(current || []), item]))
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page thread">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button variant="secondary" size="sm" onClick={() => nav('/conversations')}>
            ← Back to Inbox
          </Button>
          <div className="overline">
            <i /> {activeConv?.otherParticipant?.name ? `Chat with ${activeConv.otherParticipant.name}` : 'Active Thread'}
          </div>
        </div>

        {activeConv?.campaign && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              📢 Campaign: <b>{activeConv.campaign.title}</b>
            </span>
            <Link to={`/campaigns/${activeConv.campaign.id}`} className="ui-button ui-btn--outline ui-btn--sm" style={{ padding: '2px 8px', fontSize: '11px' }}>
              View Ad Brief
            </Link>
          </div>
        )}
      </div>

      {error && <ErrorState error={error} />}

      {!messages ? (
        <LoadingState label="Loading messages…" />
      ) : (
        <div className="message-list">
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--color-text-tertiary)' }}>
              No messages yet in this conversation. Start by introducing your collaboration goals.
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className="message">
                <b>{m.senderName || 'Participant'}</b>
                <span style={{ whiteSpace: 'pre-line' }}>{m.content}</span>
              </div>
            ))
          )}
        </div>
      )}

      <form onSubmit={send} className="message-form">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message or pitch questions..."
          aria-label="Write a message"
        />
        <Button disabled={busy || !text.trim()} loading={busy}>
          Send
        </Button>
      </form>
    </main>
  )
}

