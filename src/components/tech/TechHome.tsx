import profilePicture from '../../assets/profile-picture.jpeg'
import { SocialLinks } from '../shared/SocialLinks'
import { MicroCv } from './MicroCv'

const projects = [
  { name: 'cuco.studio', url: 'https://cuco.studio', description: 'Video creation platform with AI transcription and voice cloning.' },
  { name: 'devcli', url: 'https://github.com/varn0/devcli', description: 'Developer CLI tooling.' },
  { name: 'devflow', url: 'https://github.com/varn0/devflow', description: 'Development workflow automation.' },
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
        <h1 className="profile-name">Alexis Janero Moliner</h1>
        <SocialLinks />
      </div>

      <div className="projects-list">
        {projects.map(({ name, url, description }) => (
          <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="project-row">
            <span className="project-name">{name}</span>
            <span className="project-description">{description}</span>
          </a>
        ))}
      </div>

      <MicroCv />
    </div>
  )
}
