import { useState } from 'react'
import { useBalancerStore } from '../../../store/balancerStore'
import { TRANSLATIONS, type Lang } from '../../../lib/balancer/i18n'
import { SLOT_NAMES } from '../../../lib/balancer/constants'
import type { ProfileType, Recipe } from '../../../lib/balancer/types'
import { calculateBalance } from '../../../lib/balancer/calculations'
import { DEFAULT_RECIPE_TEMPLATES, type DefaultRecipeTemplate, buildRecipeFromTemplate, getTemplateName } from '../../../lib/balancer/defaultRecipeData'
import RecipeDetailView from '../RecipeDetailView'

interface Props {
  lang: Lang
  onNewRecipe: () => void
}

const PROFILES: ProfileType[] = ['gelato', 'sorbetto', 'granita', 'vegan', 'gastronomico', 'personalizzato1', 'personalizzato2']

function recipeStats(recipe: Recipe) {
  const tot = recipe.lines.reduce((s, l) => s + l.weightG, 0)
  if (tot === 0) return null
  const zuccheri = recipe.lines.reduce((acc, l) => {
    const sugarTot = Object.values(l.ingredient.zuccheri).reduce((s, v) => s + (v ?? 0), 0)
    return acc + (l.weightG / tot) * sugarTot
  }, 0)
  const grassi = recipe.lines.reduce((s, l) => s + (l.weightG / tot) * l.ingredient.grassiPct, 0)
  return { zuccheri: zuccheri.toFixed(1), grassi: grassi.toFixed(1), totalG: tot, lines: recipe.lines.length }
}

const PROFILE_COLORS: Record<string, string> = {
  gelato:   '#C4622D',
  sorbetto: '#2D6A9F',
  granita:  '#2D7A6A',
  vegan:    '#4A8A2D',
  gastronomico: '#7A4A2D',
  personalizzato1: '#6A2D7A',
  personalizzato2: '#7A2D4A',
}

type ViewState =
  | { kind: 'list' }
  | { kind: 'default'; template: DefaultRecipeTemplate }
  | { kind: 'saved'; slotName: string; recipe: Recipe }

export default function GelatiSalvatiTab({ lang, onNewRecipe }: Props) {
  const t = TRANSLATIONS[lang]
  const { savedSlots, saveToSlot, loadFromSlot, deleteSlot, recipe: currentRecipe, profileRanges, ingredients, loadRecipe, setActiveTab } = useBalancerStore()
  const [view, setView] = useState<ViewState>({ kind: 'list' })

  const profileLabels: Record<ProfileType, string> = {
    gelato: t.profiles.gelato, sorbetto: t.profiles.sorbetto, granita: t.profiles.granita,
    vegan: t.profiles.vegan, gastronomico: t.profiles.gastronomico,
    personalizzato1: t.profiles.personalizzato1, personalizzato2: t.profiles.personalizzato2,
  }

  const totalSaved = Object.keys(savedSlots).length

  /* ─── Recipe Detail View ──────────────────────────────── */
  if (view.kind === 'default') {
    const template = view.template
    let builtRecipe: Recipe | null = null
    try {
      builtRecipe = buildRecipeFromTemplate(template, ingredients)
    } catch {
      builtRecipe = null
    }
    return (
      <RecipeDetailView
        recipe={builtRecipe}
        template={template}
        lang={lang}
        onBack={() => setView({ kind: 'list' })}
        onImport={() => setActiveTab('bilanciamento')}
      />
    )
  }

  if (view.kind === 'saved') {
    return (
      <RecipeDetailView
        recipe={view.recipe}
        template={null}
        lang={lang}
        onBack={() => setView({ kind: 'list' })}
        onImport={() => setActiveTab('bilanciamento')}
      />
    )
  }

  /* ─── List view ───────────────────────────────────────── */
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            {t.nav.myRecipes}
          </h1>
          {totalSaved > 0 && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {totalSaved} {lang === 'it' ? 'ricette salvate' : 'saved recipes'}
            </p>
          )}
        </div>
        <button
          onClick={onNewRecipe}
          className="text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-accent)', color: 'white' }}
        >
          + {t.nav.newRecipe}
        </button>
      </div>

      {/* ── DEFAULT RECIPES SECTION ────────────────────── */}
      <section className="mb-10">
        <h2
          className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
          style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
        >
          <span style={{ color: 'var(--color-accent)' }}>★</span>
          {lang === 'it' ? 'Ricette incluse' : 'Included recipes'}
        </h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          {DEFAULT_RECIPE_TEMPLATES.map(tpl => {
            const name = getTemplateName(tpl, lang)
            const profileColor = PROFILE_COLORS[tpl.profile] ?? 'var(--color-accent)'
            return (
              <button
                key={tpl.id}
                onClick={() => setView({ kind: 'default', template: tpl })}
                className="text-left rounded-2xl overflow-hidden group transition-all"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(196,98,45,0.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Image */}
                <div
                  className="relative w-full"
                  style={{ aspectRatio: '4/3', background: 'var(--color-surface-deep)', overflow: 'hidden' }}
                >
                  <img
                    src={tpl.imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    style={{ transition: 'transform 0.3s' }}
                    onMouseEnter={e => ((e.target as HTMLImageElement).style.transform = 'scale(1.04)')}
                    onMouseLeave={e => ((e.target as HTMLImageElement).style.transform = 'scale(1)')}
                    onError={e => {
                      const el = e.target as HTMLImageElement
                      el.style.display = 'none'
                      const parent = el.parentElement
                      if (parent) {
                        parent.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:2.5rem">🍦</div>'
                      }
                    }}
                  />
                  {/* Default badge */}
                  <div
                    className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(196,98,45,0.92)', fontSize: '10px', backdropFilter: 'blur(4px)' }}
                  >
                    ★ {lang === 'it' ? 'Inclusa' : 'Included'}
                  </div>
                  {/* Profile badge */}
                  <div
                    className="absolute top-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${profileColor}DD`, fontSize: '10px', backdropFilter: 'blur(4px)' }}
                  >
                    {profileLabels[tpl.profile]}
                  </div>
                </div>
                {/* Info */}
                <div className="p-3">
                  <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                    {name}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {lang === 'it' ? 'Apri e scala →' : 'Open and scale →'}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── PERSONAL SAVED RECIPES ─────────────────────── */}
      {totalSaved === 0 && (
        <div
          className="rounded-2xl p-10 text-center mb-8"
          style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}
        >
          <div className="text-2xl mb-3">✎</div>
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            {t.myRecipes.emptyTitle}
          </h2>
          <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            {t.myRecipes.emptyDesc}
          </p>
          <button
            onClick={onNewRecipe}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-accent)', color: 'white' }}
          >
            {t.myRecipes.createFirst} →
          </button>
        </div>
      )}

      {totalSaved > 0 && (
        <>
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
            style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--color-text-muted)' }}
            />
            {lang === 'it' ? 'Le tue ricette' : 'Your recipes'}
          </h2>

          {PROFILES.map(profile => {
            const slots = SLOT_NAMES[profile]
            const filledSlots = slots.filter(s => savedSlots[s])
            if (filledSlots.length === 0) return null
            return (
              <section key={profile} className="mb-8">
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em', opacity: 0.7 }}
                >
                  {profileLabels[profile]}
                </h3>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                  {filledSlots.map(slotName => {
                    const saved = savedSlots[slotName]!
                    const stats = recipeStats(saved)
                    const balance = calculateBalance(saved, profileRanges[saved.profile])
                    const statusColor =
                      balance.overallStatus === 'bilanciata' ? 'var(--color-success)' :
                      balance.overallStatus === 'quasi-bilanciata' ? 'var(--color-warning)' :
                      'var(--color-error)'
                    const statusDot =
                      balance.overallStatus === 'bilanciata' ? '✓' :
                      balance.overallStatus === 'quasi-bilanciata' ? '~' : '✗'

                    return (
                      <div
                        key={slotName}
                        className="rounded-xl p-4 flex flex-col gap-3 cursor-pointer"
                        style={{
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                        onClick={() => setView({ kind: 'saved', slotName, recipe: saved })}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--color-text)' }}>
                            {saved.nome || slotName}
                          </div>
                          <span className="text-xs font-bold shrink-0" style={{ color: statusColor }}>{statusDot}</span>
                        </div>
                        {stats && (
                          <div className="flex gap-1.5 flex-wrap">
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}>
                              Z {stats.zuccheri}%
                            </span>
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}>
                              G {stats.grassi}%
                            </span>
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}>
                              {stats.totalG}g
                            </span>
                          </div>
                        )}
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {t.myRecipes.savedOn} {new Date(saved.updatedAt).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        {/* Actions */}
                        <div className="flex gap-2 mt-auto pt-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => loadFromSlot(slotName)}
                            className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-opacity hover:opacity-90"
                            style={{ background: 'var(--color-accent)', color: 'white' }}
                          >
                            {t.myRecipes.loadRecipe}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(lang === 'it' ? 'Eliminare questa ricetta?' : 'Delete this recipe?'))
                                deleteSlot(slotName)
                            }}
                            className="text-xs px-2.5 py-1.5 rounded-lg"
                            style={{ border: '1px solid var(--color-border)', color: 'var(--color-error)', background: 'transparent' }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}

          {/* Empty slots */}
          <div className="mt-8">
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em', opacity: 0.4 }}
            >
              {lang === 'it' ? 'Slot disponibili' : 'Available slots'}
            </h3>
            {PROFILES.map(profile => {
              const slots = SLOT_NAMES[profile]
              const emptySlots = slots.filter(s => !savedSlots[s])
              if (emptySlots.length === 0) return null
              return (
                <section key={profile} className="mb-4">
                  <h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-border)', letterSpacing: '0.08em' }}>
                    {profileLabels[profile]}
                  </h4>
                  <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                    {emptySlots.map(slotName => (
                      <div
                        key={slotName}
                        className="rounded-xl p-3 flex flex-col gap-2"
                        style={{ border: '1px dashed var(--color-border)', opacity: 0.55 }}
                      >
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{slotName}</div>
                        <div className="text-xs" style={{ color: 'var(--color-border)' }}>{t.myRecipes.noRecipesYet}</div>
                        <button
                          onClick={() => {
                            if (currentRecipe.profile === profile) {
                              saveToSlot(slotName)
                            } else {
                              alert(lang === 'it'
                                ? `La ricetta corrente è di tipo ${profileLabels[currentRecipe.profile]}. Cambia profilo prima di salvare qui.`
                                : `Current recipe is type ${profileLabels[currentRecipe.profile]}. Change profile first.`)
                            }
                          }}
                          className="text-xs font-medium py-1 rounded"
                          style={{ border: '1px dashed var(--color-accent)', color: 'var(--color-accent)', background: 'transparent' }}
                        >
                          {t.actions.salvaQui}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
