import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import { me, role } from '../controllers/auth.controller.js'
export const authRouter=Router();authRouter.get('/me',authenticate,me);authRouter.post('/role',authenticate,role)
