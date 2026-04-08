import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'
import { X, Zap, Globe, Keyboard, Camera as CameraIcon } from 'lucide-react'

type ScanState = 'idle' | 'scanning' | 'error' | 'success'

export default function Scan() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [state, setState] = useState<ScanState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [manualBarcode, setManualBarcode] = useState('')
  const [showManual, setShowManual] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    startScanner()
    return () => stopScanner()
  }, [])

  async function startScanner() {
    setState('scanning')
    setErrorMsg('')

    try {
      readerRef.current = new BrowserMultiFormatReader()
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices()
      
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      )
      
      const selectedDeviceId = backCamera ? backCamera.deviceId : videoInputDevices[0].deviceId

      await readerRef.current.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            setState('success')
            stopScanner() // Stop immediately
            setTimeout(() => {
              navigate(`/product?barcode=${result.getText()}`)
            }, 500)
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error(err)
          }
        }
      )
    } catch (err: any) {
      setState('error')
      if (err?.name === 'NotAllowedError') {
        setErrorMsg('Camera access is required to scan barcodes.')
      } else {
        setErrorMsg('Could not initialize camera.')
      }
    }
  }

  function stopScanner() {
    if (readerRef.current) {
      BrowserMultiFormatReader.releaseAllStreams()
      readerRef.current = null
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (manualBarcode.trim()) {
      stopScanner()
      navigate(`/product?barcode=${manualBarcode.trim()}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-10 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      
      {/* Background Camera Feed */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110 blur-sm brightness-75"
        style={{ filter: state === 'scanning' ? 'none' : 'blur(20px) brightness(0.5)' }}
      />
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${state === 'scanning' ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Top Bar - Dynamic Padding */}
      <div className="relative z-10 p-6 flex items-center justify-between mt-2">
        <button 
          onClick={() => {
            stopScanner()
            navigate(-1)
          }}
          className="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center text-white"
        >
          <X size={24} />
        </button>
        <div className="glass-panel px-4 py-2 rounded-2xl flex items-center gap-2 text-white text-[10px] font-bold uppercase tracking-widest">
          <Globe size={12} className="text-green-400 animate-pulse" />
          Lens Mode
        </div>
        <button className="w-12 h-12 glass-panel rounded-2xl flex items-center justify-center text-white">
          <Zap size={20} />
        </button>
      </div>

      {/* Center Viewfinder */}
      <div className="relative flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {state === 'scanning' && (
            <motion.div 
              key="scanning"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="relative w-full aspect-square max-w-[260px]"
            >
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-3xl shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-3xl shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-3xl shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-3xl shadow-[0_0_15px_rgba(255,255,255,0.3)]" />

              <motion.div 
                animate={{ top: ['5%', '95%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute left-2 right-2 h-0.5 bg-white/80 shadow-[0_0_10px_white] z-10"
              />
              <div className="absolute inset-4 bg-white/5 rounded-2xl backdrop-blur-[1px] border border-white/10" />
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div 
              key="success"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-brand-primary text-3xl shadow-[0_0_40px_white]"
            >
              ✓
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="editorial-card bg-white/90 backdrop-blur-xl p-8 text-center space-y-4 max-w-xs z-[110]"
            >
              <div className="w-16 h-16 bg-status-danger rounded-2xl mx-auto flex items-center justify-center text-red-600">
                <CameraIcon size={32} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl text-brand-primary italic">Camera Error</h3>
                <p className="text-gray-500 text-xs font-light leading-relaxed">{errorMsg}</p>
              </div>
              <button onClick={startScanner} className="btn-primary w-full text-xs py-3 rounded-xl">Retry Camera</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Interface */}
      <div className="relative z-10 p-8 pt-0 mb-4 space-y-6">
        <div className="text-center space-y-1.5">
          <p className="text-white text-lg font-serif italic">Scan Barcode</p>
          <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-bold">Align product within the brackets</p>
        </div>

        <button 
          onClick={() => setShowManual(true)}
          className="w-full h-14 glass-panel rounded-2xl flex items-center justify-center gap-3 text-white active:scale-95 transition-all shadow-lg"
        >
          <Keyboard size={18} />
          <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Enter Manually</span>
        </button>
      </div>

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {showManual && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-[150] bg-brand-cream flex flex-col pt-[env(safe-area-inset-top)]"
          >
            <div className="px-8 flex justify-between items-center py-8">
              <h2 className="text-3xl font-serif text-brand-primary tracking-tight">Lookup</h2>
              <button 
                onClick={() => setShowManual(false)}
                className="w-10 h-10 bg-brand-sage/50 rounded-xl flex items-center justify-center text-brand-primary"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="px-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.2em] text-brand-primary/40 font-bold ml-1">Barcode Identity</label>
                <input 
                  autoFocus
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter barcode number..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="w-full bg-white border border-brand-sage rounded-2xl p-5 text-lg font-serif text-brand-primary placeholder:text-brand-sage focus:outline-none focus:ring-4 focus:ring-brand-primary/5 transition-all shadow-sm"
                />
              </div>
              
              <button type="submit" className="btn-primary w-full text-base py-5 shadow-xl shadow-brand-primary/10">
                Reveal Analysis
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
