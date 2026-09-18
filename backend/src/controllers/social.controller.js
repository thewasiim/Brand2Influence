import * as social from '../services/social.service.js'
import { ApiError } from '../utils/api-error.js'

// POST /api/social/follow/:userId
export async function follow(req, res, next) {
  try {
    const result = await social.followUser(req.auth.id, req.params.userId)
    // Notify the target user
    res.json(result)
  } catch (e) { next(e) }
}

// DELETE /api/social/follow/:userId
export async function unfollow(req, res, next) {
  try {
    const result = await social.unfollowUser(req.auth.id, req.params.userId)
    res.json(result)
  } catch (e) { next(e) }
}

// GET /api/social/followers/:userId
export async function getFollowers(req, res, next) {
  try {
    const items = await social.getFollowers(req.params.userId)
    res.json({ items })
  } catch (e) { next(e) }
}

// GET /api/social/following/:userId
export async function getFollowing(req, res, next) {
  try {
    const items = await social.getFollowing(req.params.userId)
    res.json({ items })
  } catch (e) { next(e) }
}

// GET /api/social/follow-status/:userId
export async function followStatus(req, res, next) {
  try {
    const status = await social.getFollowStatus(req.auth?.id, req.params.userId)
    res.json(status)
  } catch (e) { next(e) }
}

// GET /api/social/feed
export async function getFeed(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10)
    const result = await social.getFeed(req.auth.id, page)
    res.json(result)
  } catch (e) { next(e) }
}

// GET /api/social/explore
export async function getExplore(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10)
    const result = await social.getExplore(page)
    res.json(result)
  } catch (e) { next(e) }
}

// POST /api/social/posts
export async function createPost(req, res, next) {
  try {
    const { mediaUrl, mediaType, caption, thumbnailUrl } = req.body
    const post = await social.createPost(req.auth.id, { mediaUrl, mediaType, caption, thumbnailUrl })
    res.status(201).json(post)
  } catch (e) { next(e) }
}

// GET /api/social/posts/:userId
export async function getUserPosts(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10)
    const result = await social.getUserPosts(req.params.userId, page)
    res.json(result)
  } catch (e) { next(e) }
}

// POST /api/social/posts/:id/like
export async function likePost(req, res, next) {
  try {
    const result = await social.likePost(req.auth.id, req.params.id)
    res.json(result)
  } catch (e) { next(e) }
}

// DELETE /api/social/posts/:id/like
export async function unlikePost(req, res, next) {
  try {
    const result = await social.unlikePost(req.auth.id, req.params.id)
    res.json(result)
  } catch (e) { next(e) }
}

// GET /api/social/notifications
export async function getNotifications(req, res, next) {
  try {
    const result = await social.getNotifications(req.auth.id)
    res.json(result)
  } catch (e) { next(e) }
}

// POST /api/social/notifications/read
export async function markRead(req, res, next) {
  try {
    const result = await social.markNotificationsRead(req.auth.id)
    res.json(result)
  } catch (e) { next(e) }
}

// GET /api/social/search?q=
export async function search(req, res, next) {
  try {
    const result = await social.search(req.query.q, parseInt(req.query.page || '1', 10))
    res.json(result)
  } catch (e) { next(e) }
}

// GET /api/social/suggested
export async function suggested(req, res, next) {
  try {
    const items = await social.getSuggestedUsers(req.auth.id)
    res.json({ items })
  } catch (e) { next(e) }
}
