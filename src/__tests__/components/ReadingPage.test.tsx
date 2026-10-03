import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('flips only one card at a time', async () => {
    const user = userEvent.setup()
    render(<ReadingPage />)
    const first = screen.getByRole('button', { name: reading[0].name })
    const second = screen.getByRole('button', { name: reading[1].name })

    await user.click(first)
    expect(first).toHaveAttribute('aria-pressed', 'true')
    expect(second).toHaveAttribute('aria-pressed', 'false')

    await user.click(second)
    expect(second).toHaveAttribute('aria-pressed', 'true')
    expect(first).toHaveAttribute('aria-pressed', 'false')
  })

  it('flips a card back when it is clicked again', async () => {
    const user = userEvent.setup()
    render(<ReadingPage />)
    const card = screen.getByRole('button', { name: reading[0].name })

    await user.click(card)
    expect(card).toHaveAttribute('aria-pressed', 'true')

    await user.click(card)
    expect(card).toHaveAttribute('aria-pressed', 'false')
  })
})
