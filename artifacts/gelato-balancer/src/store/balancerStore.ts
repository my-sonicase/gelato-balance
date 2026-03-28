import { create } from 'zustand'
import { DEFAULT_PROFILE_RANGES, DEFAULT_OVERRUN, STORAGE_KEYS } from '../lib/balancer/constants'
import { DEFAULT_INGREDIENTS } from '../lib/balancer/defaultIngredients'
import { calculateBalance } from '../lib/balancer/calculations'
import type {
  IngredientDefinition, Recipe, RecipeLine, RecipeBalance,
  ProfileType, ProfileRanges, ParameterRange, IngredientGroup, TabType
} from '../lib/balancer/types'
import type { Lang } from '../lib/balancer/i18n'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch { /* ignore */ }
}

function newRecipe(profile: ProfileType = 'gelato'): Recipe {
  return {
    id: crypto.randomUUID(),
    nome: '',
    profile,
    lines: [],
    overrunPct: DEFAULT_OVERRUN[profile],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function mergeProfileRanges(saved: Partial<Record<ProfileType, ProfileRanges>>): Record<ProfileType, ProfileRanges> {
  const merged = { ...DEFAULT_PROFILE_RANGES }
  for (const [k, v] of Object.entries(saved)) {
    if (v) merged[k as ProfileType] = v
  }
  return merged
}

interface BalancerStore {
  lang: Lang
  setLang: (lang: Lang) => void

  ingredients: IngredientDefinition[]
  addCustomIngredient: (ing: Omit<IngredientDefinition, 'id' | 'isCustom' | 'isReadOnly'>) => void
  updateCustomIngredient: (id: string, updates: Partial<IngredientDefinition>) => void
  deleteCustomIngredient: (id: string) => void

  profileRanges: Record<ProfileType, ProfileRanges>
  updateProfileRange: (profile: ProfileType, param: keyof ProfileRanges, range: ParameterRange) => void
  resetProfileRanges: (profile: ProfileType) => void

  recipe: Recipe
  balance: RecipeBalance
  activeGroup: IngredientGroup | null
  setActiveGroup: (group: IngredientGroup | null) => void
  addLine: (ingredientId: string, group: IngredientGroup) => void
  updateWeight: (lineId: string, weightG: number) => void
  removeLine: (lineId: string) => void
  setRecipeName: (name: string) => void
  setProfile: (profile: ProfileType) => void
  setOverrun: (pct: number) => void
  clearRecipe: () => void
  loadRecipe: (recipe: Recipe) => void

  activeTab: TabType
  setActiveTab: (tab: TabType) => void

  savedSlots: Record<string, Recipe>
  saveToSlot: (slotName: string) => void
  loadFromSlot: (slotName: string) => void
  deleteSlot: (slotName: string) => void
}

const savedProfileRanges = loadFromStorage<Partial<Record<ProfileType, ProfileRanges>>>(
  STORAGE_KEYS.PROFILE_RANGES, {}
)
const savedCustomIngredients = loadFromStorage<IngredientDefinition[]>(
  STORAGE_KEYS.CUSTOM_INGREDIENTS, []
)
const savedSlots = loadFromStorage<Record<string, Recipe>>(
  STORAGE_KEYS.SAVED_SLOTS, {}
)
const savedLang = loadFromStorage<Lang>(STORAGE_KEYS.LANGUAGE, 'it')
const lastRecipe = loadFromStorage<Recipe | null>(STORAGE_KEYS.LAST_RECIPE, null)

const initialProfileRanges = mergeProfileRanges(savedProfileRanges)
const allIngredients = [...DEFAULT_INGREDIENTS, ...savedCustomIngredients]
const initialRecipe = lastRecipe ?? newRecipe()
const initialBalance = calculateBalance(initialRecipe, initialProfileRanges[initialRecipe.profile])

export const useBalancerStore = create<BalancerStore>((set, get) => ({
  lang: savedLang,
  setLang: (lang) => {
    saveToStorage(STORAGE_KEYS.LANGUAGE, lang)
    set({ lang })
  },

  ingredients: allIngredients,
  addCustomIngredient: (ing) => {
    const newIng: IngredientDefinition = {
      ...ing,
      id: crypto.randomUUID(),
      isCustom: true,
      isReadOnly: false,
    }
    const ingredients = [...get().ingredients, newIng]
    const custom = ingredients.filter(i => i.isCustom)
    saveToStorage(STORAGE_KEYS.CUSTOM_INGREDIENTS, custom)
    set({ ingredients })
  },
  updateCustomIngredient: (id, updates) => {
    const ingredients = get().ingredients.map(i => i.id === id ? { ...i, ...updates } : i)
    const custom = ingredients.filter(i => i.isCustom)
    saveToStorage(STORAGE_KEYS.CUSTOM_INGREDIENTS, custom)
    set({ ingredients })
  },
  deleteCustomIngredient: (id) => {
    const ingredients = get().ingredients.filter(i => i.id !== id)
    const custom = ingredients.filter(i => i.isCustom)
    saveToStorage(STORAGE_KEYS.CUSTOM_INGREDIENTS, custom)
    set({ ingredients })
  },

  profileRanges: initialProfileRanges,
  updateProfileRange: (profile, param, range) => {
    const profileRanges = {
      ...get().profileRanges,
      [profile]: { ...get().profileRanges[profile], [param]: range },
    }
    saveToStorage(STORAGE_KEYS.PROFILE_RANGES, profileRanges)
    const { recipe } = get()
    const balance = calculateBalance(recipe, profileRanges[recipe.profile])
    set({ profileRanges, balance })
  },
  resetProfileRanges: (profile) => {
    const profileRanges = {
      ...get().profileRanges,
      [profile]: DEFAULT_PROFILE_RANGES[profile],
    }
    saveToStorage(STORAGE_KEYS.PROFILE_RANGES, profileRanges)
    const { recipe } = get()
    const balance = calculateBalance(recipe, profileRanges[recipe.profile])
    set({ profileRanges, balance })
  },

  recipe: initialRecipe,
  balance: initialBalance,
  activeGroup: null,
  setActiveGroup: (group) => set({ activeGroup: group }),

  addLine: (ingredientId, _group) => {
    const { recipe, ingredients, profileRanges } = get()
    const ingredient = ingredients.find(i => i.id === ingredientId)
    if (!ingredient) return
    const line: RecipeLine = {
      id: crypto.randomUUID(),
      ingredientId,
      ingredient,
      weightG: 0,
    }
    const updated = { ...recipe, lines: [...recipe.lines, line], updatedAt: new Date().toISOString() }
    const balance = calculateBalance(updated, profileRanges[updated.profile])
    saveToStorage(STORAGE_KEYS.LAST_RECIPE, updated)
    set({ recipe: updated, balance })
  },

  updateWeight: (lineId, weightG) => {
    const { recipe, profileRanges } = get()
    const lines = recipe.lines.map(l => l.id === lineId ? { ...l, weightG } : l)
    const updated = { ...recipe, lines, updatedAt: new Date().toISOString() }
    const balance = calculateBalance(updated, profileRanges[updated.profile])
    saveToStorage(STORAGE_KEYS.LAST_RECIPE, updated)
    set({ recipe: updated, balance })
  },

  removeLine: (lineId) => {
    const { recipe, profileRanges } = get()
    const lines = recipe.lines.filter(l => l.id !== lineId)
    const updated = { ...recipe, lines, updatedAt: new Date().toISOString() }
    const balance = calculateBalance(updated, profileRanges[updated.profile])
    saveToStorage(STORAGE_KEYS.LAST_RECIPE, updated)
    set({ recipe: updated, balance })
  },

  setRecipeName: (nome) => {
    const { recipe, profileRanges } = get()
    const updated = { ...recipe, nome, updatedAt: new Date().toISOString() }
    saveToStorage(STORAGE_KEYS.LAST_RECIPE, updated)
    set({ recipe: updated })
  },

  setProfile: (profile) => {
    const { recipe, profileRanges } = get()
    const updated = {
      ...recipe,
      profile,
      overrunPct: DEFAULT_OVERRUN[profile],
      updatedAt: new Date().toISOString(),
    }
    const balance = calculateBalance(updated, profileRanges[profile])
    saveToStorage(STORAGE_KEYS.LAST_RECIPE, updated)
    set({ recipe: updated, balance })
  },

  setOverrun: (overrunPct) => {
    const { recipe, profileRanges } = get()
    const updated = { ...recipe, overrunPct, updatedAt: new Date().toISOString() }
    const balance = calculateBalance(updated, profileRanges[updated.profile])
    saveToStorage(STORAGE_KEYS.LAST_RECIPE, updated)
    set({ recipe: updated, balance })
  },

  clearRecipe: () => {
    const { recipe, profileRanges } = get()
    const fresh = newRecipe(recipe.profile)
    const balance = calculateBalance(fresh, profileRanges[fresh.profile])
    saveToStorage(STORAGE_KEYS.LAST_RECIPE, fresh)
    set({ recipe: fresh, balance })
  },

  loadRecipe: (recipe: Recipe) => {
    const { profileRanges } = get()
    const balance = calculateBalance(recipe, profileRanges[recipe.profile])
    saveToStorage(STORAGE_KEYS.LAST_RECIPE, recipe)
    set({ recipe, balance, activeTab: 'bilanciamento' })
  },

  activeTab: 'bilanciamento',
  setActiveTab: (activeTab) => set({ activeTab }),

  savedSlots,
  saveToSlot: (slotName) => {
    const { recipe } = get()
    const slot = { ...recipe, slotName, updatedAt: new Date().toISOString() }
    const slots = { ...get().savedSlots, [slotName]: slot }
    saveToStorage(STORAGE_KEYS.SAVED_SLOTS, slots)
    set({ savedSlots: slots })
  },
  loadFromSlot: (slotName) => {
    const { savedSlots, profileRanges } = get()
    const recipe = savedSlots[slotName]
    if (!recipe) return
    const balance = calculateBalance(recipe, profileRanges[recipe.profile])
    saveToStorage(STORAGE_KEYS.LAST_RECIPE, recipe)
    set({ recipe, balance, activeTab: 'bilanciamento' })
  },
  deleteSlot: (slotName) => {
    const slots = { ...get().savedSlots }
    delete slots[slotName]
    saveToStorage(STORAGE_KEYS.SAVED_SLOTS, slots)
    set({ savedSlots: slots })
  },
}))
