import styles from './dashboard.module.css'

export function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>{title}</h3>
        {subtitle && <p className={styles.panelSubtitle}>{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}

/** Label, proportional bar, and a bare count. */
export function BarList({
  buckets,
  emptyLabel = 'No data yet',
}: {
  buckets: { label: string; count: number }[]
  emptyLabel?: string
}) {
  const visible = buckets.filter((bucket) => bucket.count > 0)

  if (visible.length === 0) {
    return <p className={styles.empty}>{emptyLabel}</p>
  }

  const max = Math.max(...visible.map((bucket) => bucket.count))

  return (
    <ul className={styles.barList}>
      {visible.map((bucket) => (
        <li className={styles.barRow} key={bucket.label}>
          <span className={styles.barLabel}>{bucket.label}</span>
          <span className={styles.barTrack}>
            <span
              className={styles.barFill}
              style={{ width: `${Math.max((bucket.count / max) * 100, 2)}%` }}
            />
          </span>
          <span className={styles.barValue}>{bucket.count}</span>
        </li>
      ))}
    </ul>
  )
}