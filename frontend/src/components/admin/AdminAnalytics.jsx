import { useEffect, useState } from 'react'
import { adminAPI } from '../../lib/api'
import { Users, Trophy, Heart, DollarSign, TrendingUp, Activity } from 'lucide-react'

export default function AdminAnalytics({ stats: propStats }) {
  const [stats, setStats] = useState(propStats)
  const [loading, setLoading] = useState(!propStats)

  useEffect(() => {
    if (!propStats) {
      adminAPI.getAnalytics().then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false))
    } else {
      setStats(propStats)
      setLoading(false)
    }
  }, [propStats])

  const cards = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', change: stats?.new_users_this_month },
    { label: 'Active Subscribers', value: stats?.active_subscribers || 0, icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10', change: null },
    { label: 'Prize Pool', value: `£${Number(stats?.total_prize_pool || 0).toLocaleString()}`, icon: Trophy, color: 'text-gold-400', bg: 'bg-gold-500/10', change: null },
    { label: 'Charity Total', value: `£${Number(stats?.total_charity_contributions || 0).toLocaleString()}`, icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10', change: null },
    { label: 'Monthly Revenue', value: `£${Number(stats?.monthly_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-400', bg: 'bg-purple-500/10', change: null },
    { label: 'Total Draws Run', value: stats?.total_draws || 0, icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-500/10', change: null },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black font-display text-white">Admin Dashboard</h1>
        <p className="text-white/40 mt-1">Platform overview & analytics</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map(({ label, value, icon: Icon, color, bg, change }) => (
            <div key={label} className="glass rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-white/40 text-sm mt-1">{label}</p>
              {change > 0 && <p className="text-green-400 text-xs mt-1">+{change} this month</p>}
            </div>
          ))}
        </div>
      )}

      {/* Recent activity */}
      {stats?.recent_activity?.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {stats.recent_activity.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    item.type === 'subscription' ? 'bg-green-400' :
                    item.type === 'draw' ? 'bg-gold-400' :
                    item.type === 'donation' ? 'bg-red-400' : 'bg-white/30'
                  }`} />
                  <p className="text-white/70 text-sm">{item.description}</p>
                </div>
                <span className="text-white/30 text-xs">{new Date(item.created_at).toLocaleDateString('en-GB')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
