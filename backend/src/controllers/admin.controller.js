import * as service from '../services/admin.service.js'
export const metrics=async(_req,res,next)=>{try{res.json(await service.metrics())}catch(e){next(e)}}
export const users=async(req,res,next)=>{try{res.json(await service.users(req.query))}catch(e){next(e)}}
export const updateUser=async(req,res,next)=>{try{res.json(await service.updateUser(req.params.id,req.body))}catch(e){next(e)}}
