import { useEffect, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Download, Plus } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { applyServerErrors } from '../components/LeadForm'
import { Alert, Badge, Button, ConfirmDialog, EmptyState, ErrorState, Field, Pagination, Skeleton, statusTone, useTitle } from '../components/ui'
import IndustryPicker from '../components/IndustryPicker'
import NegotiationCard from '../components/Negotiation'
import { industries, niches, objectives, platforms } from '../config/brand'
import { useCountry } from '../lib/country'
import * as api from '../lib/api'
import { formatDate, formatMoney, mergeIndustries } from '../lib/format'
import { brandProfileSchema, campaignSchema, creatorProfileSchema, type BrandProfileForm, type CampaignForm, type CreatorProfileForm } from '../lib/schemas'
import type { AdminCreator, Lead, LeadStatus } from '../lib/types'
import { useAsync } from '../lib/useAsync'

const cityOpts = (list: string[], cur: string) => (list.includes(cur) ? list : [cur, ...list])
const toNum = (s: string) => (s === '' ? null : Number(s))
const toStr = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n))

function DashShell({ title, children }: { title: string; children: ReactNode }) {
  const { user } = useAuth()
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-1 text-muted">Signed in as {user?.name}</p>
      <div className="mt-8 space-y-12">{children}</div>
    </div>
  )
}
const Section = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => (
  <section><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-bold">{title}</h2>{action}</div>{children}</section>
)
const Card = ({ children }: { children: ReactNode }) => <div className="rounded-tag border border-ink/15 bg-white p-5 sm:p-6">{children}</div>

/* ---------------- Brand ---------------- */
export function BrandDashboard() {
  useTitle('Brand dashboard')
  const profile = useAsync(api.getBrandProfile, [])
  const campaigns = useAsync(api.listBrandCampaigns, [])
  const deals = useAsync(() => api.listNegotiations('brand'), [])
  const [adding, setAdding] = useState(false)
  return (
    <DashShell title="Your campaigns">
      <Section title="Campaigns" action={<Button variant="dark" onClick={() => setAdding(!adding)}><Plus className="h-4 w-4" aria-hidden />{adding ? 'Close form' : 'New campaign'}</Button>}>
        {adding && <div className="mb-6"><Card><CampaignFormView onCreated={() => { setAdding(false); campaigns.reload() }} /></Card></div>}
        {campaigns.loading && <Skeleton className="h-24" />}
        {campaigns.error && <ErrorState message={campaigns.error} onRetry={campaigns.reload} />}
        {campaigns.data?.length === 0 && !adding && <EmptyState title="No campaigns yet" action={<Button variant="dark" onClick={() => setAdding(true)}>Create your first campaign</Button>}>Describe what you want to promote and we will start shortlisting creators.</EmptyState>}
        <ul className="space-y-3">
          {campaigns.data?.map((c) => (
            <li key={c.id}><Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="text-lg font-semibold">{c.title}</h3><p className="text-sm text-muted">{c.objective} • {c.platforms.join(', ')}</p></div>
                <Badge tone={statusTone(c.status)}>{c.status}</Badge>
              </div>
              <p className="mt-3 text-muted">{c.description}</p>
              <p className="mt-3 text-sm">Budget <strong>{formatMoney(c.budget, c.currency)}</strong>. {formatDate(c.start_date)} to {formatDate(c.end_date)}.</p>
            </Card></li>
          ))}
        </ul>
      </Section>
      <Section title="Negotiations">
        <p className="mb-4 max-w-2xl text-muted">Agree fees and deliverables with each creator over several rounds. Offers go back and forth until you both accept.</p>
        {deals.loading && <Skeleton className="h-32" />}
        {deals.error && <ErrorState message={deals.error} onRetry={deals.reload} />}
        {deals.data?.length === 0 && <EmptyState title="No negotiations yet">Once creators are shortlisted for a campaign, offers appear here.</EmptyState>}
        <ul className="space-y-4">{deals.data?.map((n) => <li key={n.id}><NegotiationCard n={n} role="brand" onChanged={deals.reload} /></li>)}</ul>
      </Section>
      <Section title="Business profile">
        {profile.loading && <Skeleton className="h-48" />}
        {profile.error && <ErrorState message={profile.error} onRetry={profile.reload} />}
        {profile.data && <Card><BrandProfileView initial={profile.data} /></Card>}
      </Section>
    </DashShell>
  )
}

function CampaignFormView({ onCreated }: { onCreated: () => void }) {
  const { country } = useCountry()
  const [err, setErr] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CampaignForm>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { title: '', objective: '', description: '', target_audience: '', platforms: [], budget: '', start_date: '', end_date: '' },
  })
  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit(async (v) => {
      setErr('')
      try { await api.createBrandCampaign({ ...v, budget: Number(v.budget), currency: country.currency, start_date: v.start_date || null, end_date: v.end_date || null }); onCreated() } catch (e) { setErr(applyServerErrors(e, setError)) }
    })}>
      {err && <Alert kind="error" title="Campaign not saved">{err}</Alert>}
      <Field label="Campaign title" error={errors.title?.message}>{(p) => <input {...p} {...register('title')} className="input" />}</Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Objective" error={errors.objective?.message}>{(p) => <select {...p} {...register('objective')} className="input"><option value="">Choose one</option>{objectives.map((o) => <option key={o}>{o}</option>)}</select>}</Field>
        <Field label={`Budget (${country.symbol})`} error={errors.budget?.message}>{(p) => <input {...p} {...register('budget')} inputMode="decimal" className="input" />}</Field>
        <Field label="Start date (optional)">{(p) => <input {...p} {...register('start_date')} type="date" className="input" />}</Field>
        <Field label="End date (optional)">{(p) => <input {...p} {...register('end_date')} type="date" className="input" />}</Field>
      </div>
      <Field label="Description" error={errors.description?.message}>{(p) => <textarea {...p} {...register('description')} rows={4} className="input" />}</Field>
      <Field label="Target audience (optional)">{(p) => <input {...p} {...register('target_audience')} className="input" />}</Field>
      <fieldset><legend className="mb-1.5 text-sm font-semibold">Platforms</legend>
        <div className="flex flex-wrap gap-3">{platforms.map((pl) => <label key={pl.id} className="flex items-center gap-2 rounded-lg border border-ink/25 px-3.5 py-2 has-[:checked]:border-lagoon has-[:checked]:bg-mist"><input type="checkbox" value={pl.id} {...register('platforms')} className="accent-lagoon" />{pl.label}</label>)}</div>
        {errors.platforms && <p role="alert" className="mt-1 text-sm font-medium text-hibiscus">{errors.platforms.message}</p>}
      </fieldset>
      <Button type="submit" loading={isSubmitting}>Submit campaign</Button>
    </form>
  )
}

function BrandProfileView({ initial }: { initial: import('../lib/types').BrandProfile }) {
  const { country } = useCountry()
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<BrandProfileForm>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: { business_name: initial.business_name, industry: initial.industry, city: initial.city, website: initial.website ?? '', phone: initial.phone ?? '', contact_person: initial.contact_person ?? '', description: initial.description ?? '' },
  })
  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit(async (v) => {
      setMsg(null)
      try { await api.updateBrandProfile(v); setMsg({ kind: 'success', text: 'Profile saved.' }) } catch (e) { setMsg({ kind: 'error', text: applyServerErrors(e, setError) }) }
    })}>
      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Business name" error={errors.business_name?.message}>{(p) => <input {...p} {...register('business_name')} className="input" />}</Field>
        <Field label="Contact person">{(p) => <input {...p} {...register('contact_person')} className="input" />}</Field>
        <Field label="Industry" error={errors.industry?.message}>{(p) => <select {...p} {...register('industry')} className="input">{industries.map((i) => <option key={i}>{i}</option>)}</select>}</Field>
        <Field label="City" error={errors.city?.message}>{(p) => <select {...p} {...register('city')} className="input">{cityOpts(country.cities, initial.city).map((i) => <option key={i}>{i}</option>)}</select>}</Field>
        <Field label="Website">{(p) => <input {...p} {...register('website')} type="url" className="input" />}</Field>
        <Field label="Phone" error={errors.phone?.message}>{(p) => <input {...p} {...register('phone')} type="tel" className="input" />}</Field>
      </div>
      <Field label="About the business" error={errors.description?.message}>{(p) => <textarea {...p} {...register('description')} rows={3} className="input" />}</Field>
      <Button type="submit" variant="dark" loading={isSubmitting}>Save profile</Button>
    </form>
  )
}

/* ---------------- Creator ---------------- */
export function CreatorDashboard() {
  useTitle('Creator dashboard')
  const profile = useAsync(api.getCreatorProfile, [])
  const deals = useAsync(() => api.listNegotiations('creator'), [])
  const vs = profile.data?.verification_status
  return (
    <DashShell title="Your creator profile">
      {vs && (
        <Alert kind={vs === 'approved' ? 'success' : vs === 'rejected' ? 'error' : 'info'} title={vs === 'approved' ? 'Your profile is live' : vs === 'rejected' ? 'Your application was not approved' : 'Your application is being reviewed'}>
          {vs === 'pending' && 'Our team reviews every profile. Your profile is not public until it is approved.'}
          {vs === 'approved' && 'Brands can find you in the creator directory.'}
          {vs === 'rejected' && 'You can update your profile and contact us if you have questions.'}
        </Alert>
      )}
      <Section title="Offers and negotiations">
        <p className="mb-4 max-w-2xl text-muted">Brands send offers here. You can accept, counter or decline, and keep going for a few rounds until the fee and deliverables feel fair to both sides. Relay takes no commission or fee from creators.</p>
        {deals.loading && <Skeleton className="h-32" />}
        {deals.error && <ErrorState message={deals.error} onRetry={deals.reload} />}
        {deals.data?.length === 0 && <EmptyState title="No offers yet">When a campaign fits your profile, the brand's offer will show up here.</EmptyState>}
        <ul className="space-y-4">{deals.data?.map((n) => <li key={n.id}><NegotiationCard n={n} role="creator" onChanged={deals.reload} /></li>)}</ul>
      </Section>
      <Section title="Edit profile">
        {profile.loading && <Skeleton className="h-64" />}
        {profile.error && <ErrorState message={profile.error} onRetry={profile.reload} />}
        {profile.data && <Card><CreatorProfileView initial={profile.data} /></Card>}
      </Section>
    </DashShell>
  )
}

function CreatorProfileView({ initial: p0 }: { initial: import('../lib/types').CreatorProfile }) {
  const { country } = useCountry()
  const known = p0.industries.filter((i) => industries.includes(i))
  const custom = p0.industries.filter((i) => !industries.includes(i))
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CreatorProfileForm>({
    resolver: zodResolver(creatorProfileSchema),
    defaultValues: {
      display_name: p0.display_name, bio: p0.bio ?? '', city: p0.city, primary_niche: p0.primary_niche, industries: known, other_industries: custom.join(', '),
      instagram_handle: p0.instagram_handle ?? '', instagram_followers: toStr(p0.instagram_followers),
      tiktok_handle: p0.tiktok_handle ?? '', tiktok_followers: toStr(p0.tiktok_followers),
      youtube_handle: p0.youtube_handle ?? '', youtube_subscribers: toStr(p0.youtube_subscribers),
      facebook_handle: p0.facebook_handle ?? '', average_engagement_rate: toStr(p0.average_engagement_rate), starting_rate: toStr(p0.starting_rate),
    },
  })
  const num = (name: keyof CreatorProfileForm, label: string, hint?: string) => (
    <Field label={label} error={errors[name]?.message} hint={hint}>{(p) => <input {...p} {...register(name)} inputMode="decimal" className="input" />}</Field>
  )
  const txt = (name: keyof CreatorProfileForm, label: string) => <Field label={label} error={errors[name]?.message}>{(p) => <input {...p} {...register(name)} className="input" />}</Field>
  return (
    <form noValidate className="space-y-5" onSubmit={handleSubmit(async (v) => {
      setMsg(null)
      try {
        await api.updateCreatorProfile({ ...v, industries: mergeIndustries(v.industries, v.other_industries), other_industries: undefined, bio: v.bio || null, instagram_followers: toNum(v.instagram_followers), tiktok_followers: toNum(v.tiktok_followers), youtube_subscribers: toNum(v.youtube_subscribers), average_engagement_rate: toNum(v.average_engagement_rate), starting_rate: toNum(v.starting_rate) })
        setMsg({ kind: 'success', text: 'Profile saved. Changes to an approved profile may be re-checked by our team.' })
      } catch (e) { setMsg({ kind: 'error', text: applyServerErrors(e, setError) }) }
    })}>
      {msg && <Alert kind={msg.kind}>{msg.text}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        {txt('display_name', 'Display name')}
        <Field label="City" error={errors.city?.message}>{(p) => <select {...p} {...register('city')} className="input">{cityOpts(country.cities, p0.city).map((c) => <option key={c}>{c}</option>)}</select>}</Field>
        <Field label="Main niche" error={errors.primary_niche?.message}>{(p) => <select {...p} {...register('primary_niche')} className="input">{niches.map((c) => <option key={c}>{c}</option>)}</select>}</Field>
        {num('starting_rate', `Starting rate (${country.symbol})`, 'Shown publicly. Leave blank to show "On request".')}
        <div className="sm:col-span-2"><IndustryPicker picked={register('industries')} other={register('other_industries')} error={errors.industries?.message} /></div>
        {txt('instagram_handle', 'Instagram handle')}{num('instagram_followers', 'Instagram followers')}
        {txt('tiktok_handle', 'TikTok handle')}{num('tiktok_followers', 'TikTok followers')}
        {txt('youtube_handle', 'YouTube handle')}{num('youtube_subscribers', 'YouTube subscribers')}
        {txt('facebook_handle', 'Facebook handle')}{num('average_engagement_rate', 'Average engagement rate (%)')}
      </div>
      <Field label="Bio" error={errors.bio?.message}>{(p) => <textarea {...p} {...register('bio')} rows={3} className="input" />}</Field>
      <p className="text-sm text-muted">Audience figures are shown as creator-reported. You cannot change your verification status.</p>
      <Button type="submit" variant="dark" loading={isSubmitting}>Save profile</Button>
    </form>
  )
}

/* ---------------- Admin ---------------- */
type Tab = 'overview' | 'creators' | 'leads' | 'campaigns'
export function AdminDashboard() {
  useTitle('Admin')
  const [tab, setTab] = useState<Tab>('overview')
  const tabs: [Tab, string][] = [['overview', 'Overview'], ['creators', 'Creators'], ['leads', 'Leads'], ['campaigns', 'Campaigns']]
  return (
    <DashShell title="Admin">
      <div role="tablist" aria-label="Admin sections" className="-mt-6 flex flex-wrap gap-2">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-lg px-4 py-2 font-semibold ${tab === k ? 'bg-ink text-white' : 'border border-ink/25 bg-white hover:bg-mist'}`}>{l}</button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'overview' && <Overview />}
        {tab === 'creators' && <CreatorsAdmin />}
        {tab === 'leads' && <LeadsAdmin />}
        {tab === 'campaigns' && <CampaignsAdmin />}
      </div>
    </DashShell>
  )
}

function Overview() {
  const { data, error, loading, reload } = useAsync(api.adminDashboard, [])
  if (loading) return <Skeleton className="h-40" />
  if (error || !data) return <ErrorState message={error ?? 'No data'} onRetry={reload} />
  const stats: [string, number][] = [['New leads', data.new_leads], ['Total leads', data.total_leads], ['Pending creators', data.pending_creators], ['Approved creators', data.approved_creators], ['Active campaigns', data.active_campaigns], ['Completed campaigns', data.completed_campaigns]]
  return (
    <div className="space-y-4">
      {data.is_demo && <Alert>These numbers come from demo data.</Alert>}
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([l, n]) => <div key={l} className="rounded-tag border border-ink/15 bg-white p-5"><dt className="text-sm text-muted">{l}</dt><dd className="font-display text-4xl font-bold">{n}</dd></div>)}
      </dl>
    </div>
  )
}

function CreatorsAdmin() {
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const { data, error, loading, reload } = useAsync(() => api.adminCreators({ status: status || undefined, page }), [status, page])
  const [pending, setPending] = useState<{ c: AdminCreator; to: 'approved' | 'rejected' } | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const confirm = async () => {
    if (!pending) return
    setBusy(true); setErr('')
    try { await api.setVerification(pending.c.id, { verification_status: pending.to }); setPending(null); reload() } catch (e) { setErr(e instanceof Error ? e.message : 'Update failed.'); setPending(null) } finally { setBusy(false) }
  }
  return (
    <Section title="Creator applications" action={
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold" htmlFor="cstatus">Show</label>
        <select id="cstatus" className="input !w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="pending">Pending review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="">All</option>
        </select>
        <Button variant="outline" onClick={() => void api.downloadCsv('creators')}><Download className="h-4 w-4" aria-hidden />Export CSV</Button>
      </div>}>
      {err && <div className="mb-3"><Alert kind="error">{err}</Alert></div>}
      {loading && <Skeleton className="h-40" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data?.data.length === 0 && <EmptyState title="Nothing in this list">No creators match this status.</EmptyState>}
      <ul className="space-y-3">
        {data?.data.map((c) => (
          <li key={c.id}><Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="text-lg font-semibold">{c.display_name}</h3><p className="text-sm text-muted">{c.primary_niche} in {c.city}. {c.email}</p></div>
              <Badge tone={statusTone(c.verification_status)}>{c.verification_status}</Badge>
            </div>
            {c.bio && <p className="mt-2 text-muted">{c.bio}</p>}
            <div className="mt-4 flex flex-wrap gap-3">
              {c.verification_status !== 'approved' && <Button variant="dark" onClick={() => setPending({ c, to: 'approved' })}>Approve</Button>}
              {c.verification_status !== 'rejected' && <Button variant="outline" onClick={() => setPending({ c, to: 'rejected' })}>Reject</Button>}
            </div>
          </Card></li>
        ))}
      </ul>
      {data && <Pagination meta={data.meta} onPage={setPage} />}
      <ConfirmDialog open={pending !== null} busy={busy} danger={pending?.to === 'rejected'} title={pending?.to === 'approved' ? 'Approve this creator?' : 'Reject this application?'} confirmLabel={pending?.to === 'approved' ? 'Approve' : 'Reject'} onConfirm={() => void confirm()} onCancel={() => setPending(null)}>
        {pending?.to === 'approved' ? `${pending?.c.display_name} will appear in the public directory.` : `${pending?.c.display_name} will not appear publicly.`}
      </ConfirmDialog>
    </Section>
  )
}

const leadStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost']
function LeadsAdmin() {
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, error, loading, reload } = useAsync(() => api.adminLeads({ status: status || undefined, search: search || undefined, page }), [status, search, page])
  return (
    <Section title="Brand leads" action={<Button variant="outline" onClick={() => void api.downloadCsv('leads')}><Download className="h-4 w-4" aria-hidden />Export CSV</Button>}>
      <div className="mb-5 flex flex-wrap gap-4">
        <Field label="Search">{(p) => <input {...p} type="search" className="input" defaultValue={search} onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(e.currentTarget.value); setPage(1) } }} placeholder="Business, name or email" />}</Field>
        <Field label="Status">{(p) => <select {...p} className="input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}><option value="">All</option>{leadStatuses.map((s) => <option key={s}>{s}</option>)}</select>}</Field>
      </div>
      {loading && <Skeleton className="h-40" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data?.data.length === 0 && <EmptyState title="No leads found">New briefs from the website will show up here.</EmptyState>}
      <ul className="space-y-3">{data?.data.map((l) => <li key={l.id}><LeadRow lead={l} onSaved={reload} /></li>)}</ul>
      {data && <Pagination meta={data.meta} onPage={setPage} />}
    </Section>
  )
}

function LeadRow({ lead, onSaved }: { lead: Lead; onSaved: () => void }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [notes, setNotes] = useState(lead.internal_notes ?? '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ kind: 'success' | 'error'; text: string } | null>(null)
  useEffect(() => { setStatus(lead.status); setNotes(lead.internal_notes ?? '') }, [lead])
  const save = async () => {
    setBusy(true); setMsg(null)
    try { await api.updateLead(lead.id, { status, internal_notes: notes }); setMsg({ kind: 'success', text: 'Saved.' }); onSaved() } catch (e) { setMsg({ kind: 'error', text: e instanceof Error ? e.message : 'Save failed.' }) } finally { setBusy(false) }
  }
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="text-lg font-semibold">{lead.business_name}</h3><p className="text-sm text-muted">{lead.contact_name}. <a className="underline" href={`mailto:${lead.email}`}>{lead.email}</a>{lead.phone ? `. ${lead.phone}` : ''}</p></div>
        <div className="text-right text-sm text-muted"><p>{formatDate(lead.created_at)}</p><p>Source: {lead.source ?? 'unknown'}</p></div>
      </div>
      <p className="mt-3 text-sm"><strong>{lead.campaign_objectives}</strong>. Budget {formatMoney(lead.campaign_budget, lead.currency)}. {lead.desired_platforms.join(', ')}</p>
      {lead.campaign_description && <p className="mt-2 text-muted">{lead.campaign_description}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
        <Field label="Status">{(p) => <select {...p} className="input" value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}>{leadStatuses.map((s) => <option key={s}>{s}</option>)}</select>}</Field>
        <Field label="Internal notes (private)">{(p) => <input {...p} className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />}</Field>
        <Button variant="dark" loading={busy} onClick={() => void save()}>Save</Button>
      </div>
      {msg && <div className="mt-3"><Alert kind={msg.kind}>{msg.text}</Alert></div>}
    </Card>
  )
}

function CampaignsAdmin() {
  const [page, setPage] = useState(1)
  const { data, error, loading, reload } = useAsync(() => api.adminCampaigns({ page }), [page])
  return (
    <Section title="Campaigns">
      {loading && <Skeleton className="h-32" />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data?.data.length === 0 && <EmptyState title="No campaigns yet">Campaigns submitted by brands appear here.</EmptyState>}
      <ul className="space-y-3">
        {data?.data.map((c) => (
          <li key={c.id}><Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h3 className="text-lg font-semibold">{c.title}</h3><p className="text-sm text-muted">{c.brand_name}. {c.objective}</p></div>
              <Badge tone={statusTone(c.status)}>{c.status}</Badge>
            </div>
            <p className="mt-2 text-sm">Budget <strong>{formatMoney(c.budget, c.currency)}</strong>. {formatDate(c.start_date)} to {formatDate(c.end_date)}.</p>
          </Card></li>
        ))}
      </ul>
      {data && <Pagination meta={data.meta} onPage={setPage} />}
    </Section>
  )
}
