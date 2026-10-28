import { formatNumber } from '../format'
import { buildStats, LibraryStats } from './stats'
import { Book } from './books'
import { BookAttributes, buildAttributes } from './attributes'
import { BarList, Panel } from './panel'
import styles from './dashboard.module.css'

/** The genre list runs to 40+ entries; the panel shows the most common only. */
const GENRE_LIMIT = 10

function Tiles({ tiles }: { tiles: LibraryStats['tiles'] }) {
  return (
    <ul className={styles.tiles}>
      {tiles.map((tile) => (
        <li className={styles.tile} key={tile.label}>
          <span className={styles.tileLabel}>{tile.label}</span>
          <span className={styles.tileValue}>{tile.value}</span>
          {tile.detail && <span className={styles.tileDetail}>{tile.detail}</span>}
        </li>
      ))}
    </ul>
  )
}

export default function Dashboard({
  books,
  attributes: attributesByTitle,
}: {
  books: Book[]
  attributes: Record<string, BookAttributes>
}) {
  const stats = buildStats(books)
  const attributes = buildAttributes(books, attributesByTitle)
  const { coverage, genres, moods } = attributes
  const { lengthSummary } = stats

  return (
    <section className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Stats</h2>
      </header>

      <Tiles tiles={stats.tiles} />

      <div className={styles.grid}>
        {genres.length > 0 && (
          <Panel
            title="Top Genres"
            subtitle={`${formatNumber(coverage.withGenres)} of ${formatNumber(coverage.total)} books tagged · top ${Math.min(GENRE_LIMIT, genres.length)}`}
          >
            <BarList buckets={genres.slice(0, GENRE_LIMIT)} />
          </Panel>
        )}

        <Panel
          title="Publication era"
          subtitle={`When your books were first published · ${formatNumber(stats.dated)} of ${formatNumber(books.length)} dated`}
        >
          <BarList buckets={stats.decades} emptyLabel="No publication years in the export" />
        </Panel>
        <Panel
          title="Page length"
          subtitle={`${formatNumber(lengthSummary.average)} pages average · ${formatNumber(lengthSummary.median)} median · ${formatNumber(lengthSummary.total)} total across ${formatNumber(lengthSummary.sampled)} editions`}
        >
          <BarList buckets={stats.lengths} />
        </Panel>

        {moods.length > 0 && (
          <Panel
            title="Mood"
            subtitle={`${formatNumber(coverage.withMoods)} of ${formatNumber(coverage.total)} books tagged`}
          >
            <BarList buckets={moods} />
          </Panel>
        )}
      </div>
    </section>
  )
}