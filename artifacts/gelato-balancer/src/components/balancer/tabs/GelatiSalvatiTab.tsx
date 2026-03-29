import { useBalancerStore } from '../../../store/balancerStore'
import { TRANSLATIONS, type Lang } from '../../../lib/balancer/i18n'
import { SLOT_NAMES } from '../../../lib/balancer/constants'
import type { ProfileType, Recipe } from '../../../lib/balancer/types'
import { calculateBalance } from '../../../lib/balancer/calculations'

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

export default function GelatiSalvatiTab({ lang, onNewRecipe }: Props) {
  const t = TRANSLATIONS[lang]
  const { savedSlots, saveToSlot, loadFromSlot, deleteSlot, recipe, profileRanges } = useBalancerStore()

  const profileLabels: Record<ProfileType, string> = {
    gelato: t.profiles.gelato, sorbetto: t.profiles.sorbetto, granita: t.profiles.granita,
    vegan: t.profiles.vegan, gastronomico: t.profiles.gastronomico,
    personalizzato1: t.profiles.personalizzato1, personalizzato2: t.profiles.personalizzato2,
  }

  const totalSaved = Object.keys(savedSlots).length

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

      {/* Empty state */}
      {totalSaved === 0 && (
        <div
          className="rounded-2xl p-12 text-center mb-8"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ background: 'var(--color-surface-deep)' }}
          >
            🍦
          </div>
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            {t.myRecipes.emptyTitle}
          </h2>
          <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
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

      {/* Saved recipes grouped by profile */}
      {PROFILES.map(profile => {
        const slots = SLOT_NAMES[profile]
        const filledSlots = slots.filter(s => savedSlots[s])
        if (filledSlots.length === 0) return null

        return (
          <section key={profile} className="mb-8">
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: 'var(--color-accent)' }}
              />
              {profileLabels[profile]}
              <span className="font-normal text-xs lowercase tracking-normal" style={{ color: 'var(--color-border)' }}>
                — {filledSlots.length} {lang === 'it' ? 'ricette' : 'recipes'}
              </span>
            </h2>
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
                  balance.overallStatus === 'quasi-bilanciata' ? '⚠' : '✗'
                return (
                  <div
                    key={slotName}
                    className="rounded-xl p-4 flex flex-col gap-3 group"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                  >
                    {/* Recipe name + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm leading-tight truncate" style={{ color: 'var(--color-text)' }}>
                        {saved.nome || slotName}
                      </div>
                      <span
                        className="text-xs font-bold shrink-0"
                        style={{ color: statusColor }}
                      >{statusDot}</span>
                    </div>

                    {/* Stats row */}
                    {stats && (
                      <div className="flex gap-1.5 flex-wrap">
                        <span
                          className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}
                        >Z {stats.zuccheri}%</span>
                        <span
                          className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}
                        >G {stats.grassi}%</span>
                        <span
                          className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}
                        >{stats.totalG}g</span>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}
                        >{stats.lines} {lang === 'it' ? 'ingr.' : 'ing.'}</span>
                      </div>
                    )}

                    {/* Date */}
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {t.myRecipes.savedOn} {new Date(saved.updatedAt).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto pt-1">
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

      {/* Empty slots section — shown only when there are some saved recipes */}
      {totalSaved > 0 && (
        <div className="mt-8">
          <h2
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em', opacity: 0.5 }}
          >
            {lang === 'it' ? 'Slot disponibili' : 'Available slots'}
          </h2>
          {PROFILES.map(profile => {
            const slots = SLOT_NAMES[profile]
            const emptySlots = slots.filter(s => !savedSlots[s])
            if (emptySlots.length === 0) return null
            return (
              <section key={profile} className="mb-6">
                <h3
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: 'var(--color-border)', letterSpacing: '0.08em' }}
                >
                  {profileLabels[profile]}
                </h3>
                <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                  {emptySlots.map(slotName => (
                    <div
                      key={slotName}
                      className="rounded-xl p-3 flex flex-col gap-2"
                      style={{ border: '1px dashed var(--color-border)', opacity: 0.6 }}
                    >
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{slotName}</div>
                      <div className="text-xs" style={{ color: 'var(--color-border)' }}>
                        {t.myRecipes.noRecipesYet}
                      </div>
                      <button
                        onClick={() => {
                          if (recipe.profile === profile) {
                            saveToSlot(slotName)
                          } else {
                            alert(lang === 'it'
                              ? `La ricetta corrente è di tipo ${profileLabels[recipe.profile]}. Cambia profilo prima di salvare qui.`
                              : `Current recipe is type ${profileLabels[recipe.profile]}. Change profile first.`
                            )
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
      )}
    </div>
  )
}
