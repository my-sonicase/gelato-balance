import type { SystemIngredient, UserCustomIngredient } from '@workspace/db'

export interface IngredientDTO {
  id: string
  nome: string
  nomeEN?: string
  group: string
  acquaPct: number
  grassiPct: number
  slngPct: number
  altriSolidiPct: number
  zuccheri: Record<string, number>
  podDirect?: number
  pacDirect?: number
  minPct?: number
  maxPct?: number
  isCustom?: boolean
  isReadOnly?: boolean
}

function toNum(v: string | null | undefined): number {
  return v == null ? 0 : parseFloat(v)
}

function toNumOpt(v: string | null | undefined): number | undefined {
  return v == null ? undefined : parseFloat(v)
}

export function mapSystemIngredient(row: SystemIngredient): IngredientDTO {
  return {
    id: row.id,
    nome: row.nome,
    nomeEN: row.nomeEN ?? undefined,
    group: row.groupName,
    acquaPct: toNum(row.acquaPct),
    grassiPct: toNum(row.grassiPct),
    slngPct: toNum(row.slngPct),
    altriSolidiPct: toNum(row.altriSolidiPct),
    zuccheri: (row.zuccheri as Record<string, number>) ?? {},
    podDirect: toNumOpt(row.podDirect),
    pacDirect: toNumOpt(row.pacDirect),
    minPct: row.minPct != null ? toNum(row.minPct) : undefined,
    maxPct: row.maxPct != null ? toNum(row.maxPct) : undefined,
    isReadOnly: true,
    isCustom: false,
  }
}

export function mapUserIngredient(row: UserCustomIngredient): IngredientDTO {
  return {
    id: row.id,
    nome: row.nome,
    nomeEN: row.nomeEN ?? undefined,
    group: row.groupName,
    acquaPct: toNum(row.acquaPct),
    grassiPct: toNum(row.grassiPct),
    slngPct: toNum(row.slngPct),
    altriSolidiPct: toNum(row.altriSolidiPct),
    zuccheri: (row.zuccheri as Record<string, number>) ?? {},
    podDirect: toNumOpt(row.podDirect),
    pacDirect: toNumOpt(row.pacDirect),
    minPct: row.minPct != null ? toNum(row.minPct) : undefined,
    maxPct: row.maxPct != null ? toNum(row.maxPct) : undefined,
    isReadOnly: false,
    isCustom: true,
  }
}
