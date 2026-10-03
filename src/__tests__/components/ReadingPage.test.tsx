import { render, screen } from '@testing-library/react'
import { ReadingPage } from '../../components/tech/ReadingPage'
import { reading } from '../../data/reading'

describe('ReadingPage', () => {
  it('renders one card per reading entry', () => {
    render(<ReadingPage />)
    expect(screen.getAllByRole('button')).toHaveLength(reading.length)
  })

  it('renders a card for a known author', () => {
    render(<ReadingPage />)
    expect(screen.getByRole('button', { name: 'Jane Austen' })).toBeInTheDocument()
  })
})
