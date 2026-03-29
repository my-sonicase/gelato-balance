import { useState } from 'react'
import { useBalancerStore } from '../../../store/balancerStore'
import { TRANSLATIONS, type Lang } from '../../../lib/balancer/i18n'
import type { ProfileType, Recipe } from '../../../lib/balancer/types'
import { calculateBalance } from '../../../lib/balancer/calculations'
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

type ViewState = { kind: 'list' } | { kind: 'detail'; recipe: Recipe }

export default function GelatiSalvatiTab({ lang, onNewRecipe }: Props) {
  const t = TRANSLATIONS[lang]
  const { savedRecipes, loadRecipe, deleteSlot, profileRanges, isLoadingData, setActiveTab } = useBalancerStore()
  const [view, setView] = useState<ViewState>({ kind: 'list' })
  const [search, setSearch] = useState('')

  const profileLabels: Record<ProfileType, string> = {
    gelato: t.profiles.gelato, sorbetto: t.profiles.sorbetto, granita: t.profiles.granita,
    vegan: t.profiles.vegan, gastronomico: t.profiles.gastronomico,
    personalizzato1: t.profiles.personalizzato1, personalizzato2: t.profiles.personalizzato2,
  }

  const matchSearch = (r: Recipe) =>
    !search || r.nome.toLowerCase().includes(search.toLowerCase())

  const systemRecipes = savedRecipes.filter(r => r.isSystemRecipe && matchSearch(r))
  const userRecipes   = savedRecipes.filter(r => !r.isSystemRecipe && matchSearch(r))

  /* ─── Recipe Detail View ──────────────────────────────── */
  if (view.kind === 'detail') {
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
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-lg font-semibold shrink-0" style={{ color: 'var(--color-text)' }}>
          {t.nav.myRecipes}
        </h1>
        <input
          type="text"
          placeholder={lang === 'it' ? 'Cerca ricetta…' : 'Search recipe…'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)', flex: '1 1 180px', minWidth: 140 }}
        />
        <button onClick={onNewRecipe}
          className="text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 shrink-0"
          style={{ background: 'var(--color-accent)', color: 'white' }}>
          + {t.nav.newRecipe}
        </button>
      </div>

      {/* ── SYSTEM / INCLUDED RECIPES ────────────────────── */}
      {isLoadingData ? (
        <div className="flex items-center justify-center py-12">
          <span style={{ color: 'var(--color-text-muted)' }}>
            {lang === 'it' ? 'Caricamento ricette…' : 'Loading recipes…'}
          </span>
        </div>
      ) : (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
            style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            <span style={{ color: 'var(--color-accent)' }}>★</span>
            {lang === 'it' ? 'Ricette incluse' : 'Included recipes'}
          </h2>
          {systemRecipes.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {lang === 'it' ? 'Nessuna ricetta di sistema.' : 'No system recipes.'}
            </p>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {systemRecipes.map(recipe => {
                const profileColor = PROFILE_COLORS[recipe.profile] ?? 'var(--color-accent)'
                return (
                  <button key={recipe.id} onClick={() => setView({ kind: 'detail', recipe })}
                    className="text-left rounded-2xl overflow-hidden"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(196,98,45,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}>
                    <div className="relative w-full" style={{ aspectRatio: '4/3', background: 'var(--color-surface-deep)', overflow: 'hidden' }}>
                      {recipe.thumbnail ? (
                        <img src={recipe.thumbnail} alt={recipe.nome}
                          className="w-full h-full object-cover"
                          onError={e => {
                            const el = e.target as HTMLImageElement
                            el.style.display = 'none'
                            const p = el.parentElement
                            if (p) p.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:2.5rem">🍦</div>'
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2.5rem' }}>🍦</div>
                      )}
                      <div className="absolute top-2 left-2 text-white font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(196,98,45,0.92)', fontSize: '10px', backdropFilter: 'blur(4px)' }}>
                        ★ {lang === 'it' ? 'Inclusa' : 'Included'}
                      </div>
                      <div className="absolute top-2 right-2 text-white font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${profileColor}DD`, fontSize: '10px', backdropFilter: 'blur(4px)' }}>
                        {profileLabels[recipe.profile]}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{recipe.nome}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {lang === 'it' ? 'Apri e scala →' : 'Open and scale →'}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── PERSONAL SAVED RECIPES ─────────────────────── */}
      {userRecipes.length === 0 ? (
        <div className="rounded-2xl p-10 text-center mb-8"
          style={{ background: 'var(--color-surface)', border: '1px dashed var(--color-border)' }}>
          <div className="text-2xl mb-3">✎</div>
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            {t.myRecipes.emptyTitle}
          </h2>
          <p className="text-sm mb-5 max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            {t.myRecipes.emptyDesc}
          </p>
          <button onClick={onNewRecipe}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ background: 'var(--color-accent)', color: 'white' }}>
            {t.myRecipes.createFirst} →
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"
            style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-text-muted)' }} />
            {lang === 'it' ? 'Le tue ricette' : 'Your recipes'}
          </h2>

          {PROFILES.map(profile => {
            const profileSaved = userRecipes.filter(r => r.profile === profile)
            if (profileSaved.length === 0) return null
            return (
              <section key={profile} className="mb-8">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em', opacity: 0.7 }}>
                  {profileLabels[profile]}
                </h3>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                  {profileSaved.map(saved => {
                    const stats = recipeStats(saved)
                    const balance = calculateBalance(saved, profileRanges[saved.profile])
                    const profileColor = PROFILE_COLORS[saved.profile] ?? 'var(--color-accent)'
                    const statusColor =
                      balance.overallStatus === 'bilanciata' ? 'var(--color-success)' :
                      balance.overallStatus === 'quasi-bilanciata' ? 'var(--color-warning)' :
                      'var(--color-error)'

                    return (
                      <div key={saved.id}
                        className="rounded-2xl overflow-hidden cursor-pointer"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(196,98,45,0.10)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.boxShadow = 'none' }}
                        onClick={() => setView({ kind: 'detail', recipe: saved })}>
                        {saved.thumbnail ? (
                          <div className="relative w-full" style={{ aspectRatio: '4/3', background: 'var(--color-surface-deep)', overflow: 'hidden' }}>
                            <img src={saved.thumbnail} alt={saved.nome} className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            <div className="absolute top-2 right-2 text-white font-bold px-2 py-0.5 rounded-full"
                              style={{ background: `${profileColor}DD`, fontSize: '10px', backdropFilter: 'blur(4px)' }}>
                              {profileLabels[saved.profile]}
                            </div>
                            <div className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ background: statusColor, fontSize: 10 }}>
                              {balance.overallStatus === 'bilanciata' ? '✓' : balance.overallStatus === 'quasi-bilanciata' ? '~' : '!'}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-between px-3 py-2"
                            style={{ background: `${profileColor}18`, borderBottom: '1px solid var(--color-border)' }}>
                            <span className="text-xs font-bold" style={{ color: profileColor }}>{profileLabels[saved.profile]}</span>
                            <span className="text-xs font-bold" style={{ color: statusColor }}>
                              {balance.overallStatus === 'bilanciata' ? '✓' : balance.overallStatus === 'quasi-bilanciata' ? '~' : '!'}
                            </span>
                          </div>
                        )}
                        <div className="p-3 flex flex-col gap-2">
                          <div className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
                            {saved.nome}
                          </div>
                          {stats && (
                            <div className="flex gap-1.5 flex-wrap">
                              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}>Z {stats.zuccheri}%</span>
                              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}>G {stats.grassi}%</span>
                              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}>{stats.totalG}g</span>
                            </div>
                          )}
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            {t.myRecipes.savedOn} {new Date(saved.updatedAt).toLocaleDateString(lang === 'it' ? 'it-IT' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="flex gap-2 mt-1 pt-1" onClick={e => e.stopPropagation()}>
                            <button onClick={() => loadRecipe(saved)}
                              className="flex-1 text-xs font-semibold py-1.5 rounded-lg"
                              style={{ background: 'var(--color-accent)', color: 'white' }}>
                              {t.myRecipes.loadRecipe}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(lang === 'it' ? 'Eliminare questa ricetta?' : 'Delete this recipe?'))
                                  deleteSlot(saved.id)
                              }}
                              className="text-xs px-2.5 py-1.5 rounded-lg"
                              style={{ border: '1px solid var(--color-border)', color: 'var(--color-error)', background: 'transparent' }}>
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}
