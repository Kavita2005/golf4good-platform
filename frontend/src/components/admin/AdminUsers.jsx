import { useState, useEffect } from 'react'
import { adminAPI } from '../../lib/api'
import { Search, Edit2, ChevronDown, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState(null)

  const fetchUsers = () => {
    setLoading(true)
    adminAPI.getUsers({ search }).then(r => setUsers(r.data?.users || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [search])

  const handleUpdate = async (id, data) => {
    try {
      await adminAPI.updateUser(id, data)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u))
      setEditUser(null)
      toast.success('User updated')
    } catch { toast.error('Update failed') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black font-display text-white">Users</h1>
        <span className="badge-gray">{users.length} total</span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="input-field pl-11" />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {['User', 'Email', 'Plan', 'Status', 'Scores', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-white/40 text-xs uppercase tracking-wider font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded shimmer" /></td>)}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-white/30">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-all">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-white text-xs font-bold">
                      {u.first_name?.[0]}
                    </div>
                    <span className="text-white text-sm font-medium">{u.first_name} {u.last_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-white/50 text-sm">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.subscription_plan === 'yearly' ? 'badge-gold' : u.subscription_plan === 'monthly' ? 'badge-green' : 'badge-gray'}`}>
                    {u.subscription_plan || 'None'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.subscription_status === 'active' ? 'badge-green' : 'badge-red'}`}>
                    {u.subscription_status || 'inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50 text-sm">{u.score_count || 0}/5</td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditUser(u)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditUser(null)}>
          <div className="glass-dark rounded-3xl p-6 w-full max-w-md border border-white/10 animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-bold text-lg mb-5">Edit User</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">First Name</label>
                  <input defaultValue={editUser.first_name} className="input-field" id="fn" />
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1.5 block">Last Name</label>
                  <input defaultValue={editUser.last_name} className="input-field" id="ln" />
                </div>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Role</label>
                <select defaultValue={editUser.role} className="input-field" id="role">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Subscription Status</label>
                <select defaultValue={editUser.subscription_status || 'inactive'} className="input-field" id="sub_status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="lapsed">Lapsed</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => handleUpdate(editUser.id, {
                first_name: document.getElementById('fn').value,
                last_name: document.getElementById('ln').value,
                role: document.getElementById('role').value,
                subscription_status: document.getElementById('sub_status').value,
              })} className="flex-1 py-2.5 rounded-xl bg-green-500/20 text-green-400 font-semibold text-sm hover:bg-green-500/30 transition-all">
                Save Changes
              </button>
              <button onClick={() => setEditUser(null)} className="px-4 py-2.5 rounded-xl glass text-white/50 text-sm hover:text-white">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
