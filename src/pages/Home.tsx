import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getHistory } from '../lib/idb'
import type { HistoryEntry } from '../lib/idb'
import { Search, Bookmark, ChevronRight, Scan as ScanIcon, Sparkles, Info } from 'lucide-react'

export default function Home() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    getHistory().then(h => setHistory(h.slice(0, 4)))
  }, [])

  return (
    <div className="flex flex-col min-h-svh pb-24 relative overflow-hidden">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[150%] aspect-square bg-brand-accent/5 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[100%] aspect-square bg-brand-sage/20 rounded-full blur-[100px] -z-10" />

      <div className="px-6 pt-16 space-y-10">
        
        {/* Header Section */}
        <header className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-brand-accent font-sans font-bold uppercase tracking-[0.2em] text-[10px]"
          >
            <Sparkles size={14} />
            <span>The Serene Lens</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl font-serif text-brand-primary leading-[0.9] tracking-tighter"
          >
            VitalLens
          </motion.h1>
        </header>

        {/* Glass-morphic Hero Action */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={() => navigate('/scan')}
            className="group relative w-full aspect-[4/3] bg-brand-primary overflow-hidden rounded-[3rem] p-10 flex flex-col justify-end text-white shadow-3xl shadow-brand-primary/20 active:scale-[0.98] transition-all"
          >
            {/* Dynamic Glass Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary via-brand-primary/80 to-transparent z-0" />
            <div className="absolute top-[-20%] right-[-20%] w-80 h-80 bg-brand-accent/20 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-[2s]" />
            
            <div className="relative z-10 space-y-6 text-left w-full">
              <motion.div 
                whileHover={{ rotate: 5 }}
                className="w-16 h-16 glass-panel border-white/10 rounded-3xl flex items-center justify-center text-white mb-4"
              >
                <ScanIcon size={32} strokeWidth={1.2} />
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-4xl font-serif leading-[1.1] tracking-tight">Reveal the truth <br/>behind labels</h2>
                <p className="text-white/50 text-xs font-light tracking-wide uppercase">Point camera at any barcode</p>
              </div>
            </div>
          </button>
        </motion.section>

        {/* Daily Insight / Pro Tip */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="editorial-card bg-brand-accent/10 border-brand-accent/20 flex items-start gap-4 p-5"
        >
          <div className="w-10 h-10 glass-panel border-brand-accent/20 rounded-2xl flex items-center justify-center text-brand-accent shrink-0">
            <Info size={20} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Daily Insight</p>
            <p className="text-xs text-brand-primary/70 leading-relaxed italic">"Always check the first three ingredients—they make up over 80% of the product's mass."</p>
          </div>
        </motion.div>

        {/* Quick Access Grid */}
        <section className="grid grid-cols-2 gap-4">
          <QuickAction 
            icon={<Search size={24} />} 
            label="Search" 
            description="Lookup Products"
            onClick={() => navigate('/search')}
            delay={0.4}
          />
          <QuickAction 
            icon={<Bookmark size={24} />} 
            label="Archive" 
            description="Your Collection"
            onClick={() => navigate('/saved')}
            delay={0.5}
          />
        </section>

        {/* History Section */}
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-serif text-3xl text-brand-primary tracking-tight">Recent Scan</h2>
            <button 
              onClick={() => navigate('/saved')}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent hover:text-brand-primary transition-colors"
            >
              Archive
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {history.length > 0 ? (
              <div className="space-y-3 stagger-entrance">
                {history.map((entry) => (
                  <motion.button
                    key={entry.barcode}
                    layout
                    onClick={() => navigate(`/product?barcode=${entry.product.barcode}`)}
                    className="w-full editorial-card flex items-center gap-5 group active:scale-[0.99] hover:bg-white"
                  >
                    <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-brand-sage/50 p-3 group-hover:scale-105 transition-transform">
                      {entry.product.imageUrl ? (
                        <img src={entry.product.imageUrl} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-3xl opacity-20 grayscale">📦</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left space-y-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">{entry.product.brand || 'Original'}</p>
                      <p className="text-base font-serif italic text-brand-primary truncate">{entry.product.name}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-brand-sage flex items-center justify-center text-brand-sage group-hover:text-brand-primary group-hover:border-brand-primary transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
        </section>

      </div>
    </div>
  )
}

function QuickAction({ icon, label, description, onClick, delay }: { icon: React.ReactNode, label: string, description: string, onClick: () => void, delay: number }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="editorial-card text-left space-y-4 active:scale-95 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-brand-accent/5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="w-12 h-12 bg-brand-cream rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all duration-500 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold tracking-tight text-brand-primary">{label}</p>
        <p className="text-[9px] text-brand-accent uppercase tracking-widest mt-1 font-black">{description}</p>
      </div>
    </motion.button>
  )
}

function EmptyState() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="editorial-card py-16 text-center space-y-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-brand-sage/5 -z-10" />
      <div className="w-20 h-20 glass-panel border-brand-sage rounded-full mx-auto flex items-center justify-center text-5xl">🔭</div>
      <div className="space-y-2">
        <h3 className="font-serif text-xl italic text-brand-primary">Our lens is ready</h3>
        <p className="text-xs text-brand-primary/40 font-light max-w-[200px] mx-auto leading-relaxed">
          Scan your first product to begin your journey toward clean living.
        </p>
      </div>
    </motion.div>
  )
}
