import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { me, role, register, profile, updateProfile } from '../controllers/auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', register)
authRouter.get('/me', authenticate, me)
authRouter.post('/role', authenticate, role)
authRouter.get('/profile', authenticate, profile)
authRouter.put('/profile', authenticate, updateProfile)
