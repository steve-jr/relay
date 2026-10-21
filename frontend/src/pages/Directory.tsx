import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import CreatorCard from '../components/CreatorCard'
import { Button, EmptyState, ErrorState, Pagination, Skeleton, useTitle } from '../components/ui'
import { followerRanges, industries, niches, platforms } from '../config/brand'
import { useCountry } from '../lib/country'
import { listCreators } from '../lib/api'
import { useAsync } from '../lib/useAsync'

const keys = ['q', 'city', 'platform', 'niche', 'industry', 'min_followers', 'sort'] as const

export default function Directory() {
  useTitle('Creator directory')
  const [params, setParams] = useSearchParams()
  const { country } = useCountry()
  const [showFilters, setShowFilters] = useState(false)
  const page = Number(params.get('page') ?? 1)
  const query = Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ''])) as Record<(typeof keys)[number], string>
  const { data, error, loading, reload } = useAsync(
    () => listCreators({ ...Object.fromEntries(Object.entries(query).filter(([, v]) => v)), country: country.code, page }),
    [params.toString()],
  )

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params)
    if (v) next.set(k, v); else next.delete(k)
    next.delete('page')
    setParams(next)
  }
  const hasFilters = keys.some((k) => k !== 'sort' && query[k])
  const sel = (k: (typeof keys)[number], label: string, opts: { value: string; label: string }[]) => (
    <div>
      <label htmlFor={`f-${k}`} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <select id={`f-${k}`} className="input" value={query[k]} onChange={(e) => set(k, e.target.value)}>
        <option value="">Any</option>
        {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  return (
    <div className="container-page py-12 sm:py-16">
      <h1 className="text-4xl font-bold">Creator directory</h1>
      <p className="mt-3 max-w-2xl text-muted">{`Showing creators in ${country.name}.`}  Every creator here has been reviewed by our team. Follower counts are reported by creators unless a profile says it is verified.</p>

      <button type="button" className="mt-8 inline-flex items-center gap-2 rounded-lg border border-ink/30 bg-white px-4 py-2 font-semibold lg:hidden" aria-expanded={showFilters} aria-controls="filters" onClick={() => setShowFilters(!showFilters)}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden />Filters
      </button>
      <div id="filters" className={`mt-4 rounded-tag border border-ink/15 bg-white p-5 lg:mt-8 lg:block ${showFilters ? 'block' : 'hidden'}`}>{filters()}</div>

      <div className="mt-8" aria-live="polite">
        {data && !loading && <p className="mb-4 text-sm text-muted">{data.meta.total} {data.meta.total === 1 ? 'creator' : 'creators'} found</p>}
        {error && <ErrorState message={error} onRetry={reload} />}
        {loading && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-64" />)}</div>}
        {!loading && !error && data && data.data.length === 0 && (
          <EmptyState title="No creators match those filters" action={hasFilters ? <Button variant="dark" onClick={() => setParams(new URLSearchParams())}>Clear filters</Button> : undefined}>
            Try removing a filter or searching a broader niche. New creators join after review.
          </EmptyState>
        )}
        {!loading && data && data.data.length > 0 && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{data.data.map((c) => <CreatorCard key={c.id} creator={c} />)}</div>}
        {data && <Pagination meta={data.meta} onPage={(p) => { const n = new URLSearchParams(params); n.set('page', String(p)); setParams(n); window.scrollTo(0, 0) }} />}
      </div>
    </div>
  )

  function filters() {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-4">
          <label htmlFor="f-q" className="mb-1.5 block text-sm font-semibold">Search by name or niche</label>
          <input id="f-q" type="search" className="input" defaultValue={query.q} onKeyDown={(e) => { if (e.key === 'Enter') set('q', e.currentTarget.value) }} onBlur={(e) => { if (e.target.value !== query.q) set('q', e.target.value) }} placeholder={`For example skincare or ${country.cities[0]}`} />
        </div>
        {sel('niche', 'Niche', niches.map((n) => ({ value: n, label: n })))}
        {sel('city', 'City', country.cities.filter((c) => c !== 'Other').map((c) => ({ value: c, label: c })))}
        {sel('industry', 'Industry', industries.filter((i) => i !== 'Other').map((n) => ({ value: n, label: n })))}
        {sel('platform', 'Platform', platforms.map((p) => ({ value: p.id, label: p.label })))}
        {sel('min_followers', 'Audience size', followerRanges)}
        <div>
          <label htmlFor="f-sort" className="mb-1.5 block text-sm font-semibold">Sort by</label>
          <select id="f-sort" className="input" value={query.sort} onChange={(e) => set('sort', e.target.value)}>
            <option value="">Newest</option><option value="followers">Largest audience</option><option value="rate_low">Lowest starting rate</option>
          </select>
        </div>
      </div>
    )
  }
}
