import { reading } from '../../data/reading'
import { AuthorCard } from './AuthorCard'

export function ReadingPage() {
  return (
    <div className="reading-page">
      <div className="reading-grid">
        {reading.map((entry) => (
          <AuthorCard key={entry.image} {...entry} />
        ))}
      </div>
    </div>
  )
}
