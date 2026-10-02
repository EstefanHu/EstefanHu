import { Book, currentlyReading, formatDate, readBooks } from './books'
import { buildRecentlyRead } from './recently-read'
import Dashboard from './dashboard'
import styles from './page.module.css'

const MAX_RATING = 5

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

function BookCard({ book, footer }: { book: Book; footer?: React.ReactNode }) {
  const added = formatDate(book.addedAt)

  return (
    <article className={styles.book}>
      <header className={styles.bookHeader}>
        {/* titles get ellipsised, so keep the full text for hover */}
        <h3 className={styles.bookTitle} title={book.title}>
          {book.title}
        </h3>
        <p className={styles.author} title={book.authors}>
          {book.authors}
        </p>
      </header>

      <Rating rating={book.rating} />

      <footer className={styles.bookFooter}>
        {footer ?? (added && <Meta label="Added" value={added} />)}
      </footer>
    </article>
  )
}

function page() {
  const recentlyRead = buildRecentlyRead(readBooks)

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>My <span>Reading</span></h1>
        <p className={styles.subtitle}>
          {readBooks.length.toLocaleString('en-US')} books &mdash; tracked from my Goodreads export
        </p>
      </div>

      {currentlyReading.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Currently Reading</h2>

          <div className={styles.bookList}>
            {currentlyReading.map((book) => (
              <BookCard key={book.title} book={book} />
            ))}
          </div>
        </section>
      )}

      <Dashboard />

      {recentlyRead.books.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Recently Read</h2>

          <div className={styles.bookList}>
            {recentlyRead.books.map((book) => (
              <BookCard
                key={book.title}
                book={book}
                footer={
                  <>
                    <Meta
                      label="Finished"
                      value={formatDate(book.finishedAt) ?? ''}
                    />
                    {book.pages && <Meta value={`${book.pages} pages`} />}
                  </>
                }
              />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export default page
