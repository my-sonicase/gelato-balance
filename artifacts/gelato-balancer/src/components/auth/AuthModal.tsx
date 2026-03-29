import { useState } from 'react'
import { useAuth } from '../../lib/authContext'

export default function AuthModal() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = mode === 'login'
      ? await login(email, password)
      : await signup(email, password)
    setLoading(false)
    if (err) setError(err)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,20,14,0.65)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ background: 'var(--color-base)', border: '1px solid var(--color-border)' }}>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, fontWeight: 500, color: 'var(--color-text)' }}>
            Gelato Balancer
          </span>
          <span className="text-xs font-semibold rounded px-1.5 py-0.5" style={{ background: 'var(--color-accent)', color: 'white', fontSize: 9, letterSpacing: '0.12em' }}>PRO</span>
        </div>

        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          {mode === 'login' ? 'Welcome back to your workspace.' : 'Start building your recipe library.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-muted)' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              placeholder={mode === 'signup' ? 'At least 8 characters' : ''}
            />
          </div>

          {error && (
            <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(196,98,45,0.1)', color: 'var(--color-accent)' }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition-opacity"
            style={{ background: 'var(--color-accent)', color: 'white', opacity: loading ? 0.7 : 1 }}>
            {loading ? '…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {mode === 'login' ? (
            <>No account? <button onClick={() => { setMode('signup'); setError(null) }} className="font-semibold" style={{ color: 'var(--color-accent)' }}>Create one</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); setError(null) }} className="font-semibold" style={{ color: 'var(--color-accent)' }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  )
}
