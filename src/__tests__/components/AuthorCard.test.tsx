import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthorCard } from '../../components/tech/AuthorCard'

const props = {
  name: 'Jane Austen',
  image: '/authors/jane-austen.jpg',
  url: 'https://en.wikipedia.org/wiki/Jane_Austen',
}

describe('AuthorCard', () => {
  it('renders the front image and starts unflipped with the link hidden', () => {
    render(<AuthorCard {...props} />)
    const card = screen.getByRole('button', { name: 'Jane Austen' })
    expect(card).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByAltText('Jane Austen')).toBeInTheDocument()
    // link is aria-hidden while unflipped, so it is absent from the a11y tree
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('flips on click and exposes the external link with correct attributes', async () => {
    const user = userEvent.setup()
    render(<AuthorCard {...props} />)
    const card = screen.getByRole('button', { name: 'Jane Austen' })

    await user.click(card)

    expect(card).toHaveAttribute('aria-pressed', 'true')
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', props.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('flips with the keyboard (Enter)', async () => {
    const user = userEvent.setup()
    render(<AuthorCard {...props} />)
    const card = screen.getByRole('button', { name: 'Jane Austen' })
    card.focus()
    await user.keyboard('{Enter}')
    expect(card).toHaveAttribute('aria-pressed', 'true')
  })

  it('clicking the link does not flip the card back (stopPropagation)', async () => {
    const user = userEvent.setup()
    render(<AuthorCard {...props} />)
    const card = screen.getByRole('button', { name: 'Jane Austen' })
    await user.click(card)
    const link = screen.getByRole('link')
    await user.click(link)
    expect(card).toHaveAttribute('aria-pressed', 'true')
  })
})
