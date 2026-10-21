import type { UseFormRegisterReturn } from 'react-hook-form'
import { industries } from '../config/brand'

/** Tick any number of industries, or write your own (comma separated) if yours is not listed. */
export default function IndustryPicker({ picked, other, error }: { picked: UseFormRegisterReturn; other: UseFormRegisterReturn; error?: string }) {
  return (
    <fieldset aria-describedby={error ? 'ind-err' : undefined}>
      <legend className="mb-1.5 text-sm font-semibold">Industries you want to work with</legend>
      <div className="flex flex-wrap gap-2">
        {industries.filter((i) => i !== 'Other').map((i) => (
          <label key={i} className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink/25 bg-white px-3 py-1.5 text-sm has-[:checked]:border-lagoon has-[:checked]:bg-mist">
            <input type="checkbox" value={i} {...picked} className="h-4 w-4 accent-lagoon" />{i}
          </label>
        ))}
      </div>
      <label htmlFor="other-industries" className="mb-1.5 mt-4 block text-sm font-semibold">Not listed? Write your own</label>
      <input id="other-industries" {...other} className="input" placeholder="For example agriculture, fintech" />
      <p className="mt-1 text-sm text-muted">Separate several with commas.</p>
      {error && <p id="ind-err" role="alert" className="mt-1 text-sm font-medium text-hibiscus">{error}</p>}
    </fieldset>
  )
}
