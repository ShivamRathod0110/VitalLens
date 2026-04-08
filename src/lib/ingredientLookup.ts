// src/lib/ingredientLookup.ts
// The actual DB is lazy-loaded on first use — not included in the main bundle

import type { Ingredient } from '../data/ingredientTypes'

type ProductType = 'food' | 'cosmetic'

// Module-level cache so the DB only loads once per session
let dbCache: Map<string, Ingredient> | null = null
let aliasCache: Map<string, string> | null = null  // alias -> canonical id

async function loadDB(): Promise<Map<string, Ingredient>> {
  if (dbCache) return dbCache

  // Dynamic import — only fetches the file when first ingredient is tapped
  const { INGREDIENT_DB } = await import('../data/ingredientDB')

  dbCache = new Map()
  aliasCache = new Map()

  for (const ingredient of INGREDIENT_DB) {
    dbCache.set(ingredient.id, ingredient)
    // Index by name (lowercase)
    aliasCache.set(ingredient.name.toLowerCase(), ingredient.id)
    // Index by every alias
    for (const alias of ingredient.aliases) {
      aliasCache.set(alias.toLowerCase(), ingredient.id)
    }
  }

  return dbCache
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .trim()
    // Remove parenthetical notes e.g. "Citric Acid (E330)"
    .replace(/\s*\(.*?\)/g, '')
    // Remove asterisks (organic markers)
    .replace(/\*/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
}

export async function lookupIngredient(
  rawName: string,
  _productType?: ProductType
): Promise<Ingredient | null> {
  const db = await loadDB()
  if (!aliasCache) return null

  const key = normalize(rawName)

  // Direct alias lookup
  const id = aliasCache.get(key)
  if (id) {
    const ingredient = { ...(db.get(id) ?? null) } as Ingredient
    
    // Inject nutritional benefits for common ingredients if missing
    if (ingredient && !ingredient.nutritionalBenefit) {
      const lowerName = ingredient.name.toLowerCase()
      if (lowerName === 'sugar' || lowerName === 'sucrose' || lowerName === 'high fructose corn syrup') {
        ingredient.nutritionalBenefit = 'empty'
      } else if (lowerName.includes('fiber') || lowerName.includes('fibre') || lowerName.includes('whole grain')) {
        ingredient.nutritionalBenefit = 'high'
      } else if (lowerName === 'salt' || lowerName === 'sodium chloride') {
        ingredient.nutritionalBenefit = 'empty'
      } else if (lowerName.includes('vitamin') || lowerName.includes('mineral')) {
        ingredient.nutritionalBenefit = 'high'
      } else if (lowerName.includes('water')) {
        ingredient.nutritionalBenefit = 'neutral'
      } else if (lowerName.includes('flour') && !lowerName.includes('whole')) {
        ingredient.nutritionalBenefit = 'low'
      }
    }
    
    return ingredient
  }

  // Fuzzy fallback: try matching after stripping common suffixes
  // e.g. "sodium lauryl sulfate" vs "sodium laureth sulfate"
  for (const [alias, ingId] of aliasCache.entries()) {
    if (alias.includes(key) || key.includes(alias)) {
      if (alias.length > 4) {  // avoid matching on very short strings
        return db.get(ingId) ?? null
      }
    }
  }

  return null
}

export async function lookupMany(
  rawNames: string[],
  _productType?: ProductType
): Promise<Map<string, Ingredient | null>> {
  // Load DB once then batch-lookup
  await loadDB()
  const results = new Map<string, Ingredient | null>()
  for (const name of rawNames) {
    results.set(name, await lookupIngredient(name, _productType))
  }
  return results
}

// Returns just the tagline for compact display (no full load needed)
export async function getTagline(rawName: string): Promise<string | null> {
  const ingredient = await lookupIngredient(rawName)
  return ingredient?.tagline ?? null
}
