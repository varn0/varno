import { useState, type KeyboardEvent } from 'react'
import type { ReadingEntry } from '../../data/reading'

export function AuthorCard({ name, image, url }: ReadingEntry) {
  const [flipped, setFlipped] = useState(false)

  function toggle() {
    setFlipped((f) => !f)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <div
      className={`author-card${flipped ? ' is-flipped' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={name}
      onClick={toggle}
      onKeyDown={handleKeyDown}
    >
      <div className="author-card-inner">
        <div className="author-card-face author-card-front">
          <img src={image} alt={name} loading="lazy" />
        </div>
        <div className="author-card-face author-card-back">
          <span className="author-card-name">{name}</span>
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
