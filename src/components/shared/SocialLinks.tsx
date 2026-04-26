import { useTheme } from '../../hooks/useTheme'
import {
  RiTwitterXLine,
  RiTwitterXFill,
  RiLinkedinBoxLine,
  RiLinkedinBoxFill,
  RiMediumLine,
  RiMediumFill,
  RiGithubLine,
  RiGithubFill,
} from '@remixicon/react'

interface SocialItem {
  href: string
  label: string
  LineIcon: typeof RiTwitterXLine
  FillIcon: typeof RiTwitterXFill
}

const socials: SocialItem[] = [
  {
    href: 'https://x.com/ajanerom',
    label: 'X (Twitter)',
    LineIcon: RiTwitterXLine,
    FillIcon: RiTwitterXFill,
  },
  {
    href: 'https://www.linkedin.com/in/ajanerom-devops',
    label: 'LinkedIn',
    LineIcon: RiLinkedinBoxLine,
    FillIcon: RiLinkedinBoxFill,
  },
  {
    href: 'https://ajanerom.medium.com',
    label: 'Medium',
    LineIcon: RiMediumLine,
    FillIcon: RiMediumFill,
  },
  {
    href: 'https://github.com/varn0',
    label: 'GitHub',
    LineIcon: RiGithubLine,
    FillIcon: RiGithubFill,
  },
]

export function SocialLinks() {
  const { theme } = useTheme()

  return (
    <div className="social-links">
      {socials.map(({ href, label, LineIcon, FillIcon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-link"
          aria-label={label}
        >
          {theme === 'dark' ? <LineIcon size={24} /> : <FillIcon size={24} />}
        </a>
      ))}
    </div>
  )
}
