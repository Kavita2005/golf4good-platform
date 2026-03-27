// WinningsPanel
export function WinningsPanel({ winnings, compact = false }) {
  const total = winnings.reduce((s, w) => s + (w.amount || 0), 0)
  const pending = winnings.filter(w => w.payment_status === 'pending')

  return (
    <div className={`glass rounded-2xl ${compact ? 'p-5' : 'p-6'}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gold-500/20 flex items-center justify-center">
          <span className="text-gold-400 text-lg">🏆</span>
        </div>
        <div>
          <h3 className="text-white font-bold">My Winnings</h3>
          <p className="text-white/40 text-xs">Total: <span className="text-gold-400 font-semibold">£{total.toLocaleString()}</span></p>
        </div>
      </div>
      {winnings.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-white/30 text-sm">No winnings yet</p>
          <p className="text-white/20 text-xs mt-1">Keep entering draws!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(compact ? winnings.slice(0, 3) : winnings).map((w, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5">
              <div>
                <p className="text-white text-sm font-medium">{w.draw_name || `Draw #${w.draw_id}`}</p>
                <p className="text-white/40 text-xs">{w.match_type} · {new Date(w.created_at).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="text-right">
                <p className="text-gold-400 font-bold">£{w.amount?.toLocaleString()}</p>
                <span className={`badge text-xs ${w.payment_status === 'paid' ? 'badge-green' : w.payment_status === 'pending' ? 'badge-gold' : 'badge-gray'}`}>
                  {w.payment_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {pending.length > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-gold-500/10 border border-gold-500/20">
          <p className="text-gold-300 text-xs">⚠️ {pending.length} winning(s) pending verification. Upload proof of scores to claim.</p>
        </div>
      )}
    </div>
  )
}

// DrawHistory
export function DrawHistory({ history, compact = false }) {
  return (
    <div className={`glass rounded-2xl ${compact ? 'p-5' : 'p-6'}`}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <span className="text-blue-400 text-lg">📅</span>
        </div>
        <div>
          <h3 className="text-white font-bold">Draw History</h3>
          <p className="text-white/40 text-xs">{history.length} draws entered</p>
        </div>
      </div>
      {history.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-white/30 text-sm">No draw history yet</p>
          <p className="text-white/20 text-xs mt-1">You'll appear here after your first monthly draw</p>
        </div>
      ) : (
        <div className="space-y-2">
          {(compact ? history.slice(0, 4) : history).map((h, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5">
              <div>
                <p className="text-white text-sm font-medium">{h.draw_name}</p>
                <p className="text-white/40 text-xs">{new Date(h.draw_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
              </div>
              <span className={`badge ${h.won ? 'badge-gold' : 'badge-gray'}`}>
                {h.won ? `Won £${h.prize?.toLocaleString()}` : 'No match'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// SubscriptionStatus
export default function SubscriptionStatus({ subscription }) {
  if (!subscription) return (
    <a href="/subscribe" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/20 border border-green-500/30 hover:bg-green-500/30 transition-all">
      <span className="w-2 h-2 rounded-full bg-red-400" />
      <span className="text-green-400 text-sm font-medium">Subscribe to enter draws</span>
    </a>
  )

  const isActive = subscription.status === 'active'
  const renewDate = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl glass border ${isActive ? 'border-green-500/30' : 'border-red-500/30'}`}>
      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
      <div>
        <p className={`text-sm font-semibold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
          {isActive ? 'Active' : 'Inactive'} · {subscription.plan === 'yearly' ? 'Annual' : 'Monthly'}
        </p>
        {renewDate && <p className="text-white/30 text-xs">Renews {renewDate}</p>}
      </div>
    </div>
  )
}
