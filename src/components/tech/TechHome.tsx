import profilePicture from '../../assets/profile-picture.jpeg'
import { MicroCv } from './MicroCv'

const socials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ajanerom-devops' },
  { label: 'GitHub', href: 'https://github.com/varn0' },
  { label: 'Medium', href: 'https://ajanerom.medium.com' },
  { label: 'X', href: 'https://x.com/ajanerom' },
]

const projects = [
  {
    name: 'CucoStudio',
    url: 'https://cuco.studio',
    description: 'Video creation platform with AI transcription and voice cloning.',
  },
  {
    name: 'devcli',
    url: 'https://github.com/varn0/devcli',
    description: 'Developer CLI tooling.',
  },
  {
    name: 'devflow',
    url: 'https://github.com/varn0/devflow',
    description: 'Development workflow automation.',
  },
]

export function TechHome() {
  return (
    <div className="tech-home">
      <div className="profile-section">
        <img
          src={profilePicture}
          alt="Alexis Janero Moliner"
          className="profile-picture"
        />
        <div className="profile-info">
          <h1 className="profile-name">Alexis Janero Moliner</h1>
          <div className="profile-meta">
            <span className="profile-role">Engineer</span>
            <span className="profile-socials">
              {socials.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-social-link"
                >
                  {label.toLowerCase()}
                </a>
              ))}
            </span>
          </div>
        </div>
      </div>

      <section className="home-section">
        <h2 className="home-section-title">Projects</h2>
        <div className="projects-list">
          {projects.map(({ name, url, description }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-card"
            >
              <span className="project-name">{name}</span>
              <span className="project-description">{description}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h2 className="home-section-title">Experience</h2>
        <MicroCv />
      </section>
    </div>
  )
}
