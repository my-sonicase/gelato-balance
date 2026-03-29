import { useState } from 'react'
import { useBalancerStore } from '../../store/balancerStore'
import { TRANSLATIONS, type Lang } from '../../lib/balancer/i18n'
import type { IngredientDefinition, Recipe, IngredientGroup } from '../../lib/balancer/types'
import type { DefaultRecipeTemplate } from '../../lib/balancer/defaultRecipeData'
import { buildRecipeFromTemplate, getTemplateName } from '../../lib/balancer/defaultRecipeData'

function ingName(ing: IngredientDefinition, lang: Lang): string {
  return lang === 'en' && ing.nomeEN ? ing.nomeEN : ing.nome
}

interface Props {
  recipe: Recipe | null
  template: DefaultRecipeTemplate | null
  lang: Lang
  onBack: () => void
  onImport: () => void
}

const QUANTITY_PRESETS = [500, 1000, 2000, 3000, 5000, 10000, 16000]

const GROUP_ORDER: IngredientGroup[] = [
  'latticiniUova', 'neutriBasi', 'zuccheri', 'ingredientiPrincipali',
  'fruttaVerdura', 'alcolici', 'alimentiTritati',
]

function formatWeight(g: number): string {
  if (g >= 1000) return `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 2)} kg`
  return `${Math.round(g)} g`
}

export default function RecipeDetailView({ recipe: recipeProp, template, lang, onBack, onImport }: Props) {
  const { ingredients, loadRecipe } = useBalancerStore()
  const t = TRANSLATIONS[lang]

  // Build recipe from template if only template provided
  const recipe: Recipe = recipeProp ?? buildRecipeFromTemplate(template!, ingredients)

  const baseWeight = recipe.lines.reduce((s, l) => s + l.weightG, 0)
  const [targetG, setTargetG] = useState(baseWeight > 0 ? Math.round(baseWeight) : 1000)
  const [customInput, setCustomInput] = useState(String(Math.round(targetG)))

  const scale = baseWeight > 0 ? targetG / baseWeight : 1

  const isDefault = template !== null
  const displayName = template ? getTemplateName(template, lang) : recipe.nome || (lang === 'it' ? 'Ricetta senza nome' : 'Unnamed recipe')
  const imageUrl = template?.imageUrl

  const PROFILE_LABELS: Record<string, string> = {
    gelato: t.profiles.gelato,
    sorbetto: t.profiles.sorbetto,
    granita: t.profiles.granita,
    vegan: t.profiles.vegan,
    gastronomico: t.profiles.gastronomico,
    personalizzato1: t.profiles.personalizzato1,
    personalizzato2: t.profiles.personalizzato2,
  }

  const GROUP_LABELS: Record<IngredientGroup, string> = {
    latticiniUova: t.groups.latticiniUova,
    neutriBasi: t.groups.neutriBasi,
    zuccheri: t.groups.zuccheri,
    ingredientiPrincipali: t.groups.ingredientiPrincipali,
    fruttaVerdura: t.groups.fruttaVerdura,
    alcolici: t.groups.alcolici,
    alimentiTritati: t.groups.alimentiTritati,
  }

  // Group lines
  const grouped: Partial<Record<IngredientGroup, typeof recipe.lines>> = {}
  for (const line of recipe.lines) {
    const g = line.ingredient.group
    if (!grouped[g]) grouped[g] = []
    grouped[g]!.push(line)
  }

  function handleImport() {
    const importRecipe: Recipe = {
      ...recipe,
      id: crypto.randomUUID(),
      nome: isDefault ? (lang === 'it' ? `${displayName} (copia)` : `${displayName} (copy)`) : recipe.nome,
      updatedAt: new Date().toISOString(),
    }
    loadRecipe(importRecipe)
    onImport()
  }

  function handlePrint() {
    window.print()
  }

  function applyCustom(val: string) {
    const n = parseInt(val.replace(/[^0-9]/g, ''), 10)
    if (!isNaN(n) && n >= 100 && n <= 50000) {
      setTargetG(n)
      setCustomInput(String(n))
    }
  }

  return (
    <div className="min-h-full print:min-h-0" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Back bar — hidden on print */}
      <div className="flex items-center gap-3 mb-6 no-print">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span>←</span>
          <span>{t.nav.myRecipes}</span>
        </button>
        <span style={{ color: 'var(--color-border)' }}>/</span>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {displayName}
        </span>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: imageUrl ? '1fr 1fr' : '1fr', maxWidth: 900 }}>
        {/* Hero image */}
        {imageUrl && (
          <div className="rounded-2xl overflow-hidden print:hidden" style={{ aspectRatio: '4/3', background: 'var(--color-surface)' }}>
            <img
              src={imageUrl}
              alt={displayName}
              className="w-full h-full object-cover"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}

        {/* Meta + actions */}
        <div className="flex flex-col gap-4">
          {/* Print header (only visible on print) */}
          <div className="hidden print:block mb-2">
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Gelato Balancer PRO</div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1
                className="text-2xl font-semibold"
                style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}
              >
                {displayName}
              </h1>
              {isDefault && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-accent)', color: 'white', fontSize: '10px' }}
                >
                  ★ {lang === 'it' ? 'Default' : 'Default'}
                </span>
              )}
            </div>
            <span
              className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}
            >
              {PROFILE_LABELS[recipe.profile]}
            </span>
          </div>

          {/* Quantity selector */}
          <div className="no-print">
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
              {lang === 'it' ? 'Quantità da produrre' : 'Quantity to produce'}
            </div>
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {QUANTITY_PRESETS.map(q => (
                <button
                  key={q}
                  onClick={() => { setTargetG(q); setCustomInput(String(q)) }}
                  className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: targetG === q ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: targetG === q ? 'white' : 'var(--color-text-muted)',
                    border: `1px solid ${targetG === q ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  }}
                >
                  {formatWeight(q)}
                </button>
              ))}
            </div>
            {/* Custom input */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customInput}
                min={100} max={50000}
                onChange={e => setCustomInput(e.target.value)}
                onBlur={e => applyCustom(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && applyCustom(customInput)}
                className="w-28 text-center font-mono text-sm px-2 py-1.5 rounded-lg"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)' }}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>g</span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                ({lang === 'it' ? 'min 100g, max 50 kg' : 'min 100g, max 50 kg'})
              </span>
            </div>
          </div>

          {/* Print quantity info */}
          <div className="hidden print:block text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {lang === 'it' ? 'Quantità:' : 'Quantity:'} <strong>{formatWeight(targetG)}</strong>
            {baseWeight > 0 && ` (${lang === 'it' ? 'scala' : 'scale'}: ×${scale.toFixed(3)})`}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap no-print">
            <button
              onClick={handleImport}
              className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl transition-opacity hover:opacity-90 text-center"
              style={{ background: 'var(--color-accent)', color: 'white', minWidth: 160 }}
            >
              → {lang === 'it' ? 'Importa nel Bilanciatore' : 'Import to Balance Tool'}
            </button>
            <button
              onClick={handlePrint}
              className="text-sm font-medium px-4 py-2.5 rounded-xl border"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent' }}
            >
              {t.actions.stampa}
            </button>
          </div>
        </div>
      </div>

      {/* Ingredient list */}
      <div className="mt-8" style={{ maxWidth: 700 }}>
        <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
          {lang === 'it' ? 'Ingredienti' : 'Ingredients'} — {formatWeight(targetG)}
        </div>

        {GROUP_ORDER.filter(g => grouped[g]?.length).map(group => (
          <div key={group} className="mb-5">
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-2 pb-1"
              style={{
                color: 'var(--color-text-muted)',
                borderBottom: '1px solid var(--color-border)',
                letterSpacing: '0.07em',
              }}
            >
              {GROUP_LABELS[group]}
            </div>
            <div className="space-y-0">
              {grouped[group]!.map((line, idx) => {
                const scaledG = line.weightG * scale
                const pct = baseWeight > 0 ? (line.weightG / baseWeight * 100) : 0
                return (
                  <div
                    key={line.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                    style={{
                      background: idx % 2 === 0 ? 'var(--color-surface)' : 'transparent',
                    }}
                  >
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                      {ingName(line.ingredient, lang)}
                    </span>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {pct.toFixed(1)}%
                      </span>
                      <span
                        className="text-base font-semibold font-mono text-right"
                        style={{ color: 'var(--color-text)', minWidth: 72 }}
                      >
                        {formatWeight(scaledG)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Total */}
        <div
          className="flex items-center justify-between py-3 px-3 rounded-xl mt-2"
          style={{ background: 'var(--color-surface-deep)' }}
        >
          <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--color-text)', letterSpacing: '0.05em' }}>
            {lang === 'it' ? 'Totale miscela' : 'Total mix'}
          </span>
          <span className="text-lg font-bold font-mono" style={{ color: 'var(--color-accent)' }}>
            {formatWeight(targetG)}
          </span>
        </div>

        {recipe.overrunPct > 0 && (
          <div className="mt-2 px-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            + {recipe.overrunPct}% overrun → {formatWeight(targetG * (1 + recipe.overrunPct / 100))} {lang === 'it' ? 'di gelato' : 'of gelato'}
          </div>
        )}
      </div>
    </div>
  )
}
