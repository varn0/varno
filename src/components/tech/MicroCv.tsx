import { timelineEntries } from '../../data/micro-cv'
import type { TimelineIcon } from '../../data/micro-cv'
import { useTheme } from '../../hooks/useTheme'
import { TwoColumnRow } from '../shared/TwoColumnSection'

function TechIconThemed(props: TimelineIcon) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const effectiveHex = isDark && props.darkHex ? props.darkHex : props.hex
  const iconSrc = props.src || `https://cdn.simpleicons.org/${props.slug}/${effectiveHex || '000000'}`

  const className = props.wide ? 'micro-cv-icon micro-cv-icon--wide' : 'micro-cv-icon'

  return (
    <span className={className} title={props.label}>
      <img src={iconSrc} alt={props.label} width={props.wide ? 36 : 20} height={20} />
    </span>
  )
}

export function MicroCv() {
  return (
    <>
      {timelineEntries.map((entry) => (
        <TwoColumnRow key={entry.label} label={entry.label} muted>
          <div className="micro-cv-icons">
            {entry.icons.map((icon) => (
              <TechIconThemed key={icon.slug} {...icon} />
            ))}
          </div>
        </TwoColumnRow>
      ))}
    </>
  )
}
