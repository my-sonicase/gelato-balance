import { useBalancerStore } from '../../../store/balancerStore'
import { TRANSLATIONS, type Lang } from '../../../lib/balancer/i18n'
import type { ProfileType, ProfileRanges } from '../../../lib/balancer/types'

interface Props { lang: Lang }

const PROFILES: ProfileType[] = ['gelato', 'sorbetto', 'granita', 'vegan', 'gastronomico', 'personalizzato1', 'personalizzato2']
const PARAMS: (keyof ProfileRanges)[] = ['zuccheri', 'grassi', 'slng', 'altriSolidi', 'solidiTotali', 'pod', 'pac', 'frutta', 'alcolici', 'overrun', 'alimentiTritati']

export default function ConfigurazioneTab({ lang }: Props) {
  const t = TRANSLATIONS[lang]
  const { profileRanges, updateProfileRange, resetProfileRanges } = useBalancerStore()

  const paramLabels: Record<keyof ProfileRanges, string> = {
    zuccheri: t.parameters.zuccheri,
    grassi: t.parameters.grassi,
    slng: t.parameters.slng,
    altriSolidi: t.parameters.altriSolidi,
    solidiTotali: t.parameters.solidiTotali,
    pod: t.parameters.pod,
    pac: t.parameters.pac,
    frutta: t.parameters.frutta,
    alcolici: t.parameters.alcolici,
    overrun: t.parameters.overrun,
    alimentiTritati: t.parameters.alimentiTritati,
  }

  const profileLabels: Record<ProfileType, string> = {
    gelato: t.profiles.gelato,
    sorbetto: t.profiles.sorbetto,
    granita: t.profiles.granita,
    vegan: t.profiles.vegan,
    gastronomico: t.profiles.gastronomico,
    personalizzato1: t.profiles.personalizzato1,
    personalizzato2: t.profiles.personalizzato2,
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{t.configurazione.title}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{t.configurazione.rangesDescription}</p>
      </div>

      <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ background: 'var(--color-surface-deep)' }}>
              <th className="text-left px-3 py-2 font-semibold sticky left-0" style={{ color: 'var(--color-text)', background: 'var(--color-surface-deep)', minWidth: '150px', borderRight: '1px solid var(--color-border)' }}>
                {lang === 'it' ? 'Parametro' : 'Parameter'}
              </th>
              {PROFILES.map(profile => (
                <th key={profile} className="px-3 py-2 text-center" style={{ color: 'var(--color-text)', minWidth: '110px', borderRight: '1px solid var(--color-border)' }}>
                  <div className="text-xs font-semibold">{profileLabels[profile]}</div>
                  <button
                    onClick={() => resetProfileRanges(profile)}
                    className="text-xs mt-1 px-2 py-0.5 rounded"
                    style={{ color: 'var(--color-accent)', fontWeight: 500, border: '1px solid var(--color-border)', background: 'transparent' }}
                  >
                    {t.configurazione.ripristina}
                  </button>
                </th>
              ))}
            </tr>
            <tr style={{ background: 'var(--color-surface)' }}>
              <th className="sticky left-0" style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }} />
              {PROFILES.map(profile => (
                <th key={profile} className="px-2 py-1" style={{ borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="grid grid-cols-2 gap-1">
                    <span className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.configurazione.minLabel}</span>
                    <span className="text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.configurazione.maxLabel}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PARAMS.map((param, idx) => (
              <tr key={param} style={{ background: idx % 2 === 0 ? 'var(--color-base)' : 'var(--color-surface)' }}>
                <td className="px-3 py-2 sticky left-0 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)', background: idx % 2 === 0 ? 'var(--color-base)' : 'var(--color-surface)', borderRight: '1px solid var(--color-border)', letterSpacing: '0.06em' }}>
                  {paramLabels[param]}
                </td>
                {PROFILES.map(profile => {
                  const range = profileRanges[profile][param]
                  return (
                    <td key={profile} className="px-2 py-1.5 text-center" style={{ borderRight: '1px solid var(--color-border)' }}>
                      <div className="grid grid-cols-2 gap-1">
                        <input
                          type="number"
                          value={range.min}
                          onChange={e => updateProfileRange(profile, param, { ...range, min: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center text-xs rounded px-1 py-1 font-mono"
                          style={{
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-base)',
                            color: 'var(--color-text)',
                          }}
                          step="0.5"
                        />
                        <input
                          type="number"
                          value={range.max}
                          onChange={e => updateProfileRange(profile, param, { ...range, max: parseFloat(e.target.value) || 0 })}
                          className="w-full text-center text-xs rounded px-1 py-1 font-mono"
                          style={{
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-base)',
                            color: 'var(--color-text)',
                          }}
                          step="0.5"
                        />
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
