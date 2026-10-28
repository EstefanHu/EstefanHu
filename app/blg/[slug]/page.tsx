import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticleBody, ArticleFooter } from '../../article'
import { formatDate } from '../../format'
import { getPost, posts, readingTime, sortedPosts } from '../posts'
import styles from './post.module.css'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = getPost((await params).slug)

  if (!post) return { title: 'Post not found' }

  return {
    title: `${post.title} - Blog`,
    description: post.excerpt,
  }
}

async function page({ params }: Params) {
  const post = getPost((await params).slug)

  if (!post) notFound()

  // position in the newest-first list, for the older/newer links
  const index = sortedPosts.findIndex((entry) => entry.slug === post.slug)
  const newer = sortedPosts[index - 1]
  const older = sortedPosts[index + 1]

  return (
    <article>
      <header className={styles.header}>
        <h1 className={styles.title}>{post.title}</h1>

        <div className={styles.meta}>
          <span>
            <span className={styles.metaLabel}>Posted</span>
            {formatDate(post.date)}
          </span>

          <span>{readingTime(post)} min read</span>

          {post.tags.map((tag) => (
            <span className={styles.tag} key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      <ArticleBody blocks={post.body} />

      <ArticleFooter
        left={older && { label: 'Older', title: older.title, href: `/blg/${older.slug}` }}
        right={newer && { label: 'Newer', title: newer.title, href: `/blg/${newer.slug}` }}
        back={{ label: 'all posts', href: '/blg' }}
      />
    </article>
  )
}

export default page
