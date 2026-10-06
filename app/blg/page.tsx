import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate, preview, readingTime, sortedPosts } from './posts'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Blog',
  description: `${sortedPosts.length} posts - notes and thoughts`,
}

function page() {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>
          A <span>Blog</span>
        </h1>
        <p className={styles.subtitle}>
          {sortedPosts.length} posts &mdash; notes and thoughts
        </p>
      </div>

      <div className={styles.postList}>
        {sortedPosts.map((post) => (
          <Link className={styles.post} href={`/blg/${post.slug}`} key={post.slug}>
            <div className={styles.postHeader}>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.postExcerpt}>{post.excerpt}</p>
              <p className={styles.postPreview}>{preview(post)}</p>
            </div>

            <footer className={styles.postFooter}>
              <span className={styles.meta}>
                <span className={styles.metaLabel}>Posted</span>
                {formatDate(post.date)}
              </span>

              <span className={styles.meta}>{readingTime(post)} min read</span>

              <span className={styles.tags}>
                {post.tags.map((tag) => (
                  <span className={styles.tag} key={tag}>
                    {tag}
                  </span>
                ))}
              </span>
            </footer>
          </Link>
        ))}
      </div>
    </>
  )
}

export default page
