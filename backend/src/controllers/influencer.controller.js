import * as service from '../services/influencer.service.js'
export const list=async(req,res,next)=>{try{res.json(await service.list(req.query))}catch(e){next(e)}}
export const get=async(req,res,next)=>{try{res.json(await service.getById(req.params.id))}catch(e){next(e)}}
export const save=async(req,res,next)=>{try{res.json(await service.save(req.currentUser,req.body))}catch(e){next(e)}}
