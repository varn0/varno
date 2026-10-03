import { Outlet, Link } from 'react-router-dom'
import { TechHeader } from './TechHeader'

export function TechLayout() {
  return (
    <div className="tech-layout">
      <TechHeader />
      <main className="tech-main">
        <Outlet />
      </main>
      <footer className="tech-footer">
        <Link to="/reading" className="tech-footer-link" aria-label="reading">
          ✦
        </Link>
      </footer>
    </div>
  )
}
