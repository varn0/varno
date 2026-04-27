import { useParams, Link } from 'react-router-dom'
import { useMarkdown } from '../../hooks/useMarkdown'

interface PostFrontmatter extends Record<string, unknown> {
  title: string
  date: string
  source?: string
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { data, html, loading, error } = useMarkdown<PostFrontmatter>(
    `/content/blog/${slug}.md`
  )

  if (loading) {
    return (
      <div className="blog-post-page">
        <p className="blog-loading">Loading...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="blog-post-page">
        <p>Post not found.</p>
        <Link to="/blog" className="blog-back-link">Back to blog</Link>
      </div>
    )
  }

  const date = new Date(data.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="blog-post-page">
      <Link to="/blog" className="blog-back-link">&larr; Back to blog</Link>
      <article className="blog-post">
        <header className="blog-post-header">
          <h1 className="blog-post-title">{data.title}</h1>
          <div className="blog-post-meta">
            <span>{date}</span>
            {data.source && data.source !== 'original' && (
              <span className="blog-card-source">
                Originally on {data.source === 'linkedin' ? 'LinkedIn' : 'Medium'}
              </span>
            )}
          </div>
        </header>
        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>
    </div>
  )
}
