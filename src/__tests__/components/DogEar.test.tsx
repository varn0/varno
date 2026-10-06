import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DogEar } from '../../components/shared/DogEar'

describe('DogEar', () => {
  it('renders an accessible link to the given destination', () => {
    render(
      <MemoryRouter>
        <DogEar to="/reading" label="Open the reading page" visible />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: 'Open the reading page' })
    expect(link).toHaveAttribute('href', '/reading')
    expect(link).toHaveClass('dogear')
  })

  it('is not hidden when visible', () => {
    render(
      <MemoryRouter>
        <DogEar to="/reading" label="Open the reading page" visible />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link')).not.toHaveClass('dogear--hidden')
  })

  it('has the hidden class when not visible', () => {
    render(
      <MemoryRouter>
        <DogEar to="/reading" label="Open the reading page" visible={false} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link')).toHaveClass('dogear--hidden')
  })
})
