import { timelineEntries } from '../../data/micro-cv'

describe('micro-cv timeline data', () => {
  it('has entries ordered most recent first', () => {
    for (let i = 0; i < timelineEntries.length - 1; i++) {
      expect(timelineEntries[i].startYear).toBeGreaterThanOrEqual(
        timelineEntries[i + 1].startYear
      )
    }
  })

  it('every entry has at least one icon', () => {
    for (const entry of timelineEntries) {
      expect(entry.icons.length).toBeGreaterThan(0)
    }
  })

  it('every icon has a slug and label', () => {
    for (const entry of timelineEntries) {
      for (const icon of entry.icons) {
        expect(icon.slug).toBeTruthy()
        expect(icon.label).toBeTruthy()
      }
    }
  })

  it('contains the expected number of time periods', () => {
    expect(timelineEntries).toHaveLength(6)
  })
})
