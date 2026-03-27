import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { adminAPI, drawsAPI, charitiesAPI, winnersAPI } from '../lib/api'
import AdminUsers from '../components/admin/AdminUsers'
import AdminDraws from '../components/admin/AdminDraws'
import AdminCharities from '../components/admin/AdminCharities'
import AdminWinners from '../components/admin/AdminWinners'
import AdminAnalytics from '../components/admin/AdminAnalytics'
import { Users, Trophy, Heart, Award, BarChart3, Settings, ChevronRight } from 'lucide-react'

const NAV = [
  { path: '/admin', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/draws', label: 'Draws', icon: Trophy },
  { path: '/admin/charities', label: 'Charities', icon: Heart },
  { path: '/admin/winners', label: 'Winners', icon: Award },
]

export default function AdminPage() {
  const location = useLocation()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    adminAPI.getAnalytics().then(r => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen pt-20 flex">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 glass-dark border-r border-white/5 pt-6 pb-10 hidden md:flex flex-col gap-1 px-3 fixed top-20 bottom-0 z-40">
        <p className="text-white/30 text-xs uppercase tracking-widest px-3 mb-3">Admin Panel</p>
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path))
          return (
            <Link key={path} to={path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active ? 'bg-green-500/20 text-green-400' : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}>
              <Icon className="w-4 h-4" /> {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          )
        })}
      </aside>

      {/* Mobile tab bar */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden glass-dark border-t border-white/10 z-50 flex">
        {NAV.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path))
          return (
            <Link key={path} to={path} className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-all ${active ? 'text-green-400' : 'text-white/30'}`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          )
        })}
      </div>

      {/* Content */}
      <main className="flex-1 md:ml-60 px-4 md:px-8 pt-6 pb-24 md:pb-8">
        <Routes>
          <Route index element={<AdminAnalytics stats={stats} />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="draws" element={<AdminDraws />} />
          <Route path="charities" element={<AdminCharities />} />
          <Route path="winners" element={<AdminWinners />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}
