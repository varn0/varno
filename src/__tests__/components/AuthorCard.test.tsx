import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthorCard } from '../../components/tech/AuthorCard'

const base = {
  name: 'Jane Austen',
  image: '/authors/jane-austen.jpg',
  url: 'https://en.wikipedia.org/wiki/Jane_Austen',
}

describe('AuthorCard', () => {
  it('shows the front image and hides the link when not flipped', () => {
    render(<AuthorCard {...base} flipped={false} onToggle={() => {}} />)
    const card = screen.getByRole('button', { name: 'Jane Austen' })
    expect(card).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByAltText('Jane Austen')).toBeInTheDocument()
    // link is aria-hidden while unflipped, so it is absent from the a11y tree
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('exposes the external link with correct attributes when flipped', () => {
    render(<AuthorCard {...base} flipped={true} onToggle={() => {}} />)
    const card = screen.getByRole('button', { name: 'Jane Austen' })
    expect(card).toHaveAttribute('aria-pressed', 'true')
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', base.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('calls onToggle when the card is clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<AuthorCard {...base} flipped={false} onToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: 'Jane Austen' }))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('calls onToggle when Enter is pressed', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<AuthorCard {...base} flipped={false} onToggle={onToggle} />)
    screen.getByRole('button', { name: 'Jane Austen' }).focus()
    await user.keyboard('{Enter}')
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('does not call onToggle when the link itself is clicked (stopPropagation)', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<AuthorCard {...base} flipped={true} onToggle={onToggle} />)
    await user.click(screen.getByRole('link'))
    expect(onToggle).not.toHaveBeenCalled()
  })
})
