import { marked } from 'marked'

export { parseFrontmatter } from './frontmatter'
export type { Frontmatter } from './frontmatter'

export function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false }) as string
}
