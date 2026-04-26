import { useTheme } from '../../hooks/useTheme'
import { RiLightbulbLine } from '@remixicon/react'

export function ThemeToggle() {
  const { toggleTheme } = useTheme()

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      <RiLightbulbLine size={20} />
    </button>
  )
}
