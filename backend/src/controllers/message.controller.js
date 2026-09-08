import * as service from '../services/message.service.js'
export const list=async(req,res,next)=>{try{res.json(await service.list(req.currentUser,req.params.conversationId))}catch(e){next(e)}}
export const send=async(req,res,next)=>{try{res.status(201).json(await service.send(req.currentUser,req.body))}catch(e){next(e)}}
