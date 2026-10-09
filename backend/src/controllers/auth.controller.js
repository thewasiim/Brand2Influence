import * as service from '../services/auth.service.js'
import { env } from '../config/env.js'

export const me = async (req, res, next) => {
  try {
    res.json(await service.getMe(req.auth))
  } catch (e) {
    next(e)
  }
}

export const role = async (req, res, next) => {
  try {
    res.status(200).json(await service.setRole(req.auth, req.body.role))
  } catch (e) {
    next(e)
  }
}

export const register = async (req, res, next) => {
  try {
    const result = await service.register(req.body)
    res.status(201).json(result)
  } catch (e) {
    next(e)
  }
}

export const checkUsername = async (req, res, next) => {
  try {
    const username = req.query.username || req.body.username || ''
    const result = await service.checkUsernameAvailability(username)
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export const resolveIdentifier = async (req, res, next) => {
  try {
    const result = await service.resolveIdentifier(req.body.identifier)
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export const profile = async (req, res, next) => {
  try {
    res.json(await service.getProfile(req.auth))
  } catch (e) {
    next(e)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    res.json(await service.updateProfile(req.auth, req.body))
  } catch (e) {
    next(e)
  }
}

export const googleAuth = (req, res, next) => {
  try {
    const role = req.query.role || ''
    const url = service.getGoogleAuthUrl(role)
    res.redirect(url)
  } catch (e) {
    next(e)
  }
}

export const googleCallback = async (req, res, next) => {
  try {
    const { code, state, error, error_description } = req.query
    if (error) {
      return res.redirect(`${env.frontendOrigin}/auth/login?error=${encodeURIComponent(error_description || error)}`)
    }
    const result = await service.handleGoogleCallback(code, state)
    res.redirect(result.frontendRedirectUrl)
  } catch (e) {
    console.error('Google OAuth callback error:', e)
    res.redirect(`${env.frontendOrigin}/auth/login?error=${encodeURIComponent(e.message || 'Google authentication failed')}`)
  }
}

export const sendOtp = async (req, res, next) => {
  try {
    const result = await service.sendRegistrationOtp(req.body)
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export const verifyOtp = async (req, res, next) => {
  try {
    const result = await service.verifyRegistrationOtp(req.body)
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export const forgotPasswordOtp = async (req, res, next) => {
  try {
    const result = await service.sendForgotPasswordOtp(req.body)
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export const resetPasswordOtp = async (req, res, next) => {
  try {
    const result = await service.verifyAndResetPasswordOtp(req.body)
    res.json(result)
  } catch (e) {
    next(e)
  }
}

export const logout = async (req, res, next) => {
  try {
    res.clearCookie('token')
    res.json({ success: true, message: 'Logged out successfully' })
  } catch (e) {
    next(e)
  }
}



