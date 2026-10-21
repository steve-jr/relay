import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { formatCount, formatMoney } from '../lib/format'
import type { CreatorPublic } from '../lib/types'
import { useAuth } from '../auth/AuthContext'
import { Avatar, Badge, linkClass } from './ui'

const label: Record<string, string> = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube', facebook: 'Facebook' }

export default function CreatorCard({ creator: c }: { creator: CreatorPublic }) {
  const { user } = useAuth()
  const isBrand = user?.role === 'brand'
  return (
    <article className="rate-tag">
      <div className="space-y-4 p-5 pr-10">
        <div className="flex items-center gap-3">
          <Avatar name={c.display_name} src={c.profile_image_url} />
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold leading-tight">{c.display_name}</h3>
            <p className="flex items-center gap-1 text-sm text-muted"><MapPin className="h-3.5 w-3.5" aria-hidden />{c.city}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{c.primary_niche}</Badge>
          {c.is_demo && <Badge tone="demo">Sample profile</Badge>}
        </div>
        {c.socials.length > 0 && (
          <ul className="space-y-1 text-sm">
            {c.socials.map((s) => (
              <li key={s.platform} className="flex justify-between gap-4">
                <span>{label[s.platform]}</span>
                <span className="font-semibold">{formatCount(s.followers)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="rate-tag-foot">
        <div>
          <p className="text-xs text-muted">Starting rate</p>
          <p className="font-display text-xl font-bold">{formatMoney(c.starting_rate, c.currency)}</p>
        </div>
        {!isBrand ? (
          <Link to="/login" state={{ from: `/creators/${c.slug}` }} className={linkClass('dark', '!px-3 !py-1.5 text-sm')}>Brands: log in to view<span className="sr-only"> {c.display_name}</span></Link>
        ) : (
        <div className="flex gap-2">
          <Link to={`/creators/${c.slug}`} className={linkClass('outline', '!px-3 !py-1.5 text-sm')}>View profile<span className="sr-only"> for {c.display_name}</span></Link>
          <Link to={`/creators/${c.slug}#enquire`} className={linkClass('dark', '!px-3 !py-1.5 text-sm')}>Request<span className="sr-only"> collaboration with {c.display_name}</span></Link>
        </div>
        )}
      </div>
    </article>
  )
}
