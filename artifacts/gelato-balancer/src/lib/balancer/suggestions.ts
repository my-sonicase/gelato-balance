import type { RecipeBalance, ProfileRanges } from './types'

export interface Suggestion {
  param: string
  severity: 'ok' | 'warning' | 'error'
  textIT: string
  textEN: string
}

function grams(pctDiff: number, total: number): number {
  return Math.abs(Math.round((pctDiff / 100) * total))
}

export function generateSuggestions(
  balance: RecipeBalance,
  ranges: ProfileRanges,
): Suggestion[] {
  const suggestions: Suggestion[] = []
  const tot = balance.totalWeightG

  if (tot < 50) {
    return [{
      param: 'general',
      severity: 'warning',
      textIT: 'Aggiungi ingredienti per iniziare il bilanciamento.',
      textEN: 'Add ingredients to start balancing.',
    }]
  }

  // Zuccheri
  if (balance.zuccheriStatus !== 'ok') {
    const mid = (ranges.zuccheri.min + ranges.zuccheri.max) / 2
    const diff = balance.zuccheriPct - mid
    if (diff > 0) {
      const g = grams(diff, tot)
      suggestions.push({
        param: 'zuccheri',
        severity: 'error',
        textIT: `Zuccheri al ${balance.zuccheriPct.toFixed(1)}% (max ${ranges.zuccheri.max}%). Riduci saccarosio o destrosio di ~${g}g.`,
        textEN: `Sugars at ${balance.zuccheriPct.toFixed(1)}% (max ${ranges.zuccheri.max}%). Reduce sucrose or dextrose by ~${g}g.`,
      })
    } else {
      const g = grams(-diff, tot)
      suggestions.push({
        param: 'zuccheri',
        severity: 'error',
        textIT: `Zuccheri al ${balance.zuccheriPct.toFixed(1)}% (min ${ranges.zuccheri.min}%). Aggiungi ~${g}g di saccarosio.`,
        textEN: `Sugars at ${balance.zuccheriPct.toFixed(1)}% (min ${ranges.zuccheri.min}%). Add ~${g}g of sucrose.`,
      })
    }
  }

  // Grassi
  if (balance.grassiStatus !== 'ok' && ranges.grassi.max > 0) {
    const mid = (ranges.grassi.min + ranges.grassi.max) / 2
    const diff = balance.grassiPct - mid
    if (diff > 0) {
      const g = grams(diff, tot)
      suggestions.push({
        param: 'grassi',
        severity: 'error',
        textIT: `Grassi al ${balance.grassiPct.toFixed(1)}% (max ${ranges.grassi.max}%). Riduci panna o burro di ~${g}g.`,
        textEN: `Fat at ${balance.grassiPct.toFixed(1)}% (max ${ranges.grassi.max}%). Reduce cream or butter by ~${g}g.`,
      })
    } else {
      const g = grams(-diff, tot)
      suggestions.push({
        param: 'grassi',
        severity: 'error',
        textIT: `Grassi al ${balance.grassiPct.toFixed(1)}% (min ${ranges.grassi.min}%). Aggiungi ~${g}g di panna 35%.`,
        textEN: `Fat at ${balance.grassiPct.toFixed(1)}% (min ${ranges.grassi.min}%). Add ~${g}g of 35% cream.`,
      })
    }
  }

  // SLNG
  if (balance.slngStatus !== 'ok' && ranges.slng.max > 0) {
    const mid = (ranges.slng.min + ranges.slng.max) / 2
    const diff = balance.slngPct - mid
    if (diff > 0) {
      const g = grams(diff, tot)
      suggestions.push({
        param: 'slng',
        severity: 'error',
        textIT: `SLNG al ${balance.slngPct.toFixed(1)}% (max ${ranges.slng.max}%). Riduci latte o LPS di ~${g}g.`,
        textEN: `MSNF at ${balance.slngPct.toFixed(1)}% (max ${ranges.slng.max}%). Reduce milk or skim milk powder by ~${g}g.`,
      })
    } else {
      const g = grams(-diff, tot)
      suggestions.push({
        param: 'slng',
        severity: 'error',
        textIT: `SLNG al ${balance.slngPct.toFixed(1)}% (min ${ranges.slng.min}%). Aggiungi ~${g}g di LPS (latte in polvere scremato).`,
        textEN: `MSNF at ${balance.slngPct.toFixed(1)}% (min ${ranges.slng.min}%). Add ~${g}g of skim milk powder (LPS).`,
      })
    }
  }

  // PAC
  if (balance.pacStatus !== 'ok') {
    const mid = (ranges.pac.min + ranges.pac.max) / 2
    const diff = balance.pacValue - mid
    if (diff > 0) {
      suggestions.push({
        param: 'pac',
        severity: 'error',
        textIT: `PAC ${balance.pacValue.toFixed(1)} (troppo alto, max ${ranges.pac.max}). Il gelato sarà troppo morbido. Sostituisci parte del destrosio con saccarosio.`,
        textEN: `PAC ${balance.pacValue.toFixed(1)} (too high, max ${ranges.pac.max}). Gelato will be too soft. Replace some dextrose with sucrose.`,
      })
    } else {
      suggestions.push({
        param: 'pac',
        severity: 'error',
        textIT: `PAC ${balance.pacValue.toFixed(1)} (troppo basso, min ${ranges.pac.min}). Il gelato sarà troppo duro. Aggiungi destrosio o riduci saccarosio.`,
        textEN: `PAC ${balance.pacValue.toFixed(1)} (too low, min ${ranges.pac.min}). Gelato will be too hard. Add dextrose or reduce sucrose.`,
      })
    }
  }

  // Solidi totali
  if (balance.solidiTotaliStatus !== 'ok') {
    const mid = (ranges.solidiTotali.min + ranges.solidiTotali.max) / 2
    const diff = balance.solidiTotaliPct - mid
    if (diff > 0) {
      suggestions.push({
        param: 'solidiTotali',
        severity: 'warning',
        textIT: `Solidi totali al ${balance.solidiTotaliPct.toFixed(1)}% (max ${ranges.solidiTotali.max}%). Aumenta la quota acqua (latte, acqua) o riduci i solidi.`,
        textEN: `Total solids at ${balance.solidiTotaliPct.toFixed(1)}% (max ${ranges.solidiTotali.max}%). Increase water content (milk, water) or reduce solids.`,
      })
    } else {
      suggestions.push({
        param: 'solidiTotali',
        severity: 'warning',
        textIT: `Solidi totali al ${balance.solidiTotaliPct.toFixed(1)}% (min ${ranges.solidiTotali.min}%). Riduci la parte acquosa o aggiungi solidi (LPS, zuccheri).`,
        textEN: `Total solids at ${balance.solidiTotaliPct.toFixed(1)}% (min ${ranges.solidiTotali.min}%). Reduce water content or add more solids (LPS, sugars).`,
      })
    }
  }

  // POD
  if (balance.podStatus !== 'ok') {
    const mid = (ranges.pod.min + ranges.pod.max) / 2
    const diff = balance.podValue - mid
    if (diff > 0) {
      suggestions.push({
        param: 'pod',
        severity: 'warning',
        textIT: `POD ${balance.podValue.toFixed(1)} (troppo dolce, max ${ranges.pod.max}). Riduci fruttosio o destrosio, usa trealosio o maltodestrine.`,
        textEN: `POD ${balance.podValue.toFixed(1)} (too sweet, max ${ranges.pod.max}). Reduce fructose or dextrose; use trehalose or maltodextrins.`,
      })
    } else {
      suggestions.push({
        param: 'pod',
        severity: 'warning',
        textIT: `POD ${balance.podValue.toFixed(1)} (non abbastanza dolce, min ${ranges.pod.min}). Aggiungi saccarosio o destrosio.`,
        textEN: `POD ${balance.podValue.toFixed(1)} (not sweet enough, min ${ranges.pod.min}). Add sucrose or dextrose.`,
      })
    }
  }

  if (suggestions.length === 0) {
    suggestions.push({
      param: 'ok',
      severity: 'ok',
      textIT: 'Ricetta bilanciata. Tutti i parametri rientrano nei valori di riferimento.',
      textEN: 'Balanced recipe. All parameters are within reference values.',
    })
  }

  return suggestions
}
