export default function DrawHistory({ history, compact = false }) {
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
                <p className="text-white/40 text-xs">{new Date(h.draw_date).toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</p>
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
