import Link from 'next/link'
import styles from './project.module.css'

function notFound() {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>No such project</h1>
      <p className={styles.tagline}>
        &larr; <Link href="/prjcts">back to all projects</Link>
      </p>
    </div>
  )
}

export default notFound