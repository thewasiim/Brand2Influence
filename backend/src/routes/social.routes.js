import { Router } from 'express'
import * as c from '../controllers/social.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export const socialRouter = Router()

// Public
socialRouter.get('/explore', c.getExplore)
socialRouter.get('/search', c.search)
socialRouter.get('/posts/:userId', c.getUserPosts)
socialRouter.get('/followers/:userId', c.getFollowers)
socialRouter.get('/following/:userId', c.getFollowing)

// Auth required
socialRouter.get('/feed', authenticate, c.getFeed)
socialRouter.get('/suggested', authenticate, c.suggested)
socialRouter.get('/follow-status/:userId', authenticate, c.followStatus)
socialRouter.post('/follow/:userId', authenticate, c.follow)
socialRouter.delete('/follow/:userId', authenticate, c.unfollow)
socialRouter.post('/posts', authenticate, c.createPost)
socialRouter.post('/posts/:id/like', authenticate, c.likePost)
socialRouter.delete('/posts/:id/like', authenticate, c.unlikePost)
socialRouter.get('/notifications', authenticate, c.getNotifications)
socialRouter.post('/notifications/read', authenticate, c.markRead)
