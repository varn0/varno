import { Link } from 'react-router-dom'

type DogEarProps = {
  to: string
  label: string
}

export function DogEar({ to, label }: DogEarProps) {
  return (
    <Link to={to} className="dogear" aria-label={label}>
      <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        {/* the page corner, curling up: crease (diagonal) + lifted flap */}
        <path className="dogear-flap" d="M14 40 Q 30 31 34 34 Q 31 30 40 14 Z" />
      </svg>
    </Link>
  )
}
