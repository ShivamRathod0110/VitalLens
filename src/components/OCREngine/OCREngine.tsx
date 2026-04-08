import { useState, useRef } from 'react'
import { createWorker } from 'tesseract.js'
import { motion } from 'framer-motion'
import { Camera, Loader2, Check, AlertCircle, X, Sparkles } from 'lucide-react'
import { parseNutritionFromOCR } from '../../lib/ocrScorer'
import type { Product } from '../../types/product'

interface Props {
  barcode: string
  onResult: (data: Partial<Product>) => void
  onCancel: () => void
}

export default function OCREngine({ barcode, onResult, onCancel }: Props) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [ocrData, setOcrData] = useState<Partial<Product> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = async (file: File) => {
    setLoading(true)
    setError(null)
    setOcrData(null)
    try {
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100))
          }
        }
      })
      
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      
      const result = parseNutritionFromOCR(text, barcode)
      setOcrData(result)
    } catch (err) {
      console.error('OCR Error:', err)
      setError('Failed to read the label. Please ensure the photo is clear.')
    } finally {
      setLoading(false)
    }
  }

  const handleContribute = () => {
    if (ocrData) {
      onResult({
        ...ocrData,
        dataSource: 'community',
        dataQuality: 'partial'
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  return (
    <div className="fixed inset-0 z-[60] bg-brand-cream flex flex-col p-6 overflow-y-auto">
      <header className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-serif text-brand-primary italic">Label Analysis</h2>
        <button onClick={onCancel} className="p-3 glass-panel border-brand-sage rounded-2xl text-brand-primary">
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
        <div className="w-32 h-32 glass-panel border-brand-accent/20 rounded-full flex items-center justify-center text-brand-primary shadow-2xl relative">
          <div className="absolute inset-0 bg-brand-accent/5 rounded-full blur-2xl -z-10" />
          {loading ? (
            <div className="relative">
              <Loader2 className="animate-spin text-brand-accent" size={48} strokeWidth={1.5} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-brand-primary">
                {progress}%
              </span>
            </div>
          ) : ocrData ? (
            <Check size={48} className="text-brand-accent" strokeWidth={1.5} />
          ) : (
            <Camera size={48} strokeWidth={1.2} />
          )}
        </div>

        <div className="text-center space-y-3 max-w-[280px]">
          <h3 className="text-2xl font-serif italic text-brand-primary">
            {loading ? 'Reading DNA…' : ocrData ? 'Archive Deciphered' : 'Capture Registry Entry'}
          </h3>
          <p className="text-xs text-brand-primary/40 leading-relaxed uppercase tracking-widest font-light">
            {loading 
              ? 'Analyzing chemical composition' 
              : ocrData 
                ? 'We found ingredients and macros.' 
                : 'Position the nutrition facts clearly'}
          </p>
        </div>

        {!loading && !ocrData && (
          <div className="w-full space-y-4 pt-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary w-full flex items-center justify-center gap-3"
            >
              <Camera size={20} />
              Begin Analysis
            </button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              hidden 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </div>
        )}

        {ocrData && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-4 pt-4"
          >
            <div className="editorial-card p-5 space-y-3 bg-white/50 border-brand-accent/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-accent">Detected Data</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-brand-sage/50 px-2 py-1 rounded text-[10px] font-bold">{ocrData.category?.toUpperCase()}</span>
                <span className="bg-brand-sage/50 px-2 py-1 rounded text-[10px] font-bold">{ocrData.ingredients?.length} INGREDIENTS</span>
                {ocrData.nutritionPer100g && <span className="bg-brand-sage/50 px-2 py-1 rounded text-[10px] font-bold">NUTRITION DATA</span>}
              </div>
            </div>
            <button 
              onClick={handleContribute}
              className="btn-primary w-full flex items-center justify-center gap-3 bg-brand-accent"
            >
              <Check size={20} />
              Contribute to Registry
            </button>
            <button 
              onClick={() => setOcrData(null)}
              className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-brand-primary/30"
            >
              Retake Photo
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-status-danger border border-red-100 rounded-3xl flex items-start gap-4"
          >
            <AlertCircle size={20} className="text-red-600 shrink-0" />
            <p className="text-xs text-red-900 font-medium leading-relaxed italic">{error}</p>
          </motion.div>
        )}
      </div>

      <footer className="pt-8 border-t border-brand-sage/30 mt-auto">
        <div className="flex items-center gap-4 p-5 glass-panel border-brand-accent/10 rounded-3xl">
          <Sparkles size={18} className="text-brand-accent shrink-0" />
          <p className="text-[10px] text-brand-primary/60 font-medium leading-relaxed italic">
            Provisional data is generated locally via neural OCR. You can verify and adjust details once saved.
          </p>
        </div>
      </footer>
    </div>
  )
}
