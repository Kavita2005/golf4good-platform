import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import scoresRoutes from './routes/scores.js'
import subscriptionsRoutes from './routes/subscriptions.js'
import charitiesRoutes from './routes/charities.js'
import drawsRoutes from './routes/draws.js'
import winnersRoutes from './routes/winners.js'
import adminRoutes from './routes/admin.js'
import webhookRoutes from './routes/webhooks.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// ─── Webhooks must come BEFORE express.json() ─────────────────────────────────
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes)

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}))
app.use(express.json())
app.use(morgan('dev'))

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/scores', scoresRoutes)
app.use('/api/subscriptions', subscriptionsRoutes)
app.use('/api/charities', charitiesRoutes)
app.use('/api/draws', drawsRoutes)
app.use('/api/winners', winnersRoutes)
app.use('/api/admin', adminRoutes)

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

app.listen(PORT, () => console.log(`🏌️ Golf4Good API running on port ${PORT}`))

export default app
