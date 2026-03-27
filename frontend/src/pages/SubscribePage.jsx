import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { subscriptionAPI } from '../lib/api'
import { CheckCircle, Zap, Trophy, Heart, Star, ArrowRight, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 12.99,
    period: '/month',
    badge: null,
    features: [
      'Full score entry (5 rolling scores)',
      'Monthly draw entry',
      'Min. 10% to your chosen charity',
      'Winner dashboard & stats',
      'Email draw result notifications',
    ],
    color: 'from-green-600 to-green-500',
    border: 'border-white/10',
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 119.99,
    period: '/year',
    badge: 'Save 23%',
    features: [
      'Everything in Monthly',
      '2 months free vs monthly',
      'Priority customer support',
      'Early access to new features',
      'Higher charity contribution tiers',
      'Exclusive member badge',
    ],
    color: 'from-gold-600 to-gold-400',
    border: 'border-gold-500/40',
    highlight: true,
  },
]

const PERKS = [
  { icon: Trophy, text: 'Enter monthly prize draws automatically' },
  { icon: Heart, text: 'Support your chosen charity every month' },
  { icon: Star, text: 'Track your Stableford scores over time' },
  { icon: Zap, text: 'Jackpot rolls over if unclaimed' },
]

export default function SubscribePage() {
  const [selected, setSelected] = useState('yearly')
  const [loading, setLoading] = useState(false)
  const { user, isSubscribed } = useAuth()
  const navigate = useNavigate()

  const plan = PLANS.find(p => p.id === selected)

  const handleSubscribe = async () => {
    if (!user) { navigate('/register'); return }
    if (isSubscribed) { toast.success('You already have an active subscription!'); navigate('/dashboard'); return }

    setLoading(true)
    try {
      const { data } = await subscriptionAPI.createCheckout(selected)
      if (data.url) window.location.href = data.url
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-green-500/30 mb-6">
            <Zap className="w-4 h-4 text-gold-400" />
            <span className="text-white/70 text-sm font-medium">Simple pricing, real impact</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-4">
            Choose your <span className="gradient-text-gold">plan</span>
          </h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto">
            Every subscription enters you into the monthly draw and funds the charity you choose.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {PLANS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`relative glass rounded-3xl p-8 text-left transition-all duration-300 group ${
                selected === p.id
                  ? `border ${p.border} ${p.highlight ? 'glow-gold' : 'glow-green'}`
                  : 'border border-white/5 hover:border-white/10'
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 right-6 badge-gold px-3 py-1 text-xs">
                  {p.badge}
                </span>
              )}
              {p.highlight && <div className="absolute inset-0 bg-gradient-to-br from-gold-500/8 to-transparent rounded-3xl pointer-events-none" />}

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-1">{p.name}</p>
                    <p className="text-4xl font-black font-display text-white">
                      £{p.price}
                      <span className="text-lg font-normal text-white/40">{p.period}</span>
                    </p>
                    {p.id === 'yearly' && (
                      <p className="text-gold-400 text-xs mt-1">£{(p.price / 12).toFixed(2)}/month equivalent</p>
                    )}
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selected === p.id
                      ? `bg-gradient-to-br ${p.color} border-transparent`
                      : 'border-white/20'
                  }`}>
                    {selected === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <ul className="space-y-3">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-white/70">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${p.highlight ? 'text-gold-400' : 'text-green-400'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-lg shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Subscribe — £{plan.price}{plan.period}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-white/30 text-xs mb-8">
            <span>🔒 Secured by Stripe</span>
            <span>·</span>
            <span>Cancel anytime</span>
            <span>·</span>
            <span>No hidden fees</span>
          </div>

          {!user && (
            <p className="text-white/40 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-green-400 hover:text-green-300 transition-colors">Sign in</Link>
            </p>
          )}
        </div>

        {/* Perks */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          {PERKS.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-2xl glass">
              <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-white/60 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
