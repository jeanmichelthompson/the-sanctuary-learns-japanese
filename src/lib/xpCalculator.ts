/**
 * Calculates XP based on activity type and duration
 * Makes XP calculation more interesting than just minutes × 10
 */
export function calculateXP(activityType: string, durationMinutes: number): number {
    // Base XP is 5 XP per minute
    let baseXP = durationMinutes * 5
  
    // Activity type multipliers
    const multipliers: Record<string, number> = {
      Reading: 1.2, // Reading gives 20% more XP
      Listening: 1.1, // Listening gives 10% more XP
      Grammar: 1.5, // Grammar gives 50% more XP (it's harder!)
    }
  
    // Apply activity type multiplier
    const multiplier = multipliers[activityType] || 1
    baseXP = baseXP * multiplier
  
    // Bonus for longer sessions (encourages deeper study)
    if (durationMinutes >= 30) {
      baseXP += 25 // Bonus for 30+ minute sessions
    }
    if (durationMinutes >= 60) {
      baseXP += 50 // Additional bonus for 60+ minute sessions
    }
  
    // Add a small random bonus (1-10 XP) to make it less predictable
    const randomBonus = Math.floor(Math.random() * 10) + 1
    baseXP += randomBonus
  
    // Round to nearest integer
    return Math.round(baseXP)
  }
  
  /**
   * Returns a human-readable explanation of XP calculation
   */
  export function explainXPCalculation(activityType: string, durationMinutes: number): string {
    const multipliers: Record<string, number> = {
      Reading: 1.2,
      Listening: 1.1,
      Grammar: 1.5,
    }
  
    const multiplier = multipliers[activityType] || 1
    const baseXP = durationMinutes * 5
    const multipliedXP = baseXP * multiplier
  
    let explanation = `Base: ${durationMinutes} min × 5 = ${baseXP} XP\n`
    explanation += `${activityType} bonus: ${baseXP} × ${multiplier} = ${Math.round(multipliedXP)} XP\n`
  
    let bonusXP = 0
    if (durationMinutes >= 30) {
      bonusXP += 25
      explanation += `30+ min bonus: +25 XP\n`
    }
    if (durationMinutes >= 60) {
      bonusXP += 50
      explanation += `60+ min bonus: +50 XP\n`
    }
  
    explanation += `Random bonus: +1-10 XP\n`
    explanation += `Total: ~${Math.round(multipliedXP + bonusXP)} XP + random bonus`
  
    return explanation
  }
  