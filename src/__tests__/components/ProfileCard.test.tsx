import { render, screen } from '@testing-library/react'
import { ProfileCard } from '../../components/shared/ProfileCard'

describe('ProfileCard', () => {
  it('gives the hero image explicit dimensions and high fetch priority', () => {
    render(<ProfileCard />)
    const img = screen.getByAltText('Alexis Janero Moliner')
    expect(img).toHaveAttribute('width', '130')
    expect(img).toHaveAttribute('height', '130')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })
})
