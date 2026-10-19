import { buildManifest } from '../../lib/blogManifest'

const post = (fm: string) => `---\n${fm}\n---\nbody`

describe('buildManifest', () => {
  it('maps frontmatter to manifest entries with slug and file preserved', () => {
    const entries = buildManifest([
      { slug: 'a', file: 'a.md', raw: post('title: "A"\ndate: 2025-01-02\ndescription: "First"\ntags: [x, y]\nsource: linkedin') },
    ])
    expect(entries).toEqual([
      { slug: 'a', file: 'a.md', title: 'A', date: '2025-01-02', description: 'First', tags: ['x', 'y'], source: 'linkedin' },
    ])
  })

  it('defaults missing fields instead of crashing', () => {
    const entries = buildManifest([
      { slug: 'b', file: 'b.md', raw: post('title: "B"\ndate: 2025-01-01') },
    ])
    expect(entries[0]).toMatchObject({ slug: 'b', file: 'b.md', title: 'B', description: '', tags: [] })
    expect(entries[0].source).toBeUndefined()
  })

  it('normalizes a single tag value into an array', () => {
    const entries = buildManifest([
      { slug: 'c', file: 'c.md', raw: post('title: "C"\ndate: 2025-01-01\ntags: solo') },
    ])
    expect(entries[0].tags).toEqual(['solo'])
  })
})
