import type { Metadata } from 'next'
import Link from 'next/link'
import { preview, sortedProjects } from './projects'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Projects',
  description: `${sortedProjects.length} projects - active and archived`,
}

function page() {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>
          my <span>Projects</span>
        </h1>
        <p className={styles.subtitle}>
          {sortedProjects.length} projects &mdash; active and archived
        </p>
      </div>

      <div className={styles.projectList}>
        {sortedProjects.map((project) => (
          <Link
            className={`${styles.project} ${project.featured ? styles.projectFeatured : ''}`}
            href={`/prjcts/${project.slug}`}
            key={project.slug}
          >
            <div className={styles.projectHeader}>
              <h2 className={styles.projectTitle}>{project.title}</h2>
              <p className={styles.projectExcerpt}>{project.excerpt}</p>
              <p className={styles.projectPreview}>{preview(project)}</p>
            </div>

            <footer className={styles.projectFooter}>
              <span className={styles.meta}>
                <span className={styles.metaLabel}>Year</span>
                {project.year}
              </span>

              <span className={styles.meta}>
                <span className={styles.metaLabel}>Status</span>
                {project.status}
              </span>

              <span className={styles.tags}>
                {project.tags.map((tag) => (
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
