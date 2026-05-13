import { useState } from 'react'
import { roles, education } from '../../data/work-history'
import type { Role } from '../../data/work-history'

function RoleSection({ role, notesVisible }: { role: Role; notesVisible: boolean }) {
  const hasNotes = role.stories.length > 0

  return (
    <section className={`cv-role ${notesVisible && hasNotes ? 'cv-role--with-notes' : ''}`}>
      <div>
        <div className="cv-role-header">
          <h3 className="cv-role-title">
            {role.title} — {role.company}
          </h3>
          <div className="cv-role-meta">
            {role.period} · {role.location}
          </div>
        </div>
        <p className="cv-summary">{role.summary}</p>
      </div>
      {notesVisible && hasNotes && (
        <div className="cv-notes-column" aria-live="polite">
          {role.stories.map((story, i) => (
            <div key={i} className="cv-note">
              <span className="cv-note-title">{story.title}</span>
              {' — '}
              {story.paragraphs.map((p, j) => (
                <span key={j}>
                  {j > 0 && ' '}
                  {p}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function MobileNotesView() {
  const rolesWithStories = roles.filter((r) => r.stories.length > 0)

  return (
    <div className="cv-notes-mobile" aria-live="polite">
      {rolesWithStories.map((role, i) => (
        <div key={i} className="cv-notes-group">
          <div className="cv-notes-group-label">{role.company}</div>
          {role.stories.map((story, j) => (
            <div key={j} className="cv-note">
              <span className="cv-note-title">{story.title}</span>
              {' — '}
              {story.paragraphs.map((p, k) => (
                <span key={k}>
                  {k > 0 && ' '}
                  {p}
                </span>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function CvPage() {
  const [notesVisible, setNotesVisible] = useState(false)

  return (
    <div className={`cv-page ${notesVisible ? 'cv-page--notes-visible' : ''}`}>
      <p className="cv-subtitle">Notes from years of building and breaking infrastructure.</p>
      <button
        className="cv-notes-toggle"
        aria-pressed={notesVisible}
        onClick={() => setNotesVisible(!notesVisible)}
      >
        {notesVisible ? 'HIDE PERSONAL NOTES' : 'SHOW PERSONAL NOTES'}
      </button>
      {notesVisible && <MobileNotesView />}
      {roles.map((role, i) => (
        <RoleSection key={i} role={role} notesVisible={notesVisible} />
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
