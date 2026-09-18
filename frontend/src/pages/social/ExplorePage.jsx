import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { socialService } from '../../services/social'
import './ExplorePage.css'

function PostModal({ post, onClose, onLike }) {
  const [liked, setLiked] = useState(post.isLikedByViewer)
  const [count, setCount] = useState(post.likes_count || 0)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleLike = async () => {
    try {
      if (liked) {
        await socialService.unlikePost(post.id)
        setLiked(false); setCount(c => Math.max(0, c - 1))
      } else {
        await socialService.likePost(post.id)
        setLiked(true); setCount(c => c + 1)
      }
      onLike && onLike(post.id, !liked)
    } catch {/* ignore */}
  }

  const handleFollow = async () => {
    try {
      await socialService.followUser(post.author?.id || post.user_id)
      setFollowing(true)
    } catch {/* ignore */}
  }

  const author = post.author || {}
  const initials = (author.name || 'U').slice(0, 1).toUpperCase()
  const isVideo = post.media_type === 'video'

  return (
    <div className="ep-modal-overlay" onClick={onClose} role="dialog" aria-label="Post detail">
      <div className="ep-modal" onClick={e => e.stopPropagation()}>
        {/* Media side */}
        <div className="ep-modal-media">
          {isVideo
            ? <video src={post.media_url} poster={post.thumbnail_url} controls autoPlay playsInline className="ep-modal-video" />
            : <img src={post.media_url} alt={post.caption} className="ep-modal-img" />
          }
        </div>

        {/* Info side */}
        <div className="ep-modal-info">
          <button className="ep-modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div className="ep-modal-author">
            <div className="ep-modal-avatar">
              {author.avatarUrl ? <img src={author.avatarUrl} alt={author.name} /> : <span>{initials}</span>}
            </div>
            <div className="ep-modal-author-text">
              <span className="ep-modal-author-name">{author.name || 'Creator'}</span>
              <span className={`hfp-role-pill ${author.role === 'brand' ? 'brand' : 'creator'}`}>
                {author.role === 'brand' ? '🏷️ Brand' : '✨ Creator'}
              </span>
            </div>
            {!following
              ? <button className="hfp-follow-btn" onClick={handleFollow} style={{ marginLeft: 'auto' }}>Follow</button>
              : <span className="hfp-following-label" style={{ marginLeft: 'auto' }}>Following</span>
            }
          </div>

          <div className="ep-modal-caption">{post.caption}</div>

          <div className="ep-modal-actions">
            <button className={`hfp-like-btn ${liked ? 'liked' : ''}`} onClick={handleLike} aria-label="Like">
              <svg width="22" height="22" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{count > 0 ? count.toLocaleString() : 'Like'}</span>
            </button>
          </div>

          <div className="ep-modal-meta">
            {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  )
}

function ExploreGrid({ posts, onSelect, loading }) {
  return (
    <div className="ep-grid">
      {posts.map(post => (
        <button
          key={post.id}
          className="ep-grid-item"
          onClick={() => onSelect(post)}
          aria-label={`View post: ${post.caption?.slice(0, 40) || 'Post'}`}
        >
          {post.media_type === 'video' ? (
            <>
              <img
                src={post.thumbnail_url || `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=60`}
                alt={post.caption}
                className="ep-grid-thumb"
                loading="lazy"
              />
              <div className="ep-grid-video-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z"/>
                </svg>
              </div>
            </>
          ) : (
            <img src={post.media_url} alt={post.caption} className="ep-grid-thumb" loading="lazy" />
          )}
          <div className="ep-grid-overlay">
            <span className="ep-grid-likes">
              ♥ {(post.likes_count || 0).toLocaleString()}
            </span>
          </div>
        </button>
      ))}
      {loading && [1,2,3,4,5,6].map(i => (
        <div key={`skel-${i}`} className="ep-grid-item ep-grid-skel">
          <div className="hfp-skel" style={{ height: '100%', borderRadius: '8px' }} />
        </div>
      ))}
    </div>
  )
}

export default function ExplorePage() {
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filter, setFilter] = useState('all') // 'all' | 'image' | 'video'
  const loaderRef = useRef(null)

  const loadMore = useCallback(async (p) => {
    setLoading(true)
    try {
      const res = await socialService.getExplore(p)
      setPosts(prev => p === 1 ? (res.items || []) : [...prev, ...(res.items || [])])
      setHasMore(res.hasMore || false)
    } catch {/* ignore */} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMore(1)
  }, [loadMore])

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        const next = page + 1
        setPage(next)
        loadMore(next)
      }
    }, { threshold: 0.1 })
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, page, loadMore])

  const filtered = filter === 'all' ? posts : posts.filter(p => p.media_type === filter)

  return (
    <div className="ep-root">
      <div className="ep-header">
        <div>
          <h1 className="ep-title">Explore</h1>
          <p className="ep-subtitle">Discover content from creators and brands</p>
        </div>
        <div className="ep-filter-tabs">
          {['all', 'image', 'video'].map(f => (
            <button
              key={f}
              className={`ep-filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '✦ All' : f === 'image' ? '🖼 Images' : '🎬 Videos'}
            </button>
          ))}
        </div>
      </div>

      <ExploreGrid posts={filtered} onSelect={setSelected} loading={loading && posts.length === 0} />

      <div ref={loaderRef} style={{ height: 1 }} />

      {loading && posts.length > 0 && (
        <div className="ep-loading-more">Loading more…</div>
      )}

      {selected && (
        <PostModal
          post={selected}
          onClose={() => setSelected(null)}
          onLike={(id, liked) => {
            setPosts(prev => prev.map(p =>
              p.id === id ? { ...p, isLikedByViewer: liked, likes_count: liked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1) } : p
            ))
          }}
        />
      )}
    </div>
  )
}
