// src/data/ingredientTypes.ts

export type IngredientCategory =
  | 'preservative'
  | 'emulsifier'
  | 'antioxidant'
  | 'colorant'
  | 'flavoring'
  | 'sweetener'
  | 'thickener'
  | 'humectant'
  | 'surfactant'
  | 'exfoliant'
  | 'fragrance'
  | 'uv_filter'
  | 'active'        // Cosmetic actives like salicylic acid, retinol
  | 'nutrient'      // Vitamins, minerals
  | 'acid_regulator'
  | 'stabilizer'
  | 'solvent'
  | 'film_former'
  | 'chelating_agent'
  | 'other'

export type HazardLevel =
  | 'safe'          // Well-studied, no significant concerns
  | 'low'           // Minor concerns at high exposure
  | 'moderate'      // Some studies show concerns, debated
  | 'high'          // Strong evidence of harm at typical exposure
  | 'unknown'       // Insufficient data

export type EvidenceQuality =
  | 'strong'        // Multiple peer-reviewed studies, scientific consensus
  | 'mixed'         // Conflicting studies, ongoing debate
  | 'precautionary' // Limited data, precautionary concern
  | 'anecdotal'     // Mainly user reports, no solid studies

// Context-specific explanation when same ingredient
// serves different roles in food vs cosmetics
export interface IngredientContext {
  use: string             // What it does in this context
  whyUsed: string         // Why manufacturers add it
  typicalConcentration?: string  // e.g. "0.5–2% in rinse-off products"
  exposureConcern?: string       // Context-specific exposure note
}

export interface IngredientConcern {
  description: string     // Plain-language concern
  evidence: EvidenceQuality
  affectedGroups?: string[]  // e.g. ["sensitive skin", "pregnant women"]
  threshold?: string         // e.g. "only at >5% concentration"
}

export type NutritionalBenefit =
  | 'high'      // Superfoods, essential nutrients (Vitamins, Omega-3, Fiber)
  | 'moderate'  // Good building blocks (Whole grains, Healthy fats)
  | 'neutral'   // Standard components (Water, Starches)
  | 'low'       // Minimal value (Refined flours)
  | 'empty'     // No value, mainly energy/flavor (Sugar, Salt, some Additives)

export interface Ingredient {
  // Identity
  id: string                    // Unique slug e.g. "salicylic-acid"
  name: string                  // Display name e.g. "Salicylic Acid"
  aliases: string[]             // Alternative names / E-numbers / INCI variants

  // Classification
  categories: IngredientCategory[]
  hazardLevel: HazardLevel
  nutritionalBenefit?: NutritionalBenefit // New property
  isVegan?: boolean
  isCrueltyFree?: boolean

  // One-line tag shown automatically on product page
  // e.g. "Acne treatment · Exfoliant"
  tagline: string

  // Context-aware explanations
  // Only one may exist if ingredient is food-only or cosmetic-only
  foodContext?: IngredientContext
  cosmeticContext?: IngredientContext

  // Shared concerns (apply regardless of context)
  concerns: IngredientConcern[]

  // For ingredients where context changes the concern significantly
  foodConcerns?: IngredientConcern[]
  cosmeticConcerns?: IngredientConcern[]

  // Sources / credibility
  sources?: string[]   // e.g. ["EWG Skin Deep", "EFSA", "FDA GRAS"]

  // Internal metadata
  lastUpdated?: string  // ISO date string
}
