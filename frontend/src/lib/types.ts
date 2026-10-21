export type Role = 'admin' | 'brand' | 'creator'
export type PlatformId = 'instagram' | 'tiktok' | 'youtube' | 'facebook'

export interface User { id: number; name: string; email: string; role: Role; country?: 'GH' | 'NG' | 'KE' }

export interface SocialAccount { platform: PlatformId; handle: string; followers: number | null }

export interface CreatorPublic {
  id: number
  slug: string
  display_name: string
  bio: string | null
  city: string
  country: string // ISO code: GH, NG or KE
  currency: string
  primary_niche: string
  secondary_niches: string[]
  industries: string[]
  socials: SocialAccount[]
  average_engagement_rate: number | null
  starting_rate: number | null
  profile_image_url: string | null
  is_demo?: boolean
}

export interface PageMeta { current_page: number; last_page: number; per_page: number; total: number }
export interface Paginated<T> { data: T[]; meta: PageMeta }

export interface CreatorQuery {
  q?: string; city?: string; platform?: string; niche?: string
  min_followers?: string; industry?: string; country?: string; sort?: string; page?: number
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected'

export interface CreatorProfile {
  id: number
  display_name: string
  bio: string | null
  city: string
  primary_niche: string
  industries: string[]
  instagram_handle: string | null
  instagram_followers: number | null
  tiktok_handle: string | null
  tiktok_followers: number | null
  youtube_handle: string | null
  youtube_subscribers: number | null
  facebook_handle: string | null
  average_engagement_rate: number | null
  starting_rate: number | null
  verification_status: VerificationStatus
  is_public: boolean
}

export interface AdminCreator extends CreatorProfile { slug: string; email: string; admin_review_notes: string | null; created_at: string }

export interface BrandProfile {
  id: number; business_name: string; industry: string; website: string | null
  description: string | null; city: string; phone: string | null; contact_person: string | null
}

export type CampaignStatus = 'draft' | 'submitted' | 'reviewing' | 'recruiting' | 'active' | 'completed' | 'cancelled'
export interface Campaign {
  id: number; title: string; description: string; objective: string
  target_audience: string | null; platforms: string[]; budget: number
  start_date: string | null; end_date: string | null; status: CampaignStatus; currency: string
  brand_name?: string
}

export interface Offer {
  id: number; round: number; by: 'brand' | 'creator'; fee: number
  deliverables: string; deadline: string | null; note: string | null; created_at: string
}
export type NegotiationStatus = 'open' | 'accepted' | 'declined'
export interface Negotiation {
  id: number; campaign_title: string; brand_name: string; creator_name: string; currency: string
  status: NegotiationStatus; turn: 'brand' | 'creator' | null; max_rounds: number; offers: Offer[]
}
export interface OfferInput { fee: number; deliverables: string; deadline: string | null; note: string | null }

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
export interface Lead {
  id: number; contact_name: string; business_name: string; email: string; phone: string | null
  industry: string | null; campaign_budget: number | null; currency: string; desired_platforms: string[]
  campaign_objectives: string | null; campaign_description: string | null
  status: LeadStatus; source: string | null; internal_notes: string | null; created_at: string
}

export interface DashboardStats {
  new_leads: number; total_leads: number; total_creators: number
  pending_creators: number; approved_creators: number; active_campaigns: number; completed_campaigns: number
  is_demo?: boolean
}
