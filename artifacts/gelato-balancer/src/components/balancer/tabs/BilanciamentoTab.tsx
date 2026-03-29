import { useState, useRef, useEffect } from 'react'
import { useBalancerStore } from '../../../store/balancerStore'
import { TRANSLATIONS, type Lang } from '../../../lib/balancer/i18n'
import type { IngredientDefinition, IngredientGroup, ProfileType, BalanceStatus, RecipeLine } from '../../../lib/balancer/types'
import { SUGAR_CONSTANTS } from '../../../lib/balancer/constants'
import { DEFAULT_RECIPE_TEMPLATES, buildRecipeFromTemplate, getTemplateName } from '../../../lib/balancer/defaultRecipeData'
import { generateSuggestions } from '../../../lib/balancer/suggestions'
import { pickThumbnail } from '../../../lib/balancer/thumbnails'

function ingName(ing: IngredientDefinition, lang: Lang): string {
  return lang === 'en' && ing.nomeEN ? ing.nomeEN : ing.nome
}

interface Props { lang: Lang }

const GROUPS: IngredientGroup[] = [
  'latticiniUova', 'neutriBasi', 'zuccheri', 'ingredientiPrincipali',
  'fruttaVerdura', 'alcolici', 'alimentiTritati',
]
const PROFILES: ProfileType[] = ['gelato', 'sorbetto', 'granita', 'vegan', 'gastronomico', 'personalizzato1', 'personalizzato2']

/* ─── Sub-components ───────────────────────────────────────── */

function StatusDot({ status }: { status: BalanceStatus }) {
  const color = status === 'ok' ? 'var(--color-success)' : 'var(--color-error)'
  return <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, marginRight: 4, flexShrink: 0 }} />
}

function BalanceBar({ value, min, max, status }: { value: number; min: number; max: number; status: BalanceStatus }) {
  const lo = Math.min(min, value * 0.8, min - 2)
  const hi = Math.max(max, value * 1.2, max + 2)
  const range = hi - lo || 1
  const barLeft = ((min - lo) / range) * 100
  const barWidth = ((max - min) / range) * 100
  const dotPos = Math.max(0, Math.min(100, ((value - lo) / range) * 100))
  const barColor = status === 'ok' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)'
  const dotColor = status === 'ok' ? 'var(--color-success)' : 'var(--color-error)'
  return (
    <div style={{ position: 'relative', height: 7, background: 'var(--color-surface-deep)', borderRadius: 4, overflow: 'visible', marginTop: 3 }}>
      <div style={{ position: 'absolute', left: `${barLeft}%`, width: `${barWidth}%`, height: '100%', background: barColor, borderRadius: 4 }} />
      <div style={{ position: 'absolute', left: `${dotPos}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 9, height: 9, borderRadius: '50%', background: dotColor, border: '2px solid white', zIndex: 1 }} />
    </div>
  )
}

function AddIngredientDropdown({ group, lang, onAdd }: { group: IngredientGroup; lang: Lang; onAdd: (id: string) => void }) {
  const { ingredients } = useBalancerStore()
  const t = TRANSLATIONS[lang]
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const filtered = ingredients.filter(i => i.group === group && ingName(i, lang).toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen(!open)} className="text-xs font-medium px-2.5 py-1 rounded"
        style={{ color: 'var(--color-accent)', border: '1px dashed var(--color-accent)', background: 'transparent' }}>
        {t.actions.aggiungiIngrediente}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 rounded-lg shadow-lg" style={{ background: 'white', border: '1px solid var(--color-border)', minWidth: 240, maxHeight: 260, overflow: 'hidden', display: 'flex', flexDirection: 'column', left: 0 }}>
          <input autoFocus type="text" placeholder={t.actions.cerca} value={query} onChange={e => setQuery(e.target.value)}
            className="px-3 py-2 text-sm outline-none" style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 && <div className="px-3 py-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>—</div>}
            {filtered.map(ing => (
              <button key={ing.id} className="w-full text-left px-3 py-2 text-sm" style={{ color: 'var(--color-text)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => { onAdd(ing.id); setOpen(false); setQuery('') }}>
                {ingName(ing, lang)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function IngredientRow({ line, totalWeightG, lang }: { line: RecipeLine; totalWeightG: number; lang: Lang }) {
  const { updateWeight, removeLine } = useBalancerStore()
  const ing = line.ingredient

  const pctOfTotal = totalWeightG > 0 ? (line.weightG / totalWeightG * 100) : 0
  const sugarTotal = Object.values(ing.zuccheri).reduce((s, v) => s + (v ?? 0), 0)
  const zPct = totalWeightG > 0 ? (line.weightG / totalWeightG) * sugarTotal : 0
  const gPct = totalWeightG > 0 ? (line.weightG / totalWeightG) * ing.grassiPct : 0
  const sPct = totalWeightG > 0 ? (line.weightG / totalWeightG) * ing.slngPct : 0
  const aPct = totalWeightG > 0 ? (line.weightG / totalWeightG) * ing.altriSolidiPct : 0

  let podContrib = 0
  if (totalWeightG > 0) {
    for (const [st, sv] of Object.entries(ing.zuccheri)) {
      const constants = SUGAR_CONSTANTS[st]
      if (constants) podContrib += (line.weightG / totalWeightG) * ((sv ?? 0) / 100) * constants.POD
    }
  }

  const col: React.CSSProperties = { color: 'var(--color-text-muted)', fontSize: 10, textAlign: 'center', fontFamily: 'monospace' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: COL_WIDTHS, gap: 2, padding: '3px 8px', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
      <span className="text-xs truncate" style={{ color: 'var(--color-text)' }} title={ingName(ing, lang)}>{ingName(ing, lang)}</span>
      <input type="number" min={0} value={line.weightG === 0 ? '' : line.weightG} placeholder="0"
        onChange={e => updateWeight(line.id, parseFloat(e.target.value) || 0)}
        className="text-xs text-center rounded px-1 py-0.5 w-full font-mono"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)' }} />
      <span style={col}>{pctOfTotal.toFixed(1)}</span>
      <span style={col}>{zPct.toFixed(1)}</span>
      <span style={col}>{gPct.toFixed(1)}</span>
      <span style={col}>{sPct.toFixed(1)}</span>
      <span style={col}>{aPct.toFixed(1)}</span>
      <span style={col}>{(podContrib * 100).toFixed(0)}</span>
      <button onClick={() => removeLine(line.id)} style={{ color: 'var(--color-error)', fontWeight: 700, fontSize: 14, lineHeight: 1, textAlign: 'center' }}>×</button>
    </div>
  )
}

const COL_WIDTHS = '120px 68px 44px 42px 42px 40px 40px 38px 24px'

/* ─── Save modal (name-based) ─────────────────────────────── */

type SaveState =
  | { type: 'idle' }
  | { type: 'conflict'; name: string }
  | { type: 'default-protected'; name: string }
  | { type: 'empty-name' }
  | { type: 'success'; name: string }

/* ─── Load modal ──────────────────────────────────────────── */

function LoadRecipeModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const { savedSlots, ingredients, loadRecipe } = useBalancerStore()
  const hasSaved = Object.keys(savedSlots).length > 0

  function importDefault(tpl: (typeof DEFAULT_RECIPE_TEMPLATES)[number]) {
    try {
      const base = buildRecipeFromTemplate(tpl, ingredients)
      loadRecipe({ ...base, id: crypto.randomUUID(), nome: getTemplateName(tpl, lang), updatedAt: new Date().toISOString() })
      onClose()
    } catch (e) { console.error(e) }
  }

  function importSaved(slotName: string) {
    const saved = savedSlots[slotName]
    if (!saved) return
    loadRecipe({ ...saved, id: crypto.randomUUID(), updatedAt: new Date().toISOString() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
            {lang === 'it' ? 'Carica una ricetta' : 'Load a recipe'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
              <span style={{ color: 'var(--color-accent)' }}>★</span>
              {lang === 'it' ? 'Ricette incluse' : 'Included recipes'}
            </div>
            <div className="space-y-1">
              {DEFAULT_RECIPE_TEMPLATES.map(tpl => (
                <button key={tpl.id} onClick={() => importDefault(tpl)}
                  className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--color-surface-deep)' }}>
                    <img src={tpl.imageUrl} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{getTemplateName(tpl, lang)}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{tpl.profile} · {tpl.lines.reduce((s, l) => s + l.weightG, 0)}g</div>
                  </div>
                  <span style={{ color: 'var(--color-accent)', fontSize: 12 }}>→</span>
                </button>
              ))}
            </div>
          </div>
          {hasSaved && (
            <div>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
                {lang === 'it' ? 'Le tue ricette' : 'Your saved recipes'}
              </div>
              <div className="space-y-1">
                {Object.entries(savedSlots).map(([slotName, saved]) => (
                  <button key={slotName} onClick={() => importSaved(slotName)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}>
                    {saved.thumbnail && (
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--color-surface-deep)' }}>
                        <img src={saved.thumbnail} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{saved.nome || slotName}</div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{saved.profile} · {saved.lines.reduce((s, l) => s + l.weightG, 0).toFixed(0)}g</div>
                    </div>
                    <span style={{ color: 'var(--color-accent)', fontSize: 12 }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
      <div className="text-base font-medium font-mono" style={{ color: 'var(--color-text)' }}>{value}</div>
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────── */

export default function BilanciamentoTab({ lang }: Props) {
  const {
    recipe, balance, profileRanges,
    setRecipeName, setProfile, setOverrun, addLine,
    savedSlots, saveToSlot, setActiveTab,
  } = useBalancerStore()
  const t = TRANSLATIONS[lang]
  const [collapsedGroups, setCollapsedGroups] = useState<Set<IngredientGroup>>(new Set())
  const [showLoad, setShowLoad] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>({ type: 'idle' })
  const nameInputRef = useRef<HTMLInputElement>(null)

  const ranges = profileRanges[recipe.profile]
  const suggestions = generateSuggestions(balance, ranges)

  const DEFAULT_NAMES_LOWER = DEFAULT_RECIPE_TEMPLATES.flatMap(tpl => [
    tpl.nomeIT.toLowerCase(), tpl.nomeEN.toLowerCase(),
  ])

  function toggleGroup(g: IngredientGroup) {
    setCollapsedGroups(prev => { const n = new Set(prev); n.has(g) ? n.delete(g) : n.add(g); return n })
  }

  function handleSave() {
    const name = recipe.nome.trim()
    if (!name) {
      setSaveState({ type: 'empty-name' })
      nameInputRef.current?.focus()
      return
    }
    if (DEFAULT_NAMES_LOWER.includes(name.toLowerCase())) {
      setSaveState({ type: 'default-protected', name })
      return
    }
    if (savedSlots[name]) {
      setSaveState({ type: 'conflict', name })
      return
    }
    doSave(name)
  }

  function doSave(name: string) {
    const thumb = pickThumbnail(recipe.profile, name)
    saveToSlot(name, thumb)
    setSaveState({ type: 'success', name })
    setTimeout(() => setSaveState({ type: 'idle' }), 2500)
  }

  const profileLabels: Record<ProfileType, string> = {
    gelato: t.profiles.gelato, sorbetto: t.profiles.sorbetto, granita: t.profiles.granita,
    vegan: t.profiles.vegan, gastronomico: t.profiles.gastronomico,
    personalizzato1: t.profiles.personalizzato1, personalizzato2: t.profiles.personalizzato2,
  }
  const groupLabels: Record<IngredientGroup, string> = {
    latticiniUova: t.groups.latticiniUova, neutriBasi: t.groups.neutriBasi, zuccheri: t.groups.zuccheri,
    ingredientiPrincipali: t.groups.ingredientiPrincipali, fruttaVerdura: t.groups.fruttaVerdura,
    alcolici: t.groups.alcolici, alimentiTritati: t.groups.alimentiTritati,
  }

  const statusParams = [
    { key: 'zuccheri',       label: t.parameters.zuccheri,       value: balance.zuccheriPct,        status: balance.zuccheriStatus,        range: ranges.zuccheri },
    { key: 'grassi',         label: t.parameters.grassi,         value: balance.grassiPct,          status: balance.grassiStatus,          range: ranges.grassi },
    { key: 'slng',           label: t.parameters.slng,           value: balance.slngPct,            status: balance.slngStatus,            range: ranges.slng },
    { key: 'altriSolidi',    label: t.parameters.altriSolidi,    value: balance.altriSolidiPct,     status: balance.altriSolidiStatus,     range: ranges.altriSolidi },
    { key: 'solidiTotali',   label: t.parameters.solidiTotali,   value: balance.solidiTotaliPct,    status: balance.solidiTotaliStatus,    range: ranges.solidiTotali },
    { key: 'pod',            label: t.parameters.pod,            value: balance.podValue,           status: balance.podStatus,             range: ranges.pod },
    { key: 'pac',            label: t.parameters.pac,            value: balance.pacValue,           status: balance.pacStatus,             range: ranges.pac },
    { key: 'frutta',         label: t.parameters.frutta,         value: balance.fruttaPct,          status: balance.fruttaStatus,          range: ranges.frutta },
    { key: 'alcolici',       label: t.parameters.alcolici,       value: balance.alcoliciPct,        status: balance.alcoliciStatus,        range: ranges.alcolici },
    { key: 'alimentiTritati',label: t.parameters.alimentiTritati,value: balance.alimentiTritatiPct, status: balance.alimentiTritatiStatus, range: ranges.alimentiTritati },
  ] as const

  const outOfRange = statusParams.filter(p => p.status !== 'ok').length

  const hdrStyle: React.CSSProperties = {
    color: 'var(--color-text-muted)', fontSize: 9, textAlign: 'center',
    padding: '0 1px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
  }

  return (
    <div className="space-y-3">
      {/* Modals */}
      {showLoad && <LoadRecipeModal lang={lang} onClose={() => setShowLoad(false)} />}

      {/* Save conflict / error modal */}
      {(saveState.type === 'conflict' || saveState.type === 'default-protected' || saveState.type === 'empty-name') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="rounded-2xl p-6 w-80 shadow-xl" style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)' }}>
            {saveState.type === 'empty-name' && (
              <>
                <h2 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  {lang === 'it' ? 'Nome mancante' : 'Missing name'}
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  {lang === 'it' ? 'Inserisci un nome per la ricetta prima di salvare.' : 'Please enter a recipe name before saving.'}
                </p>
                <button onClick={() => setSaveState({ type: 'idle' })} className="w-full py-2 rounded-lg font-medium text-sm"
                  style={{ background: 'var(--color-accent)', color: 'white' }}>OK</button>
              </>
            )}
            {saveState.type === 'default-protected' && (
              <>
                <h2 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  {lang === 'it' ? 'Nome riservato' : 'Reserved name'}
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  {lang === 'it'
                    ? `"${saveState.name}" è il nome di una ricetta inclusa e non può essere sovrascritto. Scegli un nome diverso.`
                    : `"${saveState.name}" belongs to an included recipe and cannot be overwritten. Please choose a different name.`}
                </p>
                <button onClick={() => setSaveState({ type: 'idle' })} className="w-full py-2 rounded-lg font-medium text-sm"
                  style={{ background: 'var(--color-accent)', color: 'white' }}>OK</button>
              </>
            )}
            {saveState.type === 'conflict' && (
              <>
                <h2 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                  {lang === 'it' ? 'Ricetta esistente' : 'Recipe exists'}
                </h2>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  {lang === 'it'
                    ? `Esiste già una ricetta con il nome "${saveState.name}". Vuoi sovrascriverla?`
                    : `A recipe named "${saveState.name}" already exists. Overwrite it?`}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setSaveState({ type: 'idle' })} className="flex-1 py-2 rounded-lg text-sm"
                    style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent' }}>
                    {lang === 'it' ? 'Annulla' : 'Cancel'}
                  </button>
                  <button onClick={() => doSave(saveState.name)} className="flex-1 py-2 rounded-lg text-sm font-semibold"
                    style={{ background: 'var(--color-accent)', color: 'white' }}>
                    {lang === 'it' ? 'Sovrascrivi' : 'Overwrite'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TOP BAR ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Recipe name */}
        <input
          ref={nameInputRef}
          type="text"
          placeholder={t.balancer.nomeRicetta}
          value={recipe.nome}
          onChange={e => setRecipeName(e.target.value)}
          className="text-sm font-semibold px-3 py-2 rounded-lg"
          style={{
            border: `1px solid ${saveState.type === 'empty-name' ? 'var(--color-error)' : 'var(--color-border)'}`,
            background: 'var(--color-base)', color: 'var(--color-text)',
            flex: '1 1 180px', minWidth: 140,
          }}
        />
        {/* Profile dropdown */}
        <select value={recipe.profile} onChange={e => setProfile(e.target.value as ProfileType)}
          className="text-sm px-2.5 py-2 rounded-lg"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)', flexShrink: 0 }}>
          {PROFILES.map(p => <option key={p} value={p}>{profileLabels[p]}</option>)}
        </select>
        {/* Gear icon → Configuration */}
        <button
          onClick={() => setActiveTab('configurazione')}
          title={lang === 'it' ? 'Configura i parametri del profilo' : 'Configure profile parameters'}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-surface)'; e.currentTarget.style.color = 'var(--color-accent)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
        <div style={{ flex: '0 0 4px' }} />
        {/* Load */}
        <button onClick={() => setShowLoad(true)} className="text-xs font-medium px-3 py-2 rounded-lg"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent', flexShrink: 0 }}>
          {lang === 'it' ? '↑ Carica' : '↑ Load'}
        </button>
        {/* Save */}
        <button onClick={handleSave} className="text-xs font-semibold px-4 py-2 rounded-lg relative"
          style={{ background: 'var(--color-accent)', color: 'white', flexShrink: 0 }}>
          {saveState.type === 'success'
            ? (lang === 'it' ? '✓ Salvata!' : '✓ Saved!')
            : t.actions.salva}
        </button>
      </div>

      {/* ── MAIN LAYOUT ───────────────────────────────────── */}
      <div className="flex gap-4 items-start" style={{ flexWrap: 'nowrap', overflowX: 'auto' }}>

        {/* ── INGREDIENT TABLE ─────────────────────────── */}
        <div style={{ flex: '0 0 490px', minWidth: 470 }}>
          {/* Table header */}
          <div className="rounded-t-lg" style={{ background: 'var(--color-surface-deep)', border: '1px solid var(--color-border)', borderBottom: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: COL_WIDTHS, gap: 2, padding: '6px 8px' }}>
              <span style={{ ...hdrStyle, textAlign: 'left' }}>{lang === 'it' ? 'Ingrediente' : 'Ingredient'}</span>
              <span style={hdrStyle}>{lang === 'it' ? 'g' : 'g'}</span>
              <span style={hdrStyle}>% tot</span>
              <span style={hdrStyle}>{lang === 'it' ? 'Zucc' : 'Sug'}</span>
              <span style={hdrStyle}>{lang === 'it' ? 'Gras' : 'Fat'}</span>
              <span style={hdrStyle}>SLNG</span>
              <span style={hdrStyle}>{lang === 'it' ? 'Altri' : 'Oth'}</span>
              <span style={hdrStyle}>POD</span>
              <span />
            </div>
          </div>

          {/* Groups */}
          {GROUPS.map(group => {
            const groupLines = recipe.lines.filter(l => l.ingredient.group === group)
            const collapsed = collapsedGroups.has(group)
            const groupWeightG = groupLines.reduce((s, l) => s + l.weightG, 0)
            return (
              <div key={group} style={{ borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                <button onClick={() => toggleGroup(group)} className="w-full text-left px-2 py-1.5 flex items-center gap-2"
                  style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 8, transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)', display: 'inline-block', transition: 'transform 0.15s', color: 'var(--color-text-muted)' }}>▼</span>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>{groupLabels[group]}</span>
                  {groupLines.length > 0 && <span className="ml-auto text-xs font-mono" style={{ color: 'var(--color-text-muted)', fontSize: 10 }}>{groupWeightG.toFixed(0)}g</span>}
                </button>
                {!collapsed && (
                  <>
                    {groupLines.map(line => <IngredientRow key={line.id} line={line} totalWeightG={balance.totalWeightG} lang={lang} />)}
                    <div className="px-2 py-1.5" style={{ background: 'var(--color-base)' }}>
                      <AddIngredientDropdown group={group} lang={lang} onAdd={(id) => addLine(id, group)} />
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {/* Totals row */}
          <div className="rounded-b-lg px-2 py-2" style={{ background: 'var(--color-surface-deep)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: COL_WIDTHS, gap: 2, alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text)' }}>{t.balancer.totali}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 12, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.totalWeightG.toFixed(0)}g</span>
              <span style={{ textAlign: 'center', fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text)' }}>100%</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.zuccheriPct.toFixed(1)}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.grassiPct.toFixed(1)}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.slngPct.toFixed(1)}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.altriSolidiPct.toFixed(1)}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 10, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.podValue.toFixed(1)}</span>
              <span />
            </div>
          </div>
        </div>

        {/* ── SIDEBAR ──────────────────────────────────── */}
        <div style={{ flex: '1 1 340px', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Suggestions */}
          <div className="rounded-xl p-3" style={{
            background: suggestions[0].severity === 'ok' ? 'var(--color-success-bg)' : 'rgba(196,98,45,0.07)',
            border: `1px solid ${suggestions[0].severity === 'ok' ? 'var(--color-success)' : 'var(--color-accent)'}`,
          }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{
              color: suggestions[0].severity === 'ok' ? 'var(--color-success)' : 'var(--color-accent)',
              letterSpacing: '0.08em',
            }}>
              {suggestions[0].severity === 'ok' ? '✓' : '!'} {lang === 'it' ? 'Suggerimenti' : 'Suggestions'}
            </div>
            <div className="space-y-2">
              {suggestions.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                    background: s.severity === 'ok' ? 'var(--color-success)' : s.severity === 'error' ? 'var(--color-error)' : 'var(--color-warning)',
                    display: 'inline-block',
                  }} />
                  <span className="text-xs leading-snug" style={{ color: 'var(--color-text)' }}>
                    {lang === 'it' ? s.textIT : s.textEN}
                  </span>
                </div>
              ))}
              {suggestions.length > 4 && (
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  +{suggestions.length - 4} {lang === 'it' ? 'altri...' : 'more...'}
                </div>
              )}
            </div>
          </div>

          {/* Dati Gelato */}
          <div className="rounded-xl p-3 space-y-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
              {lang === 'it' ? 'Dati Gelato' : 'Gelato Data'}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <DataItem label={t.balancer.pesoMiscela} value={`${balance.pesoMiscelaG.toFixed(0)}g`} />
              <DataItem label={t.balancer.pesoGelato} value={`${balance.pesoGelatoG.toFixed(0)}g`} />
              <DataItem label={t.balancer.calorie} value={`${balance.kcalPer100gGelato.toFixed(0)} kcal`} />
              <DataItem label={t.balancer.tempServizio} value={`${balance.temperaturaServizio.toFixed(1)}°C`} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>{t.balancer.overrun}</label>
              <input type="number" value={recipe.overrunPct} onChange={e => setOverrun(parseFloat(e.target.value) || 0)}
                className="text-sm font-mono px-2.5 py-1.5 rounded w-full"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)' }}
                min={0} max={100} step={1} />
            </div>
          </div>

          {/* Balance panel */}
          <div className="rounded-xl p-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="mb-3 flex items-center justify-between">
              <h3 style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
                {lang === 'it' ? 'Bilanciamento' : 'Balance'}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                background: balance.overallStatus === 'bilanciata' ? 'var(--color-success-bg)' :
                            balance.overallStatus === 'quasi-bilanciata' ? 'var(--color-warning-bg)' : 'var(--color-error-bg)',
                color: balance.overallStatus === 'bilanciata' ? 'var(--color-success)' :
                       balance.overallStatus === 'quasi-bilanciata' ? 'var(--color-warning)' : 'var(--color-error)',
              }}>
                {balance.overallStatus === 'bilanciata'
                  ? (lang === 'it' ? '✓ Bilanciata' : '✓ Balanced')
                  : balance.overallStatus === 'quasi-bilanciata'
                  ? (lang === 'it' ? '⚠ Quasi OK' : '⚠ Nearly OK')
                  : `${outOfRange} ${t.balancer.parametriOutOfRange}`}
              </span>
            </div>
            <div className="space-y-2">
              {statusParams.map(p => (
                <div key={p.key}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                      <StatusDot status={p.status} />{p.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 500, fontFamily: 'monospace', color: 'var(--color-text)' }}>
                      {p.value.toFixed(1)}
                      <span style={{ fontSize: 9, color: 'var(--color-text-muted)', marginLeft: 2 }}>[{p.range.min}–{p.range.max}]</span>
                    </span>
                  </div>
                  <BalanceBar value={p.value} min={p.range.min} max={p.range.max} status={p.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
