import LeadForm from '../components/LeadForm'
import { useTitle } from '../components/ui'
import { FaqList } from './Home'
import { faqs } from '../config/content'

const types = ['Product launches', 'Brand awareness', 'UGC production', 'Event promotion', 'Local business promotion', 'App or service promotion']

export default function ForBrands() {
  useTitle('For brands')
  return (
    <>
      <section className="bg-white">
        <div className="container-page py-14 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl">Stop guessing which creators will work for you.</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">Finding creators, agreeing rates, chasing content and reporting results takes hours. We handle the coordination so you can focus on the product.</p>
        </div>
      </section>
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold">How a campaign runs</h2>
              <ol className="mt-5 space-y-5">
                {[['Submit your brief', 'Use the form. It takes about five minutes.'], ['We shortlist creators', 'We match your goals and budget to approved creators.'], ['Negotiate and approve', 'Agree the fee, deliverables and deadline with each creator over a few rounds of offers and counter-offers.'], ['Content goes live', 'Creators deliver, you review the content, and we share the results we can measure.']].map(([t, d], i) => (
                  <li key={t} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sun font-display font-bold">{i + 1}</span><div><h3 className="font-semibold">{t}</h3><p className="text-muted">{d}</p></div></li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Campaigns we run</h2>
              <ul className="mt-4 flex flex-wrap gap-2">{types.map((t) => <li key={t} className="rounded-full border border-ink/25 bg-white px-4 py-1.5">{t}</li>)}</ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Pricing approach</h2>
              <p className="mt-3 text-muted">Creators set their starting rates and you negotiate the final terms with them in rounds. We charge brands a service fee that depends on campaign size and how much management you need, with a clear quote before any work begins. Creators are never charged a commission.</p>
            </div>
          </div>
          <div id="enquire" className="scroll-mt-24 rounded-tag border border-ink/15 bg-white p-6 sm:p-8 lg:self-start">
            <h2 className="mb-1 text-2xl font-bold">Start with a short brief</h2>
            <p className="mb-6 text-muted">Tell us what you want to achieve. We reply by email.</p>
            <LeadForm />
          </div>
        </div>
      </section>
      <section className="section bg-white"><div className="container-page max-w-3xl"><h2 className="mb-6 text-3xl font-bold">Common questions</h2><FaqList items={faqs} /></div></section>
    </>
  )
}
