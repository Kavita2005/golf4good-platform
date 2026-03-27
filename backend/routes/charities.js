import express from 'express'
import { supabase } from '../utils/supabase.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// GET /api/charities
router.get('/', async (req, res) => {
  try {
    const { search, category, featured, limit = 20, my } = req.query
    let query = supabase.from('charities').select('*').order('featured', { ascending: false }).order('name')

    if (search) query = query.ilike('name', `%${search}%`)
    if (category) query = query.eq('category', category)
    if (featured === 'true') query = query.eq('featured', true)
    if (limit) query = query.limit(parseInt(limit))

    const { data: charities, error } = await query
    if (error) throw error
    res.json({ charities: charities || [] })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch charities' })
  }
})

// GET /api/charities/:id
router.get('/:id', async (req, res) => {
  try {
    const { data: charity, error } = await supabase
      .from('charities')
      .select('*, charity_events(*)')
      .eq('id', req.params.id)
      .single()

    if (error || !charity) return res.status(404).json({ message: 'Charity not found' })

    // Map events
    charity.events = charity.charity_events || []
    delete charity.charity_events
    res.json({ charity })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch charity' })
  }
})

// PUT /api/charities/my-selection (authenticated)
router.put('/my-selection', authenticate, async (req, res) => {
  try {
    const { charity_id, contribution_pct } = req.body
    if (!charity_id) return res.status(400).json({ message: 'charity_id required' })
    const pct = Math.min(100, Math.max(10, parseInt(contribution_pct) || 10))

    await supabase.from('user_charity_selections').upsert({
      user_id: req.user.id,
      charity_id,
      contribution_pct: pct,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    // Update subscription charity_amount if subscription exists
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, plan')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single()

    if (sub) {
      const baseFee = sub.plan === 'yearly' ? 119.99 / 12 : 12.99
      const charityAmount = parseFloat((baseFee * pct / 100).toFixed(2))
      await supabase.from('subscriptions').update({ charity_amount: charityAmount }).eq('id', sub.id)
    }

    // Increment supporter count
    await supabase.rpc('increment_charity_supporters', { cid: charity_id })

    res.json({ message: 'Charity selection updated', contribution_pct: pct })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update charity selection' })
  }
})

// POST /api/charities/donate
router.post('/donate', authenticate, async (req, res) => {
  try {
    const { charity_id, amount } = req.body
    if (!charity_id || !amount || amount < 1) return res.status(400).json({ message: 'Invalid donation' })

    await supabase.from('donations').insert({
      user_id: req.user.id,
      charity_id,
      amount: parseFloat(amount),
      type: 'one_off',
    })

    // Update charity total_raised
    await supabase.rpc('increment_charity_raised', { cid: charity_id, amt: parseFloat(amount) })

    res.json({ message: 'Donation recorded successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to process donation' })
  }
})

// ── Admin CRUD ─────────────────────────────────────────────────────────────

// POST /api/charities (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, long_description, category, website, location, image_url, featured, registration_number } = req.body
    if (!name || !description) return res.status(400).json({ message: 'Name and description are required' })

    const { data: charity, error } = await supabase.from('charities').insert({
      name, description, long_description, category, website, location, image_url,
      featured: featured || false, registration_number,
      total_raised: 0, supporter_count: 0,
    }).select().single()

    if (error) throw error
    res.status(201).json({ charity })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create charity' })
  }
})

// PUT /api/charities/:id (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('charities').update(req.body).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json({ charity: data })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update charity' })
  }
})

// DELETE /api/charities/:id (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await supabase.from('charities').delete().eq('id', req.params.id)
    res.json({ message: 'Charity deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete charity' })
  }
})

export default router
