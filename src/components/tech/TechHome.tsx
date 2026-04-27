import { ProfileCard } from '../shared/ProfileCard'
import { TwoColumnSection, TwoColumnRow, TwoColumnSpacer } from '../shared/TwoColumnSection'
import { MicroCv } from './MicroCv'

const projects = [
  { name: 'cuco.studio', url: 'https://cuco.studio', description: 'Video creation platform with AI transcription and voice cloning.' },
  { name: 'devcli', url: 'https://github.com/varn0/devcli', description: 'Developer CLI tooling.' },
  { name: 'devflow', url: 'https://github.com/varn0/devflow', description: 'Development workflow automation.' },
]

export function TechHome() {
  return (
    <div className="tech-home">
      <ProfileCard />
      <TwoColumnSection>
        {projects.map(({ name, url, description }) => (
          <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="two-col-link">
            <TwoColumnRow label={name} bold>
              {description}
            </TwoColumnRow>
          </a>
        ))}
        <TwoColumnSpacer />
        <MicroCv />
      </TwoColumnSection>
    </div>
  )
}
