import * as service from '../services/influencer.service.js'
import { syncSocialAccount, fetchSocialPublic } from '../services/socialSync.service.js'

export const list = async (req, res, next) => { try { res.json(await service.list(req.query)) } catch (e) { next(e) } }
export const get = async (req, res, next) => { try { res.json(await service.getById(req.params.id)) } catch (e) { next(e) } }
export const save = async (req, res, next) => { try { res.json(await service.save(req.currentUser, req.body)) } catch (e) { next(e) } }
export const syncSocial = async (req, res, next) => { try { res.json(await syncSocialAccount(req.currentUser, req.body)) } catch (e) { next(e) } }
export const fetchPublicSocial = async (req, res, next) => {
  try {
    const stats = await fetchSocialPublic(req.body)
    res.json({ success: true, stats, data: stats })
  } catch (e) {
    next(e)
  }
}
