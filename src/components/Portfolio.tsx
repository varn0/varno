import { useTheme } from '../hooks/useTheme'
import profilePicture from '../assets/profile.svg'

function Portfolio() {
  useTheme()

  return (
    <div className="portfolio">
      <div className="portfolio-content">
        <div className="profile-section">
          <img 
            src={profilePicture} 
            alt="Profile" 
            className="profile-picture"
          />
          <h1 className="name">Your Name</h1>
        </div>
        <div className="social-links">
          <a 
            href="https://x.com/yourusername" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            X
          </a>
          <a 
            href="https://linkedin.com/in/yourusername" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            LinkedIn
          </a>
          <a 
            href="https://medium.com/@yourusername" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            Medium
          </a>
          <a 
            href="https://github.com/yourusername" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="geometric-decoration">
        <svg width="200" height="200" viewBox="0 0 200 200" className="geometric-svg">
          <line 
            x1="200" y1="200" x2="200" y2="50" 
            stroke="var(--border-color)" 
            strokeWidth="2"
            className="thick-segment"
          />
          <line 
            x1="200" y1="50" x2="50" y2="200" 
            stroke="var(--border-color)" 
            strokeWidth="1"
          />
          <line 
            x1="50" y1="200" x2="200" y2="200" 
            stroke="var(--border-color)" 
            strokeWidth="1"
          />
          <polygon 
            points="170,170 170,100 100,170" 
            fill="none" 
            stroke="var(--border-color)" 
            strokeWidth="1"
            className="triangle-small"
          />
        </svg>
      </div>
    </div>
  )
}

export default Portfolio

