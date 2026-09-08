import { Router } from 'express'
import * as c from '../controllers/message.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { loadCurrentUser, allowRoles } from '../middleware/role.middleware.js'
export const messageRouter=Router();messageRouter.use(authenticate,loadCurrentUser,allowRoles('brand','influencer'));messageRouter.get('/:conversationId',c.list);messageRouter.post('/',c.send)
