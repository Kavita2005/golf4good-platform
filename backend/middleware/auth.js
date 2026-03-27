import jwt from 'jsonwebtoken'
import { supabase } from '../utils/supabase.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'golf4good_secret_key_2026')
    
    // Fetch fresh user from DB
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) return res.status(401).json({ message: 'User not found' })
    
    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' })
    return res.status(401).json({ message: 'Invalid token' })
  }
}

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

export const requireSubscription = async (req, res, next) => {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', req.user.id)
    .eq('status', 'active')
    .single()

  if (!sub) return res.status(403).json({ message: 'Active subscription required' })
  req.subscription = sub
  next()
}
