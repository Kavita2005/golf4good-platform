import { useState, useEffect } from 'react'
import { charitiesAPI, winnersAPI } from '../../lib/api'
import { Plus, Edit2, Trash2, CheckCircle, X, Upload, Heart, Award } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Admin Charities ─────────────────────────────────────────────────────────
export function AdminCharities() {
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', category: '', website: '', location: '', image_url: '', featured: false })

  useEffect(() => {
    charitiesAPI.getAll().then(r => setCharities(r.data?.charities || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    try {
      if (editItem) {
        await charitiesAPI.update(editItem.id, form)
        setCharities(prev => prev.map(c => c.id === editItem.id ? { ...c, ...form } : c))
        toast.success('Charity updated')
      } else {
        const { data } = await charitiesAPI.create(form)
        setCharities(prev => [data.charity, ...prev])
        toast.success('Charity added')
      }
      setShowForm(false); setEditItem(null)
      setForm({ name: '', description: '', category: '', website: '', location: '', image_url: '', featured: false })
    } catch { toast.error('Failed to save charity') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this charity?')) return
    try {
      await charitiesAPI.remove(id)
      setCharities(prev => prev.filter(c => c.id !== id))
      toast.success('Charity deleted')
    } catch { toast.error('Failed to delete') }
  }

  const startEdit = (c) => { setEditItem(c); setForm(c); setShowForm(true) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black font-display text-white">Charities</h1>
        <button onClick={() => { setShowForm(true); setEditItem(null) }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm font-semibold hover:bg-green-500/30 transition-all">
          <Plus className="w-4 h-4" /> Add Charity
        </button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {['Name', 'Category', 'Featured', 'Supporters', 'Raised', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => <tr key={i} className="border-b border-white/5">{[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded shimmer" /></td>)}</tr>)
            ) : charities.map(c => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/3">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="badge-gray">{c.category || '—'}</span></td>
                <td className="px-4 py-3">{c.featured ? <span className="badge-gold">Featured</span> : <span className="text-white/30 text-xs">No</span>}</td>
                <td className="px-4 py-3 text-white/50 text-sm">{c.supporter_count || 0}</td>
                <td className="px-4 py-3 text-white/70 text-sm">£{Number(c.total_raised || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="glass-dark rounded-3xl p-6 w-full max-w-md border border-white/10 animate-fade-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-5">{editItem ? 'Edit Charity' : 'Add Charity'}</h3>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Charity Name', placeholder: 'e.g. Cancer Research UK' },
                { key: 'description', label: 'Short Description', placeholder: 'Brief description...' },
                { key: 'category', label: 'Category', placeholder: 'Health, Education, Sport...' },
                { key: 'website', label: 'Website', placeholder: 'https://...' },
                { key: 'location', label: 'Location', placeholder: 'London, UK' },
                { key: 'image_url', label: 'Image URL', placeholder: 'https://...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
                  <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="input-field" />
                </div>
              ))}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="accent-green-500" />
                <label htmlFor="featured" className="text-white/70 text-sm">Feature on homepage</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 font-semibold text-sm hover:bg-green-500/30 transition-all">Save</button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl glass text-white/50 text-sm hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Admin Winners ─────────────────────────────────────────────────────────────
export function AdminWinners() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    winnersAPI.getAll({ status: filter === 'all' ? undefined : filter })
      .then(r => setWinners(r.data?.winners || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter])

  const handleVerify = async (id, action) => {
    try {
      await winnersAPI.verify(id, action)
      setWinners(prev => prev.map(w => w.id === id ? { ...w, verification_status: action === 'approve' ? 'approved' : 'rejected' } : w))
      toast.success(`Winner ${action === 'approve' ? 'approved' : 'rejected'}`)
    } catch { toast.error('Action failed') }
  }

  const handleMarkPaid = async (id) => {
    try {
      await winnersAPI.markPaid(id)
      setWinners(prev => prev.map(w => w.id === id ? { ...w, payment_status: 'paid' } : w))
      toast.success('Marked as paid')
    } catch { toast.error('Failed to update') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black font-display text-white">Winners</h1>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'paid'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${filter === f ? 'bg-green-500/20 text-green-400' : 'glass text-white/40 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)
        ) : winners.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <Award className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">No winners found</p>
          </div>
        ) : winners.map(w => (
          <div key={w.id} className="glass rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-white font-bold">{w.user_name}</p>
                <p className="text-white/40 text-xs">{w.draw_name} · {w.match_type}</p>
                {w.proof_url && (
                  <a href={w.proof_url} target="_blank" rel="noreferrer" className="text-blue-400 text-xs mt-1 flex items-center gap-1">
                    <Upload className="w-3 h-3" /> View proof
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-gold-400 font-bold">£{w.amount?.toLocaleString()}</p>
                  <div className="flex gap-1 mt-1">
                    <span className={`badge ${w.verification_status === 'approved' ? 'badge-green' : w.verification_status === 'rejected' ? 'badge-red' : 'badge-gold'}`}>
                      {w.verification_status || 'pending'}
                    </span>
                    <span className={`badge ${w.payment_status === 'paid' ? 'badge-green' : 'badge-gray'}`}>
                      {w.payment_status || 'pending'}
                    </span>
                  </div>
                </div>
                {w.verification_status !== 'approved' && w.verification_status !== 'rejected' && (
                  <div className="flex gap-1">
                    <button onClick={() => handleVerify(w.id, 'approve')} className="p-2 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-all" title="Approve">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleVerify(w.id, 'reject')} className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all" title="Reject">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {w.verification_status === 'approved' && w.payment_status !== 'paid' && (
                  <button onClick={() => handleMarkPaid(w.id)} className="px-3 py-1.5 rounded-xl bg-gold-500/20 text-gold-400 text-xs font-semibold hover:bg-gold-500/30 transition-all">
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminCharities
