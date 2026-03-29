export type SugarType =
  | 'saccarosio' | 'destrosio' | 'fruttosio' | 'invertito' | 'lattosio'
  | 'miele' | 'trealosio' | 'isofruttosio' | 'maltitolo' | 'sorbitolo'
  | 'mannitolo' | 'xilitolo' | 'eritritolo' | 'tagatosio' | 'stevia'
  | 'glicrizina' | 'glucosioAt21DE' | 'glucosioAt39DE' | 'glucosioAt42DE'
  | 'glucosioAt52DE' | 'maltodestrina5DE' | 'maltodestrina18DE' | 'maltodestrina20DE'

export type ProfileType =
  | 'gelato' | 'sorbetto' | 'granita' | 'vegan' | 'gastronomico'
  | 'personalizzato1' | 'personalizzato2'

export type IngredientGroup =
  | 'latticiniUova' | 'neutriBasi' | 'zuccheri' | 'ingredientiPrincipali'
  | 'fruttaVerdura' | 'alcolici' | 'alimentiTritati'

export type TabType = 'istruzioni' | 'configurazione' | 'bilanciamento' | 'gelatiSalvati' | 'calcolatori' | 'ingredienti'

export interface IngredientDefinition {
  id: string
  nome: string
  group: IngredientGroup
  acquaPct: number
  grassiPct: number
  slngPct: number
  zuccheri: Partial<Record<SugarType, number>>
  altriSolidiPct: number
  minPct?: number
  maxPct?: number
  isCustom?: boolean
  isReadOnly?: boolean
}

export interface RecipeLine {
  id: string
  ingredientId: string
  ingredient: IngredientDefinition
  weightG: number
}

export interface ParameterRange {
  min: number
  max: number
}

export interface ProfileRanges {
  zuccheri: ParameterRange
  grassi: ParameterRange
  slng: ParameterRange
  altriSolidi: ParameterRange
  solidiTotali: ParameterRange
  pod: ParameterRange
  pac: ParameterRange
  frutta: ParameterRange
  alcolici: ParameterRange
  overrun: ParameterRange
  alimentiTritati: ParameterRange
}

export interface Recipe {
  id: string
  nome: string
  profile: ProfileType
  lines: RecipeLine[]
  overrunPct: number
  slotName?: string
  notes?: string
  thumbnail?: string
  createdAt: string
  updatedAt: string
}

export type BalanceStatus = 'low' | 'ok' | 'high'

export interface RecipeBalance {
  totalWeightG: number
  acquaG: number;        acquaPct: number
  grassiG: number;       grassiPct: number;       grassiStatus: BalanceStatus
  slngG: number;         slngPct: number;         slngStatus: BalanceStatus
  zuccheriG: number;     zuccheriPct: number;     zuccheriStatus: BalanceStatus
  altriSolidiG: number;  altriSolidiPct: number;  altriSolidiStatus: BalanceStatus
  solidiTotaliG: number; solidiTotaliPct: number; solidiTotaliStatus: BalanceStatus
  podValue: number;      podStatus: BalanceStatus
  pacValue: number;      pacStatus: BalanceStatus
  fruttaPct: number;     fruttaStatus: BalanceStatus
  alcoliciPct: number;   alcoliciStatus: BalanceStatus
  alimentiTritatiPct: number; alimentiTritatiStatus: BalanceStatus
  pesoMiscelaG: number
  pesoGelatoG: number
  kcalPer100gGelato: number
  temperaturaServizio: number
  overallStatus: 'bilanciata' | 'quasi-bilanciata' | 'da-correggere'
}
