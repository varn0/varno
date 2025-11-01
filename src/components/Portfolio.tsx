import { useTheme } from '../hooks/useTheme'
import profilePicture from '../assets/profile.svg'

function Portfolio() {
  useTheme()

  return (
    <div className="portfolio">
      <div className="portfolio-content">
        <img 
          src={profilePicture} 
          alt="Profile" 
          className="profile-picture"
        />
        <h1 className="name">Your Name</h1>
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
    </div>
  )
}

export default Portfolio

