import { useState, useEffect } from 'react'
import type { Lang } from '../../lib/balancer/i18n'

interface Props { lang: Lang }

interface SysIngredient {
  id: string; nome: string; nomeEN: string; group: string
  acquaPct: string; grassiPct: string; slngPct: string; altriSolidiPct: string
  podDirect?: number | null; pacDirect?: number | null
  isArchived: boolean
}

interface SysRecipe {
  id: string; nome: string; profile: string; overrunPct: number; thumbnail?: string
  lines: Array<{ ingredientId: string; weightG: number }>
  isArchived: boolean
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!r.ok) {
    const body = await r.json().catch(() => ({ error: r.statusText }))
    throw new Error((body as { error?: string }).error ?? r.statusText)
  }
  return r.json() as Promise<T>
}

const GROUP_LABELS: Record<string, string> = {
  latticiniUova: 'Dairy & Eggs', zuccheri: 'Sugars', neutriBasi: 'Bases & Neutrals',
  ingredientiPrincipali: 'Main Ingredients', fruttaVerdura: 'Fruit & Veg',
  alcolici: 'Alcoholic', alimentiTritati: 'Other Solids',
}

const PROFILES = ['gelato', 'sorbetto', 'granita', 'vegan', 'gastronomico', 'personalizzato1', 'personalizzato2']

const INPUT_STYLE = {
  border: '1px solid var(--color-border)', background: 'var(--color-surface-deep)',
  color: 'var(--color-text)', borderRadius: 6, padding: '5px 8px', fontSize: 13, width: '100%',
}
const LABEL_STYLE = { fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }

export default function AdminTab({ lang }: Props) {
  const [section, setSection] = useState<'ingredients' | 'recipes'>('ingredients')
  const [ingredients, setIngredients] = useState<SysIngredient[]>([])
  const [recipes, setRecipes] = useState<SysRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ingSearch, setIngSearch] = useState('')
  const [recSearch, setRecSearch] = useState('')

  const [editIngId, setEditIngId] = useState<string | null>(null)
  const [addingIng, setAddingIng] = useState(false)
  const [ingForm, setIngForm] = useState<Partial<SysIngredient>>({})

  const [editRecId, setEditRecId] = useState<string | null>(null)
  const [recForm, setRecForm] = useState<{ nome: string; profile: string; overrunPct: string }>({ nome: '', profile: 'gelato', overrunPct: '35' })

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiFetch<SysIngredient[]>('/admin/ingredients'),
      apiFetch<SysRecipe[]>('/admin/recipes'),
    ]).then(([ings, recs]) => {
      setIngredients(ings)
      setRecipes(recs)
    }).catch(err => setError(String(err)))
      .finally(() => setLoading(false))
  }, [])

  async function toggleArchiveIng(id: string, isArchived: boolean) {
    try {
      const updated = await apiFetch<SysIngredient>(`/admin/ingredients/${id}`, {
        method: 'PATCH', body: JSON.stringify({ isArchived: !isArchived }),
      })
      setIngredients(prev => prev.map(i => i.id === id ? updated : i))
    } catch (err) { setError(String(err)) }
  }

  async function saveIng() {
    if (!ingForm.nome || !ingForm.group) return
    const payload = {
      nome: ingForm.nome, nomeEN: ingForm.nomeEN,
      group: ingForm.group,
      acquaPct: Number(ingForm.acquaPct ?? 0),
      grassiPct: Number(ingForm.grassiPct ?? 0),
      slngPct: Number(ingForm.slngPct ?? 0),
      altriSolidiPct: Number(ingForm.altriSolidiPct ?? 0),
      podDirect: ingForm.podDirect != null ? Number(ingForm.podDirect) : null,
      pacDirect: ingForm.pacDirect != null ? Number(ingForm.pacDirect) : null,
    }
    try {
      if (editIngId) {
        const updated = await apiFetch<SysIngredient>(`/admin/ingredients/${editIngId}`, {
          method: 'PATCH', body: JSON.stringify(payload),
        })
        setIngredients(prev => prev.map(i => i.id === editIngId ? updated : i))
        setEditIngId(null)
      } else {
        const created = await apiFetch<SysIngredient>('/admin/ingredients', {
          method: 'POST', body: JSON.stringify(payload),
        })
        setIngredients(prev => [...prev, created])
        setAddingIng(false)
      }
      setIngForm({})
    } catch (err) { setError(String(err)) }
  }

  async function toggleArchiveRecipe(id: string, isArchived: boolean) {
    try {
      const updated = await apiFetch<SysRecipe>(`/admin/recipes/${id}`, {
        method: 'PATCH', body: JSON.stringify({ isArchived: !isArchived }),
      })
      setRecipes(prev => prev.map(r => r.id === id ? updated : r))
    } catch (err) { setError(String(err)) }
  }

  async function saveRec() {
    if (!recForm.nome || !editRecId) return
    try {
      const updated = await apiFetch<SysRecipe>(`/admin/recipes/${editRecId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          nome: recForm.nome,
          profile: recForm.profile,
          overrunPct: Number(recForm.overrunPct),
        }),
      })
      setRecipes(prev => prev.map(r => r.id === editRecId ? updated : r))
      setEditRecId(null)
    } catch (err) { setError(String(err)) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span style={{ color: 'var(--color-text-muted)' }}>Loading admin data…</span>
      </div>
    )
  }

  const TAB_STYLE = (active: boolean) => ({
    fontWeight: active ? 600 : 400,
    color: active ? 'var(--color-text)' : 'var(--color-text-muted)',
    borderBottom: active ? '2px solid var(--color-accent)' : '2px solid transparent',
    background: 'transparent',
  })

  const filteredIngs = ingredients.filter(i =>
    i.nome.toLowerCase().includes(ingSearch.toLowerCase()) ||
    (i.nomeEN ?? '').toLowerCase().includes(ingSearch.toLowerCase())
  )

  const filteredRecs = recipes.filter(r =>
    r.nome.toLowerCase().includes(recSearch.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>Admin Panel</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {lang === 'it' ? 'Gestisci ingredienti e ricette di sistema' : 'Manage system ingredients and recipes'}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm px-4 py-2 rounded-lg" style={{ background: 'rgba(196,98,45,0.1)', color: 'var(--color-accent)' }}>
          Error: {error} <button className="ml-2 underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="flex gap-0 mb-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        {(['ingredients', 'recipes'] as const).map(s => (
          <button key={s} onClick={() => setSection(s)}
            className="px-5 py-3 text-sm" style={TAB_STYLE(section === s)}>
            {s === 'ingredients'
              ? (lang === 'it' ? `Ingredienti (${ingredients.length})` : `Ingredients (${ingredients.length})`)
              : (lang === 'it' ? `Ricette (${recipes.length})` : `Recipes (${recipes.length})`)}
          </button>
        ))}
      </div>

      {/* ─── INGREDIENTS ─────────────────────────────────────────── */}
      {section === 'ingredients' && (
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)', flex: '0 0 auto' }}>
              {ingredients.filter(i => !i.isArchived).length} active · {ingredients.filter(i => i.isArchived).length} archived
            </p>
            <input
              type="text" placeholder={lang === 'it' ? 'Cerca…' : 'Search…'}
              value={ingSearch} onChange={e => setIngSearch(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)', flex: '1 1 180px', minWidth: 140 }}
            />
            <button
              onClick={() => { setAddingIng(true); setIngForm({}); setEditIngId(null) }}
              className="text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: 'var(--color-accent)', color: 'white', flex: '0 0 auto' }}>
              + {lang === 'it' ? 'Nuovo' : 'New'}
            </button>
          </div>

          {/* Add/Edit form */}
          {(addingIng || editIngId) && (
            <div className="rounded-xl p-4 mb-5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                {editIngId ? (lang === 'it' ? 'Modifica ingrediente' : 'Edit ingredient') : (lang === 'it' ? 'Nuovo ingrediente di sistema' : 'Add system ingredient')}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label style={LABEL_STYLE}>Name (IT)</label>
                  <input style={INPUT_STYLE} type="text"
                    value={ingForm.nome ?? ''}
                    onChange={e => setIngForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Name (EN)</label>
                  <input style={INPUT_STYLE} type="text"
                    value={ingForm.nomeEN ?? ''}
                    onChange={e => setIngForm(f => ({ ...f, nomeEN: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Group</label>
                  <select style={INPUT_STYLE}
                    value={ingForm.group ?? ''}
                    onChange={e => setIngForm(f => ({ ...f, group: e.target.value }))}>
                    <option value="">Select group…</option>
                    {Object.entries(GROUP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Water %</label>
                  <input style={INPUT_STYLE} type="number" min={0} max={100} step={0.1}
                    value={ingForm.acquaPct ?? ''}
                    onChange={e => setIngForm(f => ({ ...f, acquaPct: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Fat %</label>
                  <input style={INPUT_STYLE} type="number" min={0} max={100} step={0.1}
                    value={ingForm.grassiPct ?? ''}
                    onChange={e => setIngForm(f => ({ ...f, grassiPct: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>MSNF %</label>
                  <input style={INPUT_STYLE} type="number" min={0} max={100} step={0.1}
                    value={ingForm.slngPct ?? ''}
                    onChange={e => setIngForm(f => ({ ...f, slngPct: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Other Solids %</label>
                  <input style={INPUT_STYLE} type="number" min={0} max={100} step={0.1}
                    value={ingForm.altriSolidiPct ?? ''}
                    onChange={e => setIngForm(f => ({ ...f, altriSolidiPct: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>POD (per 100g) — direct override</label>
                  <input style={INPUT_STYLE} type="number" min={0} step={0.1} placeholder="Leave blank to compute from sugars"
                    value={ingForm.podDirect ?? ''}
                    onChange={e => setIngForm(f => ({ ...f, podDirect: e.target.value === '' ? null : Number(e.target.value) }))} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>PAC (per 100g) — direct override</label>
                  <input style={INPUT_STYLE} type="number" min={0} step={0.1} placeholder="Leave blank to compute from sugars"
                    value={ingForm.pacDirect ?? ''}
                    onChange={e => setIngForm(f => ({ ...f, pacDirect: e.target.value === '' ? null : Number(e.target.value) }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveIng}
                  className="text-sm font-semibold px-4 py-1.5 rounded-lg"
                  style={{ background: 'var(--color-accent)', color: 'white' }}>
                  Save
                </button>
                <button onClick={() => { setAddingIng(false); setEditIngId(null); setIngForm({}) }}
                  className="text-sm px-4 py-1.5 rounded-lg"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Name', 'EN', 'Group', 'Water', 'Fat', 'MSNF', 'Other', 'POD', 'PAC', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredIngs.map((ing, idx) => (
                  <tr key={ing.id}
                    style={{
                      background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface)',
                      opacity: ing.isArchived ? 0.5 : 1,
                      borderBottom: '1px solid var(--color-border)',
                    }}>
                    <td className="px-3 py-1.5 font-medium" style={{ color: 'var(--color-text)' }}>{ing.nome}</td>
                    <td className="px-3 py-1.5" style={{ color: 'var(--color-text-muted)' }}>{ing.nomeEN}</td>
                    <td className="px-3 py-1.5" style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{GROUP_LABELS[ing.group] ?? ing.group}</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{ing.acquaPct}%</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{ing.grassiPct}%</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{ing.slngPct}%</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{ing.altriSolidiPct}%</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {ing.podDirect != null ? ing.podDirect : <span style={{ opacity: 0.4 }}>auto</span>}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {ing.pacDirect != null ? ing.pacDirect : <span style={{ opacity: 0.4 }}>auto</span>}
                    </td>
                    <td className="px-3 py-1.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditIngId(ing.id)
                            setAddingIng(false)
                            setIngForm({ ...ing })
                          }}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent' }}>
                          Edit
                        </button>
                        <button
                          onClick={() => toggleArchiveIng(ing.id, ing.isArchived)}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ border: '1px solid var(--color-border)', color: ing.isArchived ? 'var(--color-accent)' : 'var(--color-text-muted)', background: 'transparent' }}>
                          {ing.isArchived ? 'Restore' : 'Archive'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── RECIPES ──────────────────────────────────────────────── */}
      {section === 'recipes' && (
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)', flex: '0 0 auto' }}>
              {recipes.filter(r => !r.isArchived).length} active · {recipes.filter(r => r.isArchived).length} archived
            </p>
            <input
              type="text" placeholder={lang === 'it' ? 'Cerca…' : 'Search…'}
              value={recSearch} onChange={e => setRecSearch(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-base)', color: 'var(--color-text)', flex: '1 1 180px', minWidth: 140 }}
            />
          </div>

          {/* Recipe edit form */}
          {editRecId && (
            <div className="rounded-xl p-4 mb-5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                {lang === 'it' ? 'Modifica ricetta' : 'Edit recipe'}
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="col-span-1">
                  <label style={LABEL_STYLE}>{lang === 'it' ? 'Nome' : 'Name'}</label>
                  <input style={INPUT_STYLE} type="text"
                    value={recForm.nome}
                    onChange={e => setRecForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Profile</label>
                  <select style={INPUT_STYLE}
                    value={recForm.profile}
                    onChange={e => setRecForm(f => ({ ...f, profile: e.target.value }))}>
                    {PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Overrun %</label>
                  <input style={INPUT_STYLE} type="number" min={0} max={100} step={1}
                    value={recForm.overrunPct}
                    onChange={e => setRecForm(f => ({ ...f, overrunPct: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={saveRec}
                  className="text-sm font-semibold px-4 py-1.5 rounded-lg"
                  style={{ background: 'var(--color-accent)', color: 'white' }}>
                  Save
                </button>
                <button onClick={() => setEditRecId(null)}
                  className="text-sm px-4 py-1.5 rounded-lg"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Name', 'Profile', 'Overrun', 'Ingredients', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecs.map((r, idx) => (
                  <tr key={r.id}
                    style={{
                      background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface)',
                      opacity: r.isArchived ? 0.5 : 1,
                      borderBottom: '1px solid var(--color-border)',
                    }}>
                    <td className="px-3 py-1.5 font-medium" style={{ color: 'var(--color-text)' }}>{r.nome}</td>
                    <td className="px-3 py-1.5" style={{ color: 'var(--color-text-muted)' }}>{r.profile}</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.overrunPct}%</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{r.lines.length}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditRecId(r.id)
                            setRecForm({ nome: r.nome, profile: r.profile, overrunPct: String(r.overrunPct) })
                          }}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', background: 'transparent' }}>
                          Edit
                        </button>
                        <button
                          onClick={() => toggleArchiveRecipe(r.id, r.isArchived)}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ border: '1px solid var(--color-border)', color: r.isArchived ? 'var(--color-accent)' : 'var(--color-text-muted)', background: 'transparent' }}>
                          {r.isArchived ? 'Restore' : 'Archive'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
