import type { Product, NutritionData, ProductCategory } from '../types/product'

/**
 * Robust OCR parsing that handles multi-line ingredient lists and improves
 * nutrition extraction by normalizing text first.
 */
export function parseNutritionFromOCR(text: string, barcode: string): Partial<Product> {
  // 1. Normalize text: collapse whitespace and remove newlines for easier regex matching
  const normalized = text.replace(/\s+/g, ' ').trim()
  
  const nutrition: NutritionData = {}
  let ingredients: string[] = []
  let category: ProductCategory = 'food'

  // 2. Identify Category (Cosmetic vs Food)
  const cosmeticKeywords = ['aqua', 'glycerin', 'stearyl', 'cetyl', 'alcohol', 'parfum', 'inci', 'ingredients (inci)', 'skincare', 'dermatologically']
  const cosmeticHits = cosmeticKeywords.filter(k => normalized.toLowerCase().includes(k)).length
  if (cosmeticHits >= 2 || normalized.toLowerCase().includes('inci')) {
    category = 'cosmetic'
  }

  // 3. Extract Ingredients Block
  // Look for "Ingredients" followed by anything until a common "end of section" marker or the end of string
  const ingredientsRegex = /(?:ingredients|ingrédients|inci|composition)[\s:]*(.*?)(?:nutrition|valeurs nutritionnelles|distributed by|manufactured by|made in|skin cream|moisturiser|directions|usage|caution|produced by|mfd by|mktd by|caution|$)/i
  const ingredientsMatch = normalized.match(ingredientsRegex)
  
  if (ingredientsMatch && ingredientsMatch[1]) {
    // Split by comma but ignore commas inside parentheses (e.g. "Acid (Citric Acid, Malic Acid)")
    const rawList = ingredientsMatch[1]
    ingredients = splitIngredients(rawList)
  }

  // 4. Extract Nutrition (using normalized text)
  const patterns = {
    energyKcal: /(?:energy|calories|kcal|valeur énergétique)[\s:]*(\d+)/i,
    fat: /(?:total fat|fat|lipides|matières grasses)[\s:]*(\d+(?:[\.,]\d+)?)/i,
    saturatedFat: /(?:saturated fat|saturated|dont saturés|acides gras saturés)[\s:]*(\d+(?:[\.,]\d+)?)/i,
    carbs: /(?:carbohydrates|total carb|glucides)[\s:]*(\d+(?:[\.,]\d+)?)/i,
    sugar: /(?:sugars|sugar|dont sucres|sucres)[\s:]*(\d+(?:[\.,]\d+)?)/i,
    fiber: /(?:fiber|dietary fiber|fibres|fibres alimentaires)[\s:]*(\d+(?:[\.,]\d+)?)/i,
    protein: /(?:protein|protéines)[\s:]*(\d+(?:[\.,]\d+)?)/i,
    salt: /(?:salt|sodium|sel)[\s:]*(\d+(?:[\.,]\d+)?)/i,
  }

  Object.entries(patterns).forEach(([key, regex]) => {
    const match = normalized.match(regex)
    if (match) {
      const val = parseFloat(match[1].replace(',', '.'))
      if (!isNaN(val)) {
        (nutrition as any)[key] = val
      }
    }
  })

  // 5. Clean up ingredients (remove common OCR artifacts like bullets or trailing punctuation)
  ingredients = ingredients
    .map(i => i.replace(/^[\s•\-\.\*]+|[\s\.\*]+$/g, '').trim())
    .filter(i => i.length > 2 && i.length < 50) // Filter out noise

  return {
    barcode,
    name: 'Provisional Product',
    brand: 'OCR Capture',
    category,
    nutritionPer100g: Object.keys(nutrition).length > 0 ? nutrition : undefined,
    ingredients: ingredients.length > 0 ? ingredients : [],
    additives: [],
    dataSource: 'community',
    dataQuality: (ingredients.length > 0 || Object.keys(nutrition).length > 3) ? 'complete' : 'partial',
  }
}

/**
 * Splits ingredient strings by commas while respecting parentheses.
 */
function splitIngredients(input: string): string[] {
  const result: string[] = []
  let current = ''
  let depth = 0

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    if (char === '(' || char === '[' || char === '{') depth++
    if (char === ')' || char === ']' || char === '}') depth--

    if (char === ',' && depth === 0) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  if (current.trim()) {
    result.push(current.trim())
  }

  return result
}
