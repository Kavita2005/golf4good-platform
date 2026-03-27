import express from 'express'
import { supabase } from '../utils/supabase.js'
import { authenticate, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin)

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const [usersRes, subsRes, drawsRes, winnersRes, donationsRes] = await Promise.allSettled([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('draws').select('*', { count: 'exact', head: true }),
      supabase.from('draw_winners').select('amount').eq('payment_status', 'paid'),
      supabase.from('donations').select('amount'),
    ])

    const totalUsers = usersRes.value?.count || 0
    const activeSubscribers = subsRes.value?.count || 0
    const totalDraws = drawsRes.value?.count || 0
    const totalPrizePaid = (winnersRes.value?.data || []).reduce((s, w) => s + (w.amount || 0), 0)
    const totalDonations = (donationsRes.value?.data || []).reduce((s, d) => s + (d.amount || 0), 0)

    // Monthly revenue estimate
    const { data: subDetails } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('status', 'active')

    const monthlyRevenue = (subDetails || []).reduce((s, sub) => {
      return s + (sub.plan === 'yearly' ? 119.99 / 12 : 12.99)
    }, 0)

    const prizePool = monthlyRevenue * activeSubscribers * 0.6
    const charityContributions = monthlyRevenue * activeSubscribers * 0.10 + totalDonations

    // New users this month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const { count: newUsersThisMonth } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString())

    res.json({
      total_users: totalUsers,
      active_subscribers: activeSubscribers,
      total_draws: totalDraws,
      total_prize_pool: Math.round(prizePool),
      total_charity_contributions: Math.round(charityContributions),
      monthly_revenue: Math.round(monthlyRevenue * activeSubscribers),
      new_users_this_month: newUsersThisMonth || 0,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch analytics' })
  }
})

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query
    let query = supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, role, handicap, created_at,
        subscriptions(status, plan),
        scores(count)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    }

    const { data: users, error } = await query
    if (error) throw error

    const formatted = (users || []).map(u => ({
      ...u,
      subscription_status: u.subscriptions?.[0]?.status,
      subscription_plan: u.subscriptions?.[0]?.plan,
      score_count: u.scores?.[0]?.count || 0,
    }))

    res.json({ users: formatted })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*, subscriptions(*), scores(*), user_charity_selections(*, charities(name))')
      .eq('id', req.params.id)
      .single()

    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch {
    res.status(500).json({ message: 'Failed to fetch user' })
  }
})

// PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { first_name, last_name, role, subscription_status } = req.body
    const updates = {}
    if (first_name) updates.first_name = first_name
    if (last_name) updates.last_name = last_name
    if (role) updates.role = role

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    // Update subscription status if provided
    if (subscription_status) {
      await supabase
        .from('subscriptions')
        .update({ status: subscription_status })
        .eq('user_id', req.params.id)
    }

    res.json({ user })
  } catch {
    res.status(500).json({ message: 'Failed to update user' })
  }
})

// GET /api/admin/users/:id/scores
router.get('/users/:id/scores', async (req, res) => {
  try {
    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', req.params.id)
      .order('date', { ascending: false })
    res.json({ scores: scores || [] })
  } catch {
    res.json({ scores: [] })
  }
})

// GET /api/admin/draw-stats
router.get('/draw-stats', async (req, res) => {
  try {
    const { data: draws } = await supabase
      .from('draws')
      .select('*, draw_winners(count)')
      .order('draw_date', { ascending: false })
      .limit(12)

    res.json({ draws: draws || [] })
  } catch {
    res.json({ draws: [] })
  }
})

export default router
