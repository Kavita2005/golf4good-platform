import { Link } from 'react-router-dom'
import { Trophy, Heart, Mail } from 'lucide-react'
export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-charcoal-950/50">
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold font-display">
                <span className="gradient-text-green">Golf</span>
                <span className="text-gold-400">4Good</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/50">
              Where your love of golf creates real change. Play, compete, and give back — every swing counts.
            </p>
            
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">Platform</h4>
            <ul className="space-y-3">
              {[['/', 'How It Works'], ['/charities', 'Charities'], ['/draws', 'Monthly Draws'], ['/subscribe', 'Pricing']].map(([href, label]) => (
                <li key={href}>
                  <Link to={href} className="text-sm transition-colors text-white/50 hover:text-white/80">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">Support</h4>
            <ul className="space-y-3">
              {[['#', 'Help Centre'], ['#', 'Privacy Policy'], ['#', 'Terms of Service'], ['#', 'Contact Us']].map(([href, label]) => (
                <li key={label}>
                  <a href={href} className="text-sm transition-colors text-white/50 hover:text-white/80">{label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 mt-12 border-t border-white/5 sm:flex-row">
          <p className="text-white/30 text-xs flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for golfers who give back · © 2026 Golf4Good
          </p>
          <div className="flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-white/30" />
            <a href="mailto:hello@golf4good.co" className="text-xs transition-colors text-white/30 hover:text-white/60">hello@golf4good.co</a>
          </div>
        </div>
      </div>
    </footer>
  )
}