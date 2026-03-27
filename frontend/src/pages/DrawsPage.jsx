import { useState, useEffect } from 'react'
import { drawsAPI } from '../lib/api'
import { Trophy, Calendar, Users, Zap, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const MATCH_COLORS = { '5-match': 'badge-gold', '4-match': 'badge-blue', '3-match': 'badge-gray' }

export default function DrawsPage() {
  const [draws, setDraws] = useState([])
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([drawsAPI.getAll(), drawsAPI.getLatest()])
      .then(([allRes, latestRes]) => {
        if (allRes.status === 'fulfilled') setDraws(allRes.value.data?.draws || [])
        if (latestRes.status === 'fulfilled') setLatest(latestRes.value.data?.draw || null)
      })
      .finally(() => setLoading(false))
  }, [])

  const upcoming = draws.find(d => d.status === 'upcoming')
  const completed = draws.filter(d => d.status === 'published')

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-gold-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold-500/30 mb-6">
            <Trophy className="w-4 h-4 text-gold-400" />
            <span className="text-white/70 text-sm font-medium">Monthly prize draw</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-4">
            The <span className="gradient-text-gold">Draw</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Every month, 5 numbers are drawn. Match your Stableford scores and win a share of the prize pool.
          </p>
        </div>

        {/* Upcoming draw card */}
        {upcoming && (
          <div className="glass rounded-3xl p-8 border border-gold-500/30 mb-10 relative overflow-hidden animate-fade-up">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/8 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                <div>
                  <span className="badge-gold mb-3 inline-flex items-center gap-1.5 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                    Upcoming Draw
                  </span>
                  <h2 className="text-3xl font-black font-display text-white">{upcoming.name}</h2>
                  <p className="text-white/50 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(upcoming.draw_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-sm mb-1">Jackpot</p>
                  <p className="text-4xl font-black font-display gradient-text-gold">
                    £{Number(upcoming.jackpot || 0).toLocaleString()}
                  </p>
                  {upcoming.participant_count > 0 && (
                    <p className="text-white/40 text-sm mt-1 flex items-center justify-end gap-1">
                      <Users className="w-3.5 h-3.5" /> {upcoming.participant_count.toLocaleString()} entered
                    </p>
                  )}
                </div>
              </div>

              {/* Prize breakdown */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: '5-Match Jackpot', pct: '40%', amount: upcoming.jackpot, color: 'from-gold-600 to-gold-400', rollover: true },
                  { label: '4-Match Prize', pct: '35%', amount: Math.round((upcoming.prize_pool || 0) * 0.35), color: 'from-blue-600 to-blue-400', rollover: false },
                  { label: '3-Match Prize', pct: '25%', amount: Math.round((upcoming.prize_pool || 0) * 0.25), color: 'from-purple-600 to-purple-400', rollover: false },
                ].map(({ label, pct, amount, color, rollover }) => (
                  <div key={label} className="glass rounded-2xl p-4 text-center">
                    <p className="text-white/50 text-xs mb-1">{label}</p>
                    <p className="text-xl font-black text-white">£{Number(amount || 0).toLocaleString()}</p>
                    <p className="text-white/30 text-xs">{pct} of pool</p>
                    {rollover && <p className="text-gold-400 text-xs mt-1 flex items-center justify-center gap-1"><Zap className="w-3 h-3" />Rolls over</p>}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-white/40 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Draw runs on the last day of the month
                </p>
                <Link to="/subscribe" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 text-charcoal-900 font-bold text-sm hover:shadow-lg hover:shadow-gold-500/30 transition-all">
                  Enter Draw <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* How the draw works */}
        <div className="glass rounded-2xl p-6 mb-10 animate-fade-up">
          <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
            <Zap className="w-5 h-5 text-gold-400" /> How the draw works
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step: '1', text: '5 numbers are drawn from 1–45 each month' },
              { step: '2', text: 'Your 5 stored Stableford scores are compared' },
              { step: '3', text: 'Match 3, 4, or all 5 to win a prize tier' },
              { step: '4', text: 'Winners verify scores and receive their prize' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-lg bg-green-500/20 text-green-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{step}</span>
                <p className="text-white/60 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Past draws */}
        <div>
          <h2 className="text-2xl font-bold font-display text-white mb-6">Past Draws</h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
            </div>
          ) : completed.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Trophy className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No completed draws yet</p>
              <p className="text-white/25 text-sm mt-1">The first draw will appear here after it's published</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completed.map((draw) => (
                <div key={draw.id} className="glass rounded-2xl p-6 hover:bg-white/5 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <h3 className="text-white font-bold">{draw.name}</h3>
                        <span className="badge-green">Published</span>
                      </div>
                      <p className="text-white/40 text-sm">
                        {new Date(draw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {draw.winning_numbers && (
                        <div className="flex gap-1.5">
                          {draw.winning_numbers.map((n, i) => (
                            <span key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 text-charcoal-900 text-xs font-black flex items-center justify-center">
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-white font-bold">£{Number(draw.prize_pool || 0).toLocaleString()}</p>
                        <p className="text-white/40 text-xs">Prize pool</p>
                      </div>
                    </div>
                  </div>
                  {draw.winner_summary && (
                    <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center text-xs">
                      {Object.entries(draw.winner_summary).map(([type, count]) => (
                        <span key={type} className="text-white/50">
                          <span className="text-white font-bold">{count}</span> {type} winner{count !== 1 ? 's' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
