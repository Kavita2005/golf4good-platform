import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { scoresAPI, subscriptionAPI, charitiesAPI, winnersAPI, drawsAPI } from '../lib/api'
import ScoreManager from '../components/score/ScoreManager'
import CharitySelector from '../components/charity/CharitySelector'
import WinningsPanel from '../components/dashboard/WinningsPanel'
import DrawHistory from '../components/dashboard/DrawHistory'
import SubscriptionStatus from '../components/dashboard/SubscriptionStatus'
import { Trophy, Heart, Target, BarChart3, Calendar, TrendingUp, Award } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, subscription, isSubscribed } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [scores, setScores] = useState([])
  const [charity, setCharity] = useState(null)
  const [winnings, setWinnings] = useState([])
  const [drawHistory, setDrawHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [scoresRes, charityRes, winningsRes, drawRes] = await Promise.allSettled([
          scoresAPI.getMyScores(),
          charitiesAPI.getAll({ my: true }),
          winnersAPI.getMyWinnings(),
          drawsAPI.getMyHistory(),
        ])
        if (scoresRes.status === 'fulfilled') setScores(scoresRes.value.data?.scores || [])
        if (charityRes.status === 'fulfilled') setCharity(charityRes.value.data?.selected || null)
        if (winningsRes.status === 'fulfilled') setWinnings(winningsRes.value.data?.winnings || [])
        if (drawRes.status === 'fulfilled') setDrawHistory(drawRes.value.data?.history || [])
      } catch {}
      finally { setLoading(false) }
    }
    fetchAll()
  }, [])

  const totalWon = winnings.reduce((s, w) => s + (w.amount || 0), 0)
  const avgScore = scores.length ? Math.round(scores.reduce((s, sc) => s + sc.score, 0) / scores.length) : 0

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'scores', label: 'My Scores', icon: Target },
    { id: 'charity', label: 'My Charity', icon: Heart },
    { id: 'draws', label: 'Draw History', icon: Calendar },
    { id: 'winnings', label: 'Winnings', icon: Trophy },
  ]

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-4">
          <div>
            <h1 className="text-3xl font-black font-display text-white">
              Hey, <span className="gradient-text-green">{user?.first_name}</span> 👋
            </h1>
            <p className="text-white/40 mt-1">Here's your Golf4Good overview</p>
          </div>
          <SubscriptionStatus subscription={subscription} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Avg Score', value: avgScore || '—', icon: Target, color: 'text-green-400', bg: 'bg-green-500/10' },
            { label: 'Total Won', value: `£${totalWon.toLocaleString()}`, icon: Trophy, color: 'text-gold-400', bg: 'bg-gold-500/10' },
            { label: 'Draws Entered', value: drawHistory.length || 0, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Charity Given', value: `£${((subscription?.charity_amount || 0)).toFixed(0)}`, icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-black text-white font-display">{loading ? <span className="shimmer inline-block w-16 h-6 rounded" /> : value}</p>
              <p className="text-white/40 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass rounded-2xl p-1 mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === id
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-6">
              <ScoreManager scores={scores} setScores={setScores} compact />
              <CharitySelector charity={charity} setCharity={setCharity} subscription={subscription} compact />
              <WinningsPanel winnings={winnings} compact />
              <DrawHistory history={drawHistory} compact />
            </div>
          )}
          {activeTab === 'scores' && <ScoreManager scores={scores} setScores={setScores} />}
          {activeTab === 'charity' && <CharitySelector charity={charity} setCharity={setCharity} subscription={subscription} />}
          {activeTab === 'draws' && <DrawHistory history={drawHistory} />}
          {activeTab === 'winnings' && <WinningsPanel winnings={winnings} />}
        </div>
      </div>
    </div>
  )
}
