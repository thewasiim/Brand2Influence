import * as service from '../services/auth.service.js'
export const me=async(req,res,next)=>{try{res.json(await service.getMe(req.auth))}catch(e){next(e)}}
export const role=async(req,res,next)=>{try{res.status(200).json(await service.setRole(req.auth,req.body.role))}catch(e){next(e)}}
