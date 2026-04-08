import type { Product } from '../types/product'
import { getProductOverride } from '../lib/productOverrides'


const BASE = 'https://world.openfoodfacts.org/api/v0/product'
const USER_AGENT = 'VitalLens/1.0 (vitallens@example.com)'



export async function fetchProductByBarcode(barcode: string): Promise<Product | null> {
  // Check test overrides first
  const override = await getProductOverride(barcode)
  if (override) return override

  try {
    const res = await fetch(`${BASE}/${barcode}.json`, {
      headers: { 'User-Agent': USER_AGENT },
    })

    if (res.status === 404) return null
    if (!res.ok) throw new Error(`API error: ${res.status}`)

    const json = await res.json()
    if (json.status === 0 || !json.product) return null

    const p = json.product

    // Detect if product is cosmetic or food
    const categoriesString = ((p.categories || '') + (p.categories_tags || []).join(' ')).toLowerCase()
    const isCosmetic =
      categoriesString.includes('cosmetic') ||
      categoriesString.includes('beauty') ||
      categoriesString.includes('personal care') ||
      categoriesString.includes('shampoo') ||
      categoriesString.includes('conditioner') ||
      categoriesString.includes('skincare') ||
      categoriesString.includes('deodorant') ||
      categoriesString.includes('makeup') ||
      categoriesString.includes('fragrance') ||
      categoriesString.includes('perfume') ||
      categoriesString.includes('toothpaste')

    const barcodeTrimmed = String(barcode).trim()

    // Build base product
    const product: Product = {
      barcode: barcodeTrimmed,
      name: p.product_name?.trim() || 'Unknown product',
      brand: p.brands?.trim() || 'Unknown brand',
      category: isCosmetic ? 'cosmetic' : 'food',
      imageUrl: p.image_url || p.image_front_url || null,
      servingSize: p.serving_size || null,
      servingQuantity: p.serving_quantity || null,
      ingredients: [],
      additives: [],
      dataSource: 'off',
      dataQuality: 'minimal',
    }

    // Food-specific: nutrition data
    if (!isCosmetic) {
      const n = p.nutriments ?? {}

      product.nutritionPer100g = {
        energyKcal: n['energy-kcal_100g'],
        fat: n['fat_100g'],
        saturatedFat: n['saturated-fat_100g'],
        carbs: n['carbohydrates_100g'],
        sugar: n['sugars_100g'],
        fiber: n['fiber_100g'],
        protein: n['proteins_100g'],
        salt: n['salt_100g'],
      }

      // Calculate data quality for food
      const filledFields = Object.values(product.nutritionPer100g).filter(v => v !== undefined).length
      product.dataQuality = filledFields >= 6 ? 'complete' : filledFields >= 3 ? 'partial' : 'minimal'
    } else {
      // Cosmetics: calculate quality based on ingredient availability
      const hasIngredients = p.ingredients && p.ingredients.length > 0
      const hasCategoriesInfo = !!p.categories
      const hasImage = !!p.image_url || !!p.image_front_url

      const qualityScore = (hasIngredients ? 1 : 0) + (hasCategoriesInfo ? 1 : 0) + (hasImage ? 1 : 0)
      product.dataQuality = qualityScore >= 2 ? 'partial' : 'minimal'
    }

    // Ingredients (shared across both)
    if (p.ingredients && Array.isArray(p.ingredients)) {
      product.ingredients = p.ingredients
        .map((ing: any) => {
          if (typeof ing === 'string') return ing
          return ing.text || String(ing)
        })
        .filter((text: string) => text && text.length > 0)
    } else if (typeof p.ingredients_text === 'string') {
      product.ingredients = p.ingredients_text
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
    }

    // Additives (food-specific, but might exist for cosmetics)
    if (p.additives_tags && Array.isArray(p.additives_tags)) {
      product.additives = p.additives_tags
        .map((tag: string) => tag.replace('en:', '').trim().toUpperCase())
        .filter((tag: string) => tag.length > 0)
    }

    // Cosmetic-specific: build CosmeticIngredient objects
    if (isCosmetic && product.ingredients.length > 0) {
      product.cosmeticIngredients = product.ingredients.map(name => ({
        name,
      }))
    }

    return product
  } catch (error) {
    console.error('OFF fetch error:', error)
    return null
  }
}

export async function searchProducts(query: string, page: number = 1): Promise<Product[]> {
  const pageSize = 20

  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page=${page}&page_size=${pageSize}`, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!res.ok) return []

  const json = await res.json()
  if (!json.products || !Array.isArray(json.products)) return []

  return json.products
    .map((p: any) => {
      const categoriesString = ((p.categories || '') + (p.categories_tags || []).join(' ')).toLowerCase()
      const isCosmetic =
        categoriesString.includes('cosmetic') ||
        categoriesString.includes('beauty') ||
        categoriesString.includes('personal care') ||
        categoriesString.includes('shampoo')

      const product: Product = {
        barcode: String(p.code || '').trim(),
        name: p.product_name?.trim() || 'Unknown',
        brand: p.brands?.trim() || 'Unknown',
        category: isCosmetic ? 'cosmetic' : 'food',
        imageUrl: p.image_front_url || null,
        ingredients: typeof p.ingredients_text === 'string' ? [p.ingredients_text] : [],
        additives: Array.isArray(p.additives_tags) ? p.additives_tags.map((t: string) => t.replace('en:', '')) : [],
        dataSource: 'off',
        dataQuality: 'partial',
      }

      if (!isCosmetic && p.nutriments) {
        product.nutritionPer100g = {
          energyKcal: p.nutriments['energy-kcal_100g'],
          fat: p.nutriments['fat_100g'],
          saturatedFat: p.nutriments['saturated-fat_100g'],
          carbs: p.nutriments['carbohydrates_100g'],
          sugar: p.nutriments['sugars_100g'],
          fiber: p.nutriments['fiber_100g'],
          protein: p.nutriments['proteins_100g'],
          salt: p.nutriments['salt_100g'],
        }
      }

      if (isCosmetic && product.ingredients.length > 0) {
        product.cosmeticIngredients = product.ingredients.map(name => ({ name }))
      }

      return product
    })
    .filter((p: Product) => p.barcode && p.name && p.name.length > 0)
}