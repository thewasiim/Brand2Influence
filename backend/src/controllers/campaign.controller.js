import * as service from '../services/campaign.service.js'

export const create = async (req, res, next) => {
  try {
    res.json(await service.create(req.currentUser, req.body))
  } catch (e) {
    next(e)
  }
}

export const update = async (req, res, next) => {
  try {
    res.json(await service.update(req.currentUser, req.params.id, req.body))
  } catch (e) {
    next(e)
  }
}

export const remove = async (req, res, next) => {
  try {
    res.json(await service.remove(req.currentUser, req.params.id))
  } catch (e) {
    next(e)
  }
}

export const list = async (req, res, next) => {
  try {
    res.json(await service.list(req.query))
  } catch (e) {
    next(e)
  }
}

export const listMine = async (req, res, next) => {
  try {
    res.json(await service.listMine(req.currentUser))
  } catch (e) {
    next(e)
  }
}

export const getById = async (req, res, next) => {
  try {
    res.json(await service.getById(req.params.id))
  } catch (e) {
    next(e)
  }
}

export const apply = async (req, res, next) => {
  try {
    res.json(await service.apply(req.currentUser, req.params.id, req.body))
  } catch (e) {
    next(e)
  }
}
