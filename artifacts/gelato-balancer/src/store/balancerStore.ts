import { create } from 'zustand'
import { DEFAULT_PROFILE_RANGES, DEFAULT_OVERRUN, STORAGE_KEYS } from '../lib/balancer/constants'
import { DEFAULT_INGREDIENTS } from '../lib/balancer/defaultIngredients'
import { calculateBalance } from '../lib/balancer/calculations'
import type {
  IngredientDefinition, Recipe, RecipeLine, RecipeBalance,
  ProfileType, ProfileRanges, ParameterRange, IngredientGroup, TabType
} from '../lib/balancer/types'
import type { Lang } from '../lib/balancer/i18n'

// ---------------------------------------------------------------------------
// localStorage helpers (profile ranges + active recipe for session restore)
// ---------------------------------------------------------------------------
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch { return fallback }
}
function saveToStorage<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
const API = (path: string) => `/api${path}`

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(API(path), {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!r.ok) {
    const body = await r.json().catch(() => ({ error: r.statusText }))
    throw new Error((body as { error?: string }).error ?? r.statusText)
  }
  return r.json() as Promise<T>
}

// ---------------------------------------------------------------------------
// Recipe line resolution
// ---------------------------------------------------------------------------
function resolveLines(
  rawLines: Array<{ ingredientId: string; weightG: number }>,
  ingredients: IngredientDefinition[],
): RecipeLine[] {
  return rawLines.flatMap(({ ingredientId, weightG }) => {
    const ingredient = ingredients.find(i => i.id === ingredientId)
    if (!ingredient) return []
    return [{ id: crypto.randomUUID(), ingredientId, ingredient, weightG }]
  })
}

type ApiIngredient = Omit<IngredientDefinition, 'zuccheri' | 'grassiPct' | 'acquaPct' | 'slngPct' | 'altriSolidiPct'> & {
  acquaPct: string; grassiPct: string; slngPct: string; altriSolidiPct: string
  zuccheri: Record<string, number>
  isCustom: boolean; isReadOnly?: boolean; isArchived?: boolean
  minPct?: string; maxPct?: string
}

type ApiRecipe = {
  id: string; nome: string; profile: ProfileType; overrunPct: string
  thumbnail?: string; isSystemRecipe: boolean
  lines: Array<{ ingredientId: string; weightG: number }>
  createdAt: string; updatedAt: string
}

function mapApiIngredient(ai: ApiIngredient): IngredientDefinition {
  return {
    id: ai.id, nome: ai.nome, nomeEN: ai.nomeEN, groupName: ai.groupName,
    acquaPct: Number(ai.acquaPct), grassiPct: Number(ai.grassiPct),
    slngPct: Number(ai.slngPct), altriSolidiPct: Number(ai.altriSolidiPct),
    zuccheri: ai.zuccheri,
    isCustom: ai.isCustom, isReadOnly: ai.isReadOnly ?? false,
    minPct: ai.minPct !== undefined ? Number(ai.minPct) : undefined,
    maxPct: ai.maxPct !== undefined ? Number(ai.maxPct) : undefined,
  }
}

function mapApiRecipe(ar: ApiRecipe, ingredients: IngredientDefinition[]): Recipe {
  return {
    id: ar.id, nome: ar.nome, profile: ar.profile,
    overrunPct: Number(ar.overrunPct),
    thumbnail: ar.thumbnail,
    isSystemRecipe: ar.isSystemRecipe,
    lines: resolveLines(ar.lines, ingredients),
    createdAt: ar.createdAt, updatedAt: ar.updatedAt,
  }
}

// ---------------------------------------------------------------------------
// Store helpers
// ---------------------------------------------------------------------------
function newRecipe(profile: ProfileType = 'gelato'): Recipe {
  return {
    id: crypto.randomUUID(), nome: '', profile, lines: [],
    overrunPct: DEFAULT_OVERRUN[profile],
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  }
}
function mergeProfileRanges(saved: Partial<Record<ProfileType, ProfileRanges>>): Record<ProfileType, ProfileRanges> {
  const merged = { ...DEFAULT_PROFILE_RANGES }
  for (const [k, v] of Object.entries(saved)) {
    if (v) merged[k as ProfileType] = v
  }
  return merged
}

// ---------------------------------------------------------------------------
// Initial (local-storage) state
// ---------------------------------------------------------------------------
const savedProfileRanges = loadFromStorage<Partial<Record<ProfileType, ProfileRanges>>>(STORAGE_KEYS.PROFILE_RANGES, {})
const savedLang = loadFromStorage<Lang>(STORAGE_KEYS.LANGUAGE, 'it')
const lastRecipe = loadFromStorage<Recipe | null>(STORAGE_KEYS.LAST_RECIPE, null)

const initialProfileRanges = mergeProfileRanges(savedProfileRanges)
const initialRecipe = lastRecipe ?? newRecipe()
const initialBalance = calculateBalance(initialRecipe, initialProfileRanges[initialRecipe.profile])

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------
interface BalancerStore {
  lang: Lang
  setLang: (lang: Lang) => void

  // API state
  isLoadingData: boolean
  dataError: string | null
  loadAppData: () => Promise<void>

  // Ingredients (API-backed)
  ingredients: IngredientDefinition[]
  addCustomIngredient: (ing: Omit<IngredientDefinition, 'id' | 'isCustom' | 'isReadOnly'>) => Promise<void>
  updateCustomIngredient: (id: string, updates: Partial<IngredientDefinition>) => Promise<void>
  deleteCustomIngredient: (id: string) => Promise<void>

  // Profile ranges (localStorage)
  profileRanges: Record<ProfileType, ProfileRanges>
  updateProfileRange: (profile: ProfileType, param: keyof ProfileRanges, range: ParameterRange) => void
  resetProfileRanges: (profile: ProfileType) => void

  // Active recipe (client-side)
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

  // Navigation
  activeTab: TabType
  setActiveTab: (tab: TabType) => void

  // Saved recipes (API-backed)
  savedRecipes: Recipe[]
  saveToSlot: (slotName: string, thumbnail?: string) => Promise<string | null>
  deleteSlot: (id: string) => Promise<void>
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
export const useBalancerStore = create<BalancerStore>((set, get) => ({
  lang: savedLang,
  setLang: (lang) => {
    saveToStorage(STORAGE_KEYS.LANGUAGE, lang)
    set({ lang })
  },

  // -- API state --
  isLoadingData: false,
  dataError: null,

  loadAppData: async () => {
    set({ isLoadingData: true, dataError: null })
    try {
      const [rawIngredients, rawRecipes] = await Promise.all([
        apiFetch<ApiIngredient[]>('/ingredients'),
        apiFetch<ApiRecipe[]>('/user/recipes'),
      ])
      const ingredients = rawIngredients.map(mapApiIngredient)
      const savedRecipes = rawRecipes.map(r => mapApiRecipe(r, ingredients))
      // Restore last active recipe (re-resolve ingredient refs with fresh ingredients)
      const last = lastRecipe
      const recipe = last
        ? { ...last, lines: resolveLines(last.lines.map(l => ({ ingredientId: l.ingredientId, weightG: l.weightG })), ingredients) }
        : get().recipe
      const balance = calculateBalance(recipe, get().profileRanges[recipe.profile])
      set({ ingredients, savedRecipes, recipe, balance, isLoadingData: false })
    } catch (err) {
      console.error('Failed to load app data from API, falling back to defaults:', err)
      // Fall back to hardcoded ingredients so the balance tool still works
      set({ ingredients: DEFAULT_INGREDIENTS, isLoadingData: false, dataError: String(err) })
    }
  },

  // -- Ingredients --
  ingredients: DEFAULT_INGREDIENTS,

  addCustomIngredient: async (ing) => {
    try {
      const created = await apiFetch<ApiIngredient>('/user/ingredients', {
        method: 'POST',
        body: JSON.stringify(ing),
      })
      const newIng = mapApiIngredient(created)
      set(s => ({ ingredients: [...s.ingredients, newIng] }))
    } catch (err) { console.error('addCustomIngredient failed:', err) }
  },

  updateCustomIngredient: async (id, updates) => {
    try {
      const updated = await apiFetch<ApiIngredient>(`/user/ingredients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      })
      const newIng = mapApiIngredient(updated)
      set(s => ({ ingredients: s.ingredients.map(i => i.id === id ? newIng : i) }))
    } catch (err) { console.error('updateCustomIngredient failed:', err) }
  },

  deleteCustomIngredient: async (id) => {
    try {
      await apiFetch(`/user/ingredients/${id}`, { method: 'DELETE' })
      set(s => ({ ingredients: s.ingredients.filter(i => i.id !== id) }))
    } catch (err) { console.error('deleteCustomIngredient failed:', err) }
  },

  // -- Profile ranges --
  profileRanges: initialProfileRanges,
  updateProfileRange: (profile, param, range) => {
    const profileRanges = { ...get().profileRanges, [profile]: { ...get().profileRanges[profile], [param]: range } }
    saveToStorage(STORAGE_KEYS.PROFILE_RANGES, profileRanges)
    const { recipe } = get()
    const balance = calculateBalance(recipe, profileRanges[recipe.profile])
    set({ profileRanges, balance })
  },
  resetProfileRanges: (profile) => {
    const profileRanges = { ...get().profileRanges, [profile]: DEFAULT_PROFILE_RANGES[profile] }
    saveToStorage(STORAGE_KEYS.PROFILE_RANGES, profileRanges)
    const { recipe } = get()
    const balance = calculateBalance(recipe, profileRanges[recipe.profile])
    set({ profileRanges, balance })
  },

  // -- Active recipe --
  recipe: initialRecipe,
  balance: initialBalance,
  activeGroup: null,
  setActiveGroup: (group) => set({ activeGroup: group }),

  addLine: (ingredientId, _group) => {
    const { recipe, ingredients, profileRanges } = get()
    const ingredient = ingredients.find(i => i.id === ingredientId)
    if (!ingredient) return
    const line: RecipeLine = { id: crypto.randomUUID(), ingredientId, ingredient, weightG: 0 }
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
    const { recipe } = get()
    const updated = { ...recipe, nome, updatedAt: new Date().toISOString() }
    saveToStorage(STORAGE_KEYS.LAST_RECIPE, updated)
    set({ recipe: updated })
  },

  setProfile: (profile) => {
    const { recipe, profileRanges } = get()
    const updated = { ...recipe, profile, overrunPct: DEFAULT_OVERRUN[profile], updatedAt: new Date().toISOString() }
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

  // -- Navigation --
  activeTab: 'gelatiSalvati',
  setActiveTab: (activeTab) => set({ activeTab }),

  // -- Saved recipes (API) --
  savedRecipes: [],

  saveToSlot: async (slotName, thumbnail) => {
    const { recipe, savedRecipes } = get()
    const payload = {
      nome: slotName || recipe.nome,
      profile: recipe.profile,
      overrunPct: String(recipe.overrunPct),
      thumbnail: thumbnail ?? recipe.thumbnail,
      lines: recipe.lines.map(l => ({ ingredientId: l.ingredientId, weightG: l.weightG })),
    }
    try {
      const existing = savedRecipes.find(r => !r.isSystemRecipe && r.nome === (slotName || recipe.nome))
      let saved: ApiRecipe
      if (existing) {
        saved = await apiFetch<ApiRecipe>(`/user/recipes/${existing.id}`, {
          method: 'PATCH', body: JSON.stringify(payload),
        })
      } else {
        saved = await apiFetch<ApiRecipe>('/user/recipes', {
          method: 'POST', body: JSON.stringify(payload),
        })
      }
      const { ingredients } = get()
      const mapped = mapApiRecipe(saved, ingredients)
      set(s => ({
        savedRecipes: existing
          ? s.savedRecipes.map(r => r.id === existing.id ? mapped : r)
          : [...s.savedRecipes, mapped],
      }))
      return null
    } catch (err) {
      console.error('saveToSlot failed:', err)
      return String(err)
    }
  },

  deleteSlot: async (id) => {
    try {
      await apiFetch(`/user/recipes/${id}`, { method: 'DELETE' })
      set(s => ({ savedRecipes: s.savedRecipes.filter(r => r.id !== id) }))
    } catch (err) { console.error('deleteSlot failed:', err) }
  },
}))
