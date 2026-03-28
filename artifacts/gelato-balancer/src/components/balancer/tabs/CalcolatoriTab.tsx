import { useState } from 'react'
import { TRANSLATIONS, type Lang } from '../../../lib/balancer/i18n'
import { SUGAR_CONSTANTS } from '../../../lib/balancer/constants'

interface Props { lang: Lang }

const COMMON_SUGARS = [
  { name: 'Saccarosio', mw: 342, pac: 100 },
  { name: 'Destrosio (Glucosio)', mw: 180, pac: 190 },
  { name: 'Fruttosio', mw: 122, pac: 280 },
  { name: 'Lattosio', mw: 360, pac: 100 },
  { name: 'Maltosio', mw: 342, pac: 100 },
  { name: 'Sorbitolo', mw: 182, pac: 187 },
  { name: 'Xilitolo', mw: 152, pac: 225 },
  { name: 'Trealosio', mw: 378, pac: 91 },
]

const K_GRASS = 43

export default function CalcolatoriTab({ lang }: Props) {
  const t = TRANSLATIONS[lang]

  // Calculator 1 — PAC from molecular weight
  const [mw, setMw] = useState<number | ''>(342)
  const pac1 = mw !== '' && mw > 0 ? 34200 / mw : null

  // Calculator 2 — PAC for fatty pastes
  const [grassiPct2, setGrassiPct2] = useState<number | ''>(49)
  const [zuccheriPct2, setZuccheriPct2] = useState<number | ''>(6)
  const [sugarType2, setSugarType2] = useState<string>('saccarosio')
  const sugarPAC2 = SUGAR_CONSTANTS[sugarType2]?.PAC ?? 100
  const pac2 = (zuccheriPct2 !== '' && grassiPct2 !== '')
    ? (Number(zuccheriPct2) / 100) * sugarPAC2 - (Number(grassiPct2) / 100) * K_GRASS
    : null

  // Calculator 3 — PAC for chocolate
  const [burrodiCacao, setBurrodiCacao] = useState<number | ''>(54)
  const [cacaoSecco, setCacaoSecco] = useState<number | ''>(45)
  const [zucchero3, setZucchero3] = useState<number | ''>(1)
  const pac3 = (burrodiCacao !== '' && cacaoSecco !== '' && zucchero3 !== '')
    ? (Number(zucchero3) / 100) * 100 + (Number(cacaoSecco) / 100) * 0 - (Number(burrodiCacao) / 100) * K_GRASS
    : null

  const cardStyle: React.CSSProperties = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    padding: 20,
  }
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 4 }
  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--color-border)',
    background: 'var(--color-base)',
    color: 'var(--color-text)',
    padding: '6px 12px',
    borderRadius: 6,
    fontSize: 14,
    fontFamily: 'monospace',
    width: '100%',
  }
  const resultStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 600,
    fontFamily: 'monospace',
    color: 'var(--color-accent)',
    marginTop: 8,
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
        {lang === 'it' ? 'Calcolatori PAC' : 'PAC Calculators'}
      </h1>

      {/* Calculator 1 */}
      <div style={cardStyle}>
        <h2 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{t.calculators.pac_mol.title}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{t.calculators.pac_mol.desc}</p>
        <div className="mb-3">
          <label style={labelStyle}>{t.calculators.pac_mol.pesomolecolare}</label>
          <input type="number" value={mw} onChange={e => setMw(e.target.value === '' ? '' : parseFloat(e.target.value))}
            style={inputStyle} min={1} />
        </div>
        {pac1 !== null && (
          <div>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{t.calculators.pac_mol.risultato} </span>
            <span style={resultStyle}>{pac1.toFixed(1)}</span>
          </div>
        )}

        {/* Reference table */}
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            {t.calculators.pac_mol.tabellaRiferimento}
          </div>
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--color-surface-deep)' }}>
                <tr>
                  <th className="text-left px-3 py-1.5 font-semibold text-xs" style={{ color: 'var(--color-text-muted)' }}>{lang === 'it' ? 'Zucchero' : 'Sugar'}</th>
                  <th className="text-center px-3 py-1.5 font-semibold text-xs" style={{ color: 'var(--color-text-muted)' }}>MW (g/mol)</th>
                  <th className="text-center px-3 py-1.5 font-semibold text-xs" style={{ color: 'var(--color-text-muted)' }}>PAC</th>
                </tr>
              </thead>
              <tbody>
                {COMMON_SUGARS.map((s, i) => (
                  <tr key={s.name} style={{ background: i % 2 === 0 ? 'var(--color-base)' : 'var(--color-surface)' }}>
                    <td className="px-3 py-1.5 text-sm" style={{ color: 'var(--color-text)' }}>{s.name}</td>
                    <td className="px-3 py-1.5 text-center font-mono text-sm" style={{ color: 'var(--color-text-muted)' }}>{s.mw}</td>
                    <td className="px-3 py-1.5 text-center font-mono text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>{s.pac}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Calculator 2 */}
      <div style={cardStyle}>
        <h2 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{t.calculators.pac_paste.title}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{t.calculators.pac_paste.desc}</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label style={labelStyle}>{t.calculators.pac_paste.grassiPct}</label>
            <input type="number" value={grassiPct2}
              onChange={e => setGrassiPct2(e.target.value === '' ? '' : parseFloat(e.target.value))}
              style={inputStyle} min={0} max={100} step={0.1} />
          </div>
          <div>
            <label style={labelStyle}>{t.calculators.pac_paste.zuccheriPct}</label>
            <input type="number" value={zuccheriPct2}
              onChange={e => setZuccheriPct2(e.target.value === '' ? '' : parseFloat(e.target.value))}
              style={inputStyle} min={0} max={100} step={0.1} />
          </div>
        </div>
        <div className="mb-3">
          <label style={labelStyle}>{t.calculators.pac_paste.tipoZucchero}</label>
          <select value={sugarType2} onChange={e => setSugarType2(e.target.value)} style={{ ...inputStyle, fontFamily: 'sans-serif' }}>
            {Object.entries(SUGAR_CONSTANTS).map(([k, v]) => (
              <option key={k} value={k}>{k} (PAC={v.PAC})</option>
            ))}
          </select>
        </div>
        {pac2 !== null && (
          <div>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{t.calculators.pac_paste.risultato} </span>
            <span style={{ ...resultStyle, color: pac2 >= 0 ? 'var(--color-accent)' : 'var(--color-error)' }}>{pac2.toFixed(2)}</span>
          </div>
        )}
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {lang === 'it'
            ? 'Formula: PAC = (zuccheri% / 100) × PAC_zucchero − (grassi% / 100) × 43'
            : 'Formula: PAC = (sugar% / 100) × PAC_sugar − (fat% / 100) × 43'}
        </p>
      </div>

      {/* Calculator 3 */}
      <div style={cardStyle}>
        <h2 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{t.calculators.pac_cioccolato.title}</h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{t.calculators.pac_cioccolato.desc}</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label style={labelStyle}>{t.calculators.pac_cioccolato.burrodiCacao}</label>
            <input type="number" value={burrodiCacao}
              onChange={e => setBurrodiCacao(e.target.value === '' ? '' : parseFloat(e.target.value))}
              style={inputStyle} min={0} max={100} step={0.1} />
          </div>
          <div>
            <label style={labelStyle}>{t.calculators.pac_cioccolato.cacaoSecco}</label>
            <input type="number" value={cacaoSecco}
              onChange={e => setCacaoSecco(e.target.value === '' ? '' : parseFloat(e.target.value))}
              style={inputStyle} min={0} max={100} step={0.1} />
          </div>
          <div>
            <label style={labelStyle}>{t.calculators.pac_cioccolato.zucchero}</label>
            <input type="number" value={zucchero3}
              onChange={e => setZucchero3(e.target.value === '' ? '' : parseFloat(e.target.value))}
              style={inputStyle} min={0} max={100} step={0.1} />
          </div>
        </div>
        {pac3 !== null && (
          <div>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{t.calculators.pac_cioccolato.risultato} </span>
            <span style={{ ...resultStyle, color: pac3 >= 0 ? 'var(--color-accent)' : 'var(--color-error)' }}>{pac3.toFixed(2)}</span>
          </div>
        )}
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {lang === 'it'
            ? 'Formula: PAC = (zucchero%/100)×100 + (cacao secco%/100)×0 − (burro cacao%/100)×43'
            : 'Formula: PAC = (sugar%/100)×100 + (dry cocoa%/100)×0 − (cocoa butter%/100)×43'}
        </p>
      </div>
    </div>
  )
}
