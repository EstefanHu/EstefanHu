import type { Metadata } from 'next'
import { formatDate, formatNumber } from '../format'
import { Book, readBooks, recentlyRead } from './books'
import { loadAttributes, BookAttributes } from './attributes'
import BookCover from './book-cover'
import Dashboard from './dashboard'
import styles from './page.module.css'

const MAX_RATING = 5

export const metadata: Metadata = {
  title: 'Reading',
  description: 'Books I am currently reading and have read',
}

function Rating({ rating }: { rating: number }) {
  if (!rating) return null

  return (
    <span
      className={styles.rating}
      role="img"
      aria-label={`${rating} out of ${MAX_RATING} stars`}
    >
      {Array.from({ length: MAX_RATING }, (_, index) => (
        <span
          key={index}
          className={index < rating ? styles.starFilled : styles.star}
          aria-hidden="true"
        >
          ★
        </span>
      ))}
    </span>
  )
}

function Meta({ label, value }: { label?: string; value: string }) {
  return (
    <span className={styles.meta}>
      {label ? <span className={styles.metaLabel}>{label}</span> : null}
      {value}
    </span>
  )
}

/**
 * Hard caps on the visible title, longest first. The widest is rendered by
 * default and CSS swaps in the shorter ones as the viewport narrows, which
 * keeps this server-rendered (no measuring, no hydration mismatch).
 */
const TITLE_LIMITS = { wide: 50, medium: 40, narrow: 28 }

function truncate(value: string, max: number): string {
  if (value.length <= max) return value

  return `${value.slice(0, max - 1).trimEnd()}…`
}

function BookCard({ book, attributes }: { book: Book; attributes?: BookAttributes }) {
  // Books carry a dozen Open Library genres; a handful keeps the row tidy.
  const tags = [
    ...new Set([...(attributes?.genres ?? []), ...(attributes?.moods ?? [])]),
  ].slice(0, 4)

  return (
    <article className={styles.book}>
      <BookCover isbn={book.isbn} title={book.title} className={styles.cover} />

      <div className={styles.bookInfo}>
        <header className={styles.bookHeader}>
          {/* one node per breakpoint; CSS decides which is visible. The full
              text stays in `title` for hover on every variant. */}
          <h3 className={styles.bookTitle} title={book.title}>
            <span className={styles.titleWide}>{truncate(book.title, TITLE_LIMITS.wide)}</span>
            <span className={styles.titleMedium}>{truncate(book.title, TITLE_LIMITS.medium)}</span>
            <span className={styles.titleNarrow}>{truncate(book.title, TITLE_LIMITS.narrow)}</span>
          </h3>
          <p className={styles.author} title={book.authors}>
            {book.authors}
          </p>
        </header>

        <Rating rating={book.rating} />

        {tags.length > 0 && (
          <div className={styles.tags}>
            {tags.map((tag) => (
              <span className={styles.tag} key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <footer className={styles.bookFooter}>
          {book.finishedAt && <Meta label="Finished" value={formatDate(book.finishedAt)} />}
          {book.pages && <Meta value={`${book.pages} pages`} />}
        </footer>
      </div>
    </article>
  )
}

function page() {
  const attributes = loadAttributes()

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>My <span>Reading</span></h1>
        <p className={styles.subtitle}>
          {formatNumber(readBooks.length)} books &mdash; tracked from my Goodreads export
        </p>
      </div>

      <Dashboard books={readBooks} attributes={attributes} />

      {recentlyRead.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recently Read</h2>

          <div className={styles.bookList}>
            {recentlyRead.map((book) => (
              <BookCard key={book.title} book={book} attributes={attributes[book.title]} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export default page
