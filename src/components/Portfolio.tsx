import { useTheme } from '../hooks/useTheme'
import profilePicture from '../assets/profile.svg'
import { 
  RiLightbulbLine,
  RiTwitterXLine,
  RiTwitterXFill,
  RiLinkedinBoxLine,
  RiLinkedinBoxFill,
  RiMediumLine,
  RiMediumFill,
  RiGithubLine,
  RiGithubFill
} from '@remixicon/react'

function Portfolio() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="portfolio">
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        <RiLightbulbLine size={24} />
      </button>
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
            href="https://x.com/ajanerom" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
            aria-label="X (Twitter)"
          >
            {theme === 'dark' ? (
              <RiTwitterXLine size={24} />
            ) : (
              <RiTwitterXFill size={24} />
            )}
          </a>
          <a 
            href="https://www.linkedin.com/in/ajanerom-devops" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
            aria-label="LinkedIn"
          >
            {theme === 'dark' ? (
              <RiLinkedinBoxLine size={24} />
            ) : (
              <RiLinkedinBoxFill size={24} />
            )}
          </a>
          <a 
            href="https://ajanerom.medium.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
            aria-label="Medium"
          >
            {theme === 'dark' ? (
              <RiMediumLine size={24} />
            ) : (
              <RiMediumFill size={24} />
            )}
          </a>
          <a 
            href="https://github.com/varn0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-link"
            aria-label="GitHub"
          >
            {theme === 'dark' ? (
              <RiGithubLine size={24} />
            ) : (
              <RiGithubFill size={24} />
            )}
          </a>
        </div>
      </div>

    </div>
  )
}

export default Portfolio

