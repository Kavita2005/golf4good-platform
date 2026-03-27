import express from 'express'
import Stripe from 'stripe'
import { supabase } from '../utils/supabase.js'
import { authenticate } from '../middleware/auth.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')

const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 1299, // pence
    interval: 'month',
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder',
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 11999, // pence
    interval: 'year',
    priceId: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly_placeholder',
  },
}

// GET /api/subscriptions/plans
router.get('/plans', (req, res) => {
  res.json({ plans: Object.values(PLANS) })
})

// GET /api/subscriptions/status
router.get('/status', authenticate, async (req, res) => {
  try {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    res.json({ subscription: sub || null })
  } catch {
    res.json({ subscription: null })
  }
})

// POST /api/subscriptions/checkout
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const { planId } = req.body
    const plan = PLANS[planId]
    if (!plan) return res.status(400).json({ message: 'Invalid plan' })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

    // Check if user already has a Stripe customer ID
    const { data: userRecord } = await supabase
      .from('users')
      .select('stripe_customer_id, email, first_name, last_name')
      .eq('id', req.user.id)
      .single()

    let customerId = userRecord?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userRecord.email,
        name: `${userRecord.first_name} ${userRecord.last_name}`,
        metadata: { user_id: req.user.id },
      })
      customerId = customer.id
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', req.user.id)
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${frontendUrl}/dashboard?subscribed=true`,
      cancel_url: `${frontendUrl}/subscribe?cancelled=true`,
      metadata: { user_id: req.user.id, plan_id: planId },
      subscription_data: {
        metadata: { user_id: req.user.id, plan_id: planId },
      },
    })

    res.json({ url: session.url, sessionId: session.id })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    res.status(500).json({ message: 'Failed to create checkout session' })
  }
})

// POST /api/subscriptions/cancel
router.post('/cancel', authenticate, async (req, res) => {
  try {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .single()

    if (!sub) return res.status(404).json({ message: 'No active subscription' })

    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', req.user.id)
      .eq('stripe_subscription_id', sub.stripe_subscription_id)

    res.json({ message: 'Subscription will cancel at end of period' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to cancel subscription' })
  }
})

// POST /api/subscriptions/portal
router.post('/portal', authenticate, async (req, res) => {
  try {
    const { data: userRecord } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', req.user.id)
      .single()

    if (!userRecord?.stripe_customer_id) {
      return res.status(400).json({ message: 'No billing account found' })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: userRecord.stripe_customer_id,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    })

    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ message: 'Failed to open billing portal' })
  }
})

export default router
