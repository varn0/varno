import { roles, education } from '../../data/work-history'
import type { Role, Story } from '../../data/work-history'

function StoryBlock({ story }: { story: Story }) {
  return (
    <div className="cv-story">
      <h4 className="cv-story-title">{story.title}</h4>
      {story.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )
}

function RoleSection({ role }: { role: Role }) {
  return (
    <section className="cv-role">
      <div className="cv-role-header">
        <h3 className="cv-role-title">
          {role.title} — {role.company}
        </h3>
        <div className="cv-role-meta">
          {role.period} · {role.location}
        </div>
      </div>
      <ul className="cv-bullets">
        {role.bullets.map((bullet, i) => (
          <li key={i} className="cv-bullet">{bullet}</li>
        ))}
      </ul>
      {role.stories.map((story, i) => (
        <StoryBlock key={i} story={story} />
      ))}
    </section>
  )
}

export function CvPage() {
  return (
    <div className="cv-page">
      <p className="cv-subtitle">Notes from years of building and breaking infrastructure.</p>
      {roles.map((role, i) => (
        <RoleSection key={i} role={role} />
      ))}
      <hr className="cv-section-divider" />
      <h2 className="cv-page-title">Education</h2>
      <div className="cv-education">
        {education.map((entry, i) => (
          <div key={i} className="cv-education-entry">
            <div className="cv-education-degree">{entry.degree}</div>
            <div className="cv-education-meta">
              {entry.institution} · {entry.period}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
