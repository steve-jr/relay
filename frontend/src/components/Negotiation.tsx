import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as api from '../lib/api'
import { formatDate, formatMoney } from '../lib/format'
import { offerSchema, type OfferForm } from '../lib/schemas'
import type { Negotiation } from '../lib/types'
import { applyServerErrors } from './LeadForm'
import { Alert, Badge, Button, ConfirmDialog, Field, statusTone } from './ui'

/**
 * One negotiation thread. Each side can accept, counter or decline when it is their turn,
 * for up to `max_rounds` offers. The server must enforce turn order and the round limit.
 */
export default function NegotiationCard({ n, role, onChanged }: { n: Negotiation; role: 'brand' | 'creator'; onChanged: () => void }) {
  const [countering, setCountering] = useState(false)
  const [confirm, setConfirm] = useState<'accepted' | 'declined' | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const current = n.offers[n.offers.length - 1]!
  const myTurn = n.status === 'open' && n.turn === role
  const finalRound = current.round >= n.max_rounds
  const counterpart = role === 'brand' ? n.creator_name : n.brand_name
  const who = (by: 'brand' | 'creator') => (by === role ? 'You' : counterpart)

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<OfferForm>({
    resolver: zodResolver(offerSchema),
    defaultValues: { fee: String(current.fee), deliverables: current.deliverables, deadline: current.deadline ?? '', note: '' },
  })

  const respond = async () => {
    if (!confirm) return
    setBusy(true); setErr('')
    try { await api.respondNegotiation(role, n.id, confirm); setConfirm(null); onChanged() } catch (e) { setErr(e instanceof Error ? e.message : 'Could not send your response.'); setConfirm(null) } finally { setBusy(false) }
  }

  const sendCounter = handleSubmit(async (v) => {
    setErr('')
    try {
      await api.sendOffer(role, n.id, { fee: Number(v.fee), deliverables: v.deliverables, deadline: v.deadline || null, note: v.note || null })
      setCountering(false); onChanged()
    } catch (e) { setErr(applyServerErrors(e, setError)) }
  })

  return (
    <div className="rounded-tag border border-ink/15 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{n.campaign_title}</h3>
          <p className="text-sm text-muted">{role === 'brand' ? `Creator: ${n.creator_name}` : `Brand: ${n.brand_name}`}</p>
        </div>
        {n.status === 'open' ? <Badge tone={myTurn ? 'warn' : 'neutral'}>{myTurn ? 'Your turn' : `Waiting for ${counterpart}`}</Badge> : <Badge tone={statusTone(n.status)}>{n.status}</Badge>}
      </div>

      <div className="mt-4 rounded-lg bg-paper p-4">
        <p className="text-sm text-muted">{n.status === 'accepted' ? 'Agreed terms' : n.status === 'declined' ? 'Last offer' : 'Current offer'}, round {current.round} of {n.max_rounds}</p>
        <p className="font-display text-2xl font-bold">{formatMoney(current.fee, n.currency)}</p>
        <p className="mt-1">{current.deliverables}</p>
        {current.deadline && <p className="text-sm text-muted">Deadline {formatDate(current.deadline)}</p>}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-lagoon">Offer history ({n.offers.length})</summary>
        <ol className="mt-3 space-y-3 border-l-2 border-mist pl-4">
          {n.offers.map((o) => (
            <li key={o.id} className="text-sm">
              <p className="font-semibold">Round {o.round}: {who(o.by)} offered {formatMoney(o.fee, n.currency)}</p>
              <p className="text-muted">{o.deliverables}{o.deadline ? `. Deadline ${formatDate(o.deadline)}` : ''}</p>
              {o.note && <p className="italic text-muted">“{o.note}”</p>}
            </li>
          ))}
        </ol>
      </details>

      {err && <div className="mt-4"><Alert kind="error">{err}</Alert></div>}

      {myTurn && !countering && (
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="dark" onClick={() => setConfirm('accepted')}>Accept</Button>
          {!finalRound && <Button variant="outline" onClick={() => setCountering(true)}>Counter offer</Button>}
          <Button variant="ghost" onClick={() => setConfirm('declined')}>Decline</Button>
        </div>
      )}
      {myTurn && finalRound && <p className="mt-3 text-sm text-muted">This is the final round. You can accept or decline.</p>}
      {n.status === 'open' && !myTurn && <p className="mt-4 text-sm text-muted">{counterpart} will review your offer. You will see their reply here.</p>}
      {n.status === 'accepted' && <p className="mt-4 text-sm text-muted">Both sides agreed. Payment is arranged outside Relay for now, and Relay takes no commission from creators.</p>}

      {myTurn && countering && (
        <form noValidate onSubmit={sendCounter} className="mt-5 space-y-4 rounded-lg border border-ink/15 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your fee" error={errors.fee?.message}>{(p) => <input {...p} {...register('fee')} inputMode="decimal" className="input" />}</Field>
            <Field label="Deadline (optional)">{(p) => <input {...p} {...register('deadline')} type="date" className="input" />}</Field>
          </div>
          <Field label="Deliverables" error={errors.deliverables?.message}>{(p) => <textarea {...p} {...register('deliverables')} rows={2} className="input" />}</Field>
          <Field label="Note (optional)" error={errors.note?.message} hint="Explain your reasoning. Fair, specific offers settle faster.">{(p) => <input {...p} {...register('note')} className="input" />}</Field>
          <div className="flex gap-3">
            <Button type="submit" variant="dark" loading={isSubmitting}>Send counter offer</Button>
            <Button type="button" variant="ghost" onClick={() => setCountering(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <ConfirmDialog open={confirm !== null} busy={busy} danger={confirm === 'declined'} title={confirm === 'accepted' ? 'Accept these terms?' : 'Decline this offer?'} confirmLabel={confirm === 'accepted' ? 'Accept' : 'Decline'} onConfirm={() => void respond()} onCancel={() => setConfirm(null)}>
        {confirm === 'accepted' ? `You agree to ${formatMoney(current.fee, n.currency)} for: ${current.deliverables}` : 'This ends the negotiation. You cannot reopen it.'}
      </ConfirmDialog>
    </div>
  )
}
