import { Link } from 'react-router-dom'
import { Alert, linkClass, useTitle } from '../components/ui'
import { brand } from '../config/brand'
import { faqs } from '../config/content'
import { FaqList } from './Home'

function Page({ title, children, draft }: { title: string; children: React.ReactNode; draft?: boolean }) {
  useTitle(title)
  return (
    <div className="container-page max-w-3xl py-12 sm:py-16">
      <h1 className="text-4xl font-bold">{title}</h1>
      {draft && <div className="mt-6"><Alert kind="error" title="Draft template, not legal advice">This text is a starting template. It must be reviewed by qualified legal counsel in each country where you operate before launch and does not mean the service complies with any law.</Alert></div>}
      <div className="mt-8 space-y-5 text-lg leading-relaxed [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc">{children}</div>
    </div>
  )
}

export const About = () => (
  <Page title="About us">
    <p>{brand.name} helps African brands find creators they can trust, and helps creators find real paid work.</p>
    <p>We are launching in Ghana, Nigeria and Kenya because the creator economy in each is growing and the process of finding and booking creators is still mostly informal. We aim to make it clearer for both sides.</p>
    <p>We are in early access. Everything on the creator directory is clearly labelled when it is sample data.</p>
    <Link to="/contact" className={linkClass('dark')}>Contact us</Link>
  </Page>
)

export const Faq = () => (
  <Page title="Frequently asked questions"><FaqList items={faqs} /></Page>
)

export const Contact = () => (
  <Page title="Contact">
    <p>Email <a className="font-semibold text-lagoon underline" href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a> or <a className="font-semibold text-lagoon underline" href={`https://wa.me/${brand.whatsappNumber}`} target="_blank" rel="noreferrer">message us on WhatsApp</a>.</p>
    <p>To ask for your data to be corrected or deleted, email us from the address you registered with.</p>
    <p>Have a campaign in mind? <Link className="font-semibold text-lagoon underline" to="/for-brands#enquire">Send a short brief</Link> instead.</p>
  </Page>
)

export const Privacy = () => (
  <Page title="Privacy notice" draft>
    <h2>What we collect</h2>
    <p>Brand briefs (name, work email, phone, business and campaign details) and creator applications (name, email, city, niche, social handles, optional audience figures and rates).</p>
    <h2>How we use it</h2>
    <ul><li>To respond to briefs and match brands with creators.</li><li>To review creator applications and run campaigns.</li></ul>
    <h2>What is public</h2>
    <p>Only approved creator profile details are public. Creator emails and phone numbers are never published.</p>
    <h2>Your choices</h2>
    <p>You can ask us to access, correct or delete your data. Retention periods and the legal basis for processing must be confirmed with counsel before launch.</p>
  </Page>
)

export const Terms = () => (
  <Page title="Terms" draft>
    <h2>Using the platform</h2>
    <p>Brands and creators must provide accurate information. Creator approval is at our discretion and does not guarantee work or earnings.</p>
    <h2>Creator terms</h2>
    <p>Creators are responsible for the content they produce and for following platform rules and advertising disclosure requirements.</p>
    <h2>Payments</h2>
    <p>This early version does not process payments. Any payment arrangements are agreed between the parties.</p>
    <h2>Liability</h2>
    <p>Liability, dispute and governing-law terms must be written and reviewed by counsel.</p>
  </Page>
)

export const NotFound = () => (
  <Page title="Page not found">
    <p>We could not find that page.</p>
    <Link to="/" className={linkClass('dark')}>Back to home</Link>
  </Page>
)
