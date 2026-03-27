import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('golf_token')
    if (!token) { setLoading(false); return }
    try {
      const { data } = await authAPI.me()
      setUser(data.user)
      setSubscription(data.subscription)
    } catch {
      localStorage.removeItem('golf_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('golf_token', data.token)
    setUser(data.user)
    setSubscription(data.subscription)
    toast.success(`Welcome back, ${data.user.first_name}!`)
    return data
  }

  const register = async (userData) => {
    const { data } = await authAPI.register(userData)
    localStorage.setItem('golf_token', data.token)
    setUser(data.user)
    toast.success('Account created successfully!')
    return data
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('golf_token')
    setUser(null)
    setSubscription(null)
    toast.success('Logged out successfully')
  }

  const refreshUser = () => fetchMe()

  const isAdmin = user?.role === 'admin'
  const isSubscribed = subscription?.status === 'active'

  return (
    <AuthContext.Provider value={{
      user, loading, subscription, login, register, logout,
      refreshUser, isAdmin, isSubscribed
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
