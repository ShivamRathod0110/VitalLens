import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Types ---
type IngredientCategory =
  | 'preservative' | 'emulsifier' | 'antioxidant' | 'colorant' | 'flavoring'
  | 'sweetener' | 'thickener' | 'humectant' | 'surfactant' | 'exfoliant'
  | 'fragrance' | 'uv_filter' | 'active' | 'nutrient' | 'acid_regulator'
  | 'stabilizer' | 'solvent' | 'film_former' | 'chelating_agent' | 'other';

type HazardLevel = 'safe' | 'low' | 'moderate' | 'high' | 'unknown';

interface IngredientContext {
  use: string;
  whyUsed: string;
  typicalConcentration?: string;
  exposureConcern?: string;
}

interface Ingredient {
  id: string;
  name: string;
  aliases: string[];
  categories: IngredientCategory[];
  hazardLevel: HazardLevel;
  tagline: string;
  foodContext?: IngredientContext;
  cosmeticContext?: IngredientContext;
  concerns: any[];
  sources?: string[];
  lastUpdated?: string;
}

// --- Constants ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../src/data/ingredientDB.ts');
const OFF_ADDITIVES_URL = 'https://static.openfoodfacts.org/data/taxonomies/additives.full.json';
const OFF_INGREDIENTS_URL = 'https://static.openfoodfacts.org/data/taxonomies/ingredients.full.json';
const OBF_INGREDIENTS_URL = 'https://static.openbeautyfacts.org/data/taxonomies/ingredients.full.json';

// --- Helpers ---
function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function titleCase(text: string): string {
  if (!text) return '';
  return text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function mapCategory(tag: string): IngredientCategory {
  const t = tag.toLowerCase();
  if (t.includes('preservative')) return 'preservative';
  if (t.includes('emulsifier')) return 'emulsifier';
  if (t.includes('antioxidant')) return 'antioxidant';
  if (t.includes('colorant') || t.includes('colourant') || t.includes('dye')) return 'colorant';
  if (t.includes('flavoring') || t.includes('flavouring')) return 'flavoring';
  if (t.includes('sweetener')) return 'sweetener';
  if (t.includes('thickener')) return 'thickener';
  if (t.includes('humectant')) return 'humectant';
  if (t.includes('surfactant')) return 'surfactant';
  if (t.includes('exfoliant')) return 'exfoliant';
  if (t.includes('fragrance') || t.includes('parfum')) return 'fragrance';
  if (t.includes('uv-filter') || t.includes('sunscreen')) return 'uv_filter';
  if (t.includes('active')) return 'active';
  if (t.includes('nutrient') || t.includes('vitamin')) return 'nutrient';
  if (t.includes('acid_regulator') || t.includes('ph')) return 'acid_regulator';
  if (t.includes('stabilizer')) return 'stabilizer';
  if (t.includes('solvent')) return 'solvent';
  return 'other';
}

function extractSynonyms(value: any): string[] {
  const synonyms = new Set<string>();
  const langs = ['en', 'fr', 'es', 'de', 'it'];
  langs.forEach(lang => {
    if (value.name?.[lang]) synonyms.add(value.name[lang].toLowerCase().trim());
    if (Array.isArray(value.synonyms?.[lang])) {
      value.synonyms[lang].forEach((s: string) => synonyms.add(s.toLowerCase().trim()));
    }
  });
  return Array.from(synonyms).filter(s => s.length > 0);
}

// --- Main Pipeline ---
async function run() {
  console.log('🚀 Starting VitalLens Intelligent Merging Pipeline...');
  const db = new Map<string, Ingredient>();
  const nameToId = new Map<string, string>(); // Normalized Name -> ID mapping for merging

  // 1. Process OFF Additives & Ingredients
  for (const url of [OFF_ADDITIVES_URL, OFF_INGREDIENTS_URL]) {
    try {
      console.log(`📥 Fetching ${url.split('/').pop()}...`);
      const { data } = await axios.get(url);

      Object.entries(data).forEach(([key, value]: [string, any]) => {
        const eNumber = value.e_number?.en;
        const rawName = value.name?.en?.split(' - ')[1] || value.name?.en || key.replace(/^(en|fr|es|de):/, '');
        const synonyms = extractSynonyms(value);
        if (eNumber) synonyms.push(`e${eNumber.toLowerCase()}`, `e${eNumber}`, eNumber);

        // Find existing entry by ID, Name, or Synonym
        let id = eNumber ? `e${eNumber.toLowerCase()}` : slugify(rawName);
        let existingId = nameToId.get(rawName.toLowerCase());
        if (!existingId) {
          for (const s of synonyms) {
            if (nameToId.has(s)) {
              existingId = nameToId.get(s);
              break;
            }
          }
        }

        const categories = (value.parents || []).map(mapCategory).filter((c: string) => c !== 'other');
        const finalCategories = Array.from(new Set(categories)) as IngredientCategory[];
        if (finalCategories.length === 0) finalCategories.push('other');

        const foodContext: IngredientContext = {
          use: eNumber ? 'Food additive (E-number)' : 'Common food ingredient',
          whyUsed: eNumber ? 'Used for specific technical functions in food processing.' : 'Standard component used in food recipes.',
        };

        if (existingId || db.has(id)) {
          const entry = db.get(existingId || id)!;
          entry.foodContext = entry.foodContext || foodContext;
          entry.aliases = Array.from(new Set([...entry.aliases, ...synonyms]));
          entry.categories = Array.from(new Set([...entry.categories, ...finalCategories]));
          if (entry.categories.length > 1) {
            entry.categories = entry.categories.filter(c => c !== 'other');
          }
          entry.sources = Array.from(new Set([...(entry.sources || []), 'Open Food Facts']));
        } else {
          db.set(id, {
            id,
            name: titleCase(rawName),
            aliases: synonyms,
            categories: finalCategories,
            hazardLevel: 'safe',
            tagline: `${titleCase(rawName)} — Food component`,
            foodContext,
            concerns: [],
            sources: ['Open Food Facts'],
            lastUpdated: new Date().toISOString().split('T')[0],
          });
          nameToId.set(rawName.toLowerCase(), id);
          synonyms.forEach(s => nameToId.set(s, id));
        }
      });
    } catch (err: any) {
      console.error(`❌ Error processing ${url}:`, err.message);
    }
  }

  // 2. Process OBF Ingredients
  try {
    console.log('📥 Fetching Open Beauty Facts ingredients...');
    const { data: obfJson } = await axios.get(OBF_INGREDIENTS_URL);

    Object.entries(obfJson).forEach(([key, value]: [string, any]) => {
      if (key === 'stopwords') return;

      const rawName = value.name?.en || key.replace(/^(en|fr|es|de):/, '');
      const synonyms = extractSynonyms(value);
      const cas = value.properties?.cas_number;
      if (cas) synonyms.push(cas);

      // Link to existing by name or synonym
      let existingId = nameToId.get(rawName.toLowerCase());
      if (!existingId) {
        for (const s of synonyms) {
          if (nameToId.has(s)) {
            existingId = nameToId.get(s);
            break;
          }
        }
      }

      const functions = value.properties?.function || '';
      const categories = (value.parents || []).map(mapCategory).filter((c: string) => c !== 'other');
      if (functions) {
        functions.split(',').forEach((f: string) => categories.push(mapCategory(f.trim())));
      }
      const uniqueCategories = Array.from(new Set(categories.filter((c: string) => c !== 'other'))) as IngredientCategory[];
      if (uniqueCategories.length === 0) uniqueCategories.push('other');

      const cosmeticContext: IngredientContext = {
        use: functions || 'Cosmetic ingredient',
        whyUsed: `INCI Name: ${rawName}. ${functions ? `Functional role: ${functions}.` : ''}`,
      };

      if (existingId) {
        const entry = db.get(existingId)!;
        entry.cosmeticContext = cosmeticContext;
        entry.categories = Array.from(new Set([...entry.categories, ...uniqueCategories]));
        entry.aliases = Array.from(new Set([...entry.aliases, ...synonyms]));
        if (entry.categories.length > 1) {
          entry.categories = entry.categories.filter(c => c !== 'other');
        }
        entry.sources = Array.from(new Set([...(entry.sources || []), 'Open Beauty Facts']));
        // Update tagline for dual-use
        if (entry.foodContext) {
          entry.tagline = `${entry.name} — Multi-use ingredient`;
        }
      } else {
        const id = slugify(rawName);
        db.set(id, {
          id,
          name: titleCase(rawName),
          aliases: synonyms,
          categories: uniqueCategories,
          hazardLevel: 'safe',
          tagline: `${titleCase(rawName)} — Cosmetic ingredient`,
          cosmeticContext,
          concerns: [],
          sources: ['Open Beauty Facts'],
          lastUpdated: new Date().toISOString().split('T')[0],
        });
        nameToId.set(rawName.toLowerCase(), id);
        synonyms.forEach(s => nameToId.set(s, id));
      }
    });
  } catch (err: any) {
    console.error('❌ Failed to process OBF data:', err.message);
  }

  // 3. Save to DB
  console.log('💾 Saving to ingredientDB.ts...');
  const finalIngredients = Array.from(db.values());
  const fileContent = `// src/data/ingredientDB.ts
// THIS FILE IS AUTO-GENERATED BY scripts/importIngredients.ts
// @ts-nocheck

export const INGREDIENT_DB = ${JSON.stringify(finalIngredients, null, 2)};
`;

  fs.writeFileSync(DB_PATH, fileContent);
  console.log(`✨ Successfully imported ${finalIngredients.length} ingredients with intelligent merging.`);
}

run();
