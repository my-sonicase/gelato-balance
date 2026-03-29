import { useState, useEffect } from 'react'
import type { Lang } from '../../lib/balancer/i18n'

interface Props { lang: Lang }

interface SysIngredient {
  id: string; nome: string; nomeEN: string; groupName: string
  acquaPct: string; grassiPct: string; slngPct: string; altriSolidiPct: string
  isArchived: boolean
}

interface SysRecipe {
  id: string; nome: string; profile: string; overrunPct: string; thumbnail?: string
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

export default function AdminTab({ lang }: Props) {
  const [section, setSection] = useState<'ingredients' | 'recipes'>('ingredients')
  const [ingredients, setIngredients] = useState<SysIngredient[]>([])
  const [recipes, setRecipes] = useState<SysRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editIngId, setEditIngId] = useState<string | null>(null)
  const [addingIng, setAddingIng] = useState(false)
  const [ingForm, setIngForm] = useState<Partial<SysIngredient>>({})

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
    if (!ingForm.nome || !ingForm.groupName) return
    try {
      if (editIngId) {
        const updated = await apiFetch<SysIngredient>(`/admin/ingredients/${editIngId}`, {
          method: 'PATCH', body: JSON.stringify(ingForm),
        })
        setIngredients(prev => prev.map(i => i.id === editIngId ? updated : i))
        setEditIngId(null)
      } else {
        const created = await apiFetch<SysIngredient>('/admin/ingredients', {
          method: 'POST', body: JSON.stringify(ingForm),
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

  return (
    <div>
      {/* Admin page title */}
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

      {/* Section tabs */}
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

      {/* ─── INGREDIENTS ───────────────────────────────────────── */}
      {section === 'ingredients' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {ingredients.filter(i => !i.isArchived).length} active · {ingredients.filter(i => i.isArchived).length} archived
            </p>
            <button
              onClick={() => { setAddingIng(true); setIngForm({}); setEditIngId(null) }}
              className="text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: 'var(--color-accent)', color: 'white' }}>
              + {lang === 'it' ? 'Nuovo ingrediente' : 'New ingredient'}
            </button>
          </div>

          {/* Add/Edit form */}
          {(addingIng || editIngId) && (
            <div className="rounded-xl p-4 mb-5"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                {editIngId ? 'Edit ingredient' : 'Add system ingredient'}
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[
                  ['nome', 'Name (IT)'], ['nomeEN', 'Name (EN)'],
                  ['groupName', 'Group'], ['acquaPct', 'Water %'],
                  ['grassiPct', 'Fat %'], ['slngPct', 'MSNF %'],
                  ['altriSolidiPct', 'Other Solids %'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="text-xs block mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
                    {key === 'groupName' ? (
                      <select
                        value={ingForm[key as keyof SysIngredient] as string ?? ''}
                        onChange={e => setIngForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-2 py-1.5 rounded text-sm"
                        style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-deep)', color: 'var(--color-text)' }}>
                        <option value="">Select group…</option>
                        {Object.entries(GROUP_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    ) : (
                      <input
                        type={['acquaPct', 'grassiPct', 'slngPct', 'altriSolidiPct'].includes(key) ? 'number' : 'text'}
                        value={ingForm[key as keyof SysIngredient] as string ?? ''}
                        onChange={e => setIngForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-2 py-1.5 rounded text-sm"
                        style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-deep)', color: 'var(--color-text)' }}
                      />
                    )}
                  </div>
                ))}
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

          {/* Ingredients table */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Name', 'EN', 'Group', 'Water', 'Fat', 'MSNF', 'Other', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing, idx) => (
                  <tr key={ing.id}
                    style={{
                      background: idx % 2 === 0 ? 'transparent' : 'var(--color-surface)',
                      opacity: ing.isArchived ? 0.5 : 1,
                      borderBottom: '1px solid var(--color-border)',
                    }}>
                    <td className="px-3 py-1.5 font-medium" style={{ color: 'var(--color-text)' }}>{ing.nome}</td>
                    <td className="px-3 py-1.5" style={{ color: 'var(--color-text-muted)' }}>{ing.nomeEN}</td>
                    <td className="px-3 py-1.5" style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>{GROUP_LABELS[ing.groupName] ?? ing.groupName}</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{ing.acquaPct}%</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{ing.grassiPct}%</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{ing.slngPct}%</td>
                    <td className="px-3 py-1.5 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>{ing.altriSolidiPct}%</td>
                    <td className="px-3 py-1.5">
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditIngId(ing.id); setAddingIng(false); setIngForm(ing) }}
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

      {/* ─── RECIPES ────────────────────────────────────────────── */}
      {section === 'recipes' && (
        <div>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {recipes.filter(r => !r.isArchived).length} active · {recipes.filter(r => r.isArchived).length} archived
          </p>
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
                {recipes.map((r, idx) => (
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
                      <button
                        onClick={() => toggleArchiveRecipe(r.id, r.isArchived)}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ border: '1px solid var(--color-border)', color: r.isArchived ? 'var(--color-accent)' : 'var(--color-text-muted)', background: 'transparent' }}>
                        {r.isArchived ? 'Restore' : 'Archive'}
                      </button>
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
