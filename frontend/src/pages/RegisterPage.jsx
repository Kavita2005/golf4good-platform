import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Trophy, ArrowRight, User, Mail, Lock, Heart } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirm_password: '', handicap: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/subscribe')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-green-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-gold-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-lg relative animate-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black font-display">
              <span className="gradient-text-green">Golf</span><span className="text-gold-400">4Good</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold font-display text-white mb-2">Create your account</h1>
          <p className="text-white/50">Join thousands of golfers making a difference</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">First name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="James" className="input-field pl-11" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Last name</label>
                <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Smith" className="input-field" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="james@example.com" className="input-field pl-11" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Golf Handicap <span className="text-white/30">(optional)</span></label>
              <input name="handicap" type="number" min="0" max="54" value={form.handicap} onChange={handleChange} placeholder="e.g. 18" className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min. 8 characters" className="input-field pl-11 pr-11" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} placeholder="Repeat your password" className="input-field pl-11" required />
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
              <Heart className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <p className="text-green-300/80 text-xs leading-relaxed">
                A minimum of <strong>10%</strong> of your subscription will go directly to your chosen charity. You can increase this anytime from your dashboard.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-white/50 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
