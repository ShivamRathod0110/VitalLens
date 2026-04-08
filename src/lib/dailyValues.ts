import type { ProfileState } from '../store/profileStore'

export interface DailyValues {
  energyKcal: number
  sugar: number
  salt: number
  protein: number
  fiber: number
  fat: number
  saturatedFat: number
}

export function calculateDailyValues(profile: ProfileState): DailyValues {
  let energy = 2000
  
  // Basic BMR estimation if data exists (Simplified)
  if (profile.weightKg && profile.age) {
    // Mifflin-St Jeor Equation approx
    const baseBMR = profile.sex === 'male' 
      ? (10 * profile.weightKg) + 625 - (5 * profile.age) + 5
      : (10 * profile.weightKg) + 625 - (5 * profile.age) - 161
    
    const multipliers = {
      sedentary: 1.2,
      moderate: 1.55,
      active: 1.725
    }
    
    energy = baseBMR * (multipliers[profile.activityLevel || 'moderate'])
  }

  // Adjust for goals
  if (profile.goals.includes('weight_loss')) energy -= 500
  if (profile.goals.includes('muscle_gain')) energy += 300

  // Derived macros
  return {
    energyKcal: Math.round(energy),
    sugar: profile.goals.includes('low_sugar') ? 25 : Math.round((energy * 0.1) / 4), 
    salt: profile.goals.includes('low_sodium') ? 4 : 6,
    protein: profile.goals.includes('muscle_gain') ? Math.round((energy * 0.3) / 4) : Math.round((energy * 0.15) / 4),
    fiber: 28,
    fat: Math.round((energy * 0.3) / 9),
    saturatedFat: Math.round((energy * 0.1) / 9),
  }
}

export function parseServingQuantity(servingSize?: string): number | null {
  if (!servingSize) return null
  
  const match = servingSize.match(/(\d+(\.\d+)?)\s*(g|ml|cl)/i)
  if (match) {
    let val = parseFloat(match[1])
    const unit = match[3].toLowerCase()
    if (unit === 'cl') val *= 10
    return val
  }
  
  return null
}
