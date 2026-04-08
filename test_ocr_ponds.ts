import { parseNutritionFromOCR } from './src/lib/ocrScorer'

// Hypothetical OCR output from the provided Pond's image
// Note how the lines are "wrapped" and split mid-phrase
const mockOCRText = `
POND'S LIGHT MOISTURISER
INGREDIENTS: WATER, PALMITIC ACID AND STEARIC
ACID, NIACINAMIDE, ISOPROPYL MYRISTATE, GLYCERYL
STEARATE, MINERAL OIL, ETHYLHEXYL METHOXYCINNAMATE,
TRIETHANOLAMINE, GLYCERIN, CETYL ALCOHOL, DIMETHICONE, BUTYL
METHOXYDIBENZOYLMETHANE, CARBOMER, METHYL PARABEN, SODIUM PCA,
TITANIUM DIOXIDE, ALUMINA, ZINC OXIDE, PROPYL PARABEN, L-GLUTAMIC ACID, ALLANTOIN,
TOCOPHEROL ACETATE, SODIUM HYDROXIDE, DISODIUM EDTA, SODIUM ASCORBYL PHOSPHATE,
PHENOXYETHANOL, PERFUME, ALPHA-ISOMETHYL IONONE, BENZYL ALCOHOL, CITRONELLOL,
GERANIOL, HEXYL CINNAMAL, LIMONENE, LINALOOL.
SKIN CREAM. MADE IN INDIA. MKTD. BY LIC. USER
HINDUSTAN UNILEVER LIMITED (HUL). HUL 2021.
`

const result = parseNutritionFromOCR(mockOCRText, '0000000000000')

console.log('--- OCR ANALYSIS RESULT ---')
console.log('Category Detected:', result.category)
console.log('Product Name:', result.name)
console.log('Ingredient Count:', result.ingredients?.length)
console.log('First 5 Ingredients:', result.ingredients?.slice(0, 5))
console.log('Last 2 Ingredients:', result.ingredients?.slice(-2))
console.log('---------------------------')
