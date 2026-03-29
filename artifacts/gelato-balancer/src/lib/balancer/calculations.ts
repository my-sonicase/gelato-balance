import { SUGAR_CONSTANTS } from './constants'
import type { Recipe, RecipeBalance, BalanceStatus, ProfileRanges } from './types'

function statusFor(value: number, range: { min: number; max: number }, warningPct = 0.15): BalanceStatus {
  if (value >= range.min && value <= range.max) return 'ok'
  const span = range.max - range.min
  const buffer = span * warningPct
  if (value < range.min) {
    return value >= range.min - buffer ? 'low' : 'low'
  }
  return 'high'
}

export function calculateBalance(recipe: Recipe, ranges: ProfileRanges): RecipeBalance {
  const { lines, overrunPct } = recipe

  if (lines.length === 0) {
    return emptyBalance(overrunPct)
  }

  const totalWeightG = lines.reduce((s, l) => s + l.weightG, 0)
  if (totalWeightG === 0) return emptyBalance(overrunPct)

  let waterG = 0
  let grassiG = 0
  let slngG = 0
  let zuccheriG = 0
  let podTotal = 0
  let pacTotal = 0
  let fruttaG = 0
  let alcoliciG = 0
  let alimentiTritatiG = 0

  for (const line of lines) {
    const { ingredient, weightG } = line
    waterG   += weightG * ingredient.acquaPct / 100
    grassiG  += weightG * ingredient.grassiPct / 100
    slngG    += weightG * ingredient.slngPct / 100

    const sugarTotal = Object.values(ingredient.zuccheri).reduce((s, v) => s + (v ?? 0), 0)
    zuccheriG += weightG * sugarTotal / 100

    if (ingredient.podDirect != null) {
      podTotal += weightG * ingredient.podDirect / 100
    } else {
      for (const [sugarType, sugarPct] of Object.entries(ingredient.zuccheri)) {
        const sugarWeightG = weightG * (sugarPct ?? 0) / 100
        const constants = SUGAR_CONSTANTS[sugarType]
        if (constants) podTotal += sugarWeightG * constants.POD / 100
      }
    }

    if (ingredient.pacDirect != null) {
      pacTotal += weightG * ingredient.pacDirect / 100
    } else {
      for (const [sugarType, sugarPct] of Object.entries(ingredient.zuccheri)) {
        const sugarWeightG = weightG * (sugarPct ?? 0) / 100
        const constants = SUGAR_CONSTANTS[sugarType]
        if (constants) pacTotal += sugarWeightG * constants.PAC / 100
      }
    }

    if (ingredient.group === 'fruttaVerdura') fruttaG += weightG
    if (ingredient.group === 'alcolici') alcoliciG += weightG
    if (ingredient.group === 'alimentiTritati') alimentiTritatiG += weightG
  }

  const altriSolidiG = totalWeightG - waterG - grassiG - slngG - zuccheriG
  const solidiTotaliG = grassiG + slngG + zuccheriG + altriSolidiG

  const grassiPct = grassiG / totalWeightG * 100
  const slngPct   = slngG   / totalWeightG * 100
  const zuccheriPct = zuccheriG / totalWeightG * 100
  const altriSolidiPct = Math.max(0, altriSolidiG / totalWeightG * 100)
  const solidiTotaliPct = solidiTotaliG / totalWeightG * 100
  const acquaPct   = waterG / totalWeightG * 100
  const podValue   = podTotal / totalWeightG * 100
  const pacValue   = pacTotal / totalWeightG * 100
  const fruttaPct  = fruttaG / totalWeightG * 100
  const alcoliciPct= alcoliciG / totalWeightG * 100
  const alimentiTritatiPct = alimentiTritatiG / totalWeightG * 100

  const pesoGelatoG = totalWeightG * (1 + overrunPct / 100)
  const fatKcal = grassiPct * 9
  const sugarKcal = zuccheriPct * 4
  const proteinKcal = slngPct * 0.35 * 4
  const kcalPer100gMix = fatKcal + sugarKcal + proteinKcal
  const kcalPer100gGelato = kcalPer100gMix / (1 + overrunPct / 100)
  const temperaturaServizio = Math.round(-pacValue / 2)

  const outOfRange = [
    statusFor(zuccheriPct, ranges.zuccheri) !== 'ok',
    statusFor(grassiPct, ranges.grassi) !== 'ok',
    statusFor(slngPct, ranges.slng) !== 'ok',
    statusFor(altriSolidiPct, ranges.altriSolidi) !== 'ok',
    statusFor(solidiTotaliPct, ranges.solidiTotali) !== 'ok',
    statusFor(podValue, ranges.pod) !== 'ok',
    statusFor(pacValue, ranges.pac) !== 'ok',
  ].filter(Boolean).length

  const overallStatus =
    outOfRange === 0 ? 'bilanciata' :
    outOfRange <= 2  ? 'quasi-bilanciata' :
    'da-correggere'

  return {
    totalWeightG,
    acquaG: waterG, acquaPct,
    grassiG,  grassiPct,  grassiStatus: statusFor(grassiPct, ranges.grassi),
    slngG,    slngPct,    slngStatus: statusFor(slngPct, ranges.slng),
    zuccheriG,zuccheriPct,zuccheriStatus: statusFor(zuccheriPct, ranges.zuccheri),
    altriSolidiG, altriSolidiPct, altriSolidiStatus: statusFor(altriSolidiPct, ranges.altriSolidi),
    solidiTotaliG, solidiTotaliPct, solidiTotaliStatus: statusFor(solidiTotaliPct, ranges.solidiTotali),
    podValue, podStatus: statusFor(podValue, ranges.pod),
    pacValue, pacStatus: statusFor(pacValue, ranges.pac),
    fruttaPct, fruttaStatus: statusFor(fruttaPct, ranges.frutta),
    alcoliciPct, alcoliciStatus: statusFor(alcoliciPct, ranges.alcolici),
    alimentiTritatiPct, alimentiTritatiStatus: statusFor(alimentiTritatiPct, ranges.alimentiTritati),
    pesoMiscelaG: totalWeightG,
    pesoGelatoG,
    kcalPer100gGelato,
    temperaturaServizio,
    overallStatus,
  }
}

function emptyBalance(overrunPct: number): RecipeBalance {
  return {
    totalWeightG: 0, acquaG: 0, acquaPct: 0,
    grassiG: 0,  grassiPct: 0,  grassiStatus: 'ok',
    slngG: 0,    slngPct: 0,    slngStatus: 'ok',
    zuccheriG: 0,zuccheriPct: 0,zuccheriStatus: 'ok',
    altriSolidiG: 0, altriSolidiPct: 0, altriSolidiStatus: 'ok',
    solidiTotaliG: 0, solidiTotaliPct: 0, solidiTotaliStatus: 'ok',
    podValue: 0, podStatus: 'ok',
    pacValue: 0, pacStatus: 'ok',
    fruttaPct: 0, fruttaStatus: 'ok',
    alcoliciPct: 0, alcoliciStatus: 'ok',
    alimentiTritatiPct: 0, alimentiTritatiStatus: 'ok',
    pesoMiscelaG: 0,
    pesoGelatoG: 0,
    kcalPer100gGelato: 0,
    temperaturaServizio: 0,
    overallStatus: 'da-correggere',
  }
}

export function fmt(n: number, decimals = 1): string {
  return n.toFixed(decimals)
}
