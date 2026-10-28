import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleBody, ArticleFooter } from '../../article'
import { getProject, projects, sortedProjects } from '../projects'
import styles from './project.module.css'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = getProject((await params).slug)

  if (!project) return { title: 'Project not found' }

  return {
    title: `${project.title} - Projects`,
    description: project.excerpt,
  }
}

async function page({ params }: Params) {
  const project = getProject((await params).slug)

  if (!project) notFound()

  // position in the featured-then-newest list, for the other-project links
  const index = sortedProjects.findIndex((entry) => entry.slug === project.slug)
  const previous = sortedProjects[index - 1]
  const next = sortedProjects[index + 1]

  return (
    <article>
      <header className={styles.header}>
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.tagline}>{project.excerpt}</p>

        <div className={styles.meta}>
          <span>
            <span className={styles.metaLabel}>Year</span>
            {project.year}
          </span>

          <span>
            <span className={styles.metaLabel}>Status</span>
            {project.status}
          </span>

          <span>
            <span className={styles.metaLabel}>Role</span>
            {project.role}
          </span>

          {project.tags.map((tag) => (
            <span className={styles.tag} key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </header>

      <ArticleBody blocks={project.body}>
        {project.summary && <p className={styles.lead}>{project.summary}</p>}
      </ArticleBody>

      <div className={styles.stack}>
        <span className={styles.stackLabel}>Built with</span>
        <span className={styles.stackList}>
          {project.stack.map((tool) => (
            <span className={styles.stackItem} key={tool}>
              {tool}
            </span>
          ))}
        </span>
      </div>

      {project.links.length > 0 && (
        <div className={styles.links}>
          {project.links.map((link) => (
            <Link
              className={styles.link}
              href={link.href}
              /* external links open in a new tab, internal ones stay in the SPA */
              {...(link.href.startsWith('/')
                ? {}
                : { target: '_blank', rel: 'noopener noreferrer' })}
              key={link.label}
            >
              {/* one child only: <Link> forwards its children into the <a>, and
                 two of them become a keyless array, which React warns about */}
              <span className={styles.linkLabel}>
                {link.label}
                <span className={styles.linkArrow}>&rarr;</span>
              </span>
            </Link>
          ))}
        </div>
      )}

      <ArticleFooter
        left={previous && { label: 'Previous', title: previous.title, href: `/prjcts/${previous.slug}` }}
        right={next && { label: 'Next', title: next.title, href: `/prjcts/${next.slug}` }}
        back={{ label: 'all projects', href: '/prjcts' }}
      />
    </article>
  )
}

export default page