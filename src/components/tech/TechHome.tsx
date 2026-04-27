import profilePicture from '../../assets/profile-picture.jpeg'
import { SocialLinks } from '../shared/SocialLinks'
import { MicroCv } from './MicroCv'

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
      </div>
      <MicroCv />
      <SocialLinks />
    </div>
  )
}
