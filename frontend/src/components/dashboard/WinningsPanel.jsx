export default function WinningsPanel({ winnings, compact = false }) {
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
          <p className="text-white/30 text-sm">No winnings yet — keep entering draws!</p>
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
                <p className="text-gold-400 font-bold">£{(w.amount||0).toLocaleString()}</p>
                <span className={`badge text-xs ${w.payment_status==='paid'?'badge-green':w.payment_status==='pending'?'badge-gold':'badge-gray'}`}>{w.payment_status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {pending.length > 0 && (
        <div className="mt-3 p-3 rounded-xl bg-gold-500/10 border border-gold-500/20">
          <p className="text-gold-300 text-xs">⚠️ {pending.length} winning(s) pending verification. Upload proof to claim.</p>
        </div>
      )}
    </div>
  )
}
