import styles from './page.module.css'

function page() {
  const readingNow = [
    {
      title: "East of Eden",
      author: "John Steinbeck",
      startedAt: "May 2026",
      finishedAt: null,
    },
  ]

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>My <span>Library</span></h1>
      </div>

      <section className={styles.section}>
        <h3>Reading Now</h3>
        <div className={styles.bookList}>
          {readingNow.map((book, i) => (
            <div className={styles.book} key={i}>
              <div className={styles.info}>
                <header className={styles.bookHeader}>
                  <h2>{book.title}</h2>

                  <span>{book.startedAt} - {book.finishedAt ? book.finishedAt : "Present"}</span>
                </header>
                <p>{book.author}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3>Previously Read</h3>

        <div className={styles.bookList}>
          <div className={styles.book}>
            <div className={styles.info}>
              <header>
                <h2>Book Title</h2>
              </header>
              <p>Author Name</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default page