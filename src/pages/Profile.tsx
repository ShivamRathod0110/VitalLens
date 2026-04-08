import { useState } from 'react'
import { useProfileStore } from '../store/profileStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Heart, ShieldAlert, Sparkles, Check } from 'lucide-react'

export default function Profile() {
  const store = useProfileStore()
  const { updateProfile, toggleGoal } = store
  const [allergiesInput, setAllergiesInput] = useState('')

  const foodGoals = [
    { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
    { id: 'weight_loss', label: 'Weight Loss', icon: '⬇️' },
    { id: 'low_sugar', label: 'Low Sugar', icon: '🍬' },
    { id: 'low_sodium', label: 'Low Sodium', icon: '🧂' },
    { id: 'general_health', label: 'General Health', icon: '❤️' }
  ]
  
  const skinTypes = ['sensitive', 'normal', 'oily', 'dry', 'combination']

  const handleAddAllergy = () => {
    const val = allergiesInput.trim().toLowerCase()
    if (val && !store.allergies.includes(val)) {
      updateProfile({
        allergies: [...store.allergies, val],
      })
      setAllergiesInput('')
    }
  }

  const handleRemoveAllergy = (allergy: string) => {
    updateProfile({
      allergies: store.allergies.filter(a => a !== allergy),
    })
  }

  return (
    <div className="flex flex-col px-6 pt-12 pb-32 gap-10">
      
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-brand-primary font-serif italic text-lg">
          <User size={18} />
          <span>Identity</span>
        </div>
        <h1 className="text-5xl font-serif text-brand-primary tracking-tight">Profile</h1>
      </header>

      {/* Nutrition Goals Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <Heart size={20} className="text-brand-primary/40" />
          <h2 className="text-xl font-serif text-brand-primary italic">Nutrition Goals</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {foodGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id as any)}
              className={`editorial-card flex items-center justify-between p-5 transition-all active:scale-[0.98] cursor-pointer touch-manipulation ${
                store.goals.includes(goal.id as any) 
                ? 'bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20' 
                : 'bg-white text-brand-primary'
              }`}
            >
              <div className="flex items-center gap-4 pointer-events-none">
                <span className="text-xl">{goal.icon}</span>
                <span className="font-semibold tracking-tight">{goal.label}</span>
              </div>
              {store.goals.includes(goal.id as any) && <Check size={20} className="text-white pointer-events-none" />}
            </button>
          ))}
        </div>
      </section>

      {/* Allergy Restrictions */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <ShieldAlert size={20} className="text-brand-primary/40" />
          <h2 className="text-xl font-serif text-brand-primary italic">Restrictions</h2>
        </div>

        <div className="editorial-card space-y-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add allergy (e.g. Peanuts)"
              value={allergiesInput}
              onChange={e => setAllergiesInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddAllergy()}
              className="flex-1 bg-brand-sage/30 border border-brand-sage rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-primary/30 transition-all"
            />
            <button
              onClick={handleAddAllergy}
              className="bg-brand-primary text-white px-6 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {store.allergies.map((allergy) => (
                <motion.div
                  key={allergy}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 bg-status-danger border border-red-100 px-4 py-2 rounded-full text-xs font-bold text-red-800"
                >
                  <span className="capitalize">{allergy}</span>
                  <button onClick={() => handleRemoveAllergy(allergy)} className="hover:text-red-900 transition-colors cursor-pointer">
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {store.allergies.length === 0 && (
              <p className="text-xs text-gray-400 font-light italic">No restrictions added yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Cosmetic Preferences */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <Sparkles size={20} className="text-brand-primary/40" />
          <h2 className="text-xl font-serif text-brand-primary italic">Self-Care</h2>
        </div>

        <div className="editorial-card space-y-8">
          {/* Skin Type Selection */}
          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-brand-primary/40 font-bold ml-1">Skin Type</p>
            <div className="flex flex-wrap gap-2">
              {skinTypes.map(skin => (
                <button
                  key={skin}
                  onClick={() => updateProfile({ skinType: skin as any })}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer touch-manipulation ${
                    store.skinType === skin 
                    ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/10' 
                    : 'bg-white text-brand-primary/60 border-brand-sage'
                  }`}
                >
                  <span className="capitalize pointer-events-none">{skin}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Checkbox Preferences */}
          <div className="space-y-4 pt-4 border-t border-brand-sage/30">
            <PreferenceToggle 
              label="Fragrance Free" 
              checked={store.fragranceFree || false} 
              onChange={val => updateProfile({ fragranceFree: val })} 
            />
            <PreferenceToggle 
              label="Essential Oil Free" 
              checked={store.essentialOilFree || false} 
              onChange={val => updateProfile({ essentialOilFree: val })} 
            />
          </div>
        </div>
      </section>

      {/* Information Footer */}
      <footer className="editorial-card bg-brand-sage/20 border-brand-sage/30 text-center py-8">
        <p className="text-xs text-brand-primary/40 leading-relaxed max-w-[220px] mx-auto font-light">
          Your profile data is stored locally and used to calculate your personal score and allergy alerts.
        </p>
      </footer>

    </div>
  )
}

function PreferenceToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <button 
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between group active:scale-[0.99] transition-all"
    >
      <span className="text-sm font-semibold text-brand-primary">{label}</span>
      <div className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-brand-primary' : 'bg-brand-sage'}`}>
        <motion.div 
          animate={{ x: checked ? 24 : 4 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </div>
    </button>
  )
}
