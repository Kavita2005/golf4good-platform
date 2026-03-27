import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { charitiesAPI } from '../lib/api'
import { Heart, Search, Filter, ArrowRight, MapPin, Star, ChevronDown } from 'lucide-react'

const CATEGORIES = ['All', 'Health', 'Education', 'Environment', 'Sport', 'Community', 'Children', 'Elderly', 'Poverty']

export default function CharitiesPage() {
  const [charities, setCharities] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [featured, setFeatured] = useState(null)

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (search) params.search = search
    if (category !== 'All') params.category = category

    charitiesAPI.getAll(params)
      .then(r => {
        const list = r.data?.charities || []
        setCharities(list)
        if (!featured && list.length > 0) setFeatured(list.find(c => c.featured) || list[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, category])

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-red-500/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 -right-40 w-96 h-96 bg-green-500/6 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-red-500/30 mb-6">
            <Heart className="w-4 h-4 text-red-400 fill-red-400" />
            <span className="text-white/70 text-sm font-medium">120+ partner charities</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-white mb-4">
            Choose your <span className="gradient-text-gold">cause</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Every subscription funds a charity you believe in. Search, discover, and make your choice.
          </p>
        </div>

        {/* Featured charity spotlight */}
        {featured && (
          <div className="mb-10 animate-fade-up">
            <p className="text-gold-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
              <Star className="w-3.5 h-3.5 fill-gold-400" /> Spotlight Charity
            </p>
            <Link to={`/charities/${featured.id}`} className="block glass rounded-3xl overflow-hidden border border-gold-500/20 hover:border-gold-500/40 transition-all group">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-56 md:h-auto bg-gradient-to-br from-green-800 to-green-950 relative overflow-hidden">
                  {featured.image_url && (
                    <img src={featured.image_url} alt={featured.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-charcoal-950/50" />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="badge-gold mb-3 inline-flex w-fit">Featured</span>
                  <h2 className="text-2xl font-bold font-display text-white mb-3">{featured.name}</h2>
                  <p className="text-white/60 mb-5 leading-relaxed">{featured.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    {featured.total_raised && (
                      <div className="flex items-center gap-1.5 text-green-400">
                        <Heart className="w-4 h-4 fill-green-400" />
                        £{Number(featured.total_raised).toLocaleString()} raised
                      </div>
                    )}
                    {featured.location && (
                      <div className="flex items-center gap-1.5 text-white/40">
                        <MapPin className="w-4 h-4" /> {featured.location}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-5 text-gold-400 font-semibold group-hover:gap-3 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search charities..."
              className="input-field pl-11"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'glass text-white/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-white/40 text-sm mb-5">
          {loading ? 'Loading...' : `${charities.length} charities found`}
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <div className="h-44 shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 rounded shimmer" />
                  <div className="h-3 w-full rounded shimmer" />
                  <div className="h-3 w-2/3 rounded shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : charities.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-lg">No charities found</p>
            <button onClick={() => { setSearch(''); setCategory('All') }} className="mt-4 text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map((c, i) => (
              <Link
                key={c.id}
                to={`/charities/${c.id}`}
                className="glass rounded-2xl overflow-hidden card-hover group animate-fade-in border border-white/5 hover:border-white/10"
                style={{ animationDelay: `${(i % 6) * 50}ms` }}
              >
                <div className="h-44 bg-gradient-to-br from-green-800 to-green-950 relative overflow-hidden">
                  {c.image_url && (
                    <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    {c.category && <span className="badge-green">{c.category}</span>}
                    {c.featured && <span className="badge-gold"><Star className="w-2.5 h-2.5 fill-gold-400" /></span>}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white mb-1.5 group-hover:text-green-400 transition-colors">{c.name}</h3>
                  <p className="text-white/50 text-sm line-clamp-2 mb-3">{c.description}</p>
                  <div className="flex items-center justify-between">
                    {c.total_raised ? (
                      <span className="text-green-400 text-xs font-medium flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-green-400" /> £{Number(c.total_raised).toLocaleString()} raised
                      </span>
                    ) : (
                      <span className="text-white/30 text-xs">Be the first to give</span>
                    )}
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
