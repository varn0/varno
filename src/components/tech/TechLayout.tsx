import { Outlet } from 'react-router-dom'
import { TechHeader } from './TechHeader'
import { DogEar } from '../shared/DogEar'
import { useAtBottom } from '../../hooks/useAtBottom'

export function TechLayout() {
  const { ref, atBottom } = useAtBottom()

  return (
    <div className="tech-layout">
      <TechHeader />
      <main className="tech-main">
        <Outlet />
      </main>
      <DogEar
        to="/reading"
        label="Reading — authors and books I love"
        visible={atBottom}
      />
      {/* Marks the page's end; must be the last child. */}
      <div ref={ref} className="page-end-sentinel" aria-hidden="true" />
    </div>
  )
}
