import type { Product, PersonalScore } from '../types/product'

export interface UserProfile {
  goals: ('muscle_gain' | 'weight_loss' | 'low_sugar' | 'low_sodium' | 'general_health')[]
  allergies: string[]
  skinType?: 'sensitive' | 'normal' | 'oily' | 'dry' | 'combination'
  fragranceFree?: boolean
  essentialOilFree?: boolean
}

export function computePersonalScore(product: Product, profile: UserProfile): PersonalScore | null {
  if (profile.goals.length === 0 && profile.allergies.length === 0 && !profile.skinType) {
    // Profile is empty, return null so UI prompts user to set profile
    return null
  }

  if (product.category === 'food') {
    return computeFoodPersonalScore(product, profile)
  } else if (product.category === 'cosmetic') {
    return computeCosmeticPersonalScore(product, profile)
  }

  return null
}

function computeFoodPersonalScore(product: Product, profile: UserProfile): PersonalScore {
  const nutrition = product.nutritionPer100g

  if (!nutrition) {
    return {
      value: null,
      tier: 'hidden',
      reasons: [],
      explanation: 'Nutrition information missing for personal assessment.',
      goalAdjustment: 0,
      allergyWarnings: [],
    }
  }

  let score = 50
  const reasons: string[] = []
  const allergyWarnings: string[] = []

  // Goal-based adjustments
  let goalAdjustment = 0

  profile.goals.forEach(goal => {
    let currentGoalAdjustment = 0
    if (goal === 'muscle_gain') {
      // Reward protein heavily
      if (nutrition.protein && nutrition.protein > 20) {
        currentGoalAdjustment += 20
        reasons.push('Excellent protein for muscle gain')
      } else if (nutrition.protein && nutrition.protein > 10) {
        currentGoalAdjustment += 10
        reasons.push('Good protein source')
      } else if (nutrition.protein && nutrition.protein < 5) {
        currentGoalAdjustment -= 15
        reasons.push('Low protein for muscle goal')
      }

      // Penalize low calories
      if (nutrition.energyKcal && nutrition.energyKcal < 100) {
        currentGoalAdjustment -= 10
        reasons.push('Low energy for muscle build')
      }
    } else if (goal === 'weight_loss') {
      // Penalize high calories and sugar
      if (nutrition.energyKcal && nutrition.energyKcal > 300) {
        currentGoalAdjustment -= 20
        reasons.push('High calorie for weight loss')
      }

      if (nutrition.sugar && nutrition.sugar > 12) {
        currentGoalAdjustment -= 15
        reasons.push('High sugar for weight loss')
      }

      // Reward fiber and protein (satiety)
      if (nutrition.fiber && nutrition.fiber > 4) {
        currentGoalAdjustment += 10
        reasons.push('High fiber aids weight loss')
      }
    } else if (goal === 'low_sugar') {
      if (nutrition.sugar && (nutrition.sugar < 4)) {
        currentGoalAdjustment += 15
        reasons.push('Ideal low sugar')
      } else if (nutrition.sugar && (nutrition.sugar > 10)) {
        currentGoalAdjustment -= 20
        reasons.push('Too much sugar for your goal')
      }
    } else if (goal === 'low_sodium') {
      if (nutrition.salt && (nutrition.salt < 0.3)) {
        currentGoalAdjustment += 15
        reasons.push('Ideal low sodium')
      } else if (nutrition.salt && (nutrition.salt > 1.2)) {
        currentGoalAdjustment -= 20
        reasons.push('Too much salt for your goal')
      }
    }

    // Apply dampened adjustment for multiple goals
    // First goal is 100% impact, subsequent goals are 50% impact to prevent overflow
    goalAdjustment += (goalAdjustment === 0) ? currentGoalAdjustment : (currentGoalAdjustment * 0.5)
  })

  // Cap goal adjustments
  goalAdjustment = Math.max(-60, Math.min(40, goalAdjustment))

  // Allergy checks
  for (const allergy of profile.allergies) {
    const allergyLower = allergy.toLowerCase()
    const ingredientsLower = product.ingredients.map(i => i.toLowerCase())

    if (ingredientsLower.some(ing => ing.includes(allergyLower))) {
      allergyWarnings.push(`⚠️ Contains or may contain: ${allergy}`)
      goalAdjustment -= 80 // Decisive penalty for allergen match
    }
  }

  score += goalAdjustment
  score = Math.max(0, Math.min(100, score))

  const goalText = profile.goals.length > 0 ? profile.goals.map(g => g.replace('_', ' ')).join(', ') : 'your profile'

  return {
    value: score,
    tier: score >= 75 ? 'high' : score >= 45 ? 'medium' : 'low',
    reasons: reasons.slice(0, 3),
    explanation: `Personalized for ${goalText}. ${reasons.join(', ') || 'Matches your profile.'}`,
    goalAdjustment,
    allergyWarnings,
  }
}

function computeCosmeticPersonalScore(product: Product, profile: UserProfile): PersonalScore {
  const ingredients = product.cosmeticIngredients || []
  const allergyWarnings: string[] = []
  const reasons: string[] = []

  let score = 75
  let goalAdjustment = 0

  // Skin type compatibility
  if (profile.skinType === 'sensitive') {
    // Penalize harsh surfactants and fragrances
    const hasFragrance = ingredients.some(i => i.name.toLowerCase().includes('fragrance') || i.name.toLowerCase().includes('parfum'))
    const hasSurfactants = ingredients.some(i => i.name.toLowerCase().includes('sulfate'))

    if (hasFragrance) {
      goalAdjustment -= 20
      reasons.push('Contains fragrance (may irritate sensitive skin)')
    }

    if (hasSurfactants) {
      goalAdjustment -= 15
      reasons.push('Contains sulfate surfactant (may be harsh)')
    }

    if (product.hypoallergenic) {
      goalAdjustment += 15
      reasons.push('Hypoallergenic — good for sensitive skin')
    }
  } else if (profile.skinType === 'oily') {
    // Reward light, non-occlusive formulations
    const hasSilicones = ingredients.some(i => i.name.toLowerCase().includes('dimethicone') || i.name.toLowerCase().includes('silicone'))

    if (hasSilicones) {
      goalAdjustment += 10
      reasons.push('Silicone base is lightweight for oily skin')
    }
  } else if (profile.skinType === 'dry') {
    // Reward hydrating ingredients
    const hasHumectants = ingredients.some(
      i =>
        i.name.toLowerCase().includes('glycerin') ||
        i.name.toLowerCase().includes('hyaluronic') ||
        i.name.toLowerCase().includes('ceramide'),
    )

    if (hasHumectants) {
      goalAdjustment += 15
      reasons.push('Contains hydrating ingredients good for dry skin')
    }
  }

  // Fragrance-free preference
  if (profile.fragranceFree) {
    const hasFragrance = ingredients.some(i => i.name.toLowerCase().includes('fragrance') || i.name.toLowerCase().includes('parfum'))

    if (hasFragrance) {
      goalAdjustment -= 30
      reasons.push('Contains fragrance (you prefer fragrance-free)')
    } else {
      goalAdjustment += 10
      reasons.push('Fragrance-free — matches your preference')
    }
  }

  // Essential oil free preference
  if (profile.essentialOilFree) {
    const hasEssentialOils = ingredients.some(
      i =>
        i.name.toLowerCase().includes('essential oil') ||
        i.name.toLowerCase().includes('linalool') ||
        i.name.toLowerCase().includes('limonene') ||
        i.name.toLowerCase().includes('lavender oil'),
    )

    if (hasEssentialOils) {
      goalAdjustment -= 20
      reasons.push('Contains essential oils (you prefer to avoid)')
    }
  }

  // Allergy checks
  for (const allergy of profile.allergies) {
    const allergyLower = allergy.toLowerCase()
    const ingredientsLower = ingredients.map(i => i.name.toLowerCase())

    if (ingredientsLower.some(ing => ing.includes(allergyLower))) {
      allergyWarnings.push(`⚠️ Contains or may contain: ${allergy}`)
      goalAdjustment -= 50
    }
  }

  score += goalAdjustment
  score = Math.max(0, Math.min(100, score))

  return {
    value: score,
    tier: score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low',
    reasons: reasons.slice(0, 3),
    explanation: `Adjusted for your profile. ${reasons.join(', ') || 'Neutral fit.'}`,
    goalAdjustment,
    allergyWarnings,
  }
}