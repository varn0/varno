import { render, screen } from '@testing-library/react'
import { ProfileCard } from '../../components/shared/ProfileCard'
import { ThemeProvider } from '../../hooks/useTheme'

describe('ProfileCard', () => {
  it('gives the hero image explicit dimensions and high fetch priority', () => {
    render(<ThemeProvider><ProfileCard /></ThemeProvider>)
    const img = screen.getByAltText('Alexis Janero Moliner')
    expect(img).toHaveAttribute('width', '130')
    expect(img).toHaveAttribute('height', '130')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })
})
