import { reading } from '../../data/reading'

describe('reading data', () => {
  it('has 31 entries', () => {
    expect(reading).toHaveLength(31)
  })

  it('every entry has a name, an /authors/ image path, and an https url', () => {
    for (const entry of reading) {
      expect(entry.name.trim().length).toBeGreaterThan(0)
      expect(entry.image.startsWith('/authors/')).toBe(true)
      expect(entry.url.startsWith('https://')).toBe(true)
    }
  })

  it('has unique image paths', () => {
    const paths = reading.map((e) => e.image)
    expect(new Set(paths).size).toBe(paths.length)
  })
})
