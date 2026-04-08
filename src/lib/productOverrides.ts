import type { Product } from '../types/product'

// Test products for development
const TEST_PRODUCTS: Record<string, Product> = {
  '5449000050127': {
    barcode: '5449000050127',
    name: 'Coca-Cola Original Taste',
    brand: 'Coca-Cola',
    category: 'food',
    imageUrl: 'https://via.placeholder.com/300x400?text=Coca-Cola',
    nutritionPer100g: {
      energyKcal: 42,
      fat: 0,
      saturatedFat: 0,
      carbs: 10.6,
      sugar: 10.6,
      fiber: 0,
      protein: 0,
      salt: 0.01,
    },
    ingredients: ['carbonated water', 'high fructose corn syrup', 'caramel color', 'phosphoric acid', 'natural flavors', 'caffeine'],
    additives: ['E150d', 'E338'],
    dataSource: 'off',
    dataQuality: 'complete',
  },

  '8717644666341': {
    barcode: '8717644666341',
    name: 'Dove Deep Moisture Body Wash',
    brand: 'Dove',
    category: 'cosmetic',
    imageUrl: 'https://via.placeholder.com/300x400?text=Dove',
    ingredients: ['water', 'sodium laureth sulfate', 'cocamidopropyl betaine', 'sodium chloride', 'glycerin', 'fragrance'],
    additives: [],
    cosmeticIngredients: [
      { name: 'water', function: 'solvent' },
      { name: 'sodium laureth sulfate', function: 'surfactant/detergent', hazardLevel: 'low', exposureLevel: 'low' },
      { name: 'glycerin', function: 'humectant', hazardLevel: 'low', exposureLevel: 'medium' },
      { name: 'fragrance', function: 'fragrance', hazardLevel: 'medium', exposureLevel: 'medium', allergen: true },
    ],
    dataSource: 'off',
    dataQuality: 'partial',
    hypoallergenic: true,
  },

  '3574660166135': {
    barcode: '3574660166135',
    name: 'La Roche-Posay Anthelios Ultra Light Fluid SPF 60',
    brand: 'La Roche-Posay',
    category: 'cosmetic',
    imageUrl: 'https://via.placeholder.com/300x400?text=LRP+Sunscreen',
    ingredients: ['water', 'homosalate', 'octocrylene', 'avobenzone', 'glycerin', 'fragrance'],
    additives: [],
    cosmeticIngredients: [
      { name: 'homosalate', function: 'UV filter', hazardLevel: 'medium', exposureLevel: 'high' },
      { name: 'avobenzone', function: 'UV filter', hazardLevel: 'low', exposureLevel: 'high' },
      { name: 'glycerin', function: 'humectant', hazardLevel: 'low', exposureLevel: 'medium' },
      { name: 'fragrance', function: 'fragrance', hazardLevel: 'medium', exposureLevel: 'medium', allergen: true },
    ],
    dataSource: 'off',
    dataQuality: 'partial',
    dermatologistTested: true,
  },

  '4006381333912': {
    barcode: '4006381333912',
    name: 'Nivea Creme',
    brand: 'Nivea',
    category: 'cosmetic',
    imageUrl: 'https://via.placeholder.com/300x400?text=Nivea',
    ingredients: ['water', 'petrolatum', 'glycerin', 'paraffinum liquidum', 'dimethicone', 'lanolin alcohol'],
    additives: [],
    cosmeticIngredients: [
      { name: 'petrolatum', function: 'occlusive', hazardLevel: 'low', exposureLevel: 'high' },
      { name: 'glycerin', function: 'humectant', hazardLevel: 'low', exposureLevel: 'high' },
      { name: 'dimethicone', function: 'emollient/silicone', hazardLevel: 'low', exposureLevel: 'high' },
    ],
    dataSource: 'off',
    dataQuality: 'partial',
  },
}

export async function getProductOverride(barcode: string): Promise<Product | null> {
  return TEST_PRODUCTS[barcode] || null
}