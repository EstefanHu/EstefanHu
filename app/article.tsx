import Link from 'next/link'
import styles from './article.module.css'

/**
 * Blog posts and project pages are the same shape below the header: a body of
 * blocks, then a pager to the neighbouring entries and a link back to the list.
 */

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'list'; items: string[] }

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'heading':
      return <h2 className={styles.heading}>{block.text}</h2>

    case 'quote':
      return (
        <blockquote className={styles.quote}>
          <p>{block.text}</p>
          {block.attribution && (
            <cite className={styles.attribution}>{block.attribution}</cite>
          )}
        </blockquote>
      )

    case 'list':
      return (
        <ul className={styles.list}>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )

    default:
      return <p className={styles.paragraph}>{block.text}</p>
  }
}

/** `children` render ahead of the blocks, e.g. a project's lead paragraph. */
export function ArticleBody({ blocks, children }: { blocks: Block[]; children?: React.ReactNode }) {
  return (
    <div className={styles.body}>
      {children}
      {blocks.map((block, index) => (
        <BlockView block={block} key={index} />
      ))}
    </div>
  )
}

export type PagerLink = { label: string; title: string; href: string }

export function ArticleFooter({
  left,
  right,
  back,
}: {
  left?: PagerLink
  right?: PagerLink
  back: { label: string; href: string }
}) {
  return (
    <footer className={styles.footer}>
      <div className={styles.pager}>
        {left ? (
          <Link className={styles.pagerLink} href={left.href}>
            <span className={styles.pagerLabel}>{left.label}</span>
            {left.title}
          </Link>
        ) : (
          <span />
        )}

        {right && (
          <Link className={`${styles.pagerLink} ${styles.pagerRight}`} href={right.href}>
            <span className={styles.pagerLabel}>{right.label}</span>
            {right.title}
          </Link>
        )}
      </div>

      <Link className={styles.back} href={back.href}>
        &larr; {back.label}
      </Link>
    </footer>
  )
}
