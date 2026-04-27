export interface BlogMeta {
  title: string
  date: string
  description: string
  tags: string[]
  source?: 'linkedin' | 'medium' | 'original'
  slug: string
}

export interface BlogPost extends BlogMeta {
  html: string
}
