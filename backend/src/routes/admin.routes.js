import { Router } from 'express'
import * as c from '../controllers/admin.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { loadCurrentUser } from '../middleware/role.middleware.js'
import { requireAdmin } from '../middleware/admin.middleware.js'
export const adminRouter=Router();adminRouter.use(authenticate,loadCurrentUser,requireAdmin);adminRouter.get('/metrics',c.metrics);adminRouter.get('/users',c.users);adminRouter.patch('/users/:id',c.updateUser)
