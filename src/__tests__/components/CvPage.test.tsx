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
})
