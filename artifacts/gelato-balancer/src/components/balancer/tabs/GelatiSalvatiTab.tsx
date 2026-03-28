import { useBalancerStore } from '../../../store/balancerStore'
import { TRANSLATIONS, type Lang } from '../../../lib/balancer/i18n'
import { SLOT_NAMES } from '../../../lib/balancer/constants'
import type { ProfileType } from '../../../lib/balancer/types'

interface Props { lang: Lang }

const PROFILES: ProfileType[] = ['gelato', 'sorbetto', 'granita', 'vegan', 'gastronomico', 'personalizzato1', 'personalizzato2']

export default function GelatiSalvatiTab({ lang }: Props) {
  const t = TRANSLATIONS[lang]
  const { savedSlots, saveToSlot, loadFromSlot, deleteSlot, recipe } = useBalancerStore()

  const profileLabels: Record<ProfileType, string> = {
    gelato: t.profiles.gelato, sorbetto: t.profiles.sorbetto, granita: t.profiles.granita,
    vegan: t.profiles.vegan, gastronomico: t.profiles.gastronomico,
    personalizzato1: t.profiles.personalizzato1, personalizzato2: t.profiles.personalizzato2,
  }

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{t.savedRecipes.title}</h1>

      {PROFILES.map(profile => {
        const slots = SLOT_NAMES[profile]
        return (
          <section key={profile}>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.1em' }}>
              {profileLabels[profile]}
            </h2>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {slots.map(slotName => {
                const saved = savedSlots[slotName]
                return (
                  <div
                    key={slotName}
                    className="rounded-xl p-4 flex flex-col gap-2"
                    style={{ background: 'var(--color-surface)', border: `1px solid ${saved ? 'var(--color-accent)' : 'var(--color-border)'}`, opacity: saved ? 1 : 0.7 }}
                  >
                    <div className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{slotName}</div>
                    {saved ? (
                      <>
                        <div className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{saved.nome || '—'}</div>
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          {t.savedRecipes.dataSalvataggio}: {new Date(saved.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-1 text-xs font-mono flex-wrap">
                          <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}>
                            Z: {/* Compute zuccheri */}
                            {saved.lines.length > 0 && saved.lines.reduce((acc, l) => {
                              const tot = saved.lines.reduce((s, ll) => s + ll.weightG, 0)
                              if (tot === 0) return acc
                              const sugarTot = Object.values(l.ingredient.zuccheri).reduce((s, v) => s + (v ?? 0), 0)
                              return acc + (l.weightG / tot) * sugarTot
                            }, 0).toFixed(1)}%
                          </span>
                          <span className="px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-deep)', color: 'var(--color-text-muted)' }}>
                            G: {saved.lines.length > 0 && (() => {
                              const tot = saved.lines.reduce((s, l) => s + l.weightG, 0)
                              if (tot === 0) return '—'
                              return (saved.lines.reduce((s, l) => s + (l.weightG / tot) * l.ingredient.grassiPct, 0)).toFixed(1) + '%'
                            })()}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => loadFromSlot(slotName)}
                            className="flex-1 text-xs font-medium py-1.5 rounded"
                            style={{ background: 'var(--color-accent)', color: 'white' }}
                          >
                            {t.savedRecipes.caricaInBalancer}
                          </button>
                          <button
                            onClick={() => { if (confirm(lang === 'it' ? 'Eliminare questa ricetta?' : 'Delete this recipe?')) deleteSlot(slotName) }}
                            className="text-xs px-2 py-1.5 rounded"
                            style={{ border: '1px solid var(--color-border)', color: 'var(--color-error)', background: 'transparent' }}
                          >
                            ×
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.savedRecipes.vuoto}</div>
                        <button
                          onClick={() => {
                            if (recipe.profile === profile) {
                              saveToSlot(slotName)
                            } else {
                              alert(lang === 'it' ? `La ricetta corrente è di tipo ${profileLabels[recipe.profile]}. Cambia profilo prima di salvare qui.` : `Current recipe is type ${profileLabels[recipe.profile]}. Change profile first.`)
                            }
                          }}
                          className="text-xs font-medium py-1.5 rounded mt-1"
                          style={{ border: '1px dashed var(--color-accent)', color: 'var(--color-accent)', background: 'transparent' }}
                        >
                          {t.actions.salvaQui}
                        </button>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
