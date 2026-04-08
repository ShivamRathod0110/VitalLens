import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getSavedProducts, getHistory } from '../lib/idb'
import type { Product } from '../types/product'
import type { HistoryEntry } from '../lib/idb'
import { Bookmark, History, ChevronRight, Sparkles } from 'lucide-react'

type Tab = 'saved' | 'history'

export default function Saved() {
  const [tab, setTab] = useState<Tab>('saved')
  const [saved, setSaved] = useState<Product[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    getSavedProducts().then(setSaved)
    getHistory().then(setHistory)
  }, [])

  return (
    <div className="flex flex-col px-6 pt-16 pb-24 gap-10 min-h-svh relative overflow-hidden">
      
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-5%] left-[-10%] w-[100%] aspect-square bg-brand-accent/5 rounded-full blur-[100px] -z-10" />
      
      {/* Header Section */}
      <header className="space-y-2">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-brand-accent font-sans font-bold uppercase tracking-[0.2em] text-[10px]"
        >
          <Sparkles size={14} />
          <span>The Registry</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-serif text-brand-primary tracking-tight"
        >
          Archive
        </motion.h1>
      </header>

      {/* Modern Tabs */}
      <section className="flex bg-brand-sage/20 p-1.5 rounded-[2rem] border border-brand-sage/40 backdrop-blur-sm">
        <TabButton 
          active={tab === 'saved'} 
          onClick={() => setTab('saved')} 
          label="Saved" 
          count={saved.length} 
          icon={<Bookmark size={14} />} 
        />
        <TabButton 
          active={tab === 'history'} 
          onClick={() => setTab('history')} 
          label="History" 
          count={history.length} 
          icon={<History size={14} />} 
        />
      </section>

      {/* List Content */}
      <div className="flex-1 min-h-[50vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {tab === 'saved' ? (
              saved.length === 0 ? (
                <EmptyState icon={<Bookmark size={32} />} text="Your personal collection of verified products will appear here." />
              ) : (
                <div className="space-y-4 stagger-entrance">
                  {saved.map((p, idx) => (
                    <ProductRow key={p.barcode} product={p} navigate={navigate} delay={idx * 0.05} />
                  ))}
                </div>
              )
            ) : (
              history.length === 0 ? (
                <EmptyState icon={<History size={32} />} text="No scan history available yet. Start scanning to populate this list." />
              ) : (
                <div className="space-y-4 stagger-entrance">
                  {history.map((entry, idx) => (
                    <ProductRow
                      key={entry.barcode}
                      product={entry.product}
                      navigate={navigate}
                      subtitle={formatDate(entry.scanned_at)}
                      delay={idx * 0.05}
                    />
                  ))}
                </div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, label, count, icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
        active ? 'text-brand-primary' : 'text-brand-primary/40'
      }`}
    >
      {active && (
        <motion.div 
          layoutId="activeTab"
          className="absolute inset-0 bg-white rounded-2xl shadow-lg shadow-brand-primary/5 border border-brand-sage/50"
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {label}
        <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold ${active ? 'bg-brand-primary text-white' : 'bg-brand-sage/50 text-brand-primary/40'}`}>
          {count}
        </span>
      </span>
    </button>
  )
}

function ProductRow({ product, navigate, subtitle, delay }: any) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={() => navigate(`/product?barcode=${product.barcode}`)}
      className="w-full editorial-card flex items-center gap-5 group active:scale-[0.99] hover:bg-white"
    >
      <div className="w-16 h-16 bg-brand-cream rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-brand-sage/50 p-3 group-hover:scale-105 transition-transform">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt="" className="w-full h-full object-contain" />
        ) : (
          <span className="text-3xl opacity-20 grayscale">📦</span>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left space-y-0.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">{subtitle ?? (product.brand || 'Original Registry')}</p>
        <p className="text-base font-serif italic text-brand-primary truncate">{product.name}</p>
      </div>
      <div className="w-8 h-8 rounded-full border border-brand-sage flex items-center justify-center text-brand-sage group-hover:text-brand-primary group-hover:border-brand-primary transition-colors">
        <ChevronRight size={16} />
      </div>
    </motion.button>
  )
}

function EmptyState({ icon, text }: any) {
  return (
    <div className="editorial-card py-24 text-center space-y-6 relative overflow-hidden bg-brand-sage/5 border-dashed border-brand-sage">
      <div className="w-20 h-20 glass-panel border-brand-sage rounded-full mx-auto flex items-center justify-center text-brand-accent">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="font-serif text-xl italic text-brand-primary">Archive Empty</h3>
        <p className="text-xs text-brand-primary/40 font-light max-w-[200px] mx-auto leading-relaxed italic">
          {text}
        </p>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' · ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}
