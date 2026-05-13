import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CvPage } from '../../components/tech/CvPage'

describe('CvPage', () => {
  it('renders the notes toggle button with default label', () => {
    render(<CvPage />)
    const button = screen.getByRole('button', { name: 'SHOW PERSONAL NOTES' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles button label and aria-pressed on click', async () => {
    const user = userEvent.setup()
    render(<CvPage />)
    const button = screen.getByRole('button', { name: 'SHOW PERSONAL NOTES' })

    await user.click(button)
    expect(button).toHaveTextContent('HIDE PERSONAL NOTES')
    expect(button).toHaveAttribute('aria-pressed', 'true')

    await user.click(button)
    expect(button).toHaveTextContent('SHOW PERSONAL NOTES')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('does not show notes column by default', () => {
    render(<CvPage />)
    expect(screen.queryByText('Why Hexagonal Architecture Saved the Pivot')).not.toBeInTheDocument()
  })

  it('shows note titles when toggle is clicked', async () => {
    const user = userEvent.setup()
    render(<CvPage />)

    await user.click(screen.getByRole('button', { name: 'SHOW PERSONAL NOTES' }))

    expect(screen.getAllByText(/Why Hexagonal Architecture Saved the Pivot/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/What I Learned About Long-Lived Infrastructure/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Applying SRE Principles/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Choosing the Right Storage Pattern/).length).toBeGreaterThan(0)
  })

  it('renders mobile notes view with role group labels when toggled', async () => {
    const user = userEvent.setup()
    render(<CvPage />)

    await user.click(screen.getByRole('button', { name: 'SHOW PERSONAL NOTES' }))

    const mobileNotesView = document.querySelector('.cv-notes-mobile')
    expect(mobileNotesView).toBeInTheDocument()

    const groupLabels = document.querySelectorAll('.cv-notes-group-label')
    expect(groupLabels.length).toBe(2)
    expect(groupLabels[0]).toHaveTextContent('SevenSoftware')
    expect(groupLabels[1]).toHaveTextContent('Topcon Mirage Technologies')
  })

  it('adds cv-page--notes-visible class when toggled', async () => {
    const user = userEvent.setup()
    render(<CvPage />)

    const page = document.querySelector('.cv-page')
    expect(page).not.toHaveClass('cv-page--notes-visible')

    await user.click(screen.getByRole('button', { name: 'SHOW PERSONAL NOTES' }))
    expect(page).toHaveClass('cv-page--notes-visible')
  })
})
