import { Fragment, createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { countries, getActiveCountry, setActiveCountry, type Country, type CountryCode } from '../config/countries'

interface CountryState { country: Country; setCountry: (c: CountryCode) => void }
const Ctx = createContext<CountryState | null>(null)

export function CountryProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<CountryCode>(getActiveCountry().code)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const setCountry = useCallback((c: CountryCode) => {
    setActiveCountry(c)
    setCode(c)
    navigate(pathname, { replace: true }) // drop stale filters from the previous country
  }, [navigate, pathname])
  const value = useMemo(() => ({ country: countries[code], setCountry }), [code, setCountry])
  // Re-mount the tree on change so every price and city list re-renders for the new country.
  return <Ctx.Provider value={value}><Fragment key={code}>{children}</Fragment></Ctx.Provider>
}

export function useCountry() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCountry must be used inside CountryProvider')
  return c
}
