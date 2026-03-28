import { useState, useRef, useEffect } from 'react'
import { useBalancerStore } from '../../../store/balancerStore'
import { TRANSLATIONS, type Lang } from '../../../lib/balancer/i18n'
import type { IngredientGroup, ProfileType, BalanceStatus, RecipeLine } from '../../../lib/balancer/types'
import { SLOT_NAMES, SUGAR_CONSTANTS } from '../../../lib/balancer/constants'

interface Props { lang: Lang }

const GROUPS: IngredientGroup[] = [
  'latticiniUova', 'neutriBasi', 'zuccheri', 'ingredientiPrincipali',
  'fruttaVerdura', 'alcolici', 'alimentiTritati',
]
const PROFILES: ProfileType[] = ['gelato', 'sorbetto', 'granita', 'vegan', 'gastronomico', 'personalizzato1', 'personalizzato2']

function StatusDot({ status }: { status: BalanceStatus }) {
  const color = status === 'ok' ? 'var(--color-success)' : 'var(--color-error)'
  return (
    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, marginRight: 4, flexShrink: 0 }} />
  )
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
    <div style={{ position: 'relative', height: 8, background: 'var(--color-surface-deep)', borderRadius: 4, overflow: 'visible', marginTop: 3 }}>
      <div style={{ position: 'absolute', left: `${barLeft}%`, width: `${barWidth}%`, height: '100%', background: barColor, borderRadius: 4 }} />
      <div style={{ position: 'absolute', left: `${dotPos}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 10, height: 10, borderRadius: '50%', background: dotColor, border: '2px solid white', zIndex: 1 }} />
    </div>
  )
}

function AddIngredientDropdown({ group, lang, onAdd }: { group: IngredientGroup; lang: Lang; onAdd: (id: string) => void }) {
  const { ingredients } = useBalancerStore()
  const t = TRANSLATIONS[lang]
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const filtered = ingredients.filter(i => i.group === group && i.nome.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs font-medium px-3 py-1.5 rounded"
        style={{ color: 'var(--color-accent)', border: '1px dashed var(--color-accent)', background: 'transparent' }}
      >
        {t.actions.aggiungiIngrediente}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 rounded-lg shadow-lg" style={{ background: 'white', border: '1px solid var(--color-border)', minWidth: 260, maxHeight: 280, overflow: 'hidden', display: 'flex', flexDirection: 'column', left: 0 }}>
          <input
            autoFocus
            type="text"
            placeholder={t.actions.cerca}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="px-3 py-2 text-sm outline-none"
            style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 && <div className="px-3 py-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>—</div>}
            {filtered.map(ing => (
              <button
                key={ing.id}
                className="w-full text-left px-3 py-2 text-sm"
                style={{ color: 'var(--color-text)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => { onAdd(ing.id); setOpen(false); setQuery('') }}
              >
                {ing.nome}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SaveModal({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const { recipe, saveToSlot } = useBalancerStore()
  const t = TRANSLATIONS[lang]
  const slots = SLOT_NAMES[recipe.profile]
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-xl p-6 w-80 shadow-xl" style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)' }}>
        <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
          {lang === 'it' ? 'Scegli uno slot' : 'Choose a slot'}
        </h2>
        <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
          {slots.map(s => (
            <button key={s} onClick={() => setSelected(s)} className="w-full text-left px-3 py-2 rounded text-sm"
              style={{ background: selected === s ? 'var(--color-accent)' : 'var(--color-surface)', color: selected === s ? 'white' : 'var(--color-text)', border: '1px solid var(--color-border)' }}>
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="text-sm px-3 py-1.5 rounded" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent' }}>
            {t.actions.annulla}
          </button>
          <button onClick={() => { if (selected) { saveToSlot(selected); onClose() } }} disabled={!selected}
            className="text-sm px-3 py-1.5 rounded font-medium" style={{ background: 'var(--color-accent)', color: 'white', opacity: selected ? 1 : 0.5 }}>
            {t.actions.salva}
          </button>
        </div>
      </div>
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

  const colStyle: React.CSSProperties = { color: 'var(--color-text-muted)', fontSize: 11, textAlign: 'center', fontFamily: 'monospace' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 58px 44px 44px 50px 50px 44px 44px 44px 32px', gap: 2, padding: '4px 10px', borderBottom: '1px solid var(--color-border)', alignItems: 'center' }}>
      <span className="text-sm truncate" style={{ color: 'var(--color-text)' }} title={ing.nome}>{ing.nome}</span>
      <input
        type="number" min={0}
        value={line.weightG === 0 ? '' : line.weightG}
        placeholder="0"
        onChange={e => updateWeight(line.id, parseFloat(e.target.value) || 0)}
        className="text-sm text-center rounded px-1 py-0.5 w-full font-mono"
        style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)' }}
      />
      <span style={colStyle}>{pctOfTotal.toFixed(1)}%</span>
      <span style={colStyle}>{ing.minPct != null ? ing.minPct.toString() : '—'}</span>
      <span style={colStyle}>{ing.maxPct != null ? ing.maxPct.toString() : '—'}</span>
      <span style={colStyle}>{zPct.toFixed(1)}</span>
      <span style={colStyle}>{gPct.toFixed(1)}</span>
      <span style={colStyle}>{sPct.toFixed(1)}</span>
      <span style={colStyle}>{aPct.toFixed(1)}</span>
      <span style={colStyle}>{(podContrib * 100).toFixed(0)}</span>
      <button onClick={() => removeLine(line.id)} style={{ color: 'var(--color-error)', fontWeight: 700, fontSize: 16, lineHeight: 1, textAlign: 'center' }}>×</button>
    </div>
  )
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
      <div className="text-lg font-medium font-mono" style={{ color: 'var(--color-text)' }}>{value}</div>
    </div>
  )
}

export default function BilanciamentoTab({ lang }: Props) {
  const { recipe, balance, profileRanges, setRecipeName, setProfile, setOverrun, addLine } = useBalancerStore()
  const t = TRANSLATIONS[lang]
  const [collapsedGroups, setCollapsedGroups] = useState<Set<IngredientGroup>>(new Set())
  const [showSave, setShowSave] = useState(false)

  const ranges = profileRanges[recipe.profile]

  function toggleGroup(g: IngredientGroup) {
    setCollapsedGroups(prev => { const n = new Set(prev); n.has(g) ? n.delete(g) : n.add(g); return n })
  }

  const groupLabels: Record<IngredientGroup, string> = {
    latticiniUova: t.groups.latticiniUova, neutriBasi: t.groups.neutriBasi, zuccheri: t.groups.zuccheri,
    ingredientiPrincipali: t.groups.ingredientiPrincipali, fruttaVerdura: t.groups.fruttaVerdura,
    alcolici: t.groups.alcolici, alimentiTritati: t.groups.alimentiTritati,
  }
  const profileLabels: Record<ProfileType, string> = {
    gelato: t.profiles.gelato, sorbetto: t.profiles.sorbetto, granita: t.profiles.granita,
    vegan: t.profiles.vegan, gastronomico: t.profiles.gastronomico,
    personalizzato1: t.profiles.personalizzato1, personalizzato2: t.profiles.personalizzato2,
  }

  const statusParams = [
    { key: 'zuccheri', label: t.parameters.zuccheri, value: balance.zuccheriPct, status: balance.zuccheriStatus, range: ranges.zuccheri },
    { key: 'grassi', label: t.parameters.grassi, value: balance.grassiPct, status: balance.grassiStatus, range: ranges.grassi },
    { key: 'slng', label: t.parameters.slng, value: balance.slngPct, status: balance.slngStatus, range: ranges.slng },
    { key: 'altriSolidi', label: t.parameters.altriSolidi, value: balance.altriSolidiPct, status: balance.altriSolidiStatus, range: ranges.altriSolidi },
    { key: 'solidiTotali', label: t.parameters.solidiTotali, value: balance.solidiTotaliPct, status: balance.solidiTotaliStatus, range: ranges.solidiTotali },
    { key: 'pod', label: t.parameters.pod, value: balance.podValue, status: balance.podStatus, range: ranges.pod },
    { key: 'pac', label: t.parameters.pac, value: balance.pacValue, status: balance.pacStatus, range: ranges.pac },
    { key: 'frutta', label: t.parameters.frutta, value: balance.fruttaPct, status: balance.fruttaStatus, range: ranges.frutta },
    { key: 'alcolici', label: t.parameters.alcolici, value: balance.alcoliciPct, status: balance.alcoliciStatus, range: ranges.alcolici },
    { key: 'alimentiTritati', label: t.parameters.alimentiTritati, value: balance.alimentiTritatiPct, status: balance.alimentiTritatiStatus, range: ranges.alimentiTritati },
  ] as const

  const outOfRange = statusParams.filter(p => p.status !== 'ok').length

  const hdrStyle: React.CSSProperties = { color: 'var(--color-text-muted)', fontSize: 10, textAlign: 'center', padding: '0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }

  return (
    <div className="space-y-4">
      {showSave && <SaveModal lang={lang} onClose={() => setShowSave(false)} />}

      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text" placeholder={t.balancer.nomeRicetta} value={recipe.nome}
          onChange={e => setRecipeName(e.target.value)}
          className="text-base font-semibold px-3 py-2 rounded-lg"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)', flex: '1 1 200px', minWidth: 180 }}
        />
        <select value={recipe.profile} onChange={e => setProfile(e.target.value as ProfileType)}
          className="text-sm px-3 py-2 rounded-lg"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)' }}>
          {PROFILES.map(p => <option key={p} value={p}>{profileLabels[p]}</option>)}
        </select>
        <button onClick={() => setShowSave(true)} className="text-sm font-medium px-4 py-2 rounded-lg"
          style={{ background: 'var(--color-accent)', color: 'white' }}>
          {t.actions.salva}
        </button>
      </div>

      {/* Main layout */}
      <div className="flex gap-4 items-start flex-wrap">
        {/* Ingredient table */}
        <div style={{ flex: '1 1 580px', minWidth: 0 }}>
          {/* Header */}
          <div className="rounded-t-lg" style={{ background: 'var(--color-surface-deep)', border: '1px solid var(--color-border)', borderBottom: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 58px 44px 44px 50px 50px 44px 44px 44px 32px', gap: 2, padding: '8px 10px' }}>
              <span style={{ ...hdrStyle, textAlign: 'left' }}>{lang === 'it' ? 'Ingrediente' : 'Ingredient'}</span>
              <span style={hdrStyle}>{lang === 'it' ? 'Peso g' : 'Weight g'}</span>
              <span style={hdrStyle}>% tot</span>
              <span style={hdrStyle}>min%</span>
              <span style={hdrStyle}>max%</span>
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
                <button onClick={() => toggleGroup(group)} className="w-full text-left px-3 py-2 flex items-center gap-2"
                  style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  <span style={{ fontSize: 9, transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)', display: 'inline-block', transition: 'transform 0.15s', color: 'var(--color-text-muted)' }}>▼</span>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>{groupLabels[group]}</span>
                  {groupLines.length > 0 && <span className="ml-auto text-xs" style={{ color: 'var(--color-text-muted)' }}>{groupWeightG.toFixed(0)}g</span>}
                </button>

                {!collapsed && (
                  <>
                    {groupLines.map(line => (
                      <IngredientRow key={line.id} line={line} totalWeightG={balance.totalWeightG} lang={lang} />
                    ))}
                    <div className="px-3 py-2" style={{ background: 'var(--color-base)' }}>
                      <AddIngredientDropdown group={group} lang={lang} onAdd={(id) => addLine(id, group)} />
                    </div>
                  </>
                )}
              </div>
            )
          })}

          {/* Totali */}
          <div className="rounded-b-lg px-3 py-3" style={{ background: 'var(--color-surface-deep)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 58px 44px 44px 50px 50px 44px 44px 44px 32px', gap: 2, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text)' }}>{t.balancer.totali}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.totalWeightG.toFixed(0)}g</span>
              <span style={{ textAlign: 'center', fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text)' }}>100%</span>
              <span /><span />
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.zuccheriPct.toFixed(1)}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.grassiPct.toFixed(1)}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.slngPct.toFixed(1)}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.altriSolidiPct.toFixed(1)}</span>
              <span style={{ textAlign: 'center', fontWeight: 700, fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text)' }}>{balance.podValue.toFixed(1)}</span>
              <span />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Dati Gelato */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
              {lang === 'it' ? 'Dati Gelato' : 'Gelato Data'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <DataItem label={t.balancer.pesoMiscela} value={`${balance.pesoMiscelaG.toFixed(0)}g`} />
              <DataItem label={t.balancer.pesoGelato} value={`${balance.pesoGelatoG.toFixed(0)}g`} />
              <DataItem label={t.balancer.calorie} value={`${balance.kcalPer100gGelato.toFixed(0)} kcal`} />
              <DataItem label={t.balancer.tempServizio} value={`${balance.temperaturaServizio.toFixed(1)}°C`} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>{t.balancer.overrun}</label>
              <input type="number" value={recipe.overrunPct} onChange={e => setOverrun(parseFloat(e.target.value) || 0)}
                className="text-sm font-mono px-3 py-1.5 rounded w-full"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)' }}
                min={0} max={100} step={1} />
            </div>
          </div>

          {/* Balance panel */}
          <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
              <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)' }}>
                {lang === 'it' ? 'Bilanciamento' : 'Balance'}
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{
                background: balance.overallStatus === 'bilanciata' ? 'var(--color-success-bg)' : balance.overallStatus === 'quasi-bilanciata' ? 'var(--color-warning-bg)' : 'var(--color-error-bg)',
                color: balance.overallStatus === 'bilanciata' ? 'var(--color-success)' : balance.overallStatus === 'quasi-bilanciata' ? 'var(--color-warning)' : 'var(--color-error)',
              }}>
                {balance.overallStatus === 'bilanciata' ? (lang === 'it' ? '✓ Bilanciata' : '✓ Balanced') :
                 balance.overallStatus === 'quasi-bilanciata' ? (lang === 'it' ? '⚠ Quasi bilanciata' : '⚠ Nearly balanced') :
                 `${outOfRange} ${t.balancer.parametriOutOfRange}`}
              </span>
            </div>
            <div className="space-y-2.5">
              {statusParams.map(p => (
                <div key={p.key}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                      <StatusDot status={p.status} />
                      {p.label}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 500, fontFamily: 'monospace', color: 'var(--color-text)' }}>
                      {p.value.toFixed(1)}
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', marginLeft: 2 }}>[{p.range.min}–{p.range.max}]</span>
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
