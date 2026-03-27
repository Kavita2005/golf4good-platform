import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { charitiesAPI } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Heart, ArrowLeft, MapPin, Globe, Calendar, Users, ArrowRight, DollarSign } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CharityDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [charity, setCharity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [donating, setDonating] = useState(false)
  const [donateAmt, setDonateAmt] = useState(10)

  useEffect(() => {
    charitiesAPI.getOne(id)
      .then(r => setCharity(r.data?.charity))
      .catch(() => navigate('/charities'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDonate = async () => {
    if (!user) { navigate('/login'); return }
    setDonating(true)
    try {
      await charitiesAPI.donate({ charity_id: id, amount: donateAmt })
      toast.success(`£${donateAmt} donated to ${charity.name}! Thank you.`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Donation failed')
    } finally { setDonating(false) }
  }

  if (loading) return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="h-72 rounded-3xl shimmer mb-6" />
        <div className="h-8 w-1/2 rounded shimmer mb-3" />
        <div className="h-4 w-full rounded shimmer mb-2" />
        <div className="h-4 w-3/4 rounded shimmer" />
      </div>
    </div>
  )

  if (!charity) return null

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link to="/charities" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Charities
        </Link>

        {/* Hero image */}
        <div className="h-72 rounded-3xl overflow-hidden mb-8 relative">
          {charity.image_url ? (
            <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-800 to-green-950 flex items-center justify-center">
              <Heart className="w-16 h-16 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6">
            {charity.category && <span className="badge-green mb-3 block w-fit">{charity.category}</span>}
            <h1 className="text-3xl font-black font-display text-white">{charity.name}</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-white font-bold text-lg mb-3">About</h2>
              <p className="text-white/60 leading-relaxed">{charity.description}</p>
              {charity.long_description && (
                <p className="text-white/50 leading-relaxed mt-3 text-sm">{charity.long_description}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Raised', value: `£${Number(charity.total_raised || 0).toLocaleString()}`, icon: Heart, color: 'text-red-400', bg: 'bg-red-500/10' },
                { label: 'Supporters', value: charity.supporter_count || '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="glass rounded-2xl p-5">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <p className="text-2xl font-black text-white">{value}</p>
                  <p className="text-white/40 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Upcoming events */}
            {charity.events?.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold-400" /> Upcoming Events
                </h2>
                <div className="space-y-3">
                  {charity.events.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-green-400 text-xs font-bold">{new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric' })}</span>
                        <span className="text-green-400/60 text-xs">{new Date(ev.date).toLocaleDateString('en-GB', { month: 'short' })}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{ev.title}</p>
                        <p className="text-white/50 text-xs">{ev.description}</p>
                        {ev.location && <p className="text-white/30 text-xs mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info */}
            <div className="glass rounded-2xl p-5 space-y-3">
              {charity.website && (
                <a href={charity.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-white/50 hover:text-green-400 transition-colors">
                  <Globe className="w-4 h-4" /> Visit Website
                </a>
              )}
              {charity.location && (
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <MapPin className="w-4 h-4" /> {charity.location}
                </div>
              )}
              {charity.registration_number && (
                <div className="text-xs text-white/30">Reg. {charity.registration_number}</div>
              )}
            </div>

            {/* Donate */}
            <div className="glass rounded-2xl p-5 border border-green-500/20">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400 fill-red-400" /> Make a Donation
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[5, 10, 25, 50, 100, 250].map(amt => (
                  <button key={amt} onClick={() => setDonateAmt(amt)}
                    className={`py-2 rounded-xl text-sm font-bold transition-all ${
                      donateAmt === amt
                        ? 'bg-green-500/30 text-green-400 border border-green-500/40'
                        : 'glass text-white/60 hover:text-white'
                    }`}>
                    £{amt}
                  </button>
                ))}
              </div>
              <div className="relative mb-3">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">£</span>
                <input
                  type="number" min="1" value={donateAmt}
                  onChange={e => setDonateAmt(parseInt(e.target.value) || 0)}
                  className="input-field pl-8 text-center font-bold"
                />
              </div>
              <button onClick={handleDonate} disabled={donating || donateAmt < 1}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-sm shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-green-500/30 transition-all">
                {donating ? 'Processing...' : `Donate £${donateAmt}`}
              </button>
              <p className="text-white/25 text-xs text-center mt-2">Secure payment via Stripe</p>
            </div>

            {/* Subscribe CTA */}
            <div className="glass rounded-2xl p-5 border border-gold-500/20 bg-gradient-to-br from-gold-500/5 to-transparent">
              <p className="text-white font-semibold text-sm mb-2">Support monthly</p>
              <p className="text-white/50 text-xs mb-4">Subscribe and 10%+ of every payment goes to this charity automatically.</p>
              <Link to="/subscribe" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 text-sm font-semibold transition-all">
                Subscribe Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
