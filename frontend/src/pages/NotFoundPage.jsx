import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center animate-fade-up">
        <p className="text-8xl font-black font-display gradient-text-gold mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-white/50 mb-8">That page doesn't exist or has been moved.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold hover:shadow-lg transition-all">
          <Trophy className="w-4 h-4" /> Back to Golf4Good
        </Link>
      </div>
    </div>
  )
}
