import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  me,
  role,
  register,
  login,
  checkUsername,
  resolveIdentifier,
  profile,
  updateProfile,
  googleAuth,
  googleCallback,
  sendOtp,
  verifyOtp,
  forgotPasswordOtp,
  resetPasswordOtp,
  logout
} from '../controllers/auth.controller.js'

export const authRouter = Router()

authRouter.get('/google', googleAuth)
authRouter.get('/google/callback', googleCallback)
authRouter.get('/check-username', checkUsername)
authRouter.post('/send-otp', sendOtp)
authRouter.post('/verify-otp', verifyOtp)
authRouter.post('/forgot-password-otp', forgotPasswordOtp)
authRouter.post('/reset-password-otp', resetPasswordOtp)
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/resolve-identifier', resolveIdentifier)
authRouter.post('/logout', logout)
authRouter.get('/me', authenticate, me)
authRouter.post('/role', authenticate, role)
authRouter.get('/profile', authenticate, profile)
authRouter.put('/profile', authenticate, updateProfile)


