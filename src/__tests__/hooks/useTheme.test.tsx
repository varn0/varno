import { render, screen, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../../hooks/useTheme'

function Probe() {
  const { theme, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>theme:{theme}</button>
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('applies the initial theme to <html> and shares one state across consumers', () => {
    render(
      <ThemeProvider>
        <Probe />
        <Probe />
      </ThemeProvider>,
    )
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(screen.getAllByText('theme:light')).toHaveLength(2)
  })

  it('toggles all consumers and writes data-theme + localStorage', () => {
    render(
      <ThemeProvider>
        <Probe />
        <Probe />
      </ThemeProvider>,
    )
    act(() => { screen.getAllByRole('button')[0].click() })
    expect(screen.getAllByText('theme:dark')).toHaveLength(2)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })
})
