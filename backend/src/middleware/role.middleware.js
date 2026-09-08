import { adminDb } from '../config/supabase.js'
import { ApiError } from '../utils/api-error.js'
export async function loadCurrentUser(request,_response,next){try{const {data,error}=await adminDb().from('users').select('id,role,name,email,is_disabled').eq('id',request.auth.id).maybeSingle();if(error)throw error;if(!data)throw new ApiError(403,'Finish role setup to continue','PROFILE_REQUIRED');if(data.is_disabled)throw new ApiError(403,'This account is disabled','ACCOUNT_DISABLED');request.currentUser=data;next()}catch(error){next(error)}}
export const allowRoles=(...roles)=>(request,_response,next)=>roles.includes(request.currentUser?.role)?next():next(new ApiError(403,'You do not have access to this resource','FORBIDDEN'))
