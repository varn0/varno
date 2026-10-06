import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ReadingPage } from '../../components/tech/ReadingPage'
import { reading } from '../../data/reading'

function renderPage() {
  return render(
    <MemoryRouter>
      <ReadingPage />
    </MemoryRouter>,
  )
}

describe('ReadingPage', () => {
  it('renders one card per reading entry', () => {
    renderPage()
    expect(screen.getAllByRole('button')).toHaveLength(reading.length)
  })

  it('renders a card for a known author', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Jane Austen' })).toBeInTheDocument()
  })

  it('renders a dog-ear link back to the main page', () => {
    renderPage()
    const back = screen.getByRole('link', { name: 'Back to the main page' })
    expect(back).toHaveAttribute('href', '/')
  })

  it('renders a page-end sentinel as the last child of the page', () => {
    const { container } = renderPage()
    const page = container.querySelector('.reading-page')
    expect(page?.lastElementChild).toHaveClass('page-end-sentinel')
  })

  it('flips only one card at a time', async () => {
    const user = userEvent.setup()
    renderPage()
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
    renderPage()
    const card = screen.getByRole('button', { name: reading[0].name })

    await user.click(card)
    expect(card).toHaveAttribute('aria-pressed', 'true')

    await user.click(card)
    expect(card).toHaveAttribute('aria-pressed', 'false')
  })
})
