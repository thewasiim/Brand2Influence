import express from 'express'
import { env } from './config/env.js'
import { authRouter } from './routes/auth.routes.js'
import { influencerRouter } from './routes/influencer.routes.js'
import { brandRouter } from './routes/brand.routes.js'
import { campaignRouter } from './routes/campaign.routes.js'
import { conversationRouter } from './routes/conversation.routes.js'
import { messageRouter } from './routes/message.routes.js'
import { adminRouter } from './routes/admin.routes.js'
import { notFound } from './middleware/not-found.js'
import { errorHandler } from './middleware/error-handler.js'

export const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', env.frontendOrigin)
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRouter)
app.use('/api/influencers', influencerRouter)
app.use('/api/brands', brandRouter)
app.use('/api/campaigns', campaignRouter)
app.use('/api/conversations', conversationRouter)
app.use('/api/messages', messageRouter)
app.use('/api/admin', adminRouter)

app.use(notFound)
app.use(errorHandler)

