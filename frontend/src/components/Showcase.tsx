import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { useCountry } from '../lib/country'
import { formatMoney } from '../lib/format'
import { Avatar, Badge } from './ui'

/**
 * Product previews built from the same components and styles as the real app.
 * They show invented sample data and are not interactive (inert).
 */
function Frame({ title, caption, children, className = '' }: { title: string; caption: string; children: ReactNode; className?: string }) {
  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-xl border border-ink/20 bg-white shadow-[0_10px_30px_-12px_rgba(18,62,67,0.35)]">
        <div className="flex items-center gap-1.5 border-b border-ink/10 bg-paper px-3 py-2" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-ink/20" /><span className="h-2.5 w-2.5 rounded-full bg-ink/20" /><span className="h-2.5 w-2.5 rounded-full bg-ink/20" />
          <span className="ml-3 text-xs font-medium text-muted">{title}</span>
        </div>
        <div inert className="select-none p-4 sm:p-5">{children}</div>
      </div>
      <figcaption className="mt-3 text-sm text-muted">{caption}</figcaption>
    </figure>
  )
}

function SampleTag({ name, niche, city, followers, rate, currency }: { name: string; niche: string; city: string; followers: string; rate: number; currency: string }) {
  return (
    <div className="rate-tag">
      <div className="flex items-center gap-3 p-4 pr-9">
        <Avatar name={name} />
        <div className="min-w-0"><p className="truncate font-display font-semibold leading-tight">{name}</p><p className="text-sm text-muted">{niche} in {city}</p></div>
      </div>
      <div className="rate-tag-foot !py-3"><span className="text-sm text-muted">{followers} followers</span><span className="font-display text-lg font-bold">{formatMoney(rate, currency)}</span></div>
    </div>
  )
}

const CITY_SAMPLES: Record<string, [string, string][]> = {
  GH: [['Sample Skin Studio', 'Accra'], ['Sample Kumasi Eats', 'Kumasi']],
  NG: [['Sample Glow Notes', 'Lagos'], ['Sample Abuja Bites', 'Abuja']],
  KE: [['Sample Safari Style', 'Nairobi'], ['Sample Coast Eats', 'Mombasa']],
}
const RATE_SCALE: Record<string, number> = { GH: 900, NG: 60000, KE: 12000 }

export default function Showcase() {
  const { country } = useCountry()
  const [a, b] = CITY_SAMPLES[country.code]!
  const base = RATE_SCALE[country.code]!
  const steps = ['Brief sent', 'Shortlist ready', 'Plan approved', 'Live']
  const bars = [38, 52, 44, 70, 62, 88]
  return (
    <section className="section overflow-hidden bg-mist/50" aria-labelledby="showcase-title">
      <div className="container-page">
        <h2 id="showcase-title" className="text-3xl font-bold sm:text-4xl">See Relay in action</h2>
        <p className="mt-3 max-w-2xl text-muted">A look at the screens you will use. Names and numbers are sample data for illustration.</p>
        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          <Frame className="lg:col-span-3 lg:row-span-2" title="Creator directory" caption="Browse reviewed creators and compare starting rates in your local currency.">
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              {[country.name, 'Beauty & skincare', 'Instagram', '10K+'].map((f) => <span key={f} className="rounded-full border border-ink/25 bg-white px-3 py-1 font-medium">{f}</span>)}
              <span className="rounded-full bg-mist px-3 py-1 text-muted">Sort: largest audience</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SampleTag name={a[0]} niche="Beauty" city={a[1]} followers="18.4K" rate={base} currency={country.currency} />
              <SampleTag name={b[0]} niche="Food & drink" city={b[1]} followers="9.2K" rate={Math.round(base * 0.65)} currency={country.currency} />
              <SampleTag name="Sample Style Notes" niche="Fashion" city={country.cities[0]!} followers="52K" rate={Math.round(base * 2.4)} currency={country.currency} />
              <SampleTag name="Sample Gadget Corner" niche="Tech" city={country.cities[1]!} followers="41K" rate={Math.round(base * 0.9)} currency={country.currency} />
            </div>
          </Frame>

          <Frame className="lg:col-span-2" title="Campaign progress" caption="Follow a campaign from brief to launch, with fees and deliverables agreed up front.">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-display text-lg font-semibold">Sample product launch</p><p className="text-sm text-muted">Instagram, TikTok. Budget {formatMoney(base * 8, country.currency)}</p></div>
              <Badge tone="warn">recruiting</Badge>
            </div>
            <ol className="mt-5 space-y-3">
              {steps.map((s, i) => (
                <li key={s} className="flex items-center gap-3 text-sm">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i < 2 ? 'bg-lagoon text-white' : 'border border-ink/30 text-muted'}`}>{i < 2 ? <Check className="h-3.5 w-3.5" aria-hidden /> : i + 1}</span>
                  <span className={i < 2 ? 'font-semibold' : 'text-muted'}>{s}</span>
                </li>
              ))}
            </ol>
          </Frame>

          <Frame className="lg:col-span-2" title="Campaign results" caption="Manually recorded results once content is live. Relay does not pull data from social platforms yet.">
            <dl className="grid grid-cols-3 gap-3 text-center">
              {[['Reach', '120K'], ['Engagements', '8.4K'], ['Clicks', '1.2K']].map(([l, v]) => <div key={l} className="rounded-lg bg-paper p-3"><dt className="text-xs text-muted">{l}</dt><dd className="font-display text-xl font-bold">{v}</dd></div>)}
            </dl>
            <div className="mt-4 flex h-24 items-end gap-2" aria-hidden>
              {bars.map((h, i) => <div key={i} className={`flex-1 rounded-t ${i === bars.length - 1 ? 'bg-sun' : 'bg-seafoam'}`} style={{ height: `${h}%` }} />)}
            </div>
            <p className="mt-2 text-xs text-muted">Sample data</p>
          </Frame>
        </div>
      </div>
    </section>
  )
}
