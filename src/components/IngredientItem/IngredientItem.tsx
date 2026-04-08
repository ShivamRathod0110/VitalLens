// src/components/IngredientItem/IngredientItem.tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, AlertTriangle, Leaf, BookOpen, Sparkles, MinusCircle } from 'lucide-react'
import type { Ingredient } from '../../data/ingredientTypes'
import { lookupIngredient } from '../../lib/ingredientLookup'

type ProductType = 'food' | 'cosmetic'

interface Props {
  name: string
  productType: ProductType
}

const HAZARD_COLORS = {
  safe:     { bg: 'bg-status-safe',  text: 'text-green-800',  dot: 'bg-green-500',  label: 'Safe' },
  low:      { bg: 'bg-status-warning', text: 'text-amber-800', dot: 'bg-amber-400', label: 'Low concern' },
  moderate: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', label: 'Moderate concern' },
  high:     { bg: 'bg-status-danger',    text: 'text-red-800',    dot: 'bg-red-500',    label: 'High concern' },
  unknown:  { bg: 'bg-brand-sage',   text: 'text-gray-600',   dot: 'bg-gray-400',   label: 'No data' },
}

const BENEFIT_STYLES = {
  high:     { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'High Benefit', icon: <Sparkles size={14} /> },
  moderate: { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'Nutritional', icon: <Sparkles size={14} /> },
  neutral:  { bg: 'bg-gray-50',   text: 'text-gray-600',   label: 'Neutral',     icon: null },
  low:      { bg: 'bg-amber-50',  text: 'text-amber-600',  label: 'Low Value',   icon: <MinusCircle size={14} /> },
  empty:    { bg: 'bg-red-50',    text: 'text-red-600',    label: 'Empty Calorie', icon: <MinusCircle size={14} /> },
}

export default function IngredientItem({ name, productType }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [ingredient, setIngredient] = useState<Ingredient | null | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!expanded || ingredient !== undefined) return
    setLoading(true)
    lookupIngredient(name, productType).then(result => {
      setIngredient(result)
      setLoading(false)
    })
  }, [expanded, name, productType, ingredient])

  const context = ingredient
    ? productType === 'food'
      ? ingredient.foodContext
      : ingredient.cosmeticContext
    : null

  const concerns = ingredient
    ? [
        ...(ingredient.concerns ?? []),
        ...(productType === 'food' ? ingredient.foodConcerns ?? [] : ingredient.cosmeticConcerns ?? []),
      ]
    : []

  const hazard = ingredient ? HAZARD_COLORS[ingredient.hazardLevel] : null
  const benefit = ingredient?.nutritionalBenefit ? BENEFIT_STYLES[ingredient.nutritionalBenefit] : null

  return (
    <div className="group transition-all">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between py-5 px-6 text-left transition-colors active:bg-brand-sage/20"
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-brand-primary capitalize tracking-tight">{name}</span>
            {benefit && (
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider flex items-center gap-1 ${benefit.bg} ${benefit.text}`}>
                {benefit.icon}
                {benefit.label}
              </span>
            )}
          </div>
          {ingredient?.tagline && (
            <p className="text-[10px] text-brand-primary/40 mt-0.5 font-medium uppercase tracking-wider">{ingredient.tagline}</p>
          )}
          {ingredient === null && (
            <p className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-wider italic">Registry entry pending</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {hazard && (
            <div className={`w-2 h-2 rounded-full ${hazard.dot} shadow-sm group-hover:scale-125 transition-transform`} />
          )}
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <ChevronDown size={16} className="text-brand-primary/20" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-6">
              {loading && (
                <div className="flex items-center gap-3 py-4">
                  <div className="w-4 h-4 border-2 border-brand-sage border-t-brand-primary rounded-full animate-spin" />
                  <p className="text-xs text-brand-primary/40 font-bold uppercase tracking-widest">Consulting archives…</p>
                </div>
              )}

              {ingredient === null && !loading && (
                <div className="p-5 bg-brand-sage/20 rounded-2xl border border-brand-sage/50 space-y-3">
                  <div className="flex items-center gap-2 text-brand-primary/60">
                    <BookOpen size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">External Resources</span>
                  </div>
                  <p className="text-xs text-brand-primary/60 leading-relaxed font-light italic">
                    We don't have detailed analysis for this ingredient yet. Research further on <a href={`https://incidecoder.com/search?query=${encodeURIComponent(name)}`} target="_blank" rel="noopener noreferrer" className="text-brand-primary font-bold underline">INCIdecoder</a> or <a href={`https://www.ewg.org/skindeep/search/?search=${encodeURIComponent(name)}`} target="_blank" rel="noopener noreferrer" className="text-brand-primary font-bold underline">EWG</a>.
                  </p>
                </div>
              )}

              {ingredient && !loading && (
                <div className="space-y-6">
                  {/* Context Sections */}
                  {context && (
                    <div className="grid grid-cols-1 gap-5">
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-brand-primary/30 uppercase tracking-[0.2em]">Functional Role</p>
                        <p className="text-sm text-brand-primary font-medium leading-relaxed">{context.use}</p>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-brand-primary/30 uppercase tracking-[0.2em]">Clinical Context</p>
                        <p className="text-sm text-brand-primary/70 font-light leading-relaxed">{context.whyUsed}</p>
                      </div>
                    </div>
                  )}

                  {/* Concerns */}
                  {concerns.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <p className="text-[9px] font-bold text-status-danger uppercase tracking-[0.2em]">Health Advisories</p>
                      <div className="space-y-2">
                        {concerns.map((concern, i) => (
                          <div key={i} className="p-4 bg-status-danger/50 rounded-2xl border border-red-100 flex items-start gap-3">
                            <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-900 font-medium leading-relaxed">{concern.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clean State */}
                  {concerns.length === 0 && ingredient.hazardLevel === 'safe' && (
                    <div className="flex items-center gap-3 p-4 bg-status-safe rounded-2xl border border-green-100">
                      <Leaf size={16} className="text-green-600" />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-green-800 uppercase tracking-tight">Regulated as Safe</span>
                        {benefit && ingredient.nutritionalBenefit === 'empty' && (
                          <span className="text-[9px] text-red-600 font-medium italic mt-0.5">Note: Provides minimal nutritional value</span>
                        )}
                        {benefit && ingredient.nutritionalBenefit === 'high' && (
                          <span className="text-[9px] text-indigo-600 font-medium italic mt-0.5">Note: High nutritional density</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between pt-2">
                    <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${hazard?.bg} ${hazard?.text}`}>
                      {hazard?.label}
                    </div>
                    {ingredient.sources && (
                      <p className="text-[9px] text-brand-primary/20 font-bold uppercase tracking-widest">
                        Source: {ingredient.sources[0]}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

