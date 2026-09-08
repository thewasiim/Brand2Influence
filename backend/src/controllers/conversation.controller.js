import * as service from '../services/conversation.service.js'
export const create=async(req,res,next)=>{try{res.status(201).json(await service.create(req.currentUser,req.body.participantId))}catch(e){next(e)}}
export const list=async(req,res,next)=>{try{res.json(await service.list(req.currentUser))}catch(e){next(e)}}
