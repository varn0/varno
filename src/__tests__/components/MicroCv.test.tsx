import { render, screen } from '@testing-library/react'
import { MicroCv } from '../../components/tech/MicroCv'

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

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
    const labels = screen.getAllByText(/^\d{4}/)
    expect(labels[0]).toHaveTextContent('2025–')
    expect(labels[labels.length - 1]).toHaveTextContent('2010–2013')
  })
})
