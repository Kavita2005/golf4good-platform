import { useState } from 'react'
import { scoresAPI } from '../../lib/api'
import { Plus, Edit2, Trash2, Target, CheckCircle, X, Calendar, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

const ScoreBar = ({ score }) => {
  const pct = Math.min((score / 45) * 100, 100)
  const color = score >= 36 ? 'bg-green-400' : score >= 25 ? 'bg-gold-400' : score >= 15 ? 'bg-blue-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white/40 w-6 text-right">{score}</span>
    </div>
  )
}

export default function ScoreManager({ scores, setScores, compact = false }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ score: '', date: new Date().toISOString().split('T')[0] })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    const val = parseInt(form.score)
    if (isNaN(val) || val < 1 || val > 45) { toast.error('Score must be between 1 and 45'); return }
    setLoading(true)
    try {
      if (editId) {
        const { data } = await scoresAPI.updateScore(editId, form)
        setScores(prev => prev.map(s => s.id === editId ? data.score : s))
        toast.success('Score updated!')
      } else {
        const { data } = await scoresAPI.addScore(form)
        // Rolling 5: newest first, max 5
        setScores(prev => [data.score, ...prev].slice(0, 5))
        toast.success('Score added!')
      }
      setShowForm(false)
      setEditId(null)
      setForm({ score: '', date: new Date().toISOString().split('T')[0] })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save score')
    } finally { setLoading(false) }
  }

  const handleEdit = (s) => {
    setEditId(s.id)
    setForm({ score: s.score, date: s.date?.split('T')[0] || s.date })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this score?')) return
    try {
      await scoresAPI.deleteScore(id)
      setScores(prev => prev.filter(s => s.id !== id))
      toast.success('Score removed')
    } catch { toast.error('Failed to remove score') }
  }

  const avg = scores.length ? Math.round(scores.reduce((s, sc) => s + sc.score, 0) / scores.length) : 0

  return (
    <div className={`glass rounded-2xl ${compact ? 'p-5' : 'p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-bold">My Scores</h3>
            <p className="text-white/40 text-xs">Last 5 Stableford scores</p>
          </div>
        </div>
        {scores.length < 5 && !showForm && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ score: '', date: new Date().toISOString().split('T')[0] }) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold transition-all">
            <Plus className="w-3.5 h-3.5" /> Add Score
          </button>
        )}
        {scores.length >= 5 && !showForm && (
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ score: '', date: new Date().toISOString().split('T')[0] }) }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs font-semibold transition-all">
            <Plus className="w-3.5 h-3.5" /> Add (replaces oldest)
          </button>
        )}
      </div>

      {/* Stats bar */}
      {scores.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-white/5">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{avg}</p>
            <p className="text-white/40 text-xs">Avg</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-xl font-bold text-green-400">{Math.max(...scores.map(s => s.score))}</p>
            <p className="text-white/40 text-xs">Best</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-xl font-bold text-red-400">{Math.min(...scores.map(s => s.score))}</p>
            <p className="text-white/40 text-xs">Worst</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-center">
            <p className="text-xl font-bold text-white">{scores.length}/5</p>
            <p className="text-white/40 text-xs">Stored</p>
          </div>
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-xl bg-white/5 border border-green-500/20 animate-fade-in">
          <p className="text-white/70 text-sm font-semibold mb-3">{editId ? 'Edit Score' : 'Add New Score'}</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Stableford Score (1–45)</label>
              <input
                type="number" min="1" max="45" value={form.score}
                onChange={e => setForm(p => ({ ...p, score: e.target.value }))}
                placeholder="e.g. 32"
                className="input-field text-center text-lg font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Date Played</label>
              <input
                type="date" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="input-field"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold transition-all disabled:opacity-50">
              {loading ? <div className="w-4 h-4 border border-green-400/40 border-t-green-400 rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {editId ? 'Update' : 'Save Score'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null) }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 text-sm transition-all">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      )}

      {/* Scores list */}
      {scores.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No scores yet</p>
          <p className="text-white/25 text-xs mt-1">Add your first Stableford score to enter the draw</p>
        </div>
      ) : (
        <div className="space-y-2">
          {scores.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group ${i === 0 ? 'border border-green-500/20' : ''}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === 0 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'
              }`}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-sm">{s.score} pts</span>
                  <span className="text-white/40 text-xs flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <ScoreBar score={s.score} />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!compact && scores.length > 0 && (
        <p className="text-white/25 text-xs mt-4 text-center">
          Scores shown newest first · Adding a 6th score removes the oldest automatically
        </p>
      )}
    </div>
  )
}
