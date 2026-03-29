import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface AuthUser {
  id: number
  email: string
  role: 'admin' | 'user'
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<string | null>
  signup: (email: string, password: string) => Promise<string | null>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then((data: AuthUser | null) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const r = await fetch('/api/auth/login', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await r.json()
    if (!r.ok) return data.error as string
    setUser(data as AuthUser)
    return null
  }, [])

  const signup = useCallback(async (email: string, password: string): Promise<string | null> => {
    const r = await fetch('/api/auth/signup', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await r.json()
    if (!r.ok) return data.error as string
    setUser(data as AuthUser)
    return null
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
