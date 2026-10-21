import { describe, expect, it } from 'vitest'
import { budgetOptions, formatCount, formatMoney, mergeIndustries } from './format'
import { brandRegisterSchema, creatorRegisterSchema, leadSchema, loginSchema, offerSchema } from './schemas'

const validLead = {
  contact_name: 'Ama Test', business_name: 'Test Foods', email: 'ama@example.com', phone: '',
  industry: '', campaign_budget: '', desired_platforms: ['instagram'], campaign_objectives: 'Brand awareness',
  campaign_description: 'We want creators to show our new snack range in Accra.', consent: true,
}

describe('leadSchema', () => {
  it('accepts a valid lead', () => expect(leadSchema.safeParse(validLead).success).toBe(true))
  it('rejects an invalid email', () => expect(leadSchema.safeParse({ ...validLead, email: 'nope' }).success).toBe(false))
  it('requires consent', () => expect(leadSchema.safeParse({ ...validLead, consent: false }).success).toBe(false))
  it('requires at least one platform', () => expect(leadSchema.safeParse({ ...validLead, desired_platforms: [] }).success).toBe(false))
  it('rejects a malformed phone number', () => expect(leadSchema.safeParse({ ...validLead, phone: 'abc' }).success).toBe(false))
})

describe('other schemas', () => {
  it('login needs a password', () => expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false))
  it('brand registration needs matching passwords', () => {
    const r = brandRegisterSchema.safeParse({ name: 'Ama', email: 'a@b.co', password: 'password1', password_confirmation: 'password2', consent: true, business_name: 'Co', industry: 'Events', city: 'Accra' })
    expect(r.success).toBe(false)
  })
})

const creator = {
  name: 'Ama', email: 'a@b.co', password: 'password1', password_confirmation: 'password1', consent: true, terms: true,
  display_name: 'Ama Test', city: 'Accra', primary_niche: 'Fashion', industries: [] as string[], other_industries: '',
  bio: '', instagram_handle: 'ama', tiktok_handle: '',
}
describe('creator industries', () => {
  it('needs at least one industry or a written one', () => expect(creatorRegisterSchema.safeParse(creator).success).toBe(false))
  it('accepts ticked industries', () => expect(creatorRegisterSchema.safeParse({ ...creator, industries: ['Fashion', 'Events'] }).success).toBe(true))
  it('accepts a written industry when none are ticked', () => expect(creatorRegisterSchema.safeParse({ ...creator, other_industries: 'Agriculture' }).success).toBe(true))
  it('merges and dedupes ticked and written industries', () => expect(mergeIndustries(['Fashion'], 'agriculture, fashion , Fintech')).toEqual(['Fashion', 'agriculture', 'Fintech']))
})

describe('format', () => {
  it('abbreviates thousands with K', () => expect(formatMoney(5000, 'GHS')).toBe('GH₵5K'))
  it('abbreviates millions with M', () => expect(formatMoney(1200000, 'NGN')).toBe('₦1.2M'))
  it('uses the Kenyan shilling symbol', () => expect(formatMoney(250000, 'KES')).toBe('KSh250K'))
  it('leaves small amounts as they are', () => expect(formatMoney(900, 'GHS')).toBe('GH₵900'))
  it('handles a missing rate', () => expect(formatMoney(null, 'GHS')).toBe('On request'))
  it('compacts follower counts', () => expect(formatCount(12500)).toBe('12.5K'))
  it('builds budget ranges in local currency', () => {
    const o = budgetOptions([100000, 250000], 'NGN')
    expect(o.map((x) => x.label)).toEqual(['Up to ₦100K', '₦100K to ₦250K', 'Above ₦250K'])
  })
})

describe('offerSchema', () => {
  const offer = { fee: '1200', deliverables: 'One TikTok video', deadline: '', note: '' }
  it('accepts a valid counter offer', () => expect(offerSchema.safeParse(offer).success).toBe(true))
  it('rejects a zero or empty fee', () => {
    expect(offerSchema.safeParse({ ...offer, fee: '0' }).success).toBe(false)
    expect(offerSchema.safeParse({ ...offer, fee: '' }).success).toBe(false)
  })
  it('requires deliverables', () => expect(offerSchema.safeParse({ ...offer, deliverables: 'x' }).success).toBe(false))
})
