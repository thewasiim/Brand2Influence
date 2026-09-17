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


