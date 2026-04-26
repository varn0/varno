import { Outlet } from 'react-router-dom'
import { TechHeader } from './TechHeader'

export function TechLayout() {
  return (
    <div className="tech-layout">
      <TechHeader />
      <main className="tech-main">
        <Outlet />
      </main>
    </div>
  )
}
