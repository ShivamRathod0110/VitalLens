import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home as HomeIcon, Camera, Search as SearchIcon, Bookmark, User } from 'lucide-react'

// Standard imports instead of lazy to debug blank screen
import Home from './pages/Home'
import Scan from './pages/Scan'
import Search from './pages/Search'
import Saved from './pages/Saved'
import Profile from './pages/Profile'
import Product from './pages/Product'

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

function AppContent() {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-svh max-w-[430px] mx-auto bg-brand-cream selection:bg-brand-accent/30 relative">
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/scan" element={<PageWrapper><Scan /></PageWrapper>} />
            <Route path="/search" element={<PageWrapper><Search /></PageWrapper>} />
            <Route path="/saved" element={<PageWrapper><Saved /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><Profile /></PageWrapper>} />
            <Route path="/product" element={<PageWrapper><Product /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Navigation Blur Gradient */}
      <div className="nav-blur" />

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-[382px] glass-panel border-white/40 rounded-[2.5rem] grid grid-cols-5 items-center h-20 z-50 px-2 shadow-[0_20px_50px_rgba(26,46,34,0.15)]">
        <NavButton to="/" icon={<HomeIcon size={20} />} label="Home" />
        <NavButton to="/search" icon={<SearchIcon size={20} />} label="Search" />
        <NavButton to="/scan" icon={<Camera size={26} strokeWidth={1.5} />} label="Scan" isCenter />
        <NavButton to="/saved" icon={<Bookmark size={20} />} label="Archive" />
        <NavButton to="/profile" icon={<User size={20} />} label="Profile" />
      </nav>
    </div>
  )
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  )
}

function NavButton({ to, icon, label, isCenter }: { to: string; icon: React.ReactNode; label: string; isCenter?: boolean }) {
  const location = useLocation()
  const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <NavLink to={to} className={`flex flex-col items-center justify-center transition-all duration-500 ${
      isActive ? 'text-brand-primary' : 'text-brand-primary/20 hover:text-brand-primary/50'
    } ${isCenter ? '' : 'gap-1.5'}`}>
      {isCenter ? (
        <div className={`w-14 h-14 relative -top-[4px] rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 ${
          isActive ? 'bg-brand-primary text-white shadow-brand-primary/40' : 'bg-white text-brand-primary border border-brand-sage shadow-brand-primary/5'
        }`}>
          {icon}
        </div>
      ) : (
        <>
          <motion.div
            animate={isActive ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
          >
            {icon}
          </motion.div>
          <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}
