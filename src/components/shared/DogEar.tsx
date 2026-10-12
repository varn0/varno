import { useId } from 'react'
import { Link } from 'react-router-dom'

type DogEarProps = {
  to: string
  label: string
  /** When false, the dog-ear is faded out and removed from the tab order. */
  visible: boolean
}

export function DogEar({ to, label, visible }: DogEarProps) {
  // Unique per instance so two mounted dog-ears never share a gradient id.
  const gradientId = `dogear-curl-${useId()}`

  return (
    <Link
      to={to}
      className={visible ? 'dogear' : 'dogear dogear--hidden'}
      aria-label={label}
    >
      <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false">
        <defs>
          {/* Curl shading, drawn across the fold from the crease to the lifted
              tip: a shadow in the bend, the paper's base tone, then a light
              catch at the edge — the turn.js "soft page" look, held static. */}
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="33"
            y1="33"
            x2="10"
            y2="10"
          >
            <stop className="dogear-stop-crease" offset="0" />
            <stop className="dogear-stop-base" offset="0.5" />
            <stop className="dogear-stop-highlight" offset="1" />
          </linearGradient>
        </defs>
        {/* folded bottom-right corner: curled underside flap + lift shadow */}
        <path className="dogear-flap" fill={`url(#${gradientId})`} d="M56 10 L10 56 L10 10 Z" />
      </svg>
    </Link>
  )
}
