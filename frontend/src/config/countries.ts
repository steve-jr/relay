export type CountryCode = 'GH' | 'NG' | 'KE'

export interface Country {
  code: CountryCode
  name: string
  adjective: string
  currency: string
  symbol: string
  phonePlaceholder: string
  cities: string[]
  /** Illustrative budget breakpoints in local currency. Not market benchmarks. */
  budgetSteps: number[]
}

export const countries: Record<CountryCode, Country> = {
  GH: { code: 'GH', name: 'Ghana', adjective: 'Ghanaian', currency: 'GHS', symbol: 'GH₵', phonePlaceholder: '+233 24 000 0000', cities: ['Accra', 'Kumasi', 'Tema', 'Takoradi', 'Cape Coast', 'Tamale', 'Other'], budgetSteps: [2000, 5000, 10000, 25000, 50000] },
  NG: { code: 'NG', name: 'Nigeria', adjective: 'Nigerian', currency: 'NGN', symbol: '₦', phonePlaceholder: '+234 802 000 0000', cities: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu', 'Other'], budgetSteps: [100000, 250000, 500000, 1000000, 2500000] },
  KE: { code: 'KE', name: 'Kenya', adjective: 'Kenyan', currency: 'KES', symbol: 'KSh', phonePlaceholder: '+254 712 000 000', cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Other'], budgetSteps: [20000, 50000, 100000, 250000, 500000] },
}
export const countryList = Object.values(countries)
export const currencySymbols: Record<string, string> = Object.fromEntries(countryList.map((c) => [c.currency, c.symbol]))

const KEY = 'relay_country'
function readStored(): CountryCode {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'GH' || v === 'NG' || v === 'KE') return v
  } catch { /* storage may be unavailable */ }
  return 'GH'
}
let active: CountryCode = readStored()
export const getActiveCountry = () => countries[active]
export function setActiveCountry(code: CountryCode) {
  active = code
  try { localStorage.setItem(KEY, code) } catch { /* ignore */ }
}
