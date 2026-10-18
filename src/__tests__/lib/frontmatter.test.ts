import { parseFrontmatter } from '../../lib/frontmatter'

describe('parseFrontmatter', () => {
  it('parses quoted strings and splits bracketed arrays', () => {
    const raw = '---\ntitle: "Hello World"\ntags: [devops, terraform]\n---\nBody text here'
    const { frontmatter, body } = parseFrontmatter(raw)
    expect(frontmatter.title).toBe('Hello World')
    expect(frontmatter.tags).toEqual(['devops', 'terraform'])
    expect(body).toBe('Body text here')
  })

  it('returns empty frontmatter and the raw body when no block is present', () => {
    const { frontmatter, body } = parseFrontmatter('no frontmatter here')
    expect(frontmatter).toEqual({})
    expect(body).toBe('no frontmatter here')
  })
})
