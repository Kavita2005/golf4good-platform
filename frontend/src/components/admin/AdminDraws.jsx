import { useState, useEffect } from 'react'
import { drawsAPI } from '../../lib/api'
import { Plus, Play, CheckCircle, Zap, Trophy, Calendar, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDraws() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [config, setConfig] = useState({ algorithm: 'random', draw_date: '', prize_pool: '', name: '' })

  useEffect(() => {
    drawsAPI.getAll().then(r => setDraws(r.data?.draws || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSimulate = async () => {
    setSimulating(true)
    setSimulationResult(null)
    try {
      const { data } = await drawsAPI.simulate({ algorithm: config.algorithm })
      setSimulationResult(data)
      toast.success('Simulation complete!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Simulation failed')
    } finally { setSimulating(false) }
  }

  const handleCreate = async () => {
    try {
      const { data } = await drawsAPI.create(config)
      setDraws(prev => [data.draw, ...prev])
      setShowCreate(false)
      toast.success('Draw created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create draw')
    }
  }

  const handlePublish = async (id) => {
    if (!confirm('Publish this draw? This will notify all participants.')) return
    try {
      await drawsAPI.publish(id)
      setDraws(prev => prev.map(d => d.id === id ? { ...d, status: 'published' } : d))
      toast.success('Draw published and participants notified!')
    } catch { toast.error('Failed to publish') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black font-display text-white">Draw Management</h1>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-semibold hover:bg-green-500/30 transition-all">
          <Plus className="w-4 h-4" /> New Draw
        </button>
      </div>

      {/* Simulation panel */}
      <div className="glass rounded-2xl p-6 mb-6 border border-blue-500/20">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" /> Draw Simulation & Configuration
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Draw Algorithm</label>
            <select value={config.algorithm} onChange={e => setConfig(p => ({ ...p, algorithm: e.target.value }))} className="input-field">
              <option value="random">Random (Standard Lottery)</option>
              <option value="weighted_high">Weighted — Favour High Scores</option>
              <option value="weighted_low">Weighted — Favour Low Scores</option>
              <option value="frequency">Frequency-based</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleSimulate} disabled={simulating}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold text-sm transition-all disabled:opacity-50">
              {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {simulating ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {simulationResult && (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 animate-fade-in">
            <p className="text-blue-300 font-semibold text-sm mb-3">Simulation Result (Preview Only)</p>
            <div className="flex gap-2 mb-3">
              {simulationResult.numbers?.map((n, i) => (
                <span key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 text-charcoal-900 text-sm font-black flex items-center justify-center">
                  {n}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              {simulationResult.breakdown && Object.entries(simulationResult.breakdown).map(([type, data]) => (
                <div key={type} className="glass rounded-lg p-2">
                  <p className="text-white font-bold">{data.winners}</p>
                  <p className="text-white/40">{type}</p>
                  <p className="text-green-400">£{data.prize_each?.toLocaleString() || 0} each</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Draws list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)
        ) : draws.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Trophy className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No draws created yet</p>
          </div>
        ) : draws.map(draw => (
          <div key={draw.id} className="glass rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-white font-bold">{draw.name}</p>
                <p className="text-white/40 text-xs flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(draw.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {draw.winning_numbers && (
                    <span className="ml-2 flex gap-1">
                      {draw.winning_numbers.map((n, i) => (
                        <span key={i} className="w-5 h-5 rounded-full bg-gold-500/30 text-gold-400 text-xs flex items-center justify-center font-bold">{n}</span>
                      ))}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${draw.status === 'published' ? 'badge-green' : draw.status === 'upcoming' ? 'badge-gold' : 'badge-gray'}`}>
                {draw.status}
              </span>
              {draw.status !== 'published' && (
                <button onClick={() => handlePublish(draw.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-semibold hover:bg-green-500/30 transition-all">
                  <CheckCircle className="w-3.5 h-3.5" /> Publish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create draw modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="glass-dark rounded-3xl p-6 w-full max-w-md border border-white/10 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-5">Create New Draw</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Draw Name</label>
                <input value={config.name} onChange={e => setConfig(p => ({ ...p, name: e.target.value }))} placeholder="e.g. April 2026 Draw" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Draw Date</label>
                <input type="date" value={config.draw_date} onChange={e => setConfig(p => ({ ...p, draw_date: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Prize Pool (£)</label>
                <input type="number" value={config.prize_pool} onChange={e => setConfig(p => ({ ...p, prize_pool: e.target.value }))} placeholder="e.g. 210000" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Algorithm</label>
                <select value={config.algorithm} onChange={e => setConfig(p => ({ ...p, algorithm: e.target.value }))} className="input-field">
                  <option value="random">Random</option>
                  <option value="weighted_high">Weighted High</option>
                  <option value="weighted_low">Weighted Low</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 font-semibold text-sm hover:bg-green-500/30 transition-all">
                Create Draw
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl glass text-white/50 text-sm hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
