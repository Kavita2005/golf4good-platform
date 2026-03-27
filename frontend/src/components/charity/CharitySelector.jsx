import { useState, useEffect } from 'react'
import { charitiesAPI } from '../../lib/api'
import { Heart, Search, ChevronRight, Sliders, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CharitySelector({ charity, setCharity, subscription, compact = false }) {
  const [charities, setCharities] = useState([])
  const [search, setSearch] = useState('')
  const [percent, setPercent] = useState(charity?.contribution_pct || 10)
  const [picking, setPicking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (picking) {
      setLoading(true)
      charitiesAPI.getAll({ search, limit: 6 })
        .then(r => setCharities(r.data?.charities || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [picking, search])

  const handleSelect = async (c) => {
    setSaving(true)
    try {
      await charitiesAPI.updateMyCharity({ charity_id: c.id, contribution_pct: percent })
      setCharity({ ...c, contribution_pct: percent })
      setPicking(false)
      toast.success(`Now supporting ${c.name}!`)
    } catch { toast.error('Failed to update charity') }
    finally { setSaving(false) }
  }

  const handlePctChange = async (newPct) => {
    setPercent(newPct)
    if (charity) {
      try {
        await charitiesAPI.updateMyCharity({ charity_id: charity.id, contribution_pct: newPct })
        setCharity(prev => ({ ...prev, contribution_pct: newPct }))
        toast.success('Contribution updated!')
      } catch { toast.error('Failed to update') }
    }
  }

  const monthlyAmount = subscription?.plan === 'yearly'
    ? ((119.99 / 12) * percent / 100).toFixed(2)
    : ((12.99) * percent / 100).toFixed(2)

  return (
    <div className={`glass rounded-2xl ${compact ? 'p-5' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Heart className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">My Charity</h3>
            <p className="text-white/40 text-xs">Your charitable contribution</p>
          </div>
        </div>
        <button onClick={() => setPicking(true)} className="text-xs text-green-400 hover:text-green-300 font-semibold transition-colors">
          Change
        </button>
      </div>

      {charity ? (
        <div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 mb-4">
            {charity.image_url ? (
              <img src={charity.image_url} alt={charity.name} className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <p className="text-white font-semibold">{charity.name}</p>
              <p className="text-white/40 text-xs line-clamp-1">{charity.description}</p>
            </div>
          </div>

          {/* Contribution slider */}
          <div className="p-4 rounded-xl bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-white/50" />
                <span className="text-sm text-white/70">Contribution</span>
              </div>
              <span className="text-lg font-bold text-green-400">{percent}%</span>
            </div>
            <input
              type="range" min="10" max="100" step="5" value={percent}
              onChange={e => setPercent(parseInt(e.target.value))}
              onMouseUp={e => handlePctChange(parseInt(e.target.value))}
              onTouchEnd={e => handlePctChange(parseInt(e.target.value))}
              className="w-full accent-green-500"
            />
            <div className="flex justify-between text-xs text-white/30 mt-1">
              <span>10% (min)</span><span>100%</span>
            </div>
            <p className="text-white/50 text-xs mt-3 text-center">
              ≈ <span className="text-green-400 font-semibold">£{monthlyAmount}</span> to {charity.name} per month
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Heart className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No charity selected</p>
          <button onClick={() => setPicking(true)} className="mt-3 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-all">
            Choose a Charity
          </button>
        </div>
      )}

      {/* Picker modal */}
      {picking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setPicking(false)}>
          <div className="glass-dark rounded-3xl p-6 w-full max-w-lg border border-white/10 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Choose a Charity</h3>
              <button onClick={() => setPicking(false)} className="text-white/40 hover:text-white text-xl">&times;</button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search charities..."
                className="input-field pl-11"
              />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {loading ? (
                [...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)
              ) : charities.length === 0 ? (
                <p className="text-center text-white/40 py-8">No charities found</p>
              ) : charities.map(c => (
                <button key={c.id} onClick={() => handleSelect(c)} disabled={saving}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-all group text-left">
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{c.name}</p>
                    <p className="text-white/40 text-xs truncate">{c.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
