import { useBalancerStore } from '../../store/balancerStore'
import { TRANSLATIONS } from '../../lib/balancer/i18n'
import type { TabType } from '../../lib/balancer/types'
import IstruzioniTab from './tabs/IstruzioniTab'
import ConfigurazioneTab from './tabs/ConfigurazioneTab'
import BilanciamentoTab from './tabs/BilanciamentoTab'
import GelatiSalvatiTab from './tabs/GelatiSalvatiTab'
import CalcolatoriTab from './tabs/CalcolatoriTab'
import IngredientiTab from './tabs/IngredientiTab'

const TABS: TabType[] = ['istruzioni', 'configurazione', 'bilanciamento', 'gelatiSalvati', 'calcolatori', 'ingredienti']

export default function BalancerApp() {
  const { lang, setLang, activeTab, setActiveTab, recipe, clearRecipe, savedSlots } = useBalancerStore()
  const t = TRANSLATIONS[lang]

  function handlePrint() {
    window.print()
  }

  const tabLabels: Record<TabType, string> = {
    istruzioni: t.tabs.istruzioni,
    configurazione: t.tabs.configurazione,
    bilanciamento: t.tabs.bilanciamento,
    gelatiSalvati: t.tabs.gelatiSalvati,
    calcolatori: t.tabs.calcolatori,
    ingredienti: t.tabs.ingredienti,
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-base)', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 no-print"
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          height: '56px',
        }}
      >
        <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between px-4">
          {/* Logo + Title */}
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: 'var(--color-accent)' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '22px',
                fontWeight: 500,
                color: 'var(--color-text)',
                lineHeight: 1,
              }}
            >
              {t.appName}
            </span>
            <span
              className="ml-1 text-xs font-semibold tracking-widest rounded px-1.5 py-0.5"
              style={{
                background: 'var(--color-accent)',
                color: 'white',
                fontSize: '9px',
                letterSpacing: '0.12em',
              }}
            >
              {t.pro}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={clearRecipe}
              className="text-sm font-medium px-3 py-1.5 rounded border"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                background: 'transparent',
              }}
            >
              {t.actions.nuovo}
            </button>
            <button
              onClick={handlePrint}
              className="text-sm font-medium px-3 py-1.5 rounded border"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
                background: 'transparent',
              }}
            >
              {t.actions.stampa}
            </button>
            {/* Language toggle */}
            <div className="ml-3 flex items-center gap-0.5 text-sm font-medium">
              <button
                onClick={() => setLang('en')}
                className="px-2 py-1 rounded"
                style={{
                  fontWeight: lang === 'en' ? 600 : 400,
                  color: lang === 'en' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                }}
              >EN</button>
              <span style={{ color: 'var(--color-border)' }}>|</span>
              <button
                onClick={() => setLang('it')}
                className="px-2 py-1 rounded"
                style={{
                  fontWeight: lang === 'it' ? 600 : 400,
                  color: lang === 'it' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                }}
              >IT</button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <nav
        className="sticky top-14 z-30 no-print overflow-x-auto"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="max-w-screen-xl mx-auto flex px-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="whitespace-nowrap px-4 py-3 text-sm transition-colors"
              style={{
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
                background: 'transparent',
              }}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab content */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {activeTab === 'istruzioni' && <IstruzioniTab lang={lang} />}
        {activeTab === 'configurazione' && <ConfigurazioneTab lang={lang} />}
        {activeTab === 'bilanciamento' && <BilanciamentoTab lang={lang} />}
        {activeTab === 'gelatiSalvati' && <GelatiSalvatiTab lang={lang} />}
        {activeTab === 'calcolatori' && <CalcolatoriTab lang={lang} />}
        {activeTab === 'ingredienti' && <IngredientiTab lang={lang} />}
      </main>
    </div>
  )
}
