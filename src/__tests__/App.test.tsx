import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../hooks/useTheme'
import App from '../App'

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('App routing with lazy routes', () => {
  it('resolves a deep-link to a nested lazy route under TechLayout', async () => {
    renderAt('/blog')
    // TechLayout chrome (forward dog-ear) stays mounted during the lazy load.
    expect(
      screen.getByRole('link', { name: 'Reading — authors and books I love' }),
    ).toBeInTheDocument()
    await waitFor(() => expect(document.querySelector('.blog-page')).toBeInTheDocument())
  })

  it('resolves a deep-link to the top-level lazy /reading route', async () => {
    renderAt('/reading')
    await waitFor(() => expect(document.querySelector('.reading-page')).toBeInTheDocument())
  })
})
