import { Router } from 'express'
import {
  create,
  update,
  remove,
  list,
  listMine,
  getById,
  apply
} from '../controllers/campaign.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { loadCurrentUser, allowRoles } from '../middleware/role.middleware.js'

export const campaignRouter = Router()

// Public discovery of active campaign advertisements
campaignRouter.get('/', list)
campaignRouter.get('/item/:id', getById)

// Brand operations
campaignRouter.post('/', authenticate, loadCurrentUser, allowRoles('brand', 'admin'), create)
campaignRouter.get('/mine', authenticate, loadCurrentUser, allowRoles('brand', 'admin'), listMine)
campaignRouter.patch('/:id', authenticate, loadCurrentUser, allowRoles('brand', 'admin'), update)
campaignRouter.delete('/:id', authenticate, loadCurrentUser, allowRoles('brand', 'admin'), remove)

// Influencer applications / message initiation
campaignRouter.post('/:id/apply', authenticate, loadCurrentUser, allowRoles('influencer', 'admin'), apply)
