import * as service from '../services/brand.service.js'
export const save=async(req,res,next)=>{try{res.json(await service.save(req.currentUser,req.body))}catch(e){next(e)}}
