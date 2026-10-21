// DEMO MODE ONLY. Enabled with VITE_USE_MOCK_API=true. All people, numbers and campaigns below are invented sample data.
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { AdminCreator, Campaign, CreatorPublic, Lead, Negotiation, User } from './types'

const CUR: Record<string, string> = { GH: 'GHS', NG: 'NGN', KE: 'KES' }
const mk = (id: number, name: string, city: string, niche: string, secondary: string[], ig: number | null, tt: number | null, yt: number | null, rate: number | null, er: number, bio: string, country = 'GH', industries: string[] = [niche]): CreatorPublic => ({
  id, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), display_name: name, bio, city, country, currency: CUR[country]!, industries, primary_niche: niche,
  secondary_niches: secondary, average_engagement_rate: er, starting_rate: rate, profile_image_url: null, is_demo: true,
  socials: [
    ...(ig ? [{ platform: 'instagram' as const, handle: name.toLowerCase().replace(/\s/g, '_'), followers: ig }] : []),
    ...(tt ? [{ platform: 'tiktok' as const, handle: name.toLowerCase().replace(/\s/g, ''), followers: tt }] : []),
    ...(yt ? [{ platform: 'youtube' as const, handle: name.replace(/\s/g, ''), followers: yt }] : []),
  ],
})

let creators: CreatorPublic[] = [
  mk(1, 'Demo Skin Studio', 'Accra', 'Beauty & skincare', ['Lifestyle'], 18400, 32100, null, 900, 4.2, 'Sample profile. Honest skincare reviews and routines for everyday budgets.'),
  mk(2, 'Demo Kumasi Eats', 'Kumasi', 'Food & drink', ['Travel & tourism'], 9200, 15800, 4100, 600, 5.1, 'Sample profile. Street food tours and restaurant first looks.'),
  mk(3, 'Demo Style Notes', 'Accra', 'Fashion', ['Beauty & skincare'], 52000, 28000, null, 2200, 3.4, 'Sample profile. Thrift-to-runway outfits and local designer features.'),
  mk(4, 'Demo Coast Wanderer', 'Cape Coast', 'Travel & tourism', ['Lifestyle'], 14700, null, 22300, 1200, 4.8, 'Sample profile. Weekend trips, beaches and heritage sites.'),
  mk(5, 'Demo Gadget Corner', 'Tema', 'Tech', [], 6100, 41000, 12800, 800, 6.0, 'Sample profile. Phone and gadget reviews in plain language.'),
  mk(6, 'Demo Fit With Efua', 'Takoradi', 'Fitness', ['Food & drink'], 11300, 19400, null, 500, 5.5, 'Sample profile. Home workouts and meal prep.'),
  mk(7, 'Demo Laugh Lane', 'Accra', 'Comedy', ['Music & events'], 88000, 140000, 31000, 4500, 7.2, 'Sample profile. Short skits about city life.'),
  mk(8, 'Demo Tamale Table', 'Tamale', 'Food & drink', [], 3800, 7200, null, null, 4.0, 'Sample profile. Northern Ghana recipes and market visits.'),
  mk(9, 'Demo Lagos Glow', 'Lagos', 'Beauty & skincare', ['Fashion'], 42000, 88000, null, 75000, 5.2, 'Sample profile. Makeup tutorials and skincare for Lagos life.', 'NG', ['Beauty & skincare', 'Fashion']),
  mk(10, 'Demo Abuja Bites', 'Abuja', 'Food & drink', [], 21000, 36000, 8000, 45000, 4.6, 'Sample profile. Restaurant reviews and home cooking.', 'NG'),
  mk(11, 'Demo Naija Tech Talk', 'Lagos', 'Tech', [], 15000, 64000, 27000, 90000, 6.1, 'Sample profile. Gadgets and apps explained simply.', 'NG', ['Tech', 'Fintech']),
  mk(12, 'Demo Port Harcourt Style', 'Port Harcourt', 'Fashion', ['Lifestyle'], 28000, 19000, null, 60000, 3.9, 'Sample profile. Street style and local tailors.', 'NG'),
  mk(13, 'Demo Nairobi Nights', 'Nairobi', 'Music & events', ['Lifestyle'], 33000, 71000, null, 18000, 5.8, 'Sample profile. Gigs, events and nightlife picks.', 'KE'),
  mk(14, 'Demo Mombasa Coast', 'Mombasa', 'Travel & tourism', [], 17500, null, 14200, 22000, 4.4, 'Sample profile. Beach stays and coastal food.', 'KE', ['Travel & tourism', 'Hospitality']),
  mk(15, 'Demo Savannah Fit', 'Nairobi', 'Fitness', ['Food & drink'], 12800, 23400, null, 9000, 6.3, 'Sample profile. Running clubs and workouts.', 'KE'),
  mk(16, 'Demo Kisumu Kitchen', 'Kisumu', 'Food & drink', [], 6400, 12100, null, 8000, 5.0, 'Sample profile. Lakeside recipes and market finds.', 'KE', ['Food & beverage', 'Agriculture']),
]
const isPublic = (id: number) => adminCreators.find((a) => a.id === id)?.is_public ?? true
let adminCreators: AdminCreator[] = creators.slice(0, 5).map((c, i) => ({
  id: c.id, slug: c.slug, display_name: c.display_name, bio: c.bio, city: c.city, primary_niche: c.primary_niche, industries: c.industries,
  instagram_handle: c.socials[0]?.handle ?? null, instagram_followers: c.socials[0]?.followers ?? null,
  tiktok_handle: null, tiktok_followers: null, youtube_handle: null, youtube_subscribers: null, facebook_handle: null,
  average_engagement_rate: c.average_engagement_rate, starting_rate: c.starting_rate,
  verification_status: i < 3 ? 'approved' : 'pending', is_public: i < 3, email: `creator${c.id}@example.test`,
  admin_review_notes: null, created_at: '2026-10-01T09:00:00Z',
}))
let leads: Lead[] = [
  { id: 1, contact_name: 'Demo Contact A', business_name: 'Demo Bakes Ltd', email: 'a@example.test', phone: null, industry: 'Food & beverage', campaign_budget: 5000, currency: 'GHS', desired_platforms: ['instagram', 'tiktok'], campaign_objectives: 'Product launch', campaign_description: 'Sample lead: launching a new pastry line in Accra.', status: 'new', source: 'website', internal_notes: null, created_at: '2026-10-12T10:00:00Z' },
  { id: 2, contact_name: 'Demo Contact B', business_name: 'Demo Glow Co', email: 'b@example.test', phone: '+233 24 000 0000', industry: 'Beauty & skincare', campaign_budget: 25000, currency: 'GHS', desired_platforms: ['instagram'], campaign_objectives: 'Brand awareness', campaign_description: 'Sample lead: awareness push for a skincare range.', status: 'qualified', source: 'instagram', internal_notes: 'Call booked.', created_at: '2026-10-09T14:30:00Z' },
]
let brandCampaigns: Campaign[] = [
  { id: 1, title: 'Demo launch campaign', description: 'Sample campaign for demonstration.', objective: 'Product launch', target_audience: 'Young adults in Accra', platforms: ['instagram', 'tiktok'], budget: 8000, currency: 'GHS', start_date: '2026-11-01', end_date: '2026-11-30', status: 'reviewing', brand_name: 'Demo Brand' },
]
let negotiations: Negotiation[] = [
  { id: 1, campaign_title: 'Demo launch campaign', brand_name: 'Demo Brand', creator_name: 'Demo Creator', currency: 'GHS', status: 'open', turn: 'creator', max_rounds: 5,
    offers: [{ id: 1, round: 1, by: 'brand', fee: 900, deliverables: 'Two Reels and three stories', deadline: '2026-11-20', note: 'Happy to discuss.', created_at: '2026-10-15T09:00:00Z' }] },
  { id: 2, campaign_title: 'Demo seasonal promo', brand_name: 'Demo Brand', creator_name: 'Demo Creator', currency: 'GHS', status: 'open', turn: 'creator', max_rounds: 5,
    offers: [
      { id: 1, round: 1, by: 'brand', fee: 800, deliverables: 'One TikTok video', deadline: null, note: null, created_at: '2026-10-10T09:00:00Z' },
      { id: 2, round: 2, by: 'creator', fee: 1200, deliverables: 'One TikTok video with usage for 30 days', deadline: null, note: 'Includes reposting on your channels.', created_at: '2026-10-11T12:00:00Z' },
      { id: 3, round: 3, by: 'brand', fee: 1000, deliverables: 'One TikTok video with usage for 30 days', deadline: null, note: 'Can we meet in the middle?', created_at: '2026-10-12T08:30:00Z' },
    ] },
]
let creatorProfile = { ...adminCreators[3]!, verification_status: 'pending' as const, is_public: false }
let brandProfile = { id: 1, business_name: 'Demo Brand', industry: 'Consumer goods', website: null as string | null, description: null as string | null, city: 'Accra', phone: null as string | null, contact_person: 'Demo Contact' }

const accounts: Record<string, User> = {
  'admin@example.test': { id: 1, name: 'Demo Admin', email: 'admin@example.test', role: 'admin' },
  'brand@example.test': { id: 2, name: 'Demo Brand', email: 'brand@example.test', role: 'brand', country: 'GH' },
  'creator@example.test': { id: 3, name: 'Demo Creator', email: 'creator@example.test', role: 'creator', country: 'GH' },
}
let session: User | null = null

const page = <T,>(items: T[], p: number, per = 9) => ({
  data: items.slice((p - 1) * per, p * per),
  meta: { current_page: p, last_page: Math.max(1, Math.ceil(items.length / per)), per_page: per, total: items.length },
})

function reply(config: InternalAxiosRequestConfig, status: number, data: unknown): Promise<AxiosResponse> {
  const response = { data, status, statusText: String(status), headers: {}, config } as AxiosResponse
  if (status >= 400) return Promise.reject(new AxiosError('mock error', String(status), config, null, response))
  return Promise.resolve(response)
}

export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  await new Promise((r) => setTimeout(r, 250))
  const url = (config.url ?? '').replace(/^\/+/, '/')
  const method = (config.method ?? 'get').toLowerCase()
  const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : (config.data ?? {})
  const q = (config.params ?? {}) as Record<string, string | number | undefined>
  const need = (role: User['role']) => (session?.role === role ? null : reply(config, session ? 403 : 401, {}))
  let m: RegExpMatchArray | null

  if (url === '/health') return reply(config, 200, { status: 'ok' })
  if (url === '/creators/featured') return reply(config, 200, { data: creators.filter((c) => c.country === (q.country ?? 'GH') && isPublic(c.id)).slice(0, 3) })
  if (url === '/creators' && method === 'get') {
    let list = creators.filter((c) => c.country === (q.country ?? 'GH') && isPublic(c.id))
    const text = String(q.q ?? '').toLowerCase()
    if (text) list = list.filter((c) => (c.display_name + c.primary_niche).toLowerCase().includes(text))
    if (q.city) list = list.filter((c) => c.city === q.city)
    if (q.niche) list = list.filter((c) => c.primary_niche === q.niche || c.secondary_niches.includes(String(q.niche)))
    if (q.industry) list = list.filter((c) => c.industries.includes(String(q.industry)))
    if (q.platform) list = list.filter((c) => c.socials.some((s) => s.platform === q.platform))
    if (q.min_followers) list = list.filter((c) => c.socials.reduce((n, s) => n + (s.followers ?? 0), 0) >= Number(q.min_followers))
    const total = (c: CreatorPublic) => c.socials.reduce((n, s) => n + (s.followers ?? 0), 0)
    if (q.sort === 'followers') list = [...list].sort((a, b) => total(b) - total(a))
    if (q.sort === 'rate_low') list = [...list].sort((a, b) => (a.starting_rate ?? 1e9) - (b.starting_rate ?? 1e9))
    return reply(config, 200, page(list, Number(q.page ?? 1)))
  }
  if ((m = url.match(/^\/creators\/([^/]+)$/))) {
    const c = creators.find((x) => x.slug === m![1])
    return c ? reply(config, 200, { data: c }) : reply(config, 404, { message: 'Creator not found.' })
  }
  if (url === '/leads' && method === 'post') {
    if (!/^\S+@\S+\.\S+$/.test(body.email ?? '')) return reply(config, 422, { message: 'Invalid data.', errors: { email: ['This email address is not valid.'] } })
    leads = [{ id: leads.length + 1, ...body, desired_platforms: body.desired_platforms ?? [], status: 'new', internal_notes: null, created_at: new Date().toISOString() }, ...leads]
    return reply(config, 201, { data: { id: leads.length } })
  }
  if (url === '/login') {
    const u = accounts[String(body.email).toLowerCase()]
    if (!u || body.password !== 'password') return reply(config, 422, { message: 'These credentials do not match our records.', errors: { email: ['These credentials do not match our records.'] } })
    session = u
    return reply(config, 200, { data: u })
  }
  if (url === '/logout') { session = null; return reply(config, 204, null) }
  if (url === '/me') return session ? reply(config, 200, { data: session }) : reply(config, 401, {})
  if (url === '/register/brand' || url === '/register/creator') {
    if (accounts[String(body.email).toLowerCase()]) return reply(config, 422, { message: 'Email taken.', errors: { email: ['An account with this email already exists.'] } })
    session = { id: 10, name: body.name, email: body.email, role: url.endsWith('brand') ? 'brand' : 'creator', country: body.country }
    if (session.role === 'creator') creatorProfile = { ...creatorProfile, display_name: body.display_name, city: body.city, primary_niche: body.primary_niche, bio: body.bio || null, verification_status: 'pending', is_public: false }
    else brandProfile = { ...brandProfile, business_name: body.business_name, industry: body.industry, city: body.city }
    return reply(config, 201, { data: session })
  }

  const neg = url.match(/^\/(brand\/negotiations|creator\/invitations)(?:\/(\d+)\/(offers|respond))?$/)
  if (neg) {
    const role = neg[1]!.startsWith('brand') ? 'brand' : 'creator'
    const blocked = need(role)
    if (blocked) return blocked
    if (!neg[2]) return reply(config, 200, { data: structuredClone(negotiations) })
    const n = negotiations.find((x) => x.id === Number(neg[2]))
    if (!n) return reply(config, 404, { message: 'Negotiation not found.' })
    if (n.status !== 'open') return reply(config, 409, { message: 'This negotiation is already closed.' })
    if (n.turn !== role) return reply(config, 409, { message: 'It is not your turn to respond.' })
    const last = n.offers[n.offers.length - 1]!
    if (neg[3] === 'respond') {
      n.status = body.response === 'accepted' ? 'accepted' : 'declined'
      n.turn = null
    } else {
      if (!(Number(body.fee) > 0)) return reply(config, 422, { message: 'Invalid offer.', errors: { fee: ['Enter a fee greater than 0.'] } })
      if (last.round >= n.max_rounds) return reply(config, 409, { message: 'The final round has been reached. Accept or decline.' })
      n.offers.push({ id: n.offers.length + 1, round: last.round + 1, by: role, fee: Number(body.fee), deliverables: body.deliverables, deadline: body.deadline ?? null, note: body.note ?? null, created_at: new Date().toISOString() })
      n.turn = role === 'brand' ? 'creator' : 'brand'
    }
    return reply(config, 200, { data: structuredClone(n) })
  }

  let denied: Promise<AxiosResponse> | null
  if (url.startsWith('/brand/')) {
    if ((denied = need('brand'))) return denied
    if (url === '/brand/profile') { if (method === 'put') brandProfile = { ...brandProfile, ...body }; return reply(config, 200, { data: brandProfile }) }
    if (url === '/brand/campaigns' && method === 'get') return reply(config, 200, { data: brandCampaigns })
    if (url === '/brand/campaigns' && method === 'post') {
      const c: Campaign = { id: brandCampaigns.length + 1, ...body, budget: Number(body.budget), status: 'submitted', brand_name: brandProfile.business_name }
      brandCampaigns = [c, ...brandCampaigns]
      return reply(config, 201, { data: c })
    }
  }
  if (url.startsWith('/creator/')) {
    if ((denied = need('creator'))) return denied
    if (url === '/creator/profile') { if (method === 'put') creatorProfile = { ...creatorProfile, ...body }; return reply(config, 200, { data: creatorProfile }) }
  }
  if (url.startsWith('/admin/')) {
    if ((denied = need('admin'))) return denied
    if (url === '/admin/dashboard') {
      return reply(config, 200, { data: {
        new_leads: leads.filter((l) => l.status === 'new').length, total_leads: leads.length, total_creators: adminCreators.length,
        pending_creators: adminCreators.filter((c) => c.verification_status === 'pending').length,
        approved_creators: adminCreators.filter((c) => c.verification_status === 'approved').length,
        active_campaigns: 0, completed_campaigns: 0, is_demo: true } })
    }
    if (url === '/admin/creators') {
      const list = q.status ? adminCreators.filter((c) => c.verification_status === q.status) : adminCreators
      return reply(config, 200, page(list, Number(q.page ?? 1), 10))
    }
    if ((m = url.match(/^\/admin\/creators\/(\d+)\/verification$/))) {
      adminCreators = adminCreators.map((c) => (c.id === Number(m![1]) ? { ...c, verification_status: body.verification_status, is_public: body.verification_status === 'approved', admin_review_notes: body.admin_review_notes ?? c.admin_review_notes } : c))
      return reply(config, 200, { data: adminCreators.find((c) => c.id === Number(m![1])) })
    }
    if (url === '/admin/leads') {
      let list = leads
      if (q.status) list = list.filter((l) => l.status === q.status)
      if (q.search) list = list.filter((l) => (l.business_name + l.contact_name + l.email).toLowerCase().includes(String(q.search).toLowerCase()))
      return reply(config, 200, page(list, Number(q.page ?? 1), 10))
    }
    if ((m = url.match(/^\/admin\/leads\/(\d+)$/)) && method === 'patch') {
      leads = leads.map((l) => (l.id === Number(m![1]) ? { ...l, ...body } : l))
      return reply(config, 200, { data: leads.find((l) => l.id === Number(m![1])) })
    }
    if (url === '/admin/campaigns') return reply(config, 200, page(brandCampaigns, 1, 10))
    if (url.startsWith('/admin/export/')) {
      const csv = 'id,business_name,status\n' + leads.map((l) => `${l.id},"${l.business_name.replace(/"/g, '""')}",${l.status}`).join('\n')
      return reply(config, 200, new Blob([csv], { type: 'text/csv' }))
    }
  }
  return reply(config, 404, { message: 'Not found in demo data.' })
}
