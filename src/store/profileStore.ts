import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ProfileState {
  goals: ('muscle_gain' | 'weight_loss' | 'low_sugar' | 'low_sodium' | 'general_health')[]
  allergies: string[]
  skinType?: 'sensitive' | 'normal' | 'oily' | 'dry' | 'combination'
  fragranceFree?: boolean
  essentialOilFree?: boolean
  
  // Physiological data for DV% calculations
  age?: number
  sex?: 'male' | 'female' | 'other'
  weightKg?: number
  activityLevel?: 'sedentary' | 'moderate' | 'active'
}

interface ProfileStore extends ProfileState {
  updateProfile: (updates: Partial<ProfileState>) => void
  toggleGoal: (goalId: ProfileState['goals'][number]) => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      goals: [],
      allergies: [],
      skinType: undefined,
      fragranceFree: false,
      essentialOilFree: false,
      age: undefined,
      sex: undefined,
      weightKg: undefined,
      activityLevel: 'moderate',
      updateProfile: (updates) => set((state) => ({ ...state, ...updates })),
      toggleGoal: (goalId) => set((state) => ({
        goals: state.goals.includes(goalId)
          ? state.goals.filter(g => g !== goalId)
          : [...state.goals, goalId]
      })),
    }),
    {
      name: 'vitallens-profile',
    },
  ),
)
