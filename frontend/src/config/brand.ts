// Everything brand-specific lives here so it is easy to change.
export const brand = {
  name: 'Relay',
  tagline: 'African creators for your next campaign',
  contactEmail: 'hello@relay.com',
  whatsappNumber: '233000000000', // international format, no +
}

export const niches = ['Beauty & skincare', 'Fashion', 'Food & drink', 'Travel & tourism', 'Lifestyle', 'Tech', 'Fitness', 'Comedy', 'Music & events', 'Parenting']
export const platforms = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'facebook', label: 'Facebook' },
] as const
export const industries = ['Beauty & skincare', 'Fashion', 'Food & beverage', 'Restaurants & hospitality', 'Ecommerce', 'Consumer goods', 'Events', 'Tourism & entertainment', 'Agency', 'Other']
export const objectives = ['Brand awareness', 'Product launch', 'Sales and conversions', 'UGC production', 'Event promotion', 'Local business promotion', 'App or service promotion', 'Other']
export const followerRanges = [
  { value: '1000', label: '1K+' },
  { value: '10000', label: '10K+' },
  { value: '50000', label: '50K+' },
  { value: '100000', label: '100K+' },
]
