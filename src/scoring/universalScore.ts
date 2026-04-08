import type { Product, Score } from '../types/product'

// Hazard database for common cosmetic ingredients
const INGREDIENT_HAZARDS: Record<string, { hazard: 'low' | 'medium' | 'high'; concern: string }> = {
  // Preservatives
  'methylisothiazolinone': { hazard: 'high', concern: 'Possible allergen and skin sensitizer' },
  'methylchloroisothiazolinone': { hazard: 'high', concern: 'Known skin sensitizer' },
  'imidazolidinyl urea': { hazard: 'medium', concern: 'May release formaldehyde' },
  'dmdm hydantoin': { hazard: 'medium', concern: 'Formaldehyde releaser' },
  'parabens': { hazard: 'medium', concern: 'Potential endocrine disruptor, though safety debated' },

  // Fragrances
  'fragrance': { hazard: 'medium', concern: 'Potential allergen; specific ingredients unlisted' },
  'parfum': { hazard: 'medium', concern: 'Potential allergen; specific ingredients unlisted' },
  'linalool': { hazard: 'low', concern: 'Fragrance component; allergenic in some individuals' },
  'limonene': { hazard: 'low', concern: 'Fragrance component; can oxidize to allergenic compounds' },

  // Surfactants/Detergents
  'sodium lauryl sulfate': { hazard: 'medium', concern: 'Can be harsh; may cause irritation' },
  'sodium laureth sulfate': { hazard: 'low', concern: 'Milder than SLS but still stripping' },

  // Dyes
  'fd&c blue no. 1': { hazard: 'low', concern: 'FDA-approved colorant; rare sensitivity' },
  'fd&c red no. 40': { hazard: 'low', concern: 'FDA-approved colorant; may trigger hyperactivity in sensitive individuals' },

  // Plasticizers
  'diethyl phthalate': { hazard: 'medium', concern: 'Potential endocrine disruptor' },
  'bisphenol a': { hazard: 'high', concern: 'Endocrine disruptor; linked to developmental issues' },

  // UV filters
  'oxybenzone': { hazard: 'medium', concern: 'Potential allergen and endocrine disruptor' },
  'avobenzone': { hazard: 'low', concern: 'Generally safe; can degrade in sunlight' },

  // Silicones
  'dimethicone': { hazard: 'low', concern: 'Generally safe; may trap bacteria in some cases' },

  // Alcohol
  'ethanol': { hazard: 'low', concern: 'Can be drying; generally safe in small amounts' },
  'isopropyl alcohol': { hazard: 'medium', concern: 'More drying than ethanol' },
}

// Exposure level by product type
const PRODUCT_TYPE_EXPOSURE: Record<string, 'low' | 'medium' | 'high'> = {
  // Rinse-off (low exposure)
  'shampoo': 'low',
  'body wash': 'low',
  'facial cleanser': 'low',
  'hair conditioner': 'low',
  'shower gel': 'low',

  // Leave-on (medium-high exposure)
  'moisturizer': 'medium',
  'sunscreen': 'medium',
  'foundation': 'medium',
  'concealer': 'medium',
  'lip balm': 'high',
  'deodorant': 'high',
  'antiperspirant': 'high',
  'serum': 'high',
  'eye cream': 'high',
  'mask': 'medium',
  'toner': 'low',
}

// Allergen flags for strict avoidance
const ALLERGEN_INGREDIENTS = new Set([
  'methylisothiazolinone',
  'methylchloroisothiazolinone',
  'fragrance',
  'parfum',
  'essential oils',
  'tree nuts',
  'peanuts',
  'sesame',
  'nickel',
  'formaldehyde',
  'latex',
])

export function computeUniversalScore(product: Product): Score {
  if (product.category === 'food') {
    return computeFoodScore(product)
  } else if (product.category === 'cosmetic') {
    return computeCosmeticScore(product)
  }

  return {
    value: null,
    tier: 'hidden',
    reasons: [],
    explanation: 'Unknown product category.',
  }
}

function computeFoodScore(product: Product): Score {
  const nutrition = product.nutritionPer100g

  // Confidence check
  if (!nutrition) {
    return {
      value: null,
      tier: 'hidden',
      reasons: [],
      explanation: 'Nutrition information is missing. Unable to score this product.',
    }
  }

  let score = 60 // Improved baseline
  const reasons: string[] = []

  // Sugar penalty (Stricter for beverages/processed foods)
  if (nutrition.sugar !== undefined) {
    if (nutrition.sugar > 20) {
      score -= 30
      reasons.push('High in added sugars')
    } else if (nutrition.sugar > 8) {
      score -= 15
      reasons.push('Moderate sugar content')
    } else if (nutrition.sugar < 4) {
      score += 5
      reasons.push('Low sugar')
    }
  }

  // Fiber reward
  if (nutrition.fiber !== undefined) {
    if (nutrition.fiber > 6) {
      score += 15
      reasons.push('High in fiber')
    } else if (nutrition.fiber > 2) {
      score += 8
      reasons.push('Good fiber content')
    }
  }

  // Protein reward
  if (nutrition.protein !== undefined) {
    if (nutrition.protein > 15) {
      score += 15
      reasons.push('High protein')
    } else if (nutrition.protein > 5) {
      score += 8
      reasons.push('Good protein source')
    }
  }

  // Empty Calorie Detection (High sugar/fat but no fiber/protein)
  const isSugary = (nutrition.sugar ?? 0) > 10
  const hasNoFiber = (nutrition.fiber ?? 0) < 1
  const hasNoProtein = (nutrition.protein ?? 0) < 1
  
  if (isSugary && hasNoFiber && hasNoProtein) {
    score -= 15
    reasons.push('Empty calories (lacks nutrients)')
  }

  // Saturated fat penalty
  if (nutrition.saturatedFat !== undefined) {
    if (nutrition.saturatedFat > 10) {
      score -= 20
      reasons.push('High in saturated fat')
    } else if (nutrition.saturatedFat > 5) {
      score -= 10
      reasons.push('Moderate saturated fat')
    }
  }

  // Salt/sodium penalty
  if (nutrition.salt !== undefined) {
    if (nutrition.salt > 1.5) {
      score -= 15
      reasons.push('High in sodium')
    } else if (nutrition.salt > 0.8) {
      score -= 8
      reasons.push('Moderate sodium')
    }
  }

  // Additives check
  if (product.additives.length > 4) {
    score -= 10
    reasons.push(`Multiple industrial additives`)
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  return {
    value: score,
    tier: score >= 75 ? 'high' : score >= 45 ? 'medium' : 'low',
    reasons: reasons.slice(0, 3),
    explanation: `Score based on nutritional density and composition: ${reasons.join(', ')}.`,
  }
}

function computeCosmeticScore(product: Product): Score {
  const ingredients = product.cosmeticIngredients || []

  // Confidence check
  if (ingredients.length === 0) {
    return {
      value: null,
      tier: product.dataQuality === 'minimal' ? 'hidden' : 'low',
      reasons: [],
      explanation:
        product.dataQuality === 'minimal'
          ? 'Ingredient list is missing. Unable to assess this product.'
          : 'Limited ingredient information. Assessment may be incomplete.',
    }
  }

  let score = 75 // Cosmetics start higher (fewer objective harms than food)
  const reasons: string[] = []
  const hazardFlags: string[] = []

  // Get exposure level from product type
  const exposureLevel = product.productType
    ? PRODUCT_TYPE_EXPOSURE[product.productType.toLowerCase()] || 'medium'
    : 'medium'

  // Analyze each ingredient
  let highHazardCount = 0
  let mediumHazardCount = 0

  for (const ingredient of ingredients) {
    const name = ingredient.name.toLowerCase()
    const hazardData = INGREDIENT_HAZARDS[name]

    if (hazardData) {
      const { hazard, concern } = hazardData
      const actualExposure = ingredient.exposureLevel || exposureLevel

      // Only penalize if exposure is significant
      if (actualExposure === 'high' && (hazard === 'high' || hazard === 'medium')) {
        score -= hazard === 'high' ? 15 : 8
        hazardFlags.push(`${ingredient.name}: ${concern} (high exposure)`)
        if (hazard === 'high') highHazardCount++
        else mediumHazardCount++
      } else if (actualExposure === 'medium' && hazard === 'high') {
        score -= 10
        hazardFlags.push(`${ingredient.name}: ${concern}`)
        highHazardCount++
      } else if (hazard === 'medium') {
        mediumHazardCount++
      }

      // Allergen flag
      if (ALLERGEN_INGREDIENTS.has(name)) {
        reasons.push(`Contains potential allergen: ${ingredient.name}`)
      }
    }
  }

  // Reward for certifications
  if (product.hypoallergenic) {
    score += 10
    reasons.push('Hypoallergenic formulation')
  }

  if (product.dermatologistTested) {
    score += 5
    reasons.push('Dermatologist tested')
  }

  // Add hazard summary
  if (highHazardCount > 0) {
    reasons.push(`${highHazardCount} high-concern ingredient(s)`)
  } else if (mediumHazardCount > 2) {
    reasons.push('Multiple moderate-concern ingredients')
  } else if (mediumHazardCount > 0) {
    reasons.push('Some moderate-concern ingredients')
  } else if (ingredients.length > 0 && hazardFlags.length === 0) {
    reasons.push('Ingredient profile appears favorable')
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score))

  return {
    value: score,
    tier: score >= 75 ? 'high' : score >= 50 ? 'medium' : 'low',
    reasons: reasons.slice(0, 3),
    explanation:
      hazardFlags.length > 0
        ? `Concerns: ${hazardFlags.slice(0, 2).join('; ')}. Assessment based on ingredient analysis.`
        : 'Ingredient profile appears generally safe. Based on hazard and exposure analysis.',
  }
}