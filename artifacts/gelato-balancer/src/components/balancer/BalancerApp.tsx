import { useState, useEffect, useRef } from 'react'
import { useBalancerStore } from '../../store/balancerStore'
import { TRANSLATIONS } from '../../lib/balancer/i18n'
import { useAuth } from '../../lib/authContext'
import type { TabType } from '../../lib/balancer/types'
import AuthModal from '../auth/AuthModal'
import IstruzioniTab from './tabs/IstruzioniTab'
import ConfigurazioneTab from './tabs/ConfigurazioneTab'
import BilanciamentoTab from './tabs/BilanciamentoTab'
import GelatiSalvatiTab from './tabs/GelatiSalvatiTab'
import IngredientiTab from './tabs/IngredientiTab'
import AdminTab from '../admin/AdminTab'
const hilaLogo = `${import.meta.env.BASE_URL}hila-logo.png`

const SECONDARY_TABS: TabType[] = ['istruzioni', 'configurazione']

function OnboardingOverlay({ lang, onDismiss }: { lang: 'en' | 'it'; onDismiss: () => void }) {
  const t = TRANSLATIONS[lang]
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,20,14,0.55)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <img src={hilaLogo} alt="Hila" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
        </div>
        <h2 className="text-xl font-semibold mt-4 mb-1" style={{ color: 'var(--color-text)' }}>
          {t.onboarding.title}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {t.onboarding.subtitle}
        </p>
        <ul className="space-y-3 mb-8">
          {[t.onboarding.bullet1, t.onboarding.bullet2, t.onboarding.bullet3].map((bullet, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--color-accent)', color: 'white' }}>
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>{bullet}</span>
            </li>
          ))}
        </ul>
        <button onClick={onDismiss}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-accent)', color: 'white' }}>
          {t.onboarding.cta} →
        </button>
      </div>
    </div>
  )
}

const ONBOARDING_KEY = 'gelato-balancer:onboarded'

export default function BalancerApp() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const store = useBalancerStore()
  const { lang, setLang, activeTab, setActiveTab, clearRecipe, isLoadingData, loadAppData } = store
  const t = TRANSLATIONS[lang]

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem(ONBOARDING_KEY) } catch { return false }
  })
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) loadAppData()
  }, [user?.id])

  function dismissOnboarding() {
    try { localStorage.setItem(ONBOARDING_KEY, '1') } catch { /* ignore */ }
    setShowOnboarding(false)
    setActiveTab('bilanciamento')
  }
  function handleNewRecipe() { clearRecipe(); setActiveTab('bilanciamento') }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isAdmin = user?.role === 'admin'
  const PRIMARY_TABS: TabType[] = isAdmin
    ? ['gelatiSalvati', 'bilanciamento', 'ingredienti', 'admin']
    : ['gelatiSalvati', 'bilanciamento', 'ingredienti']

  const primaryTabLabels: Record<TabType, string> = {
    gelatiSalvati: t.nav.myRecipes,
    bilanciamento: t.nav.balanceTool,
    ingredienti: t.nav.ingredientsDb,
    istruzioni: t.nav.instructions,
    configurazione: t.nav.configuration,
    calcolatori: t.nav.calculators,
    admin: 'Admin',
  }

  const isSecondaryActive = SECONDARY_TABS.includes(activeTab)

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-base)' }}>
        <div className="flex items-center gap-3">
          <img src={hilaLogo} alt="Hila" style={{ height: 32, width: 'auto', objectFit: 'contain' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, fontWeight: 500, color: 'var(--color-text)' }}>
            Gelato Balance
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-base)', fontFamily: 'var(--font-body)' }}>
      {!user && <AuthModal />}
      {showOnboarding && user && <OnboardingOverlay lang={lang} onDismiss={dismissOnboarding} />}

      {/* Header */}
      <header className="sticky top-0 z-40 no-print"
        style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', height: '56px' }}>
        <div className="max-w-screen-xl mx-auto h-full flex items-center justify-between px-4 gap-4">

          {/* Branding */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img src={hilaLogo} alt="Hila Sicilian Gelato" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '20px', fontWeight: 500, color: 'var(--color-text)' }}>
                Gelato Balance
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '0.05em' }}>
                by Hila
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {isLoadingData && (
              <span className="text-xs px-2" style={{ color: 'var(--color-text-muted)' }}>Loading…</span>
            )}

            {/* ? Instructions button */}
            <button
              onClick={() => setActiveTab('istruzioni')}
              className="w-8 h-8 flex items-center justify-center rounded-lg border font-semibold text-sm transition-colors"
              style={{
                border: '1px solid var(--color-border)',
                background: activeTab === 'istruzioni' ? 'var(--color-surface-deep)' : 'transparent',
                color: activeTab === 'istruzioni' ? 'var(--color-accent)' : 'var(--color-text-muted)',
              }}
              title={t.nav.instructions}>
              ?
            </button>

            {/* Language toggle */}
            <div className="flex items-center gap-0.5 text-sm font-medium">
              <button onClick={() => setLang('en')} className="px-2 py-1 rounded"
                style={{ fontWeight: lang === 'en' ? 600 : 400, color: lang === 'en' ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>EN</button>
              <span style={{ color: 'var(--color-border)' }}>|</span>
              <button onClick={() => setLang('it')} className="px-2 py-1 rounded"
                style={{ fontWeight: lang === 'it' ? 600 : 400, color: lang === 'it' ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>IT</button>
            </div>

            {/* User menu */}
            {user && (
              <div className="relative ml-1" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(o => !o)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: isAdmin ? 'var(--color-accent)' : 'var(--color-surface-deep)', color: isAdmin ? 'white' : 'var(--color-text)' }}
                  title={user.email}>
                  {user.email[0].toUpperCase()}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-10 w-56 rounded-xl shadow-lg py-1 z-50"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{user.email}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {isAdmin ? '★ Admin' : 'User'}
                      </div>
                    </div>
                    <button onClick={async () => { setUserMenuOpen(false); await logout() }}
                      className="w-full text-left px-3 py-2 text-sm"
                      style={{ color: 'var(--color-text-muted)', background: 'transparent' }}>
                      {lang === 'it' ? 'Esci' : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Primary Tab bar */}
      {!isSecondaryActive && (
        <nav className="sticky top-14 z-30 no-print overflow-x-auto"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="max-w-screen-xl mx-auto flex px-4">
            {PRIMARY_TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="whitespace-nowrap px-5 py-3.5 text-sm transition-colors"
                style={{
                  fontWeight: activeTab === tab ? 600 : 400,
                  color: activeTab === tab ? 'var(--color-text)' : 'var(--color-text-muted)',
                  borderBottom: activeTab === tab ? '2px solid var(--color-accent)' : '2px solid transparent',
                  background: 'transparent',
                }}>
                {tab === 'admin' && isAdmin && (
                  <span className="mr-1.5 text-xs font-bold" style={{ color: 'var(--color-accent)' }}>★</span>
                )}
                {primaryTabLabels[tab]}
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* Secondary breadcrumb */}
      {isSecondaryActive && (
        <div className="sticky top-14 z-30 no-print"
          style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center gap-2">
            <button onClick={() => setActiveTab('gelatiSalvati')} className="text-sm transition-colors"
              style={{ color: 'var(--color-text-muted)' }}>
              ← {t.nav.myRecipes}
            </button>
            <span style={{ color: 'var(--color-border)' }}>/</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
              {primaryTabLabels[activeTab]}
            </span>
          </div>
        </div>
      )}

      {/* Tab content */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {activeTab === 'gelatiSalvati' && <GelatiSalvatiTab lang={lang} onNewRecipe={handleNewRecipe} />}
        {activeTab === 'bilanciamento' && <BilanciamentoTab lang={lang} />}
        {activeTab === 'ingredienti' && <IngredientiTab lang={lang} />}
        {activeTab === 'istruzioni' && <IstruzioniTab lang={lang} />}
        {activeTab === 'configurazione' && <ConfigurazioneTab lang={lang} />}
        {activeTab === 'admin' && isAdmin && <AdminTab lang={lang} />}
      </main>
    </div>
  )
}
