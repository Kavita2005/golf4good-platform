import express from 'express'
import { supabase } from '../utils/supabase.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'
import DrawEngine from '../services/drawEngine.js'

const router = express.Router()

// GET /api/draws
router.get('/', async (req, res) => {
  try {
    const { data: draws } = await supabase
      .from('draws')
      .select('*')
      .order('draw_date', { ascending: false })
      .limit(24)
    res.json({ draws: draws || [] })
  } catch {
    res.status(500).json({ message: 'Failed to fetch draws' })
  }
})

// GET /api/draws/latest
router.get('/latest', async (req, res) => {
  try {
    const { data: draw } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })
      .limit(1)
      .single()
    res.json({ draw: draw || null })
  } catch {
    res.json({ draw: null })
  }
})

// GET /api/draws/my-history
router.get('/my-history', authenticate, async (req, res) => {
  try {
    const { data: history } = await supabase
      .from('draw_participants')
      .select('*, draws(name, draw_date, status), draw_winners(amount, match_type)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    const formatted = (history || []).map(h => ({
      draw_id: h.draw_id,
      draw_name: h.draws?.name,
      draw_date: h.draws?.draw_date,
      status: h.draws?.status,
      won: h.draw_winners?.length > 0,
      prize: h.draw_winners?.[0]?.amount,
      match_type: h.draw_winners?.[0]?.match_type,
    }))

    res.json({ history: formatted })
  } catch {
    res.json({ history: [] })
  }
})

// POST /api/draws (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, draw_date, prize_pool, algorithm } = req.body
    if (!name || !draw_date) return res.status(400).json({ message: 'Name and draw_date are required' })

    // Calculate prize pool from active subscriptions if not provided
    let pool = parseFloat(prize_pool) || 0
    if (!pool) {
      const { count } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      pool = (count || 0) * 12.99
    }

    // Get jackpot rollover from previous draw
    const { data: lastDraw } = await supabase
      .from('draws')
      .select('jackpot_rollover')
      .eq('status', 'published')
      .order('draw_date', { ascending: false })
      .limit(1)
      .single()

    const { data: draw, error } = await supabase.from('draws').insert({
      name,
      draw_date,
      prize_pool: pool,
      jackpot: Math.round(pool * 0.40) + (lastDraw?.jackpot_rollover || 0),
      jackpot_rollover: lastDraw?.jackpot_rollover || 0,
      algorithm: algorithm || 'random',
      status: 'upcoming',
    }).select().single()

    if (error) throw error
    res.status(201).json({ draw })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create draw' })
  }
})

// POST /api/draws/simulate (admin)
router.post('/simulate', authenticate, requireAdmin, async (req, res) => {
  try {
    const { algorithm = 'random' } = req.body
    const result = await DrawEngine.simulate(algorithm)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Simulation failed' })
  }
})

// POST /api/draws/:id/publish (admin)
router.post('/:id/publish', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data: draw } = await supabase.from('draws').select('*').eq('id', req.params.id).single()
    if (!draw) return res.status(404).json({ message: 'Draw not found' })
    if (draw.status === 'published') return res.status(400).json({ message: 'Draw already published' })

    const result = await DrawEngine.executeDraw(req.params.id, draw.algorithm || 'random')
    res.json({ message: 'Draw published successfully', ...result })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to publish draw' })
  }
})

export default router
