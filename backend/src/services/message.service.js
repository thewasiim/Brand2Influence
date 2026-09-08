import { adminDb } from '../config/supabase.js'
import { ApiError, boundedText } from '../utils/api-error.js'
import { assertMember } from './conversation.service.js'
export async function list(user,conversationId){await assertMember(user.id,conversationId);const {data,error}=await adminDb().from('messages').select('*').eq('conversation_id',conversationId).order('sent_at');if(error)throw error;return {items:data.map(x=>({id:x.id,conversationId:x.conversation_id,senderId:x.sender_id,content:x.content,sentAt:x.sent_at}))}}
export async function send(user,payload){await assertMember(user.id,payload.conversationId);const {data,error}=await adminDb().from('messages').insert({conversation_id:payload.conversationId,sender_id:user.id,content:boundedText(payload.content,'message',2000)}).select().single();if(error)throw error;return {id:data.id,conversationId:data.conversation_id,senderId:data.sender_id,content:data.content,sentAt:data.sent_at}}
