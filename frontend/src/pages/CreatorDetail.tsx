import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import LeadForm from '../components/LeadForm'
import { Alert, Avatar, Badge, ErrorState, Skeleton, useTitle } from '../components/ui'
import { demoNotice } from '../config/content'
import { getCreator } from '../lib/api'
import { track } from '../lib/analytics'
import { countries, type CountryCode } from '../config/countries'
import { formatCount, formatMoney } from '../lib/format'
import { useAsync } from '../lib/useAsync'

const label: Record<string, string> = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook' }
const base: Record<string, string> = { instagram: 'https://instagram.com/', tiktok: 'https://tiktok.com/@', youtube: 'https://youtube.com/@', facebook: 'https://facebook.com/' }

export default function CreatorDetail() {
  const { slug = '' } = useParams()
  const { data: c, error, loading, reload } = useAsync(() => getCreator(slug), [slug])
  useTitle(c?.display_name ?? 'Creator profile')
  useEffect(() => { if (c) track('Creator profile viewed', { creator: c.slug }) }, [c])

  return (
    <div className="container-page py-10 sm:py-14">
      <Link to="/creators" className="mb-6 inline-flex items-center gap-1 font-semibold text-lagoon hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden />All creators</Link>
      {loading && <Skeleton className="h-72" />}
      {error && (error.includes('could not find') || error.includes('not found') ? (
        <Alert kind="error" title="Creator not found">This profile may have been removed or is not public. <Link className="font-semibold underline" to="/creators">Browse creators</Link></Alert>
      ) : <ErrorState message={error} onRetry={reload} />)}
      {c && (
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-8">
            <header className="flex items-center gap-5">
              <Avatar name={c.display_name} src={c.profile_image_url} size="lg" />
              <div>
                <h1 className="text-3xl font-bold sm:text-4xl">{c.display_name}</h1>
                <p className="mt-1 flex items-center gap-1 text-muted"><MapPin className="h-4 w-4" aria-hidden />{c.city}, {countries[c.country as CountryCode]?.name ?? c.country}</p>
                <div className="mt-2 flex flex-wrap gap-2"><Badge>{c.primary_niche}</Badge>{c.secondary_niches.map((n) => <Badge key={n}>{n}</Badge>)}</div>
                {c.industries.length > 0 && <p className="mt-2 text-sm text-muted">Works with: {c.industries.join(', ')}</p>}
              </div>
            </header>
            {c.is_demo && <Alert>{demoNotice}</Alert>}
            {c.bio && <p className="max-w-prose text-lg leading-relaxed">{c.bio}</p>}
            <section aria-labelledby="audience">
              <h2 id="audience" className="text-xl font-semibold">Audience</h2>
              <ul className="mt-3 divide-y divide-ink/15 rounded-tag border border-ink/15 bg-white">
                {c.socials.map((s) => (
                  <li key={s.platform} className="flex items-center justify-between gap-4 px-5 py-3">
                    <a className="font-semibold text-lagoon hover:underline" href={`${base[s.platform]}${s.handle}`} target="_blank" rel="noreferrer noopener">{label[s.platform]}, @{s.handle}</a>
                    <span className="font-display text-lg font-bold">{formatCount(s.followers)}</span>
                  </li>
                ))}
                {c.average_engagement_rate !== null && <li className="flex justify-between px-5 py-3"><span>Average engagement rate</span><span className="font-semibold">{c.average_engagement_rate}%</span></li>}
              </ul>
              <p className="mt-2 text-sm text-muted">Audience figures are reported by the creator and have not been independently verified.</p>
            </section>
          </div>
          <aside id="enquire" className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rate-tag p-6 pr-10">
              <p className="text-sm text-muted">Starting rate</p>
              <p className="font-display text-3xl font-bold">{formatMoney(c.starting_rate, c.currency)}</p>
              <p className="mt-1 text-sm text-muted">Indicative only. Final fees are agreed per campaign.</p>
            </div>
            <div className="rounded-tag border border-ink/15 bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold">Request a collaboration</h2>
              <LeadForm creatorName={c.display_name} />
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
