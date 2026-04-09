import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, ChevronRight, Loader2, Frown, Sparkles, AlertCircle } from 'lucide-react'
import { searchProducts } from '../api/openFoodFacts'
import type { Product } from '../types/product'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const navigate = useNavigate()

  async function doSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    setState('loading')
    setResults([])

    try {
      const products = await searchProducts(q)
      setResults(products)
      setState('done')
    } catch (err) {
      console.error('Search error:', err)
      setState('error')
    }
  }

  return (
    <div className="flex flex-col px-6 pt-16 pb-24 gap-10 min-h-svh relative overflow-hidden bg-brand-cream/30">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-[10%] right-[-10%] w-[80%] aspect-square bg-brand-sage/10 rounded-full blur-[100px] -z-10" />

      {/* Header */}
      <header className="space-y-2">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-brand-accent font-sans font-bold uppercase tracking-[0.2em] text-[10px]"
        >
          <Sparkles size={14} />
          <span>Global Discovery</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-serif text-brand-primary tracking-tight"
        >
          Search
        </motion.h1>
      </header>

      {/* Enhanced Search Input */}
      <section>
        <form onSubmit={doSearch} className="relative group">
          <input
            type="search"
            placeholder="Search by name or brand..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-white border border-brand-sage/50 rounded-[2.5rem] px-8 py-7 text-xl font-serif italic text-brand-primary placeholder:text-brand-primary/20 focus:outline-none focus:ring-8 focus:ring-brand-accent/5 transition-all shadow-lg shadow-brand-primary/[0.02]"
          />
          <button
            type="submit"
            disabled={state === 'loading'}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 bg-brand-primary text-white rounded-3xl flex items-center justify-center shadow-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {state === 'loading' ? <Loader2 size={24} className="animate-spin" /> : <SearchIcon size={24} />}
          </button>
        </form>
      </section>

      {/* Results / States */}
      <div className="flex-1 min-h-[40vh]">
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center gap-8"
            >
              <div className="w-24 h-24 glass-panel border-brand-sage rounded-full flex items-center justify-center text-5xl shadow-2xl opacity-40">🔭</div>
              <div className="space-y-3">
                <p className="font-serif text-2xl text-brand-primary italic tracking-tight">Ready for exploration</p>
                <p className="text-brand-primary/40 text-xs font-light max-w-[200px] leading-relaxed italic uppercase tracking-widest">
                  Query the global registry for any product code or name.
                </p>
              </div>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="editorial-card py-20 text-center space-y-8 bg-red-50/50 border-red-100 border-dashed"
            >
              <div className="w-20 h-20 glass-panel border-red-200 rounded-full mx-auto flex items-center justify-center text-red-500">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-3xl text-brand-primary italic">Connection Failed</h3>
                <p className="text-brand-primary/40 text-sm font-light max-w-[220px] mx-auto leading-relaxed">
                  The registry is currently unreachable. Please check your link.
                </p>
              </div>
              <button 
                onClick={doSearch}
                className="btn-primary px-8 py-3 text-xs rounded-2xl mx-auto"
              >
                Retry Search
              </button>
            </motion.div>
          )}

          {state === 'done' && results.length === 0 && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="editorial-card py-20 text-center space-y-8 bg-brand-sage/5 border-dashed"
            >
              <div className="w-20 h-20 glass-panel border-brand-sage rounded-full mx-auto flex items-center justify-center text-brand-accent">
                <Frown size={32} />
              </div>
              <div className="space-y-3">
                <h3 className="font-serif text-3xl text-brand-primary italic">Identity Lost</h3>
                <p className="text-brand-primary/40 text-sm font-light max-w-[220px] mx-auto leading-relaxed">
                  We couldn't match any archives with <span className="text-brand-accent font-bold italic">"{query}"</span>.
                </p>
              </div>
            </motion.div>
          )}

          {state === 'done' && results.length > 0 && (
            <motion.div 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 px-2">
                <div className="flex-1 h-[0.5px] bg-brand-sage" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-accent">
                  {results.length} Matches Found
                </span>
                <div className="flex-1 h-[0.5px] bg-brand-sage" />
              </div>

              <div className="space-y-4 stagger-entrance">
                {results.map((p) => (
                  <motion.button
                    key={p.barcode}
                    onClick={() => navigate(`/product?barcode=${p.barcode}`)}
                    className="w-full editorial-card flex items-center gap-5 group active:scale-[0.99] hover:bg-white"
                  >
                    <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-brand-sage/50 p-3 group-hover:scale-105 transition-transform">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-3xl opacity-20 grayscale">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent truncate">{p.brand || 'Original Registry'}</p>
                      <p className="text-base font-serif italic text-brand-primary truncate">{p.name}</p>
                      <div className="flex gap-2 pt-1">
                        {p.nutritionPer100g?.energyKcal != null && (
                          <span className="bg-brand-sage/50 text-brand-primary/40 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                            {Math.round(p.nutritionPer100g.energyKcal)} kcal
                          </span>
                        )}
                        <span className="bg-brand-sage/50 text-brand-primary/40 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                          ID: {p.barcode.slice(-6)}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-brand-sage flex items-center justify-center text-brand-sage group-hover:text-brand-primary group-hover:border-brand-primary transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
