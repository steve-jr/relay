import { z } from 'zod'

const phone = z.string().refine((v) => v === '' || /^\+?[0-9\s-]{7,18}$/.test(v), 'Enter a valid phone number with country code, for example +254 712 000 000')
const numStr = z.string().refine((v) => v === '' || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Enter a number, or leave blank')
const consent = z.boolean().refine((v) => v === true, 'You need to agree before continuing')
const industryFields = {
  industries: z.array(z.string()),
  other_industries: z.string().refine((v) => v.split(',').every((x) => x.trim().length <= 40), 'Keep each industry under 40 characters'),
}
type IndustryValues = { industries: string[]; other_industries: string }
const needIndustry = (d: IndustryValues) => d.industries.length > 0 || d.other_industries.trim() !== ''
const needIndustryMsg = { message: 'Pick at least one industry or write your own', path: ['industries'] }
const password = z.string().min(8, 'Use at least 8 characters')

export const leadSchema = z.object({
  contact_name: z.string().min(2, 'Enter your name'),
  business_name: z.string().min(2, 'Enter your business name'),
  email: z.string().email('Enter a valid work email'),
  phone,
  industry: z.string(),
  campaign_budget: z.string(),
  desired_platforms: z.array(z.string()).min(1, 'Pick at least one platform'),
  campaign_objectives: z.string().min(1, 'Choose an objective'),
  campaign_description: z.string().min(20, 'Tell us a bit more (at least 20 characters)').max(2000, 'Keep this under 2,000 characters'),
  consent,
})
export type LeadForm = z.infer<typeof leadSchema>

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
})
export type LoginForm = z.infer<typeof loginSchema>

const accountFields = {
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password,
  password_confirmation: z.string(),
  consent,
}
const matchPasswords = (d: { password: string; password_confirmation: string }) => d.password === d.password_confirmation
const matchMsg = { message: 'Passwords do not match', path: ['password_confirmation'] }

export const brandRegisterSchema = z
  .object({
    ...accountFields,
    business_name: z.string().min(2, 'Enter your business name'),
    industry: z.string().min(1, 'Choose an industry'),
    city: z.string().min(1, 'Choose a city'),
  })
  .refine(matchPasswords, matchMsg)
export type BrandRegisterForm = z.infer<typeof brandRegisterSchema>

export const creatorRegisterSchema = z
  .object({
    ...accountFields,
    display_name: z.string().min(2, 'Enter the name you post under'),
    city: z.string().min(1, 'Choose a city'),
    primary_niche: z.string().min(1, 'Choose your main niche'),
    ...industryFields,
    bio: z.string().max(500, 'Keep your bio under 500 characters'),
    instagram_handle: z.string(),
    tiktok_handle: z.string(),
    terms: z.boolean().refine((v) => v === true, 'You need to agree to the creator terms'),
  })
  .refine(matchPasswords, matchMsg)
  .refine(needIndustry, needIndustryMsg)
  .refine((d) => d.instagram_handle.trim() !== '' || d.tiktok_handle.trim() !== '', {
    message: 'Add at least an Instagram or TikTok handle',
    path: ['instagram_handle'],
  })
export type CreatorRegisterForm = z.infer<typeof creatorRegisterSchema>

export const creatorProfileSchema = z.object({
  display_name: z.string().min(2, 'Enter a display name'),
  bio: z.string().max(500, 'Keep your bio under 500 characters'),
  city: z.string().min(1, 'Choose a city'),
  primary_niche: z.string().min(1, 'Choose a niche'),
  ...industryFields,
  instagram_handle: z.string(),
  instagram_followers: numStr,
  tiktok_handle: z.string(),
  tiktok_followers: numStr,
  youtube_handle: z.string(),
  youtube_subscribers: numStr,
  facebook_handle: z.string(),
  average_engagement_rate: numStr,
  starting_rate: numStr,
}).refine(needIndustry, needIndustryMsg)
export type CreatorProfileForm = z.infer<typeof creatorProfileSchema>

export const brandProfileSchema = z.object({
  business_name: z.string().min(2, 'Enter your business name'),
  industry: z.string().min(1, 'Choose an industry'),
  city: z.string().min(1, 'Choose a city'),
  website: z.string(),
  phone,
  contact_person: z.string(),
  description: z.string().max(1000, 'Keep this under 1,000 characters'),
})
export type BrandProfileForm = z.infer<typeof brandProfileSchema>

export const campaignSchema = z.object({
  title: z.string().min(3, 'Give the campaign a title'),
  objective: z.string().min(1, 'Choose an objective'),
  description: z.string().min(20, 'Describe the campaign (at least 20 characters)'),
  target_audience: z.string(),
  platforms: z.array(z.string()).min(1, 'Pick at least one platform'),
  budget: z.string().refine((v) => v !== '' && Number(v) > 0, 'Enter a budget amount'),
  start_date: z.string(),
  end_date: z.string(),
})
export type CampaignForm = z.infer<typeof campaignSchema>

export const offerSchema = z.object({
  fee: z.string().refine((v) => v !== '' && Number(v) > 0, 'Enter a fee greater than 0'),
  deliverables: z.string().min(5, 'Describe what will be delivered'),
  deadline: z.string(),
  note: z.string().max(500, 'Keep the note under 500 characters'),
})
export type OfferForm = z.infer<typeof offerSchema>
