export type Goal =
  | 'general_health'
  | 'weight_loss'
  | 'muscle_gain'
  | 'low_sugar'
  | 'low_sodium'

export type Profile = {
  goal: Goal | null
  allergies: string[]
  isVegan: boolean
  isVegetarian: boolean
}

export const EMPTY_PROFILE: Profile = {
  goal: null,
  allergies: [],
  isVegan: false,
  isVegetarian: false,
}