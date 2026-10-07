import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate, getPost, Post, posts, readingTime, sortedPosts } from '../posts'
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

function Blocks({ post }: { post: Post }) {
  return (
    <>
      {post.body.map((block, index) => {
        switch (block.type) {
          case 'heading':
            return (
              <h2 className={styles.heading} key={index}>
                {block.text}
              </h2>
            )

          case 'quote':
            return (
              <blockquote className={styles.quote} key={index}>
                <p>{block.text}</p>
                {block.attribution && (
                  <cite className={styles.attribution}>{block.attribution}</cite>
                )}
              </blockquote>
            )

          case 'list':
            return (
              <ul className={styles.list} key={index}>
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )

          default:
            return (
              <p className={styles.paragraph} key={index}>
                {block.text}
              </p>
            )
        }
      })}
    </>
  )
}

async function page({ params }: Params) {
  const post = getPost((await params).slug)

  if (!post) notFound()

  // position in the newest-first list, for the older/newer links
  const index = sortedPosts.findIndex((entry) => entry.slug === post.slug)
  const newer = sortedPosts[index + 1]
  const older = sortedPosts[index - 1]

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

      <div className={styles.body}>
      <Blocks post={post} />
    </div>

    <footer className={styles.footer}>
      <div className={styles.pager}>
        {older ? (
          <Link className={styles.pagerLink} href={`/blg/${older.slug}`}>
            <span className={styles.pagerLabel}>Older</span>
            {older.title}
          </Link>
        ) : (
          <span />
        )}

        {newer && (
          <Link className={`${styles.pagerLink} ${styles.pagerNewer}`} href={`/blg/${newer.slug}`}>
            <span className={styles.pagerLabel}>Newer</span>
            {newer.title}
          </Link>
        )}
      </div>

      <Link className={styles.back} href="/blg">
        &larr; all posts
      </Link>
    </footer>

    </article>
  )
}

export default page
