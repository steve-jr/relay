import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import type * as T from './types'

const root = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '')
export const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true'

export class ApiError extends Error {
  constructor(public status: number, message: string, public fieldErrors: Record<string, string[]> = {}) {
    super(message)
  }
}

const http = axios.create({
  baseURL: `${root}/api/v1`,
  withCredentials: true, // Sanctum SPA auth uses cookies, not tokens in browser storage
  withXSRFToken: true,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
})

if (useMockApi) {
  http.defaults.adapter = (config) => import('./mock').then((m) => m.mockAdapter(config))
}

http.interceptors.response.use(
  (r) => r,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (!error.response) {
      return Promise.reject(new ApiError(0, 'Could not reach the server. Check your connection and try again.'))
    }
    const { status, data } = error.response
    const fallback: Record<number, string> = {
      401: 'Please log in to continue.',
      403: 'You do not have permission to do that.',
      404: 'We could not find what you were looking for.',
      409: 'This conflicts with an existing record.',
      419: 'Your session expired. Refresh the page and try again.',
      422: 'Please check the highlighted fields.',
      429: 'Too many attempts. Please wait a moment and try again.',
    }
    const message = data?.message ?? fallback[status] ?? 'Something went wrong on our side. Please try again.'
    return Promise.reject(new ApiError(status, message, data?.errors ?? {}))
  },
)

async function csrf() {
  if (useMockApi) return
  await axios.get(`${root}/sanctum/csrf-cookie`, { withCredentials: true })
}

const get = async <R>(url: string, config?: AxiosRequestConfig) => (await http.get<R>(url, config)).data
const send = async <R>(method: 'post' | 'put' | 'patch', url: string, body?: unknown) =>
  (await http[method]<R>(url, body)).data

// Public
export const listCreators = (params: T.CreatorQuery) => get<T.Paginated<T.CreatorPublic>>('/creators', { params })
export const featuredCreators = async (country: string) => (await get<{ data: T.CreatorPublic[] }>('/creators/featured', { params: { country } })).data
export const getCreator = async (slug: string) => (await get<{ data: T.CreatorPublic }>(`/creators/${slug}`)).data
export const submitLead = (body: Record<string, unknown>) => send<{ data: { id: number } }>('post', '/leads', body)

// Auth
export const login = async (body: { email: string; password: string }) => {
  await csrf()
  return (await send<{ data: T.User }>('post', '/login', body)).data
}
export const logout = () => send<void>('post', '/logout')
export const me = async () => (await get<{ data: T.User }>('/me')).data
export const registerBrand = async (body: Record<string, unknown>) => {
  await csrf()
  return (await send<{ data: T.User }>('post', '/register/brand', body)).data
}
export const registerCreator = async (body: Record<string, unknown>) => {
  await csrf()
  return (await send<{ data: T.User }>('post', '/register/creator', body)).data
}

// Brand
export const getBrandProfile = async () => (await get<{ data: T.BrandProfile }>('/brand/profile')).data
export const updateBrandProfile = async (body: unknown) => (await send<{ data: T.BrandProfile }>('put', '/brand/profile', body)).data
export const listBrandCampaigns = async () => (await get<{ data: T.Campaign[] }>('/brand/campaigns')).data
export const createBrandCampaign = async (body: unknown) => (await send<{ data: T.Campaign }>('post', '/brand/campaigns', body)).data

// Creator
export const getCreatorProfile = async () => (await get<{ data: T.CreatorProfile }>('/creator/profile')).data
export const updateCreatorProfile = async (body: unknown) => (await send<{ data: T.CreatorProfile }>('put', '/creator/profile', body)).data

// Negotiations (offers and counter-offers), shared by brand and creator
const negBase = (role: 'brand' | 'creator') => (role === 'brand' ? '/brand/negotiations' : '/creator/invitations')
export const listNegotiations = async (role: 'brand' | 'creator') => (await get<{ data: T.Negotiation[] }>(negBase(role))).data
export const sendOffer = async (role: 'brand' | 'creator', id: number, body: T.OfferInput) =>
  (await send<{ data: T.Negotiation }>('post', `${negBase(role)}/${id}/offers`, body)).data
export const respondNegotiation = async (role: 'brand' | 'creator', id: number, response: 'accepted' | 'declined') =>
  (await send<{ data: T.Negotiation }>('post', `${negBase(role)}/${id}/respond`, { response })).data

// Admin
export const adminDashboard = async () => (await get<{ data: T.DashboardStats }>('/admin/dashboard')).data
export const adminCreators = (params: { status?: string; page?: number }) => get<T.Paginated<T.AdminCreator>>('/admin/creators', { params })
export const setVerification = async (id: number, body: { verification_status: T.VerificationStatus; admin_review_notes?: string }) =>
  (await send<{ data: T.AdminCreator }>('patch', `/admin/creators/${id}/verification`, body)).data
export const adminLeads = (params: { status?: string; search?: string; page?: number }) => get<T.Paginated<T.Lead>>('/admin/leads', { params })
export const updateLead = async (id: number, body: { status?: T.LeadStatus; internal_notes?: string }) =>
  (await send<{ data: T.Lead }>('patch', `/admin/leads/${id}`, body)).data
export const adminCampaigns = (params: { page?: number }) => get<T.Paginated<T.Campaign>>('/admin/campaigns', { params })

export async function downloadCsv(kind: 'leads' | 'creators') {
  const blob = await get<Blob>(`/admin/export/${kind}`, { responseType: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${kind}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
