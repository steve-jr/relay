// Optional analytics. Does nothing unless VITE_ANALYTICS_DOMAIN is set and a Plausible-compatible script is loaded.
type Win = Window & { plausible?: (event: string, opts?: { props: Record<string, string> }) => void }

export function track(event: string, props: Record<string, string> = {}) {
  try {
    if (!import.meta.env.VITE_ANALYTICS_DOMAIN) return
    ;(window as Win).plausible?.(event, { props })
  } catch {
    /* analytics must never break the app */
  }
}

const KEY = 'lead_source'
export function captureSource() {
  try {
    const p = new URLSearchParams(window.location.search)
    const src = [p.get('utm_source'), p.get('utm_medium'), p.get('utm_campaign')].filter(Boolean).join('/')
    if (src) sessionStorage.setItem(KEY, src)
  } catch { /* storage may be unavailable */ }
}
export function leadSource(): string {
  try { return sessionStorage.getItem(KEY) ?? 'website' } catch { return 'website' }
}
