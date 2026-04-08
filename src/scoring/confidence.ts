import type { Product, ConfidenceTier } from '../types/product'

export interface ConfidenceResult {
  tier: ConfidenceTier
  label: string
  explanation: string
}

export function evaluateConfidence(product: Product): ConfidenceResult {
  if (product.category === 'food') {
    return evaluateFoodConfidence(product)
  } else if (product.category === 'cosmetic') {
    return evaluateCosmeticConfidence(product)
  }

  return {
    tier: 'hidden',
    label: 'Unknown',
    explanation: 'Unknown product category.',
  }
}

function evaluateFoodConfidence(product: Product): ConfidenceResult {
  const nutrition = product.nutritionPer100g

  // Check how many nutrition fields we have
  const filledNutritionFields = nutrition
    ? Object.values(nutrition).filter(v => v !== undefined).length
    : 0

  const hasIngredients = product.ingredients.length > 0
  const hasImage = !!product.imageUrl
  const hasName = !!product.name
  const hasBrand = !!product.brand

  // Score confidence
  let score = 0
  score += hasName ? 1 : 0
  score += hasBrand ? 1 : 0
  score += hasImage ? 1 : 0
  score += filledNutritionFields >= 6 ? 2 : filledNutritionFields >= 3 ? 1 : 0
  score += hasIngredients ? 1 : 0

  // Determine tier
  let tier: ConfidenceTier
  let label: string
  let explanation: string

  if (score >= 7) {
    tier = 'high'
    label = 'High confidence'
    explanation = 'Complete nutrition data and ingredients available.'
  } else if (score >= 4) {
    tier = 'medium'
    label = 'Medium confidence'
    explanation = 'Some nutrition or ingredient data may be missing.'
  } else if (score >= 2) {
    tier = 'low'
    label = 'Low confidence'
    explanation = 'Limited data available. Verify with the product label.'
  } else {
    tier = 'hidden'
    label = 'Insufficient data'
    explanation = 'Not enough information to score this product.'
  }

  return { tier, label, explanation }
}

function evaluateCosmeticConfidence(product: Product): ConfidenceResult {
  const hasIngredients = product.ingredients.length > 0 || (product.cosmeticIngredients && product.cosmeticIngredients.length > 0)
  const hasImage = !!product.imageUrl
  const hasName = !!product.name
  const hasBrand = !!product.brand

  let score = 0
  score += hasName ? 1 : 0
  score += hasBrand ? 1 : 0
  score += hasImage ? 1 : 0
  score += hasIngredients ? 2 : 0

  let tier: ConfidenceTier
  let label: string
  let explanation: string

  if (score >= 6) {
    tier = 'high'
    label = 'High confidence'
    explanation = 'Complete ingredient information available.'
  } else if (score >= 4) {
    tier = 'medium'
    label = 'Medium confidence'
    explanation = 'Most ingredient information available.'
  } else if (score >= 2) {
    tier = 'low'
    label = 'Low confidence'
    explanation = 'Limited ingredient data. Check the product label.'
  } else {
    tier = 'hidden'
    label = 'Insufficient data'
    explanation = 'Not enough information to assess this product.'
  }

  return { tier, label, explanation }
}