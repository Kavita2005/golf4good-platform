import { Link } from 'react-router-dom'
export default function SubscriptionStatus({ subscription }) {
  if (!subscription) return (
    <Link to="/subscribe" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-all">
      <span className="w-2 h-2 rounded-full bg-red-400" />
      <span className="text-green-400 text-sm font-medium">Subscribe to enter draws</span>
    </Link>
  )
  const isActive = subscription.status === 'active'
  const renewDate = subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : null
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl glass border ${isActive?'border-green-500/30':'border-red-500/30'}`}>
      <span className={`w-2 h-2 rounded-full ${isActive?'bg-green-400 animate-pulse':'bg-red-400'}`} />
      <div>
        <p className={`text-sm font-semibold ${isActive?'text-green-400':'text-red-400'}`}>
          {isActive?'Active':'Inactive'} · {subscription.plan==='yearly'?'Annual':'Monthly'}
        </p>
        {renewDate && <p className="text-white/30 text-xs">Renews {renewDate}</p>}
      </div>
    </div>
  )
}
