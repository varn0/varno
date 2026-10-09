import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { TechLayout } from '../../components/tech/TechLayout'

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route element={<TechLayout />}>
          <Route path="/" element={<div>home content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('TechLayout', () => {
  it('renders the forward dog-ear, hidden by default', () => {
    renderLayout()
    const link = screen.getByRole('link', {
      name: 'Reading — authors and books I love',
    })
    expect(link).toHaveAttribute('href', '/reading')
    // Not at bottom on mount → hidden.
    expect(link).toHaveClass('dogear--hidden')
  })

  it('renders a page-end sentinel as the last child of the layout', () => {
    const { container } = renderLayout()
    const layout = container.querySelector('.tech-layout')
    expect(layout?.lastElementChild).toHaveClass('page-end-sentinel')
  })
})
