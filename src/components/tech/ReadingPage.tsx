import { useState } from 'react'
import { reading } from '../../data/reading'
import { AuthorCard } from './AuthorCard'

export function ReadingPage() {
  const [flippedKey, setFlippedKey] = useState<string | null>(null)

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
    </div>
  )
}
