import { Router } from 'express'
import * as c from '../controllers/influencer.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { loadCurrentUser, allowRoles } from '../middleware/role.middleware.js'
export const influencerRouter=Router();influencerRouter.get('/',c.list);influencerRouter.get('/:id',c.get);influencerRouter.post('/profile',authenticate,loadCurrentUser,allowRoles('influencer'),c.save)
