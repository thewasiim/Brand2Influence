import { Router } from 'express'
import { save } from '../controllers/brand.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { loadCurrentUser, allowRoles } from '../middleware/role.middleware.js'
export const brandRouter=Router();brandRouter.post('/profile',authenticate,loadCurrentUser,allowRoles('brand'),save)
