import { timelineEntries } from '../../data/micro-cv'
import type { TimelineIcon } from '../../data/micro-cv'
import { useTheme } from '../../hooks/useTheme'

function TechIconThemed(props: TimelineIcon) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // For CDN icons, swap to darkHex in dark mode for better contrast
  const effectiveHex = isDark && props.darkHex ? props.darkHex : props.hex
  const iconSrc = props.src || `https://cdn.simpleicons.org/${props.slug}/${effectiveHex || '000000'}`

  return (
    <span className="micro-cv-icon" title={props.label}>
      <img src={iconSrc} alt={props.label} width={20} height={20} />
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
              <TechIconThemed key={icon.slug} {...icon} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
