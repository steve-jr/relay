import { currencySymbols, getActiveCountry } from '../config/countries'

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

/** Compact money: 5000 becomes "GH₵5K", 1200000 becomes "₦1.2M". Uses the active country's currency unless one is given. */
export function formatMoney(n: number | null | undefined, currency?: string): string {
  if (n === null || n === undefined) return 'On request'
  const code = currency ?? getActiveCountry().currency
  return `${currencySymbols[code] ?? code + ' '}${compact.format(n)}`
}

export function formatCount(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'n/a'
  return compact.format(n)
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('')
}

export function totalFollowers(socials: { followers: number | null }[]): number {
  return socials.reduce((sum, s) => sum + (s.followers ?? 0), 0)
}

export function budgetOptions(steps: number[], currency: string): { value: string; label: string }[] {
  const f = (n: number) => formatMoney(n, currency)
  const opts = [{ value: String(steps[0]), label: `Up to ${f(steps[0]!)}` }]
  for (let i = 1; i < steps.length; i++) opts.push({ value: String(steps[i]), label: `${f(steps[i - 1]!)} to ${f(steps[i]!)}` })
  const last = steps[steps.length - 1]!
  opts.push({ value: String(last * 2), label: `Above ${f(last)}` })
  return opts
}

/** Merge ticked industries with comma-separated custom ones; trims, dedupes, caps length. */
export function mergeIndustries(picked: string[], other: string): string[] {
  const custom = other.split(',').map((s) => s.trim()).filter(Boolean)
  const seen = new Set<string>()
  return [...picked, ...custom].filter((v) => { const k = v.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true })
}
