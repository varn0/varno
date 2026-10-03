import type { KeyboardEvent } from 'react'
import type { ReadingEntry } from '../../data/reading'

type AuthorCardProps = ReadingEntry & {
  flipped: boolean
  onToggle: () => void
}

export function AuthorCard({ name, image, url, flipped, onToggle }: AuthorCardProps) {
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onToggle()
    }
  }

  return (
    <div
      className={`author-card${flipped ? ' is-flipped' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={name}
      onClick={onToggle}
      onKeyDown={handleKeyDown}
    >
      <div className="author-card-inner">
        <div className="author-card-face author-card-front">
          <img src={image} alt={name} loading="lazy" />
        </div>
        <div className="author-card-face author-card-back">
          <span className="author-card-name" aria-hidden={!flipped}>
            {name}
          </span>
          <a
            className="author-card-link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={flipped ? 0 : -1}
            aria-hidden={!flipped}
            onClick={(e) => e.stopPropagation()}
          >
            Read ↗
          </a>
        </div>
      </div>
    </div>
  )
}
