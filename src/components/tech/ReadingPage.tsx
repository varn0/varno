import { useState } from 'react'
import { reading } from '../../data/reading'
import { AuthorCard } from './AuthorCard'
import { DogEar } from '../shared/DogEar'
import { useAtBottom } from '../../hooks/useAtBottom'

export function ReadingPage() {
  const [flippedKey, setFlippedKey] = useState<string | null>(null)
  const { ref, atBottom } = useAtBottom()

  return (
    <div className="reading-page">
      <div className="reading-grid">
        {reading.map((entry) => (
          <AuthorCard
            key={entry.image}
            {...entry}
            flipped={flippedKey === entry.image}
            onToggle={() =>
              setFlippedKey((current) =>
                current === entry.image ? null : entry.image,
              )
            }
          />
        ))}
      </div>
      <DogEar to="/" label="Back to the main page" visible={atBottom} />
      {/* Marks the page's end; must be the last child. */}
      <div ref={ref} className="page-end-sentinel" aria-hidden="true" />
    </div>
  )
}
