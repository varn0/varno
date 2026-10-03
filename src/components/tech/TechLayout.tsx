import { Outlet } from 'react-router-dom'
import { TechHeader } from './TechHeader'
import { DogEar } from '../shared/DogEar'

export function TechLayout() {
  return (
    <div className="tech-layout">
      <TechHeader />
      <main className="tech-main">
        <Outlet />
      </main>
      <DogEar to="/reading" label="Reading — authors and books I love" />
    </div>
  )
}
