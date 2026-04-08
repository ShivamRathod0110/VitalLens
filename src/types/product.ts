export type ProductCategory = 'food' | 'cosmetic'
export type DataSource = 'off' | 'override' | 'community' | 'manual'
export type DataQuality = 'complete' | 'partial' | 'minimal'

export type NutritionData = {
  energyKcal?: number
  fat?: number
  saturatedFat?: number
  carbs?: number
  sugar?: number
  fiber?: number
  protein?: number
  salt?: number
}

export type CosmeticIngredient = {
  name: string
  function?: string // e.g., 'preservative', 'fragrance', 'emulsifier'
  hazardLevel?: 'low' | 'medium' | 'high' // based on ingredient hazard database
  exposureLevel?: 'low' | 'medium' | 'high' // leave-on vs rinse-off, concentration
  allergen?: boolean // known fragrance allergen or sensitizer
}

export type Product = {
  barcode: string
  name: string
  brand: string
  category: ProductCategory
  imageUrl?: string
  servingSize?: string // e.g. "1 can (330ml)"
  servingQuantity?: number // numeric value in g or ml
  nutritionPer100g?: NutritionData
  ingredients: string[]
  additives: string[]
  cosmeticIngredients?: CosmeticIngredient[] // For cosmetics
  productType?: string // e.g., 'facial cleanser', 'shampoo', 'moisturizer'
  dermatologistTested?: boolean
  hypoallergenic?: boolean
  dataSource: DataSource
  dataQuality: DataQuality
}

export type ConfidenceTier = 'high' | 'medium' | 'low' | 'hidden'

export type Score = {
  value: number | null
  tier: ConfidenceTier
  reasons: string[]
  explanation: string
}

export type PersonalScore = Score & {
  goalAdjustment?: number
  allergyWarnings: string[]
}