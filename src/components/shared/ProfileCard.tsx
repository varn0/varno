import profilePicture from '../../assets/profile-picture.jpeg'
import { SocialLinks } from './SocialLinks'

export function ProfileCard() {
  return (
    <div className="profile-card">
      <img
        src={profilePicture}
        alt="Alexis Janero Moliner"
        className="profile-picture"
        width={130}
        height={130}
        fetchPriority="high"
      />
      <h1 className="profile-name">Alexis Janero Moliner</h1>
      <SocialLinks />
    </div>
  )
}
