import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, Trophy, Heart, BarChart3, User, LogOut, Settings, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const { user, logout, isAdmin, isSubscribed } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const navLinks = [
    { href: '/charities', label: 'Charities', icon: Heart },
    { href: '/draws', label: 'Draws', icon: Trophy },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard', icon: BarChart3 }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin', icon: Settings }] : []),
  ]

  const handleLogout = async () => {
    setUserMenu(false)
    await logout()
    navigate('/')
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-dark shadow-xl' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold font-display hidden sm:block">
              <span className="gradient-text-green">Golf</span>
              <span className="text-gold-400">4Good</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith(href)
                    ? 'bg-green-500/20 text-green-400'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(!userMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white text-sm font-bold">
                    {user.first_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-white/80">{user.first_name}</span>
                  {isSubscribed && <span className="badge-green text-xs">PRO</span>}
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                </button>
                {userMenu && (
                  <div className="absolute right-0 top-12 w-48 glass-dark rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-white/10">
                      <p className="text-sm font-medium text-white">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                      <BarChart3 className="w-4 h-4" /> Dashboard
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all">
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/70 hover:text-white px-4 py-2 rounded-xl hover:bg-white/5 transition-all font-medium">
                  Sign in
                </Link>
                <Link to="/subscribe" className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg hover:shadow-green-500/25 transition-all transform hover:scale-105">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl glass text-white/70 hover:text-white">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass-dark border-t border-white/10 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} to={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname.startsWith(href) ? 'bg-green-500/20 text-green-400' : 'text-white/70'
              }`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/10 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold">
                      {user.first_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-white/40">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 rounded-xl hover:bg-red-500/10">
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-4 py-3 text-sm text-white/70 rounded-xl hover:bg-white/5">Sign in</Link>
                  <Link to="/subscribe" className="block px-4 py-3 text-sm font-semibold text-center rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white">Get Started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
