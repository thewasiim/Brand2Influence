import * as service from '../services/influencer.service.js'
import { syncSocialAccount, fetchSocialPublic, fetchSocialPosts, verifySocialOwnership, sendSocialVerificationOtp, verifySocialVerificationOtp } from '../services/socialSync.service.js'

export const list = async (req, res, next) => { try { res.json(await service.list(req.query)) } catch (e) { next(e) } }
export const get = async (req, res, next) => { try { res.json(await service.getById(req.params.id)) } catch (e) { next(e) } }
export const save = async (req, res, next) => { try { res.json(await service.save(req.currentUser, req.body)) } catch (e) { next(e) } }
export const addPost = async (req, res, next) => { try { res.json(await service.addPost(req.currentUser, req.body)) } catch (e) { next(e) } }
export const syncSocial = async (req, res, next) => { try { res.json(await syncSocialAccount(req.currentUser, req.body)) } catch (e) { next(e) } }
export const fetchPublicSocial = async (req, res, next) => {
  try {
    const stats = await fetchSocialPublic(req.body)
    res.json({ success: true, stats, data: stats })
  } catch (e) {
    next(e)
  }
}
export const fetchPosts = async (req, res, next) => {
  try {
    const posts = await fetchSocialPosts(req.body)
    res.json({ success: true, posts, count: posts.length })
  } catch (e) {
    next(e)
  }
}
export const verifyOwnership = async (req, res, next) => {
  try {
    const result = await verifySocialOwnership(req.currentUser, req.body)
    res.json(result)
  } catch (e) {
    next(e)
  }
}
export const sendSocialOtp = async (req, res, next) => {
  try {
    const result = await sendSocialVerificationOtp(req.body)
    res.json(result)
  } catch (e) {
    next(e)
  }
}
export const verifySocialOtp = async (req, res, next) => {
  try {
    const result = await verifySocialVerificationOtp(req.body)
    res.json(result)
  } catch (e) {
    next(e)
  }
}



