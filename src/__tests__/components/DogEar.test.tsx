import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DogEar } from '../../components/shared/DogEar'

describe('DogEar', () => {
  it('renders an accessible link to the given destination', () => {
    render(
      <MemoryRouter>
        <DogEar to="/reading" label="Open the reading page" />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: 'Open the reading page' })
    expect(link).toHaveAttribute('href', '/reading')
    expect(link).toHaveClass('dogear')
  })
})
