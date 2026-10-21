import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import * as api from '../lib/api'
import { useCountry } from '../lib/country'
import type { Role, User } from '../lib/types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  registerBrand: (body: Record<string, unknown>) => Promise<User>
  registerCreator: (body: Record<string, unknown>) => Promise<User>
  logout: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

export const homeFor = (role: Role) => (role === 'admin' ? '/admin' : role === 'brand' ? '/dashboard/brand' : '/dashboard/creator')

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { country, setCountry } = useCountry()

  // Logged-in users use the country of their account, so the currency matches their records.
  const adopt = useCallback((u: User) => {
    setUser(u)
    if (u.country && u.country !== country.code) setCountry(u.country)
    return u
  }, [country.code, setCountry])

  useEffect(() => {
    api.me().then(adopt).catch(() => setUser(null)).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email: string, password: string) => adopt(await api.login({ email, password })), [adopt])
  const registerBrand = useCallback(async (b: Record<string, unknown>) => adopt(await api.registerBrand(b)), [adopt])
  const registerCreator = useCallback(async (b: Record<string, unknown>) => adopt(await api.registerCreator(b)), [adopt])
  const logout = useCallback(async () => {
    try { await api.logout() } finally { setUser(null) }
  }, [])

  const value = useMemo(() => ({ user, loading, login, registerBrand, registerCreator, logout }), [user, loading, login, registerBrand, registerCreator, logout])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used inside AuthProvider')
  return c
}

// UI-level guard only. The backend enforces the same rules with policies.
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <p className="container-page py-24 text-muted" role="status">Checking your session…</p>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />
  return <>{children}</>
}
