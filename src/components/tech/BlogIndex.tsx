import { Link } from 'react-router-dom'
import { useBlogList } from '../../hooks/useBlogList'
import type { BlogMeta } from '../../types/blog'

function BlogCard({ post }: { post: BlogMeta }) {
  const date = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="blog-card">
      <Link to={`/blog/${post.slug}`} className="blog-card-link">
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-description">{post.description}</p>
        <div className="blog-card-meta">
          <span className="blog-card-date">{date}</span>
          {post.source && post.source !== 'original' && (
            <span className="blog-card-source">
              Originally on {post.source === 'linkedin' ? 'LinkedIn' : 'Medium'}
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}

export function BlogIndex() {
  const { posts, loading } = useBlogList()

  if (loading) {
    return (
      <div className="blog-page">
        <h2 className="blog-page-title">Blog</h2>
        <p className="blog-loading">Loading...</p>
      </div>
    )
  }

  return (
    <div className="blog-page">
      <h2 className="blog-page-title">Blog</h2>
      <div className="blog-list">
        {posts.map(post => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
}
