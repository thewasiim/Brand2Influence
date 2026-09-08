import { Router } from 'express'
import * as c from '../controllers/conversation.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { loadCurrentUser, allowRoles } from '../middleware/role.middleware.js'
export const conversationRouter=Router();conversationRouter.use(authenticate,loadCurrentUser,allowRoles('brand','influencer'));conversationRouter.get('/',c.list);conversationRouter.post('/',c.create)
