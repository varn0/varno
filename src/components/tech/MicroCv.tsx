import { timelineEntries } from '../../data/micro-cv'
import type { TimelineIcon } from '../../data/micro-cv'

function TechIcon({ slug, label, hex }: TimelineIcon) {
  const iconSrc = `https://cdn.simpleicons.org/${slug}/${hex || '000000'}`

  return (
    <span className="micro-cv-icon" title={label}>
      <img src={iconSrc} alt={label} width={20} height={20} />
    </span>
  )
}

export function MicroCv() {
  return (
    <div className="micro-cv">
      {timelineEntries.map((entry) => (
        <div key={entry.label} className="micro-cv-entry">
          <span className="micro-cv-years" data-testid="micro-cv-years">
            {entry.label}
          </span>
          <div className="micro-cv-icons">
            {entry.icons.map((icon) => (
              <TechIcon key={icon.slug} {...icon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
