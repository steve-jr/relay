import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, Loader2 } from 'lucide-react'
import { brand } from '../config/brand'
import { initials } from '../lib/format'
import type { PageMeta } from '../lib/types'

export function useTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${brand.name}` : `${brand.name}: ${brand.tagline}`
  }, [title])
}

type Variant = 'primary' | 'dark' | 'outline' | 'outlineLight' | 'ghost' | 'danger'
const variants: Record<Variant, string> = {
  primary: 'bg-sun text-ink hover:bg-sun-deep',
  dark: 'bg-ink text-white hover:bg-lagoon',
  outline: 'border border-ink/30 bg-white text-ink hover:border-ink',
  outlineLight: 'border border-white/60 bg-transparent text-white hover:border-white hover:bg-white/10', // for dark backgrounds
  ghost: 'text-ink hover:bg-mist',
  danger: 'bg-hibiscus text-white hover:bg-hibiscus/90',
}

export function Button({ variant = 'primary', loading, className = '', children, disabled, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function linkClass(variant: Variant = 'primary', extra = '') {
  return `inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-semibold transition-colors ${variants[variant]} ${extra}`
}

export interface FieldProps { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }

export function Field({ label, error, hint, children, className = '' }: { label: string; error?: string; hint?: string; className?: string; children: (p: FieldProps) => ReactNode }) {
  const id = useId()
  const describedBy = [error ? `${id}-err` : '', hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="mt-1 text-sm font-medium text-hibiscus">{error}</p>}
    </div>
  )
}

export function Alert({ kind = 'info', title, children }: { kind?: 'info' | 'success' | 'error'; title?: string; children?: ReactNode }) {
  const styles = { info: 'border-lagoon/30 bg-mist text-ink', success: 'border-lagoon bg-[#E3F4EA] text-ink', error: 'border-hibiscus/50 bg-[#FCE9EF] text-ink' }
  const Icon = kind === 'success' ? CheckCircle2 : kind === 'error' ? AlertCircle : Info
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-lg border p-4 ${styles[kind]}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${kind === 'error' ? 'text-hibiscus' : 'text-lagoon'}`} aria-hidden />
      <div className="text-sm leading-relaxed">{title && <p className="font-semibold">{title}</p>}{children}</div>
    </div>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'demo' }) {
  const tones = { neutral: 'bg-mist text-ink', good: 'bg-[#D6F0DF] text-[#0B4A24]', warn: 'bg-[#FFE9A8] text-[#5C4300]', bad: 'bg-[#F9D5E0] text-[#7A1236]', demo: 'border border-dashed border-ink/40 bg-white text-muted' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-mist ${className}`} />
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-tag border border-dashed border-ink/30 bg-white px-6 py-12 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      {children && <p className="mx-auto mt-2 max-w-md text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="space-y-3">
      <Alert kind="error" title="We could not load this">{message}</Alert>
      {onRetry && <Button variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  )
}

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string | null; size?: 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-20 w-20 text-2xl' : 'h-12 w-12 text-base'
  if (src) return <img src={src} alt="" loading="lazy" className={`${dim} rounded-full object-cover`} />
  const hue = [...name].reduce((n, c) => n + c.charCodeAt(0), 0) % 4
  const bg = ['bg-lagoon text-white', 'bg-sun text-ink', 'bg-seafoam text-ink', 'bg-ink text-white'][hue]
  return <span aria-hidden className={`${dim} ${bg} inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold`}>{initials(name.replace(/^Demo\s+/, ''))}</span>
}

export function Pagination({ meta, onPage }: { meta: PageMeta; onPage: (p: number) => void }) {
  if (meta.last_page <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
      <Button variant="outline" disabled={meta.current_page <= 1} onClick={() => onPage(meta.current_page - 1)}><ChevronLeft className="h-4 w-4" aria-hidden />Previous</Button>
      <p className="text-sm text-muted">Page {meta.current_page} of {meta.last_page}</p>
      <Button variant="outline" disabled={meta.current_page >= meta.last_page} onClick={() => onPage(meta.current_page + 1)}>Next<ChevronRight className="h-4 w-4" aria-hidden /></Button>
    </nav>
  )
}

export function ConfirmDialog({ open, title, children, confirmLabel, danger, busy, onConfirm, onCancel }: {
  open: boolean; title: string; children?: ReactNode; confirmLabel: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onCancel() }} className="w-[min(92vw,28rem)] rounded-tag p-0 backdrop:bg-ink/60">
      <div className="p-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="mt-2 text-muted">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={danger ? 'danger' : 'dark'} loading={busy} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  )
}

export function statusTone(s: string): 'good' | 'warn' | 'bad' | 'neutral' {
  if (['approved', 'accepted', 'completed', 'converted', 'active', 'qualified'].includes(s)) return 'good'
  if (['pending', 'new', 'invited', 'submitted', 'reviewing', 'recruiting', 'interested', 'shortlisted', 'contacted', 'open'].includes(s)) return 'warn'
  if (['rejected', 'declined', 'lost', 'cancelled'].includes(s)) return 'bad'
  return 'neutral'
}
