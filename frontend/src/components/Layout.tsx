import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { brand } from '../config/brand'
import { homeFor, useAuth } from '../auth/AuthContext'
import { captureSource } from '../lib/analytics'
import { useMockApi } from '../lib/api'
import { countryList } from '../config/countries'
import { useCountry } from '../lib/country'
import Flag from './Flags'
import { linkClass } from './ui'

function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-display text-xl font-bold ${light ? 'text-white' : 'text-ink'}`} aria-label={`${brand.name} home`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden><path fill="#D9C69A" d="M6 4h14l8 8v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /><circle cx="21" cy="9" r="2.2" fill="#123E43" /></svg>
      {brand.name}
    </Link>
  )
}

const nav = [
  { to: '/creators', label: 'Creators' },
  { to: '/for-brands', label: 'For brands' },
  { to: '/for-creators', label: 'For creators' },
  { to: '/about', label: 'About' },
]

/** Shows only the current country's flag; hover, focus or tap reveals the other countries. */
function CountrySwitch({ align = 'right' }: { align?: 'left' | 'right' }) {
  const { country, setCountry } = useCountry()
  const [open, setOpen] = useState(false)
  const others = countryList.filter((c) => c.code !== country.code)
  return (
    <div className="group relative" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false) }}>
      <button type="button" aria-haspopup="true" aria-expanded={open} aria-label={`Country: ${country.name}. Change country`} onClick={() => setOpen(!open)} className="flex h-9 w-10 items-center justify-center rounded-md hover:bg-mist">
        <Flag code={country.code} className="h-5 w-7 rounded-[3px] border border-ink/15" />
      </button>
      <ul className={`absolute top-full z-50 min-w-44 rounded-lg border border-ink/15 bg-white p-1 shadow-lg ${align === 'right' ? 'right-0' : 'left-0'} ${open ? 'block' : 'hidden group-focus-within:block group-hover:block'}`}>
        {others.map((c) => (
          <li key={c.code}>
            <button type="button" onClick={() => { setOpen(false); setCountry(c.code) }} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left font-medium hover:bg-mist">
              <Flag code={c.code} className="h-5 w-7 shrink-0 rounded-[3px] border border-ink/15" />{c.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])
  const items = nav.filter((n) => n.to !== '/creators' || user?.role === 'brand') // directory is for logged-in brands only
  const link = ({ isActive }: { isActive: boolean }) => `rounded-md px-3 py-2 font-medium ${isActive ? 'bg-mist' : 'hover:bg-mist'}`
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:rounded focus:bg-sun focus:px-3 focus:py-2">Skip to content</a>
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {items.map((n) => <NavLink key={n.to} to={n.to} className={link}>{n.label}</NavLink>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {!user && <CountrySwitch />}
          {user ? (
            <>
              <Link to={homeFor(user.role)} className={linkClass('outline')}>Dashboard</Link>
              <button onClick={() => void logout()} className="rounded-md px-3 py-2 font-medium hover:bg-mist">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 font-medium hover:bg-mist">Log in</Link>
              <Link to="/for-brands#enquire" className={linkClass('primary')}>Find creators</Link>
            </>
          )}
        </div>
        <button className="rounded-md p-2 hover:bg-mist md:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="container-page flex flex-col gap-1 border-t border-ink/10 pb-4 pt-2 md:hidden">
          {items.map((n) => <NavLink key={n.to} to={n.to} className={link}>{n.label}</NavLink>)}
          {!user && <div className="px-3 py-1"><CountrySwitch align="left" /></div>}
          {user ? (
            <>
              <Link to={homeFor(user.role)} className="rounded-md px-3 py-2 font-medium hover:bg-mist">Dashboard</Link>
              <button onClick={() => void logout()} className="rounded-md px-3 py-2 text-left font-medium hover:bg-mist">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-2 font-medium hover:bg-mist">Log in</Link>
              <Link to="/for-brands#enquire" className={linkClass('primary', 'mt-2')}>Find creators</Link>
            </>
          )}
        </nav>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="on-dark mt-auto bg-ink text-white/80">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo light />
          <p className="max-w-xs text-sm">Find the right creators, launch campaigns faster, and manage collaborations in one place.</p>
        </div>
        <FooterCol title="For brands" links={[['Start a campaign', '/for-brands#enquire'], ['How it works', '/for-brands'], ['Brand login', '/login']]} />
        <FooterCol title="For creators" links={[['Join the network', '/for-creators'], ['Log in', '/login'], ['FAQ', '/faq']]} />
        <div>
          <h2 className="mb-3 font-display text-base font-semibold text-white">Contact</h2>
          <ul className="space-y-2 text-sm">
            <li><a className="underline-offset-2 hover:underline" href={`mailto:${brand.contactEmail}`}>{brand.contactEmail}</a></li>
            {/*<li><a className="underline-offset-2 hover:underline" href={`https://wa.me/${brand.whatsappNumber}`} target="_blank" rel="noreferrer">Message on WhatsApp</a></li>*/}
            <li><Link className="underline-offset-2 hover:underline" to="/privacy">Privacy policy</Link></li>
            <li><Link className="underline-offset-2 hover:underline" to="/terms">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">© {new Date().getFullYear()} {brand.name} - Launching Soon.</div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h2 className="mb-3 font-display text-base font-semibold text-white">{title}</h2>
      <ul className="space-y-2 text-sm">{links.map(([l, to]) => <li key={to}><Link className="underline-offset-2 hover:underline" to={to}>{l}</Link></li>)}</ul>
    </div>
  )
}

export default function Layout() {
  const { pathname, hash } = useLocation()
  useEffect(captureSource, [])
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 0)
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return (
    <div className="flex min-h-screen flex-col">
      {useMockApi && <p className="bg-sun px-4 py-1.5 text-center text-sm font-medium text-ink">Demo mode: all data on this site is sample data and nothing is saved to a server.</p>}
      <Header />
      <main id="main" className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  )
}
