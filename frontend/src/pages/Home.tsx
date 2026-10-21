import { Link } from 'react-router-dom'
import { ArrowRight, ClipboardList, Search, Handshake } from 'lucide-react'
import CreatorCard from '../components/CreatorCard'
import { Alert, Skeleton, linkClass, useTitle } from '../components/ui'
import { niches } from '../config/brand'
import { faqs } from '../config/content'
import { featuredCreators } from '../lib/api'
import { formatCount, formatMoney } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { useCountry } from '../lib/country'
import Showcase from '../components/Showcase'

export function FaqList({ items = faqs }: { items?: typeof faqs }) {
  return (
    <div className="divide-y divide-ink/15 rounded-tag border border-ink/15 bg-white">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-4">
          <summary className="cursor-pointer list-none font-semibold marker:hidden">{f.q}</summary>
          <p className="mt-2 max-w-prose text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  )
}

export default function Home() {
  useTitle()
  const { country } = useCountry()
  const featured = useAsync(() => featuredCreators(country.code), [country.code])
  const board = featured.data?.slice(0, 3) ?? []

  return (
    <>
      <section className="on-dark overflow-hidden bg-ink text-white">
        <div className="container-page grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <h1 className="settle text-4xl font-bold leading-[1.05] sm:text-6xl">Your next great campaign starts with the right creator.</h1>
            <p className="settle settle-2 mt-6 max-w-xl text-lg text-white/80">
              Discover vetted {country.adjective} creators, launch influencer campaigns, and turn great content into measurable growth. One simple process, from discovery to delivery.
            </p>
            <div className="settle settle-3 mt-8 flex flex-wrap gap-3">
              <Link to="/for-brands#enquire" className={linkClass('primary', 'px-6 py-3 text-lg')}>Find Creators</Link>
              <Link to="/for-creators" className={linkClass('outlineLight', 'px-6 py-3 text-lg')}>Join as a Creator</Link>
            </div>
          </div>
          <div className="relative hidden min-h-[22rem] lg:block" aria-label="Sample creators">
            {featured.loading && <Skeleton className="h-72 bg-white/10" />}
            {board.map((c, i) => (
              <div key={c.id} className="drop absolute w-72 text-ink" style={{ top: i * 96, left: [0, 70, 20][i], ['--r' as string]: `${[-3, 2, -1.5][i]}deg`, animationDelay: `${600 + i * 160}ms` }}>
                <MiniTag name={c.display_name} niche={c.primary_niche} city={c.city} rate={c.starting_rate} currency={c.currency} followers={c.socials[0]?.followers ?? null} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-ink/10 bg-white">
        <ul className="container-page grid gap-6 py-8 text-sm sm:grid-cols-3">
          <li><strong className="block font-display text-base">Every profile reviewed by hand</strong><span className="text-muted">Creators appear only after our team approves them.</span></li>
          <li><strong className="block font-display text-base">Prices transparency</strong><span className="text-muted">Starting rates are shown in {country.symbol} up front.</span></li>
          <li><strong className="block font-display text-base">One place to manage it all</strong><span className="text-muted">Brief, shortlist, negotiate, roll out and results together.</span></li>
        </ul>
      </section>

      <section className="section">
        <div className="container-page">
          <h2 className="text-3xl font-bold sm:text-4xl">How it works</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { icon: ClipboardList, t: 'Share your brief', d: 'Tell us your goal, audience, platforms and budget in a short form.' },
              { icon: Search, t: 'Get a shortlist', d: 'We match your brief to approved creators and send you the best fits.' },
              { icon: Handshake, t: 'Launch and review', d: 'Creators deliver content, you approve it, and we report what happened.' },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sun font-display text-lg font-bold">{i + 1}</span>
                <div><h3 className="flex items-center gap-2 text-xl font-semibold"><s.icon className="h-5 w-5 text-lagoon" aria-hidden />{s.t}</h3><p className="mt-1 text-muted">{s.d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <Showcase />

      <section className="section bg-white">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl font-bold sm:text-4xl">Featured creators</h2>
            <Link to="/creators" className="inline-flex items-center gap-1 font-semibold text-lagoon hover:underline">Browse all creators<ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.loading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-64" />)}
            {featured.error && <div className="md:col-span-3"><Alert kind="error" title="Featured creators are unavailable">{featured.error}</Alert></div>}
            {featured.data?.map((c) => <CreatorCard key={c.id} creator={c} />)}
            {featured.data?.length === 0 && <p className="text-muted md:col-span-3">Approved creators will appear here soon.</p>}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <h2 className="text-3xl font-bold sm:text-4xl">Browse by niche</h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {niches.map((n) => <li key={n}><Link to={`/creators?niche=${encodeURIComponent(n)}`} className="inline-block rounded-full border border-ink/25 bg-white px-4 py-2 font-medium hover:border-lagoon hover:bg-mist">{n}</Link></li>)}
          </ul>
        </div>
      </section>

      <section className="section bg-lagoon text-white on-dark">
        <div className="container-page grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold">For brands</h2>
            <ul className="mt-5 space-y-3 text-white"><li>Find creators who fit your audience, not just your hashtag.</li><li>See starting rates in cedis before you reach out.</li><li>Keep briefs, negotiations, deadlines and approvals in one place.</li></ul>
            <Link to="/for-brands" className={linkClass('primary', 'mt-7')}>See how it works for brands</Link>
          </div>
          <div>
            <h2 className="text-3xl font-bold">For creators</h2>
            <ul className="mt-5 space-y-3 text-white"><li>Get discovered by brands looking for strong voices.</li><li>Negotiate your fee in rounds until the terms feel fair.</li><li>No commissions or fees for creators. Approval is not guaranteed.</li></ul>
            <Link to="/for-creators" className={linkClass('outlineLight', 'mt-7')}>Apply as a creator</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">How pricing works</h2>
            <p className="mt-4 max-w-md text-muted">We keep it simple and tell you the cost before work starts. There is no fixed price list because every campaign is unique.</p>
          </div>
          <ul className="space-y-4">
            {[
              ['Creator fees', 'Negotiated between you and each creator in rounds. Relay takes no commission or fee from creators.'],
              ['Matchmaking and management', 'A service fee charged to brands based on campaign size.'],
              // ['Subscriptions', 'Planned for brands and agencies that run campaigns regularly.'],
            ].map(([t, d]) => <li key={t} className="rounded-tag border border-ink/15 bg-white p-5"><h3 className="font-semibold">{t}</h3><p className="mt-1 text-muted">{d}</p></li>)}
          </ul>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page max-w-3xl">
          <h2 className="text-3xl font-bold sm:text-4xl">Questions, answered</h2>
          <div className="mt-8"><FaqList /></div>
        </div>
      </section>

      <section className="section">
        <div className="container-page rounded-tag bg-sun p-8 sm:p-14">
          <h2 className="max-w-2xl text-3xl font-bold sm:text-4xl">Tell us what you want to launch.</h2>
          <p className="mt-3 max-w-xl text-ink/80">A short brief is enough to start. We will come back with next steps.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/for-brands#enquire" className={linkClass('dark')}>Find Creators</Link>
            <Link to="/for-creators" className={linkClass('outline', 'border-ink')}>Join as a Creator</Link>
          </div>
        </div>
      </section>
    </>
  )
}

function MiniTag({ name, niche, city, rate, currency, followers }: { name: string; niche: string; city: string; rate: number | null; currency: string; followers: number | null }) {
  return (
    <div className="rate-tag shadow-xl">
      <div className="p-4 pr-9">
        <p className="font-display text-lg font-semibold leading-tight">{name}</p>
        <p className="text-sm text-muted">{niche} in {city}</p>
      </div>
      <div className="rate-tag-foot !py-3">
        <span className="text-sm text-muted">{formatCount(followers)} followers</span>
        <span className="font-display text-lg font-bold">{formatMoney(rate, currency)}</span>
      </div>
    </div>
  )
}
