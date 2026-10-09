import { Link } from 'react-router-dom'

type DogEarProps = {
  to: string
  label: string
  /** When false, the dog-ear is faded out and removed from the tab order. */
  visible: boolean
}

export function DogEar({ to, label, visible }: DogEarProps) {
  return (
    <Link
      to={to}
      className={visible ? 'dogear' : 'dogear dogear--hidden'}
      aria-label={label}
    >
      <svg viewBox="0 0 56 56" aria-hidden="true" focusable="false">
        {/* folded bottom-right corner: filled underside flap + lift shadow */}
        <path className="dogear-flap" d="M56 10 L10 56 L10 10 Z" />
      </svg>
    </Link>
  )
}
