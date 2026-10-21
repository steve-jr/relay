import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { homeFor, useAuth } from '../auth/AuthContext'
import { applyServerErrors } from '../components/LeadForm'
import { Alert, Button, Field, useTitle } from '../components/ui'
import IndustryPicker from '../components/IndustryPicker'
import { industries, niches } from '../config/brand'
import { useCountry } from '../lib/country'
import { mergeIndustries } from '../lib/format'
import { useMockApi } from '../lib/api'
import { track } from '../lib/analytics'
import { brandRegisterSchema, creatorRegisterSchema, loginSchema, type BrandRegisterForm, type CreatorRegisterForm, type LoginForm } from '../lib/schemas'

function Shell({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <div className="container-page py-12 sm:py-16">
      <div className="mx-auto max-w-xl rounded-tag border border-ink/15 bg-white p-6 sm:p-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        {intro && <p className="mt-2 text-muted">{intro}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

export function Login() {
  useTitle('Log in')
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from
  const [formError, setFormError] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  if (user) return <Navigate to={homeFor(user.role)} replace />
  return (
    <Shell title="Log in" intro="Brands, creators and administrators log in here.">
      {useMockApi && <div className="mb-5"><Alert title="Demo accounts">admin@example.test, brand@example.test or creator@example.test with the password "password". Demo mode only.</Alert></div>}
      <form noValidate className="space-y-5" onSubmit={handleSubmit(async (v) => {
        setFormError('')
        try { const u = await login(v.email, v.password); navigate(from ?? homeFor(u.role), { replace: true }) } catch (e) { setFormError(applyServerErrors(e, setError)) }
      })}>
        {formError && <Alert kind="error" title="Could not log you in">{formError}</Alert>}
        <Field label="Email" error={errors.email?.message}>{(p) => <input {...p} {...register('email')} type="email" autoComplete="email" className="input" />}</Field>
        <Field label="Password" error={errors.password?.message}>{(p) => <input {...p} {...register('password')} type="password" autoComplete="current-password" className="input" />}</Field>
        <Button type="submit" loading={isSubmitting} className="w-full">Log in</Button>
      </form>
      <p className="mt-6 text-sm text-muted">New here? <Link to="/register/brand" className="font-semibold text-lagoon underline">Register as a brand</Link> or <Link to="/register/creator" className="font-semibold text-lagoon underline">join as a creator</Link>.</p>
    </Shell>
  )
}

const ConsentRow = ({ reg, error, name, children }: { reg: object; error?: string; name?: string; children: React.ReactNode }) => (
  <div>
    <label className="flex items-start gap-3 text-sm"><input type="checkbox" {...reg} aria-invalid={Boolean(error)} className="mt-1 h-4 w-4 accent-lagoon" data-name={name} /><span>{children}</span></label>
    {error && <p role="alert" className="mt-1 text-sm font-medium text-hibiscus">{error}</p>}
  </div>
)

export function RegisterBrand() {
  useTitle('Register as a brand')
  const { country } = useCountry()
  const { registerBrand } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<BrandRegisterForm>({
    resolver: zodResolver(brandRegisterSchema),
    defaultValues: { name: '', email: '', password: '', password_confirmation: '', consent: false, business_name: '', industry: '', city: '' },
  })
  return (
    <Shell title="Register as a brand" intro="Create an account to submit campaigns and track their progress.">
      <form noValidate className="space-y-5" onSubmit={handleSubmit(async (v) => {
        setFormError('')
        try { await registerBrand({ ...v, country: country.code }); navigate('/dashboard/brand', { replace: true }) } catch (e) { setFormError(applyServerErrors(e, setError)) }
      })}>
        {formError && <Alert kind="error" title="Could not create your account">{formError}</Alert>}
        <Field label="Your name" error={errors.name?.message}>{(p) => <input {...p} {...register('name')} autoComplete="name" className="input" />}</Field>
        <Field label="Business name" error={errors.business_name?.message}>{(p) => <input {...p} {...register('business_name')} autoComplete="organization" className="input" />}</Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Industry" error={errors.industry?.message}>{(p) => <select {...p} {...register('industry')} className="input"><option value="">Choose one</option>{industries.map((i) => <option key={i}>{i}</option>)}</select>}</Field>
          <Field label="City" error={errors.city?.message}>{(p) => <select {...p} {...register('city')} className="input"><option value="">Choose one</option>{country.cities.map((i) => <option key={i}>{i}</option>)}</select>}</Field>
        </div>
        <Field label="Work email" error={errors.email?.message}>{(p) => <input {...p} {...register('email')} type="email" autoComplete="email" className="input" />}</Field>
        <Field label="Password" error={errors.password?.message} hint="At least 8 characters.">{(p) => <input {...p} {...register('password')} type="password" autoComplete="new-password" className="input" />}</Field>
        <Field label="Confirm password" error={errors.password_confirmation?.message}>{(p) => <input {...p} {...register('password_confirmation')} type="password" autoComplete="new-password" className="input" />}</Field>
        <ConsentRow reg={register('consent')} error={errors.consent?.message}>I agree to the <Link to="/privacy" className="font-semibold underline">privacy notice</Link>.</ConsentRow>
        <Button type="submit" loading={isSubmitting} className="w-full">Create brand account</Button>
      </form>
    </Shell>
  )
}

export function RegisterCreator() {
  useTitle('Join as a creator')
  const { country } = useCountry()
  const { registerCreator } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CreatorRegisterForm>({
    resolver: zodResolver(creatorRegisterSchema),
    defaultValues: { name: '', email: '', password: '', password_confirmation: '', consent: false, terms: false, display_name: '', city: '', primary_niche: '', industries: [], other_industries: '', bio: '', instagram_handle: '', tiktok_handle: '' },
  })
  return (
    <Shell title="Join as a creator" intro="Free to join. Our team reviews every application, and approval is not guaranteed.">
      <form noValidate className="space-y-5" onSubmit={handleSubmit(async (v) => {
        setFormError('')
        try { await registerCreator({ ...v, industries: mergeIndustries(v.industries, v.other_industries), other_industries: undefined, country: country.code }); track('Creator registration completed'); navigate('/dashboard/creator', { replace: true }) } catch (e) { setFormError(applyServerErrors(e, setError)) }
      })} onFocus={() => track('Creator registration started')}>
        {formError && <Alert kind="error" title="Could not create your account">{formError}</Alert>}
        <Field label="Your name" error={errors.name?.message}>{(p) => <input {...p} {...register('name')} autoComplete="name" className="input" />}</Field>
        <Field label="Display name" error={errors.display_name?.message} hint="The name brands will see on your profile.">{(p) => <input {...p} {...register('display_name')} className="input" />}</Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City" error={errors.city?.message}>{(p) => <select {...p} {...register('city')} className="input"><option value="">Choose one</option>{country.cities.map((i) => <option key={i}>{i}</option>)}</select>}</Field>
          <Field label="Main niche" error={errors.primary_niche?.message}>{(p) => <select {...p} {...register('primary_niche')} className="input"><option value="">Choose one</option>{niches.map((i) => <option key={i}>{i}</option>)}</select>}</Field>
        </div>
        <IndustryPicker picked={register('industries')} other={register('other_industries')} error={errors.industries?.message} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Instagram handle" error={errors.instagram_handle?.message}>{(p) => <input {...p} {...register('instagram_handle')} placeholder="without the @" className="input" />}</Field>
          <Field label="TikTok handle">{(p) => <input {...p} {...register('tiktok_handle')} placeholder="without the @" className="input" />}</Field>
        </div>
        <Field label="Short bio (optional)" error={errors.bio?.message}>{(p) => <textarea {...p} {...register('bio')} rows={3} className="input" />}</Field>
        <Field label="Email" error={errors.email?.message} hint="Never shown on your public profile.">{(p) => <input {...p} {...register('email')} type="email" autoComplete="email" className="input" />}</Field>
        <Field label="Password" error={errors.password?.message} hint="At least 8 characters.">{(p) => <input {...p} {...register('password')} type="password" autoComplete="new-password" className="input" />}</Field>
        <Field label="Confirm password" error={errors.password_confirmation?.message}>{(p) => <input {...p} {...register('password_confirmation')} type="password" autoComplete="new-password" className="input" />}</Field>
        <ConsentRow reg={register('consent')} error={errors.consent?.message}>I agree to the <Link to="/privacy" className="font-semibold underline">privacy notice</Link>.</ConsentRow>
        <ConsentRow reg={register('terms')} error={errors.terms?.message}>I agree to the <Link to="/terms" className="font-semibold underline">creator terms</Link>.</ConsentRow>
        <Button type="submit" loading={isSubmitting} className="w-full">Submit application</Button>
      </form>
    </Shell>
  )
}
