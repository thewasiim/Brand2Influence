import { Router } from 'express'
import * as c from '../controllers/brand.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { loadCurrentUser, allowRoles } from '../middleware/role.middleware.js'

export const brandRouter = Router()

brandRouter.get('/', c.list)
brandRouter.get('/:id', c.get)
brandRouter.post('/profile', authenticate, loadCurrentUser, allowRoles('brand', 'admin'), c.save)
