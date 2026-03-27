import { supabase } from '../utils/supabase.js'

/**
 * Draw Engine
 * Generates 5 winning numbers (1–45) using different algorithms
 */
export class DrawEngine {
  /**
   * Random: standard lottery-style
   */
  static random() {
    const numbers = new Set()
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1)
    }
    return Array.from(numbers).sort((a, b) => a - b)
  }

  /**
   * Weighted by most frequent user scores
   */
  static async weightedByFrequency(favourHigh = true) {
    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    if (!scores || scores.length < 20) return DrawEngine.random()

    // Build frequency map
    const freq = {}
    scores.forEach(s => { freq[s.score] = (freq[s.score] || 0) + 1 })

    // Build weighted pool
    const pool = []
    for (let n = 1; n <= 45; n++) {
      const weight = favourHigh
        ? (freq[n] || 0) + 1          // common scores more likely
        : Math.max(1, 10 - (freq[n] || 0)) // rare scores more likely
      for (let i = 0; i < weight; i++) pool.push(n)
    }

    // Pick 5 unique from weighted pool
    const numbers = new Set()
    let attempts = 0
    while (numbers.size < 5 && attempts < 1000) {
      numbers.add(pool[Math.floor(Math.random() * pool.length)])
      attempts++
    }
    // Fallback if we couldn't get 5 unique
    while (numbers.size < 5) numbers.add(Math.floor(Math.random() * 45) + 1)
    return Array.from(numbers).sort((a, b) => a - b)
  }

  /**
   * Generate draw numbers based on algorithm
   */
  static async generate(algorithm = 'random') {
    switch (algorithm) {
      case 'weighted_high': return DrawEngine.weightedByFrequency(true)
      case 'weighted_low': return DrawEngine.weightedByFrequency(false)
      case 'frequency': return DrawEngine.weightedByFrequency(true)
      default: return DrawEngine.random()
    }
  }

  /**
   * Check how many numbers a user's scores match
   */
  static checkMatch(userScores, winningNumbers) {
    const winSet = new Set(winningNumbers)
    const matches = userScores.filter(s => winSet.has(s.score))
    return matches.length
  }

  /**
   * Determine match type string
   */
  static matchType(matchCount) {
    if (matchCount >= 5) return '5-match'
    if (matchCount === 4) return '4-match'
    if (matchCount === 3) return '3-match'
    return null
  }

  /**
   * Calculate prize pool distribution
   */
  static calculatePrizes(prizePool, jackpotRollover = 0) {
    const total = prizePool + jackpotRollover
    return {
      '5-match': Math.round(total * 0.40),
      '4-match': Math.round(prizePool * 0.35),
      '3-match': Math.round(prizePool * 0.25),
    }
  }

  /**
   * Run a full draw simulation (preview only — not saved)
   */
  static async simulate(algorithm = 'random', drawId = null) {
    const numbers = await DrawEngine.generate(algorithm)

    // Get all active subscribers with 5 scores
    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, last_name, scores(*)')
      .eq('scores.user_id', 'users.id')

    // Simplified simulation using scores table
    const { data: allScores } = await supabase
      .from('scores')
      .select('user_id, score')

    // Group scores by user
    const userScores = {}
    if (allScores) {
      allScores.forEach(s => {
        if (!userScores[s.user_id]) userScores[s.user_id] = []
        userScores[s.user_id].push(s.score)
      })
    }

    const breakdown = { '5-match': { winners: 0, user_ids: [] }, '4-match': { winners: 0, user_ids: [] }, '3-match': { winners: 0, user_ids: [] } }

    Object.entries(userScores).forEach(([userId, scores]) => {
      const winSet = new Set(numbers)
      const matches = scores.filter(s => winSet.has(s)).length
      const type = DrawEngine.matchType(matches)
      if (type) {
        breakdown[type].winners++
        breakdown[type].user_ids.push(userId)
      }
    })

    // Mock prize pool for simulation
    const mockPool = 210000
    const prizes = DrawEngine.calculatePrizes(mockPool)
    Object.keys(breakdown).forEach(type => {
      const winners = breakdown[type].winners
      breakdown[type].prize_each = winners > 0 ? Math.round(prizes[type] / winners) : prizes[type]
      breakdown[type].total = prizes[type]
    })

    return { numbers, breakdown, algorithm, simulated_at: new Date().toISOString() }
  }

  /**
   * Execute and save a real draw
   */
  static async executeDraw(drawId, algorithm = 'random') {
    const numbers = await DrawEngine.generate(algorithm)

    // Get draw prize pool
    const { data: draw } = await supabase.from('draws').select('*').eq('id', drawId).single()
    if (!draw) throw new Error('Draw not found')

    const prizePool = draw.prize_pool || 0
    const prizes = DrawEngine.calculatePrizes(prizePool, draw.jackpot_rollover || 0)

    // Get all active subscribers' scores
    const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active')

    if (!activeSubs || activeSubs.length === 0) {
      // No subscribers — save draw with no winners
      await supabase.from('draws').update({
        winning_numbers: numbers, status: 'published',
        five_match_pool: prizes['5-match'],
        four_match_pool: prizes['4-match'],
        three_match_pool: prizes['3-match'],
      }).eq('id', drawId)
      return { numbers, winners: [] }
    }

    const userIds = activeSubs.map(s => s.user_id)
    const { data: allScores } = await supabase
      .from('scores')
      .select('user_id, score, date')
      .in('user_id', userIds)

    // Group scores by user
    const userScores = {}
    if (allScores) {
      allScores.forEach(s => {
        if (!userScores[s.user_id]) userScores[s.user_id] = []
        userScores[s.user_id].push(s.score)
      })
    }

    // Find winners
    const winnersByType = { '5-match': [], '4-match': [], '3-match': [] }
    Object.entries(userScores).forEach(([userId, scores]) => {
      const winSet = new Set(numbers)
      const matches = scores.filter(s => winSet.has(s)).length
      const type = DrawEngine.matchType(matches)
      if (type) winnersByType[type].push(userId)
    })

    // Calculate per-winner prizes
    const winners = []
    let jackpotRollover = 0

    for (const [matchType, winnerUserIds] of Object.entries(winnersByType)) {
      const pool = prizes[matchType]
      if (winnerUserIds.length === 0) {
        if (matchType === '5-match') jackpotRollover = pool
        continue
      }
      const prizeEach = Math.round(pool / winnerUserIds.length)
      for (const userId of winnerUserIds) {
        winners.push({ user_id: userId, draw_id: drawId, match_type: matchType, amount: prizeEach, payment_status: 'pending', verification_status: 'pending' })
      }
    }

    // Save winners
    if (winners.length > 0) {
      await supabase.from('draw_winners').insert(winners)
    }

    // Update draw record
    await supabase.from('draws').update({
      winning_numbers: numbers,
      status: 'published',
      five_match_pool: prizes['5-match'],
      four_match_pool: prizes['4-match'],
      three_match_pool: prizes['3-match'],
      jackpot_rollover: jackpotRollover,
      participant_count: userIds.length,
      winner_summary: {
        '5-match': winnersByType['5-match'].length,
        '4-match': winnersByType['4-match'].length,
        '3-match': winnersByType['3-match'].length,
      }
    }).eq('id', drawId)

    return { numbers, winners }
  }
}

export default DrawEngine
