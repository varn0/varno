import { parseFrontmatter } from './frontmatter'

export interface ManifestInput {
  slug: string
  file: string
  raw: string
}

export interface ManifestEntry {
  slug: string
  file: string
  title: string
  date: string
  description: string
  tags: string[]
  source?: 'linkedin' | 'medium' | 'original'
}

function toTags(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[]
  if (typeof value === 'string' && value.length > 0) return [value]
  return []
}

export function buildManifest(inputs: ManifestInput[]): ManifestEntry[] {
  return inputs.map(({ slug, file, raw }) => {
    const { frontmatter } = parseFrontmatter(raw)
    return {
      slug,
      file,
      title: (frontmatter.title as string) ?? '',
      date: (frontmatter.date as string) ?? '',
      description: (frontmatter.description as string) ?? '',
      tags: toTags(frontmatter.tags),
      source: frontmatter.source as ManifestEntry['source'] | undefined,
    }
  })
}
