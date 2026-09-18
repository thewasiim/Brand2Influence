import { api } from './api'
import { supabase } from '../lib/supabase'

export const socialService = {
  // Feed & Explore
  getFeed: (page = 1) => api(`/social/feed?page=${page}`),
  getExplore: (page = 1) => api(`/social/explore?page=${page}`),
  getSuggested: () => api('/social/suggested'),

  // Posts
  getUserPosts: (userId, page = 1) => api(`/social/posts/${userId}?page=${page}`),
  createPost: (payload) => api('/social/posts', { method: 'POST', body: JSON.stringify(payload) }),

  // Upload media to Supabase storage, return public URL
  uploadPostMedia: async (file, userId) => {
    if (!supabase) throw new Error('Supabase not configured.')
    const ext = file.name.split('.').pop()
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('post-media').upload(path, file, { upsert: false })
    if (error) throw error
    return supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl
  },

  // Likes
  likePost: (id) => api(`/social/posts/${id}/like`, { method: 'POST' }),
  unlikePost: (id) => api(`/social/posts/${id}/like`, { method: 'DELETE' }),

  // Follows
  followUser: (userId) => api(`/social/follow/${userId}`, { method: 'POST' }),
  unfollowUser: (userId) => api(`/social/follow/${userId}`, { method: 'DELETE' }),
  getFollowers: (userId) => api(`/social/followers/${userId}`),
  getFollowing: (userId) => api(`/social/following/${userId}`),
  getFollowStatus: (userId) => api(`/social/follow-status/${userId}`),

  // Notifications
  getNotifications: () => api('/social/notifications'),
  markNotificationsRead: () => api('/social/notifications/read', { method: 'POST' }),

  // Search
  search: (q, page = 1) => api(`/social/search?q=${encodeURIComponent(q)}&page=${page}`),
}
