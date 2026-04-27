import { useState } from 'react'
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
  const [open, setOpen] = useState(false)
  const hasContent = role.stories.length > 0

  return (
    <section className="cv-role">
      <button
        className={`cv-role-header ${hasContent ? 'cv-role-header--expandable' : ''} ${open ? 'cv-role-header--open' : ''}`}
        onClick={() => hasContent && setOpen(!open)}
        disabled={!hasContent}
      >
        <div>
          <h3 className="cv-role-title">
            {role.title} — {role.company}
          </h3>
          <div className="cv-role-meta">
            {role.period} · {role.location}
          </div>
        </div>
        {hasContent && (
          <span className="cv-role-toggle">{open ? '−' : '+'}</span>
        )}
      </button>
      <p className="cv-summary">{role.summary}</p>
      {open && (
        <div className="cv-role-expanded">
          {role.stories.map((story, i) => (
            <StoryBlock key={i} story={story} />
          ))}
        </div>
      )}
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
