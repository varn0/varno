import { render, screen } from '@testing-library/react'
import { MicroCv } from '../../components/tech/MicroCv'

describe('MicroCv', () => {
  it('renders all 6 time periods', () => {
    render(<MicroCv />)
    expect(screen.getByText('2025–')).toBeInTheDocument()
    expect(screen.getByText('2022–2024')).toBeInTheDocument()
    expect(screen.getByText('2021')).toBeInTheDocument()
    expect(screen.getByText('2019–2021')).toBeInTheDocument()
    expect(screen.getByText('2013–2019')).toBeInTheDocument()
    expect(screen.getByText('2010–2013')).toBeInTheDocument()
  })

  it('renders icons with accessible alt text', () => {
    render(<MicroCv />)
    expect(screen.getByAltText('React')).toBeInTheDocument()
    expect(screen.getByAltText('FastAPI')).toBeInTheDocument()
  })

  it('renders most recent period first', () => {
    render(<MicroCv />)
    const years = screen.getAllByTestId('micro-cv-years')
    expect(years[0]).toHaveTextContent('2025–')
    expect(years[years.length - 1]).toHaveTextContent('2010–2013')
  })
})
