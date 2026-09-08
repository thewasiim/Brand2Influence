import * as service from '../services/auth.service.js'

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
