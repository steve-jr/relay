import { useEffect, useRef, useState } from 'react'
import { useForm, type FieldValues, type Path, type UseFormSetError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { industries, objectives, platforms } from '../config/brand'
import { budgetOptions } from '../lib/format'
import { useCountry } from '../lib/country'
import { track, leadSource } from '../lib/analytics'
import { ApiError, submitLead } from '../lib/api'
import { leadSchema, type LeadForm as LeadValues } from '../lib/schemas'
import { Alert, Button, Field } from './ui'

export function applyServerErrors<T extends FieldValues>(err: unknown, setError: UseFormSetError<T>): string {
  if (err instanceof ApiError) {
    Object.entries(err.fieldErrors).forEach(([k, v]) => setError(k as Path<T>, { type: 'server', message: v[0] }))
    return err.message
  }
  return 'Something went wrong. Please try again.'
}

export default function LeadForm({ creatorName }: { creatorName?: string }) {
  const { country } = useCountry()
  const [done, setDone] = useState(false)
  const [formError, setFormError] = useState('')
  const started = useRef(false)
  const successRef = useRef<HTMLDivElement>(null)
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      contact_name: '', business_name: '', email: '', phone: '', industry: '', campaign_budget: '',
      desired_platforms: [], campaign_objectives: '', consent: false,
      campaign_description: creatorName ? `I'd like to work with ${creatorName}. ` : '',
    },
  })

  useEffect(() => { if (done) successRef.current?.focus() }, [done])

  const onSubmit = handleSubmit(async (v) => {
    setFormError('')
    try {
      await submitLead({ ...v, campaign_budget: v.campaign_budget ? Number(v.campaign_budget) : null, country: country.code, currency: country.currency, source: leadSource() })
      track('Brand inquiry submitted')
      setDone(true)
    } catch (e) {
      setFormError(applyServerErrors(e, setError))
    }
  })

  if (done) {
    return (
      <div ref={successRef} tabIndex={-1} className="rounded-tag border border-lagoon bg-[#E3F4EA] p-6 outline-none">
        <h3 className="text-xl font-semibold">Thanks, we have your brief</h3>
        <p className="mt-2 text-muted">We will review it and reply by email, usually within two working days.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5" onFocus={() => { if (!started.current) { started.current = true; track('Brand inquiry started') } }}>
      {formError && <Alert kind="error" title="We could not send your brief">{formError}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" error={errors.contact_name?.message}>{(p) => <input {...p} {...register('contact_name')} autoComplete="name" className="input" />}</Field>
        <Field label="Business name" error={errors.business_name?.message}>{(p) => <input {...p} {...register('business_name')} autoComplete="organization" className="input" />}</Field>
        <Field label="Work email" error={errors.email?.message}>{(p) => <input {...p} {...register('email')} type="email" autoComplete="email" className="input" />}</Field>
        <Field label="Phone or WhatsApp (optional)" error={errors.phone?.message}>{(p) => <input {...p} {...register('phone')} type="tel" autoComplete="tel" placeholder={country.phonePlaceholder} className="input" />}</Field>
        <Field label="Industry (optional)">{(p) => <select {...p} {...register('industry')} className="input"><option value="">Choose one</option>{industries.map((i) => <option key={i}>{i}</option>)}</select>}</Field>
        <Field label="Campaign objective" error={errors.campaign_objectives?.message}>{(p) => <select {...p} {...register('campaign_objectives')} className="input"><option value="">Choose one</option>{objectives.map((o) => <option key={o}>{o}</option>)}</select>}</Field>
      </div>
      <Field label="Estimated budget (optional)" hint="Illustrative ranges to help us plan. They are not market prices.">
        {(p) => <select {...p} {...register('campaign_budget')} className="input"><option value="">Not sure yet</option>{budgetOptions(country.budgetSteps, country.currency).map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}</select>}
      </Field>
      <fieldset aria-describedby={errors.desired_platforms ? 'plat-err' : undefined}>
        <legend className="mb-1.5 text-sm font-semibold">Platforms</legend>
        <div className="flex flex-wrap gap-3">
          {platforms.map((pl) => (
            <label key={pl.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink/25 bg-white px-3.5 py-2 has-[:checked]:border-lagoon has-[:checked]:bg-mist">
              <input type="checkbox" value={pl.id} {...register('desired_platforms')} className="h-4 w-4 accent-lagoon" />{pl.label}
            </label>
          ))}
        </div>
        {errors.desired_platforms && <p id="plat-err" role="alert" className="mt-1 text-sm font-medium text-hibiscus">{errors.desired_platforms.message}</p>}
      </fieldset>
      <Field label="Tell us about the campaign" error={errors.campaign_description?.message} hint="What are you promoting, who should see it, and when?">
        {(p) => <textarea {...p} {...register('campaign_description')} rows={5} className="input" />}
      </Field>
      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" {...register('consent')} aria-invalid={Boolean(errors.consent)} className="mt-1 h-4 w-4 accent-lagoon" />
          <span>I agree to the <Link to="/privacy" className="font-semibold underline">privacy notice</Link> and that you may contact me about this brief.</span>
        </label>
        {errors.consent && <p role="alert" className="mt-1 text-sm font-medium text-hibiscus">{errors.consent.message}</p>}
      </div>
      <Button type="submit" loading={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send brief'}</Button>
    </form>
  )
}
