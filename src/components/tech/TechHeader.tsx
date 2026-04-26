import { NavLink } from 'react-router-dom'
import { ThemeToggle } from '../shared/ThemeToggle'

export function TechHeader() {
  return (
    <header className="tech-header">
      <nav className="tech-nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/cv">CV</NavLink>
        <NavLink to="/blog">Blog</NavLink>
      </nav>
      <ThemeToggle />
    </header>
  )
}
