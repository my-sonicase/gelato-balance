import { useState } from 'react'
import { useBalancerStore } from '../../../store/balancerStore'
import { TRANSLATIONS, type Lang } from '../../../lib/balancer/i18n'
import type { IngredientDefinition, IngredientGroup } from '../../../lib/balancer/types'

interface Props { lang: Lang }

const GROUPS: IngredientGroup[] = [
  'latticiniUova', 'neutriBasi', 'zuccheri', 'ingredientiPrincipali',
  'fruttaVerdura', 'alcolici', 'alimentiTritati',
]

const EMPTY_CUSTOM: Omit<IngredientDefinition, 'id' | 'isCustom' | 'isReadOnly'> = {
  nome: '',
  group: 'ingredientiPrincipali',
  acquaPct: 0,
  grassiPct: 0,
  slngPct: 0,
  zuccheri: {},
  altriSolidiPct: 0,
}

interface IngredientFormProps {
  lang: Lang
  initial?: Partial<IngredientDefinition>
  onSave: (data: Omit<IngredientDefinition, 'id' | 'isCustom' | 'isReadOnly'>) => void
  onCancel: () => void
  groupLabels: Record<IngredientGroup, string>
}

function IngredientForm({ lang, initial, onSave, onCancel, groupLabels }: IngredientFormProps) {
  const t = TRANSLATIONS[lang]
  const [form, setForm] = useState({
    nome: initial?.nome ?? '',
    group: (initial?.group ?? 'ingredientiPrincipali') as IngredientGroup,
    acquaPct: initial?.acquaPct ?? 0,
    grassiPct: initial?.grassiPct ?? 0,
    slngPct: initial?.slngPct ?? 0,
    altriSolidiPct: initial?.altriSolidiPct ?? 0,
    zuccheri: initial?.zuccheri ?? {},
    minPct: initial?.minPct,
    maxPct: initial?.maxPct,
  })

  const n = (v: string) => parseFloat(v) || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="rounded-xl p-6 shadow-xl w-full max-w-md" style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          {initial ? (lang === 'it' ? 'Modifica ingrediente' : 'Edit ingredient') : t.ingredienti.aggiungiCustom}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>{t.ingredienti.nome}</label>
            <input type="text" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="w-full text-sm px-3 py-1.5 rounded"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>{t.ingredienti.group}</label>
            <select value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value as IngredientGroup }))}
              className="w-full text-sm px-3 py-1.5 rounded"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}>
              {GROUPS.map(g => <option key={g} value={g}>{groupLabels[g]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'acquaPct', label: t.ingredienti.acqua },
              { key: 'grassiPct', label: t.ingredienti.grassi },
              { key: 'slngPct', label: t.ingredienti.slng },
              { key: 'altriSolidiPct', label: t.ingredienti.altriSolidi },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
                <input type="number" min={0} max={100} step={0.1}
                  value={form[key as keyof typeof form] as number}
                  onChange={e => setForm(f => ({ ...f, [key]: n(e.target.value) }))}
                  className="w-full text-sm px-3 py-1.5 rounded font-mono"
                  style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>{t.ingredienti.minPct}</label>
              <input type="number" min={0} max={100} step={0.1} value={form.minPct ?? ''}
                onChange={e => setForm(f => ({ ...f, minPct: e.target.value ? n(e.target.value) : undefined }))}
                className="w-full text-sm px-3 py-1.5 rounded font-mono"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>{t.ingredienti.maxPct}</label>
              <input type="number" min={0} max={100} step={0.1} value={form.maxPct ?? ''}
                onChange={e => setForm(f => ({ ...f, maxPct: e.target.value ? n(e.target.value) : undefined }))}
                className="w-full text-sm px-3 py-1.5 rounded font-mono"
                style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }} />
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onCancel} className="text-sm px-3 py-1.5 rounded" style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent' }}>
            {t.actions.annulla}
          </button>
          <button
            onClick={() => { if (form.nome.trim()) onSave(form) }}
            className="text-sm px-3 py-1.5 rounded font-medium"
            style={{ background: 'var(--color-accent)', color: 'white' }}>
            {t.actions.aggiungi}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function IngredientiTab({ lang }: Props) {
  const t = TRANSLATIONS[lang]
  const { ingredients, addCustomIngredient, updateCustomIngredient, deleteCustomIngredient } = useBalancerStore()
  const [query, setQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState<IngredientGroup | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<IngredientDefinition | null>(null)

  const groupLabels: Record<IngredientGroup, string> = {
    latticiniUova: t.groups.latticiniUova, neutriBasi: t.groups.neutriBasi, zuccheri: t.groups.zuccheri,
    ingredientiPrincipali: t.groups.ingredientiPrincipali, fruttaVerdura: t.groups.fruttaVerdura,
    alcolici: t.groups.alcolici, alimentiTritati: t.groups.alimentiTritati,
  }

  const filtered = ingredients.filter(i =>
    (activeGroup === 'all' || i.group === activeGroup) &&
    i.nome.toLowerCase().includes(query.toLowerCase())
  )

  const thStyle: React.CSSProperties = {
    textAlign: 'center', fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.07em', color: 'var(--color-text-muted)', padding: '8px 6px',
  }

  return (
    <div>
      {showForm && (
        <IngredientForm lang={lang} groupLabels={groupLabels}
          onSave={(data) => { addCustomIngredient(data); setShowForm(false) }}
          onCancel={() => setShowForm(false)} />
      )}
      {editing && (
        <IngredientForm lang={lang} initial={editing} groupLabels={groupLabels}
          onSave={(data) => { updateCustomIngredient(editing.id, data); setEditing(null) }}
          onCancel={() => setEditing(null)} />
      )}

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{t.ingredienti.title}</h1>
        <input type="text" placeholder={t.actions.cerca} value={query} onChange={e => setQuery(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)', flex: '1 1 180px' }} />
        <select value={activeGroup} onChange={e => setActiveGroup(e.target.value as IngredientGroup | 'all')}
          className="text-sm px-3 py-1.5 rounded-lg"
          style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)' }}>
          <option value="all">{lang === 'it' ? 'Tutti i gruppi' : 'All groups'}</option>
          {GROUPS.map(g => <option key={g} value={g}>{groupLabels[g]}</option>)}
        </select>
        <button onClick={() => setShowForm(true)} className="text-sm font-medium px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--color-accent)', color: 'white' }}>
          {t.ingredienti.aggiungiCustom}
        </button>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm border-collapse">
          <thead style={{ background: 'var(--color-surface-deep)' }}>
            <tr>
              <th style={{ ...thStyle, textAlign: 'left', paddingLeft: 12 }}>{t.ingredienti.nome}</th>
              <th style={thStyle}>{lang === 'it' ? 'Gruppo' : 'Group'}</th>
              <th style={thStyle}>{t.ingredienti.acqua}</th>
              <th style={thStyle}>{t.ingredienti.grassi}</th>
              <th style={thStyle}>{t.ingredienti.slng}</th>
              <th style={thStyle}>{t.ingredienti.altriSolidi}</th>
              <th style={{ ...thStyle, maxWidth: 120 }}>{t.ingredienti.zuccheri}</th>
              <th style={thStyle}>{t.ingredienti.minPct}</th>
              <th style={thStyle}>{t.ingredienti.maxPct}</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ing, idx) => {
              const sugarStr = Object.entries(ing.zuccheri).map(([k, v]) => `${k.substring(0,4)}:${v}`).join(', ')
              return (
                <tr key={ing.id} style={{ background: idx % 2 === 0 ? 'var(--color-base)' : 'var(--color-surface)' }}>
                  <td style={{ padding: '7px 12px', color: 'var(--color-text)', fontSize: 13 }}>
                    {ing.nome}
                    {ing.isReadOnly && (
                      <span className="ml-1.5 text-xs rounded px-1 py-0.5" style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}>🔒</span>
                    )}
                    {ing.isCustom && (
                      <span className="ml-1.5 text-xs rounded px-1 py-0.5" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
                        {lang === 'it' ? 'custom' : 'custom'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 11 }}>{groupLabels[ing.group]}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>{ing.acquaPct}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>{ing.grassiPct}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>{ing.slngPct}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>{ing.altriSolidiPct}</td>
                  <td style={{ padding: '7px 6px', color: 'var(--color-text-muted)', fontSize: 11, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sugarStr}>{sugarStr || '—'}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>{ing.minPct ?? '—'}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>{ing.maxPct ?? '—'}</td>
                  <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                    {!ing.isReadOnly && (
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => setEditing(ing)} className="text-xs" style={{ color: 'var(--color-accent)' }}>
                          {lang === 'it' ? 'Mod.' : 'Edit'}
                        </button>
                        <button onClick={() => { if (confirm(t.ingredienti.confermaElimina)) deleteCustomIngredient(ing.id) }}
                          className="text-xs" style={{ color: 'var(--color-error)' }}>
                          ×
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 24, color: 'var(--color-text-muted)', fontSize: 14 }}>—</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        {filtered.length} {lang === 'it' ? 'ingredienti' : 'ingredients'}
      </div>
    </div>
  )
}
