import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchProductByBarcode } from '../api/openFoodFacts'
import { addToHistory, saveProduct, unsaveProduct, isProductSaved } from '../lib/idb'
import { evaluateConfidence } from '../scoring/confidence'
import { computeUniversalScore } from '../scoring/universalScore'
import { computePersonalScore } from '../scoring/personalScore'
import type { Product } from '../types/product'
import { useProfileStore } from '../store/profileStore'
import IngredientItem from '../components/IngredientItem/IngredientItem'
import OCREngine from '../components/OCREngine/OCREngine'
import { ChevronLeft, Bookmark, ShieldCheck, AlertCircle, Zap, Leaf, Scale, Camera, Sparkles } from 'lucide-react'
import { calculateDailyValues, parseServingQuantity } from '../lib/dailyValues'
import type { DailyValues } from '../lib/dailyValues'

type LoadState = 'idle' | 'loading' | 'found' | 'not_found' | 'error'
type ViewMode = '100g' | 'serving'

export default function ProductPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const barcode = searchParams.get('barcode') ?? ''

  const [state, setState] = useState<LoadState>('idle')
  const [product, setProduct] = useState<Product | null>(null)
  const [showOCR, setShowOCR] = useState(false)

  useEffect(() => {
    if (!barcode) {
      setTimeout(() => setState('error'), 0)
      return
    }
    
    let isMounted = true
    setState('loading')
    
    fetchProductByBarcode(barcode)
      .then(p => {
        if (!isMounted) return
        if (p && p.barcode) {
          setProduct(p)
          setState('found')
        } else {
          setState('not_found')
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err)
        if (isMounted) setState('error')
      })
      
    return () => { isMounted = false }
  }, [barcode])

  if (state === 'loading' || state === 'idle') return <LoadingScreen />
  
  if (state === 'not_found') {
    return (
      <div className="min-h-svh bg-brand-cream">
        <NotFoundScreen barcode={barcode} navigate={navigate} onAnalyze={() => setShowOCR(true)} />
        {showOCR && (
          <OCREngine 
            barcode={barcode} 
            onCancel={() => setShowOCR(false)} 
            onResult={(p) => {
              if (p && p.barcode) {
                setProduct(p as Product)
                setState('found')
              }
              setShowOCR(false)
            }}
          />
        )}
      </div>
    )
  }
  
  if (state === 'error') return <ErrorScreen navigate={navigate} />
  if (!product) return <ErrorScreen navigate={navigate} />

  return <ProductScreen product={product} navigate={navigate} />
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-8 px-12 text-center bg-brand-cream text-brand-primary">
      <div className="relative">
        <div className="w-24 h-24 border-[0.5px] border-brand-accent/30 rounded-full" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-24 h-24 border-t-2 border-brand-accent rounded-full" 
        />
        <div className="absolute inset-0 flex items-center justify-center text-brand-accent animate-pulse">
          <Sparkles size={24} />
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="font-serif text-3xl italic tracking-tight">Deciphering DNA</h2>
        <p className="text-brand-primary/40 text-xs font-light uppercase tracking-widest">Cross-referencing global archives</p>
      </div>
    </div>
  )
}

function NotFoundScreen({ barcode, navigate, onAnalyze }: { barcode: string; navigate: (p: string) => void; onAnalyze: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-10 text-center gap-10 bg-brand-cream text-brand-primary">
      <div className="w-28 h-28 glass-panel border-brand-sage rounded-full flex items-center justify-center text-5xl shadow-2xl">🕵️‍♂️</div>
      <div className="space-y-4">
        <h2 className="text-4xl font-serif italic leading-tight">Identity Unknown</h2>
        <p className="text-brand-primary/50 text-sm font-light leading-relaxed max-w-[240px] mx-auto">
          Barcode <span className="font-bold text-brand-accent">{barcode}</span> is missing from our current registry.
        </p>
      </div>
      <div className="w-full space-y-4">
        <button onClick={onAnalyze} className="btn-primary w-full flex items-center justify-center gap-3">
          <Camera size={20} />
          Initialize OCR Scan
        </button>
        <button onClick={() => navigate('/scan')} className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-brand-accent hover:text-brand-primary transition-colors">Abort & Rescan</button>
      </div>
    </div>
  )
}

function ErrorScreen({ navigate }: { navigate: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh p-10 text-center gap-8 bg-brand-cream text-brand-primary">
      <div className="w-24 h-24 bg-status-danger rounded-full flex items-center justify-center text-4xl shadow-lg border border-red-100">📡</div>
      <div className="space-y-3">
        <h2 className="text-3xl font-serif italic">Transmission Interrupted</h2>
        <p className="text-brand-primary/60 text-sm font-light">The neural link to the database was lost.</p>
      </div>
      <button onClick={() => navigate('/scan')} className="btn-primary w-full">Re-establish Link</button>
    </div>
  )
}

function ProductScreen({ product, navigate }: { product: Product; navigate: (p: any) => void }) {
  const [saved, setSaved] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('100g')
  const store = useProfileStore()

  const dailyValues = calculateDailyValues(store)
  const servingQty = product.servingQuantity || parseServingQuantity(product.servingSize) || 100
  const multiplier = viewMode === 'serving' ? servingQty / 100 : 1

  const confidence = evaluateConfidence(product)
  const universal = computeUniversalScore(product)
  const personal = computePersonalScore(product, {
    goals: store.goals,
    allergies: store.allergies,
    skinType: store.skinType,
    fragranceFree: store.fragranceFree,
    essentialOilFree: store.essentialOilFree,
  })

  useEffect(() => {
    if (product.barcode) {
      isProductSaved(product.barcode).then(setSaved)
      addToHistory(product)
    }
  }, [product.barcode])

  async function toggleSave() {
    if (saved) {
      await unsaveProduct(product.barcode)
      setSaved(false)
    } else {
      await saveProduct(product)
      setSaved(true)
    }
  }

  const isFood = product.category === 'food'
  const themeColor = isFood ? 'bg-orange-50/50' : 'bg-blue-50/50'

  return (
    <div className={`flex flex-col pb-24 ${themeColor} min-h-svh text-brand-primary transition-colors duration-1000`}>
      {/* Immersive Hero Header */}
      <div className="relative h-[45vh] w-full bg-white overflow-hidden rounded-b-[4rem] shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-black/5 to-transparent z-10" />
        
        {/* Actions */}
        <div className="absolute top-8 left-6 right-6 z-20 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 glass-panel border-black/5 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-2xl"
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            onClick={toggleSave} 
            className={`w-12 h-12 glass-panel border-black/5 rounded-2xl flex items-center justify-center shadow-xl transition-all ${
              saved ? 'bg-brand-primary text-white' : ''
            }`}
          >
            <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Product Image */}
        <div className="w-full h-full flex items-center justify-center p-14">
          <AnimatePresence mode="wait">
            {product.imageUrl ? (
              <motion.img 
                key={product.barcode}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-contain drop-shadow-2xl" 
              />
            ) : (
              <div className="w-full h-full bg-brand-sage/20 rounded-[3rem] flex items-center justify-center text-9xl grayscale opacity-10">📦</div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="px-6 -mt-12 space-y-12 relative z-30">
        
        {/* Title & Metadata Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="editorial-card space-y-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent">{product.brand || 'Original Registry'}</span>
              <div className="h-px flex-1 bg-brand-sage/50" />
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                isFood ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {product.category}
              </div>
            </div>
            <h1 className="text-4xl font-serif italic leading-[1.1]">{product.name}</h1>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge 
              icon={<ShieldCheck size={12} />} 
              label={confidence.tier === 'high' ? 'High Fidelity' : 'Verified Profile'} 
              color={confidence.tier === 'high' ? 'safe' : 'warning'}
            />
            {product.dataQuality === 'complete' && (
              <Badge icon={<Leaf size={12} />} label="Clean Label" color="safe" />
            )}
          </div>
        </motion.div>

        {/* The Score Lens: Unified Dual-Ring */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary/40 px-1">Health Signature</h2>
          <div className="editorial-card grid grid-cols-1 md:grid-cols-2 gap-10 items-center overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
             
             <div className="flex justify-center py-4">
               <ScoreLens universal={universal.value || 0} personal={personal?.value || 0} />
             </div>

             <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Universal Baseline</p>
                  <p className="text-xs text-brand-primary/60 leading-relaxed italic">{universal.reasons[0] || 'Standard health evaluation based on clinical data.'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-brand-accent">Personal Match</p>
                  <p className="text-xs text-brand-primary/60 leading-relaxed italic">
                    {store.goals.length > 0 
                      ? personal?.reasons[0] || 'Optimized for your specific health goals.'
                      : 'Complete your profile for a personalized match score.'}
                  </p>
                </div>
             </div>
          </div>
        </section>

        {/* Personal Warnings */}
        <AnimatePresence>
          {personal?.allergyWarnings && personal.allergyWarnings.length > 0 && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 bg-status-danger border border-red-100 rounded-[2.5rem] flex items-start gap-5"
            >
              <div className="w-12 h-12 glass-panel border-red-200 rounded-2xl flex items-center justify-center text-red-600 shrink-0 shadow-sm">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-red-950 uppercase tracking-tight">Personal Risk Detected</p>
                <div className="space-y-1 mt-1">
                  {personal.allergyWarnings.map(w => (
                    <p key={w} className="text-xs text-red-800/80 leading-relaxed font-medium italic">{w}</p>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Impact Analysis & Nutrition */}
        <section className="space-y-6">
           <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary/40 flex items-center gap-2">
                <Scale size={14} />
                Impact Analysis
              </h2>
              {isFood && (
                <div className="flex bg-brand-sage/30 p-1 rounded-xl border border-brand-sage/50">
                  <button 
                    onClick={() => setViewMode('100g')}
                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === '100g' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-primary/40'}`}
                  >
                    100g
                  </button>
                  <button 
                    onClick={() => setViewMode('serving')}
                    className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'serving' ? 'bg-white text-brand-primary shadow-sm' : 'text-brand-primary/40'}`}
                  >
                    Serving
                  </button>
                </div>
              )}
           </div>

           {isFood ? (
             <FoodDetails product={product} multiplier={multiplier} dailyValues={dailyValues} isServing={viewMode === 'serving'} />
           ) : (
             <CosmeticDetails product={product} />
           )}
        </section>

        {/* Functional Ingredient Grouping */}
        <section className="space-y-8">
            <h2 className="text-3xl font-serif italic px-1 flex items-center gap-4">
              Composition
              <div className="flex-1 h-[0.5px] bg-brand-sage" />
            </h2>
            
            <div className="space-y-10">
              <IngredientGroup 
                title="Primary Components" 
                subtitle="The structural foundation"
                ingredients={product.ingredients.slice(0, 3)} 
                type={isFood ? 'food' : 'cosmetic'} 
              />
              {product.ingredients.length > 3 && (
                <IngredientGroup 
                  title="Secondary Actives" 
                  subtitle="Supporting health benefits"
                  ingredients={product.ingredients.slice(3, 8)} 
                  type={isFood ? 'food' : 'cosmetic'} 
                />
              )}
              {product.ingredients.length > 8 && (
                <IngredientGroup 
                  title="Trace Elements" 
                  subtitle="Minor additives & markers"
                  ingredients={product.ingredients.slice(8)} 
                  type={isFood ? 'food' : 'cosmetic'} 
                />
              )}

              {product.ingredients.length === 0 && (
                <div className="editorial-card py-12 text-center text-brand-primary/30 text-xs italic font-light">
                  No detailed composition data available.
                </div>
              )}
            </div>
        </section>

      </div>
    </div>
  )
}

function IngredientGroup({ title, subtitle, ingredients, type }: { title: string, subtitle: string, ingredients: string[], type: 'food' | 'cosmetic' }) {
  if (ingredients.length === 0) return null
  return (
    <div className="space-y-4">
      <div className="px-1">
        <h3 className="text-sm font-bold text-brand-primary uppercase tracking-tight">{title}</h3>
        <p className="text-[10px] text-brand-accent italic">{subtitle}</p>
      </div>
      <div className="editorial-card p-0 overflow-hidden divide-y divide-brand-sage/20">
        {ingredients.map(name => (
          <IngredientItem key={name} name={name} productType={type} />
        ))}
      </div>
    </div>
  )
}

function ScoreLens({ universal, personal }: { universal: number, personal: number }) {
  const size = 180
  const stroke = 12
  const center = size / 2
  const radius1 = center - stroke
  const radius2 = center - stroke * 2.5
  const circ1 = 2 * Math.PI * radius1
  const circ2 = 2 * Math.PI * radius2

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Rings */}
        <circle cx={center} cy={center} r={radius1} fill="transparent" stroke="#E8EDEA" strokeWidth={stroke} />
        <circle cx={center} cy={center} r={radius2} fill="transparent" stroke="#E8EDEA" strokeWidth={stroke} />
        
        {/* Universal Ring */}
        <motion.circle 
          cx={center} cy={center} r={radius1} fill="transparent" stroke="#1A2E22" strokeWidth={stroke}
          strokeDasharray={circ1}
          initial={{ strokeDashoffset: circ1 }}
          animate={{ strokeDashoffset: circ1 - (universal / 100) * circ1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
          strokeLinecap="round"
        />

        {/* Personal Ring */}
        <motion.circle 
          cx={center} cy={center} r={radius2} fill="transparent" stroke="#D4B996" strokeWidth={stroke}
          strokeDasharray={circ2}
          initial={{ strokeDashoffset: circ2 }}
          animate={{ strokeDashoffset: circ2 - (personal / 100) * circ2 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
          strokeLinecap="round"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
        <span className="text-xs font-bold text-brand-primary/30 uppercase tracking-widest leading-none">Match</span>
        <span className="text-4xl font-serif italic text-brand-primary">{personal || universal}</span>
        <div className="h-px w-6 bg-brand-accent/30" />
      </div>
    </div>
  )
}

function FoodDetails({ product, multiplier, dailyValues, isServing }: { product: Product; multiplier: number; dailyValues: DailyValues; isServing: boolean }) {
  const nutrition = product.nutritionPer100g
  if (!nutrition) return null

  const items = [
    { label: 'Energy', val: nutrition.energyKcal, unit: 'kcal', dvKey: 'energyKcal' },
    { label: 'Sugar', val: nutrition.sugar, unit: 'g', dvKey: 'sugar' },
    { label: 'Protein', val: nutrition.protein, unit: 'g', dvKey: 'protein' },
    { label: 'Fiber', val: nutrition.fiber, unit: 'g', dvKey: 'fiber' },
    { label: 'Sat. Fat', val: nutrition.saturatedFat, unit: 'g', dvKey: 'saturatedFat' },
    { label: 'Salt', val: nutrition.salt, unit: 'g', dvKey: 'salt' },
  ].filter(i => i.val !== undefined)

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map(item => {
        const adjustedVal = (item.val ?? 0) * multiplier
        const dvLimit = dailyValues[item.dvKey as keyof DailyValues] || 1 
        const percent = Math.min(100, Math.round((adjustedVal / dvLimit) * 100))
        
        return (
          <motion.div 
            key={item.label} 
            whileHover={{ scale: 1.02 }}
            className="editorial-card p-6 flex flex-col gap-4 bg-white"
          >
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-primary/30 uppercase tracking-[0.2em]">{item.label}</span>
                <p className="text-2xl font-serif italic">
                  {adjustedVal.toFixed(1)}<span className="text-xs font-sans ml-1 opacity-40">{item.unit}</span>
                </p>
              </div>
              {isServing && (
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                  percent > 50 ? 'bg-status-danger border-red-200 text-red-700' : 'bg-brand-sage/30 border-brand-sage text-brand-primary/40'
                }`}>
                  {percent}% DV
                </div>
              )}
            </div>
            
            {isServing && (
              <div className="h-[2px] w-full bg-brand-sage/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className={`h-full rounded-full ${
                    percent > 80 ? 'bg-status-danger' : percent > 40 ? 'bg-brand-accent' : 'bg-brand-primary'
                  }`}
                />
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

function CosmeticDetails({ product }: { product: Product }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className={`editorial-card p-6 flex flex-col gap-3 ${product.hypoallergenic ? 'bg-status-safe' : 'opacity-40'}`}>
        <Zap size={20} className={product.hypoallergenic ? 'text-green-700' : 'text-brand-primary/20'} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Hypoallergenic</span>
      </div>
      <div className={`editorial-card p-6 flex flex-col gap-3 ${product.dermatologistTested ? 'bg-blue-50' : 'opacity-40'}`}>
        <ShieldCheck size={20} className={product.dermatologistTested ? 'text-blue-700' : 'text-brand-primary/20'} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Derm Tested</span>
      </div>
    </div>
  )
}

function Badge({ icon, label, color }: { icon: React.ReactNode, label: string, color: 'safe' | 'warning' | 'danger' }) {
  const styles = {
    safe: 'bg-status-safe text-green-800 border-green-200',
    warning: 'bg-status-warning text-amber-800 border-amber-200',
    danger: 'bg-status-danger text-red-800 border-red-200'
  }
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${styles[color]}`}>
      {icon}
      {label}
    </div>
  )
}
