import { Link } from 'react-router-dom'

type DogEarProps = {
  to: string
  label: string
}

export function DogEar({ to, label }: DogEarProps) {
  return <Link to={to} className="dogear" aria-label={label} />
}
