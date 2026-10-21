import { Link } from 'react-router-dom'
import { Alert, linkClass, useTitle } from '../components/ui'

export default function ForCreators() {
  useTitle('For creators')
  return (
    <>
      <section className="on-dark bg-lagoon text-white">
        <div className="container-page py-14 sm:py-20">
          <h1 className="max-w-3xl text-4xl font-bold sm:text-5xl">Brands are looking for creators like you.</h1>
          <p className="mt-5 max-w-2xl text-lg text-white">Create a profile, get reviewed, and be considered for paid campaigns with clear briefs and honest terms.</p>
          <Link to="/register/creator" className={linkClass('primary', 'mt-8 px-6 py-3 text-lg')}>Join as a Creator</Link>
        </div>
      </section>
      <section className="section">
        <div className="container-page grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">How joining works</h2>
            <ol className="mt-5 space-y-5">
              {[['Apply', 'Create an account and tell us about your niche, city and channels.'], ['Review', 'Our team checks your profile. This can take a few days.'], ['Go live', 'Approved creators get a public profile that brands can browse.'], ['Negotiate offers', 'When a campaign fits, you get an offer. Accept, counter or decline until the fee and deliverables are fair.']].map(([t, d], i) => (
                <li key={t} className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sun font-display font-bold">{i + 1}</span><div><h3 className="font-semibold">{t}</h3><p className="text-muted">{d}</p></div></li>
              ))}
            </ol>
          </div>
          <div className="space-y-6">
            <div><h2 className="text-2xl font-bold">What we ask for</h2><p className="mt-3 text-muted">Your display name, city, niche, at least one social handle, and a short bio. Follower numbers and rates are optional but help brands choose you.</p></div>
            <div><h2 className="text-2xl font-bold">Deliverables and payment</h2><p className="mt-3 text-muted">Each offer states the fee, deliverables and deadline. You can accept, counter or decline over several rounds until the terms are fair to you. In this early version, payment is arranged directly and recorded by our team. Mobile Money options are planned.</p></div>
            <Alert title="Please note">Relay takes no commission and charges creators no fees. Approval is not guaranteed and we cannot promise work or earnings. Your email and phone number are never shown publicly.</Alert>
            <Link to="/register/creator" className={linkClass('dark')}>Start your application</Link>
          </div>
        </div>
      </section>
    </>
  )
}
