import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { socialService } from '../../services/social'
import './HomeFeedPage.css'

function PostCard({ post, onLike }) {
  const [liked, setLiked] = useState(post.isLikedByViewer)
  const [count, setCount] = useState(post.likes_count || 0)
  const [busy, setBusy] = useState(false)
  const [following, setFollowing] = useState(false)

  const handleLike = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (liked) {
        await socialService.unlikePost(post.id)
        setLiked(false)
        setCount(c => Math.max(0, c - 1))
      } else {
        await socialService.likePost(post.id)
        setLiked(true)
        setCount(c => c + 1)
      }
    } catch {/* ignore */} finally { setBusy(false) }
  }

  const handleFollow = async () => {
    try {
      await socialService.followUser(post.author?.id || post.user_id)
      setFollowing(true)
    } catch {/* ignore */}
  }

  const isVideo = post.media_type === 'video'
  const author = post.author || {}
  const initials = (author.name || 'U').slice(0, 1).toUpperCase()

  return (
    <article className="hfp-card">
      {/* Author header */}
      <div className="hfp-card-header">
        <div className="hfp-author-wrap">
          <div className="hfp-avatar">
            {author.avatarUrl
              ? <img src={author.avatarUrl} alt={author.name} />
              : <span>{initials}</span>
            }
          </div>
          <div className="hfp-author-info">
            <span className="hfp-author-name">{author.name || 'Creator'}</span>
            <span className={`hfp-role-pill ${author.role === 'brand' ? 'brand' : 'creator'}`}>
              {author.role === 'brand' ? '🏷️ Brand' : '✨ Creator'}
            </span>
          </div>
        </div>
        {!following && author.id && (
          <button className="hfp-follow-btn" onClick={handleFollow}>Follow</button>
        )}
        {following && <span className="hfp-following-label">Following</span>}
      </div>

      {/* Media */}
      <div className="hfp-media">
        {isVideo ? (
          <video
            src={post.media_url}
            poster={post.thumbnail_url}
            controls
            playsInline
            className="hfp-video"
          />
        ) : (
          <img src={post.media_url} alt={post.caption} className="hfp-image" loading="lazy" />
        )}
      </div>

      {/* Actions */}
      <div className="hfp-actions">
        <button
          className={`hfp-like-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={busy}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{count > 0 ? count.toLocaleString() : ''}</span>
        </button>

        <button className="hfp-comment-btn" aria-label="Comment">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        <button className="hfp-share-btn" aria-label="Share">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="hfp-caption">
          <span className="hfp-caption-author">{author.name || 'Creator'}</span> {post.caption}
        </div>
      )}

      {/* Time */}
      <div className="hfp-time">
        {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
    </article>
  )
}

function SuggestedCard({ user, onFollow }) {
  const [following, setFollowing] = useState(false)
  const handleFollow = async () => {
    try {
      await socialService.followUser(user.userId || user.id)
      setFollowing(true)
      onFollow && onFollow(user)
    } catch {/* ignore */}
  }
  const initials = (user.name || 'U').slice(0, 1).toUpperCase()
  return (
    <div className="hfp-suggested-card">
      <div className="hfp-sug-avatar">
        {user.profileImageUrl
          ? <img src={user.profileImageUrl} alt={user.name} />
          : <span>{initials}</span>
        }
      </div>
      <div className="hfp-sug-info">
        <span className="hfp-sug-name">{user.name}</span>
        <span className="hfp-sug-niche">{user.niche || user.businessType || ''}</span>
        <span className="hfp-sug-followers">
          {user.followersCount ? `${(user.followersCount / 1000).toFixed(0)}K followers` : ''}
        </span>
      </div>
      {following
        ? <span className="hfp-following-label">Following</span>
        : <button className="hfp-follow-btn" onClick={handleFollow}>Follow</button>
      }
    </div>
  )
}

export default function HomeFeedPage() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState(null)
  const [suggested, setSuggested] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const loadFeed = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const res = await socialService.getFeed(p)
      setPosts(prev => p === 1 ? (res.items || []) : [...(prev || []), ...(res.items || [])])
      setHasMore(res.hasMore || false)
      if (res.suggested?.length) setSuggested(res.suggested)
    } catch {
      // Fallback: load explore content when feed API is unavailable
      try {
        const res = await socialService.getExplore(p)
        setPosts(prev => p === 1 ? (res.items || []) : [...(prev || []), ...(res.items || [])])
        setHasMore(res.hasMore || false)
      } catch {
        // Both failed — show empty state
        setPosts([])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSuggested = useCallback(async () => {
    try {
      const res = await socialService.getSuggested()
      setSuggested(res.items || [])
    } catch {/* ignore */}
  }, [])

  useEffect(() => {
    loadFeed(1)
    loadSuggested()
  }, [loadFeed, loadSuggested])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    loadFeed(next)
  }

  const isBrand = profile?.role === 'brand'

  return (
    <div className="hfp-root">
      <div className="hfp-layout">
        {/* Feed Column */}
        <div className="hfp-feed-col">
          {/* Header */}
          <div className="hfp-feed-header">
            <h1 className="hfp-feed-title">Home</h1>
          </div>

          {!posts && loading && (
            <div className="hfp-loading">
              {[1, 2, 3].map(i => (
                <div key={i} className="hfp-skeleton-card">
                  <div className="hfp-skel hfp-skel-header" />
                  <div className="hfp-skel hfp-skel-media" />
                  <div className="hfp-skel hfp-skel-text" />
                </div>
              ))}
            </div>
          )}

          {posts !== null && posts.length === 0 && !loading && (
            <div className="hfp-empty">
              <div className="hfp-empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <h2>Your feed is empty</h2>
              <p>Follow creators and brands to see their posts here</p>
              <Link to="/explore" className="hfp-explore-cta">Explore Content →</Link>
            </div>
          )}

          {posts && posts.length > 0 && (
            <>
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
              {hasMore && (
                <button className="hfp-load-more" onClick={loadMore} disabled={loading}>
                  {loading ? 'Loading…' : 'Load more'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Sidebar — Suggested */}
        {suggested.length > 0 && (
          <div className="hfp-sidebar-col">
            <div className="hfp-sidebar-section">
              <h3 className="hfp-sidebar-title">Suggested for you</h3>
              {suggested.map(u => (
                <SuggestedCard key={u.id} user={u} />
              ))}
              <Link to="/search" className="hfp-see-all">See all →</Link>
            </div>

            {/* Quick stats */}
            <div className="hfp-sidebar-section hfp-quick-links">
              <Link to="/explore" className="hfp-quick-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
                Explore All Posts
              </Link>
              <Link to="/search" className="hfp-quick-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                {isBrand ? 'Find Creators' : 'Find Brands'}
              </Link>
              <Link to="/conversations" className="hfp-quick-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Messages
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
