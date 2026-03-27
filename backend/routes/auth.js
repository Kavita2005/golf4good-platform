import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../utils/supabase.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'golf4good_secret_key_2026'
const JWT_EXPIRES = '7d'

const signToken = (userId) => jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES })

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, handicap } = req.body
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ message: 'All required fields must be provided' })
    }
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' })

    // Check duplicate
    const { data: existing } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single()
    if (existing) return res.status(409).json({ message: 'Email already registered' })

    const password_hash = await bcrypt.hash(password, 12)
    const { data: user, error } = await supabase
      .from('users')
      .insert({ email: email.toLowerCase(), password_hash, first_name, last_name, handicap: handicap || null, role: 'user' })
      .select('id, email, first_name, last_name, role')
      .single()

    if (error) throw error

    const token = signToken(user.id)
    res.status(201).json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

    const { data: user } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, password_hash')
      .eq('email', email.toLowerCase())
      .single()

    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, status, plan, current_period_end, charity_amount')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { password_hash, ...safeUser } = user
    const token = signToken(user.id)
    res.json({ token, user: safeUser, subscription: subscription || null })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Login failed' })
  }
})

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, status, plan, current_period_end, charity_amount')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single()

    res.json({ user: req.user, subscription: subscription || null })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

// ── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  // Always respond ok to prevent user enumeration
  res.json({ message: 'If that email exists, a reset link has been sent.' })
})

export default router
