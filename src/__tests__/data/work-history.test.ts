import { roles, education } from '../../data/work-history'

describe('work-history data', () => {
  it('has roles ordered most recent first', () => {
    for (let i = 0; i < roles.length - 1; i++) {
      expect(roles[i].startYear).toBeGreaterThanOrEqual(roles[i + 1].startYear)
    }
  })

  it('every role has a title, company, and at least one bullet', () => {
    for (const role of roles) {
      expect(role.title).toBeTruthy()
      expect(role.company).toBeTruthy()
      expect(role.bullets.length).toBeGreaterThan(0)
    }
  })

  it('contains the expected number of roles', () => {
    expect(roles.length).toBe(7)
  })

  it('has education entries with degree and institution', () => {
    for (const entry of education) {
      expect(entry.degree).toBeTruthy()
      expect(entry.institution).toBeTruthy()
    }
  })

  it('stories have a title and at least one paragraph', () => {
    for (const role of roles) {
      for (const story of role.stories) {
        expect(story.title).toBeTruthy()
        expect(story.paragraphs.length).toBeGreaterThan(0)
      }
    }
  })
})
