import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Heart, Star, ArrowRight, Users, DollarSign, Target, Zap, CheckCircle, ChevronRight } from 'lucide-react'
import { charitiesAPI } from '../lib/api'

const STATS = [
  { value: '£2.4M', label: 'Raised for Charity', icon: Heart },
  { value: '18,400', label: 'Active Golfers', icon: Users },
  { value: '94%', label: 'Satisfaction Rate', icon: Star },
  { value: '120+', label: 'Partner Charities', icon: Target },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Subscribe', desc: 'Choose your monthly or yearly plan. A portion goes directly to charity.', color: 'from-green-500 to-emerald-600' },
  { step: '02', title: 'Enter Scores', desc: 'Log your last 5 Stableford scores. They determine your draw eligibility.', color: 'from-gold-500 to-gold-600' },
  { step: '03', title: 'Monthly Draw', desc: 'Your scores enter you into the monthly prize draw automatically.', color: 'from-blue-500 to-blue-600' },
  { step: '04', title: 'Win & Give', desc: 'Win prizes while your chosen charity receives contributions every month.', color: 'from-purple-500 to-purple-600' },
]

const PRIZES = [
  { match: '5-Number Match', share: '40%', label: 'JACKPOT', color: 'gold', rollover: true },
  { match: '4-Number Match', share: '35%', label: 'SECOND PRIZE', color: 'silver', rollover: false },
  { match: '3-Number Match', share: '25%', label: 'THIRD PRIZE', color: 'bronze', rollover: false },
]

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const num = parseFloat(target.replace(/[^0-9.]/g, ''))
        const steps = 60
        let i = 0
        const timer = setInterval(() => {
          i++
          setCount(Math.round((num * i) / steps * 10) / 10)
          if (i >= steps) clearInterval(timer)
        }, duration / steps)
      }
    })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, duration])

  const prefix = target.startsWith('£') ? '£' : ''
  const suffix = target.endsWith('%') ? '%' : target.endsWith('+') ? '+' : ''
  const formatted = target.includes(',') ? count.toLocaleString() : count

  return <span ref={ref}>{prefix}{formatted}{suffix}</span>
}

export default function HomePage() {
  const [featuredCharities, setFeaturedCharities] = useState([])
  const heroRef = useRef(null)

  useEffect(() => {
    charitiesAPI.getAll({ featured: true, limit: 3 })
      .then(r => setFeaturedCharities(r.data?.charities || []))
      .catch(() => {})
  }, [])

  // Scroll animations
  useEffect(() => {
    const els = document.querySelectorAll('.scroll-reveal')
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('opacity-100', 'translate-y-0')
      })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <div className="overflow-hidden">
      {/* ── HERO ────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-green-500/30 mb-8">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Monthly draw now live — £84,000 jackpot</span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.95] mb-8">
                <span className="text-white">Play golf.</span>
                <br />
                <span className="gradient-text-gold text-glow-gold">Change lives.</span>
                <br />
                <span className="text-white/50 text-4xl sm:text-5xl lg:text-6xl font-light italic">every month.</span>
              </h1>

              <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-lg">
                The world's first subscription golf platform where your Stableford scores enter you into a prize draw — and every subscription directly funds the charity you love.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/subscribe" className="group flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-lg shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all transform hover:scale-105">
                  Start Playing
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/draws" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl glass border border-white/20 text-white/80 hover:text-white font-semibold hover:bg-white/5 transition-all">
                  <Trophy className="w-5 h-5 text-gold-400" />
                  View Draws
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-10">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-charcoal-900 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-xs font-bold">
                      {['JD','SM','KL','MR'][i]}
                    </div>
                  ))}
                </div>
                <p className="text-white/50 text-sm"><span className="text-white font-semibold">18,400+</span> golfers giving back</p>
              </div>
            </div>

            {/* Right — floating card */}
            <div className="relative hidden lg:block">
              <div className="animate-float relative">
                {/* Main jackpot card */}
                <div className="glass rounded-3xl p-8 border border-gold-500/30 glow-gold relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-1">Current Jackpot</p>
                        <p className="text-5xl font-black font-display gradient-text-gold">£84,000</p>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-gold-400" />
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      {['5-Match: £84,000 Jackpot', '4-Match: £73,500 Pool', '3-Match: £52,500 Pool'].map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> {t}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <span className="text-white/50 text-xs">Next Draw</span>
                      <span className="text-white font-semibold text-sm">April 30, 2026</span>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 border border-green-500/30 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                    <div>
                      <p className="text-white text-xs font-bold">£240 donated</p>
                      <p className="text-white/40 text-xs">this month</p>
                    </div>
                  </div>
                </div>

                {/* Bottom badge */}
                <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 border border-blue-500/30 shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/70 text-xs">2,847 entries this month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────── */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center scroll-reveal opacity-0 translate-y-8 transition-all duration-700" style={{ transitionDelay: `${i * 100}ms` }}>
                <Icon className="w-6 h-6 text-green-400 mx-auto mb-3" />
                <p className="text-3xl font-black font-display gradient-text-gold mb-1">
                  <AnimatedCounter target={value} />
                </p>
                <p className="text-white/50 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-green-400 text-sm font-bold uppercase tracking-widest mb-3">Simple by design</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">How Golf4Good works</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">Four simple steps from signup to making a real difference</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, color }, i) => (
              <div key={i} className="relative glass rounded-2xl p-6 scroll-reveal opacity-0 translate-y-8 transition-all duration-700 hover:bg-white/5 group" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  <span className="text-white font-black text-sm">{step}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE STRUCTURE ──────────────────────── */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/3 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gold-400 text-sm font-bold uppercase tracking-widest mb-3">Monthly prize draw</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">Three ways to win</h2>
            <p className="text-white/50 text-lg">Match your scores against the draw numbers for a share of the prize pool</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PRIZES.map(({ match, share, label, color, rollover }, i) => (
              <div key={i} className={`relative glass rounded-3xl p-8 overflow-hidden scroll-reveal opacity-0 translate-y-8 transition-all duration-700 ${i === 0 ? 'border border-gold-500/40 glow-gold' : ''}`} style={{ transitionDelay: `${i * 150}ms` }}>
                {i === 0 && <div className="absolute inset-0 bg-gradient-to-br from-gold-500/8 to-transparent pointer-events-none" />}
                <div className="relative">
                  <span className={`badge ${i === 0 ? 'badge-gold' : i === 1 ? 'badge-gray' : 'badge-gray'} mb-4`}>{label}</span>
                  <p className="text-4xl font-black font-display text-white mb-1">{share}</p>
                  <p className="text-white/50 text-sm mb-4">of prize pool</p>
                  <p className="text-white font-semibold mb-3">{match}</p>
                  {rollover && (
                    <div className="flex items-center gap-2 text-gold-400 text-xs">
                      <Zap className="w-3.5 h-3.5" />
                      Jackpot rolls over if unclaimed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/draws" className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-medium transition-colors">
              View all draw results <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CHARITY SPOTLIGHT ────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-3">Making a difference</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">Featured charities</h2>
            </div>
            <Link to="/charities" className="hidden sm:flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredCharities.length > 0 ? featuredCharities.map((c, i) => (
              <Link key={c.id} to={`/charities/${c.id}`} className="glass rounded-2xl overflow-hidden card-hover group scroll-reveal opacity-0 translate-y-8 transition-all duration-700" style={{ transitionDelay: `${i * 150}ms` }}>
                <div className="h-44 bg-gradient-to-br from-green-800 to-green-900 relative overflow-hidden">
                  {c.image_url && <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="badge-green">{c.category || 'Charity'}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white mb-1 group-hover:text-green-400 transition-colors">{c.name}</h3>
                  <p className="text-white/50 text-sm line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-green-400 text-xs font-medium">
                    <Heart className="w-3.5 h-3.5" />
                    {c.total_raised ? `£${c.total_raised.toLocaleString()} raised` : 'Support this charity'}
                  </div>
                </div>
              </Link>
            )) : (
              // Skeleton placeholders
              [...Array(3)].map((_, i) => (
                <div key={i} className="glass rounded-2xl overflow-hidden">
                  <div className="h-44 shimmer" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-3/4 rounded-lg shimmer" />
                    <div className="h-3 w-full rounded-lg shimmer" />
                    <div className="h-3 w-1/2 rounded-lg shimmer" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative glass rounded-3xl p-12 sm:p-16 overflow-hidden border border-green-500/20 glow-green text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-gold-500/5 pointer-events-none" />
            <div className="relative">
              <p className="text-green-400 text-sm font-bold uppercase tracking-widest mb-4">Join the movement</p>
              <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-6 leading-tight">
                Your next round could<br />
                <span className="gradient-text-gold">change everything.</span>
              </h2>
              <p className="text-white/60 text-lg mb-10 max-w-lg mx-auto">
                Subscribe today. Enter the draw. Support your charity. It's that simple.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/subscribe" className="group flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-lg shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all transform hover:scale-105">
                  Subscribe Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/charities" className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl glass border border-white/20 text-white/80 hover:text-white font-semibold transition-all">
                  <Heart className="w-5 h-5 text-red-400" />
                  Explore Charities
                </Link>
              </div>
              <p className="text-white/30 text-xs mt-6">Cancel anytime · Secure payments via Stripe · HTTPS encrypted</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
