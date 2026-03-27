import express from 'express'
import { supabase } from '../utils/supabase.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// GET /api/winners/my-winnings
router.get('/my-winnings', authenticate, async (req, res) => {
  try {
    const { data: winnings } = await supabase
      .from('draw_winners')
      .select('*, draws(name, draw_date)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    const formatted = (winnings || []).map(w => ({
      ...w,
      draw_name: w.draws?.name,
      draw_date: w.draws?.draw_date,
    }))

    res.json({ winnings: formatted })
  } catch {
    res.json({ winnings: [] })
  }
})

// POST /api/winners/:id/proof
router.post('/:id/proof', authenticate, async (req, res) => {
  try {
    const { proof_url } = req.body
    if (!proof_url) return res.status(400).json({ message: 'proof_url required' })

    const { data, error } = await supabase
      .from('draw_winners')
      .update({ proof_url, verification_status: 'submitted', updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error || !data) return res.status(404).json({ message: 'Winning record not found' })
    res.json({ winner: data })
  } catch {
    res.status(500).json({ message: 'Failed to upload proof' })
  }
})

// GET /api/winners (admin)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query
    let query = supabase
      .from('draw_winners')
      .select('*, users(first_name, last_name, email), draws(name, draw_date)')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('verification_status', status)
    }

    const { data: winners } = await query
    const formatted = (winners || []).map(w => ({
      ...w,
      user_name: `${w.users?.first_name} ${w.users?.last_name}`,
      user_email: w.users?.email,
      draw_name: w.draws?.name,
    }))

    res.json({ winners: formatted })
  } catch {
    res.json({ winners: [] })
  }
})

// POST /api/winners/:id/verify (admin)
router.post('/:id/verify', authenticate, requireAdmin, async (req, res) => {
  try {
    const { action } = req.body // 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'Invalid action' })

    const status = action === 'approve' ? 'approved' : 'rejected'
    const { data, error } = await supabase
      .from('draw_winners')
      .update({ verification_status: status, verified_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ winner: data, message: `Winner ${status}` })
  } catch {
    res.status(500).json({ message: 'Failed to verify winner' })
  }
})

// POST /api/winners/:id/pay (admin)
router.post('/:id/pay', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('draw_winners')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ winner: data, message: 'Marked as paid' })
  } catch {
    res.status(500).json({ message: 'Failed to update payment status' })
  }
})

export default router
