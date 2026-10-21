import type { CountryCode } from '../config/countries'

function star(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner
    const a = (Math.PI / 5) * i - Math.PI / 2
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
}

/** Simple inline SVG flags (emoji flags do not render on Windows). */
export default function Flag({ code, className = '' }: { code: CountryCode; className?: string }) {
  const props = { viewBox: '0 0 30 20', className, 'aria-hidden': true, focusable: false } as const
  if (code === 'GH') {
    return (
      <svg {...props}><rect width="30" height="6.67" fill="#CE1126" /><rect y="6.67" width="30" height="6.67" fill="#FCD116" /><rect y="13.33" width="30" height="6.67" fill="#006B3F" /><polygon points={star(15, 10, 3.4, 1.4)} fill="#000" /></svg>
    )
  }
  if (code === 'NG') {
    return (
      <svg {...props}><rect width="10" height="20" fill="#008751" /><rect x="10" width="10" height="20" fill="#fff" /><rect x="20" width="10" height="20" fill="#008751" /></svg>
    )
  }
  return (
    <svg {...props}>
      <rect width="30" height="5.6" fill="#000" /><rect y="5.6" width="30" height="0.9" fill="#fff" /><rect y="6.5" width="30" height="7" fill="#BB0000" />
      <rect y="13.5" width="30" height="0.9" fill="#fff" /><rect y="14.4" width="30" height="5.6" fill="#006600" />
      <ellipse cx="15" cy="10" rx="2.6" ry="4.4" fill="#BB0000" stroke="#fff" strokeWidth="0.7" /><line x1="15" y1="5.8" x2="15" y2="14.2" stroke="#fff" strokeWidth="0.6" />
    </svg>
  )
}
