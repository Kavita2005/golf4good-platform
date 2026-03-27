import express from 'express'
import { supabase } from '../utils/supabase.js'
import { authenticate, requireSubscription } from '../middleware/auth.js'

const router = express.Router()

// ── GET /api/scores ──────────────────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false })
      .limit(5)

    if (error) throw error
    res.json({ scores: scores || [] })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch scores' })
  }
})

// ── POST /api/scores ─────────────────────────────────────────────────────────
router.post('/', authenticate, requireSubscription, async (req, res) => {
  try {
    const { score, date } = req.body
    const scoreNum = parseInt(score)

    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      return res.status(400).json({ message: 'Score must be between 1 and 45 (Stableford)' })
    }
    if (!date) return res.status(400).json({ message: 'Date is required' })

    // Rolling 5-score logic: count current scores
    const { data: existing } = await supabase
      .from('scores')
      .select('id, date')
      .eq('user_id', req.user.id)
      .order('date', { ascending: true })

    // If 5 scores exist, delete the oldest
    if (existing && existing.length >= 5) {
      await supabase.from('scores').delete().eq('id', existing[0].id)
    }

    const { data: newScore, error } = await supabase
      .from('scores')
      .insert({ user_id: req.user.id, score: scoreNum, date })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ score: newScore })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to add score' })
  }
})

// ── PUT /api/scores/:id ───────────────────────────────────────────────────────
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { score, date } = req.body
    const scoreNum = parseInt(score)

    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      return res.status(400).json({ message: 'Score must be between 1 and 45' })
    }

    const { data: updated, error } = await supabase
      .from('scores')
      .update({ score: scoreNum, date })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id) // Ownership check
      .select()
      .single()

    if (error || !updated) return res.status(404).json({ message: 'Score not found' })
    res.json({ score: updated })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update score' })
  }
})

// ── DELETE /api/scores/:id ────────────────────────────────────────────────────
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)

    if (error) throw error
    res.json({ message: 'Score deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete score' })
  }
})

export default router
