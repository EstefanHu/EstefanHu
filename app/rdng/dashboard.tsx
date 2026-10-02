import { buildStats, LibraryStats } from './stats'
import { readBooks } from './books'
import { buildAttributes } from './attributes'
import { BarList, Panel } from './panel'
import styles from './dashboard.module.css'

/** The genre list runs to 40+ rows; the panel shows the most common only. */
const GENRE_LIMIT = 15

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

export default function Dashboard() {
  const stats = buildStats(readBooks)
  const attributes = buildAttributes(readBooks)

  return (
    <section className={styles.dashboard}>
      <header className={styles.dashboardHeader}>
        <h2 className={styles.dashboardTitle}>Stats</h2>
      </header>

      <Tiles tiles={stats.tiles} />

      <div className={styles.grid}>
        <Panel
          title="Publication era"
          subtitle={`When your books were first published · ${stats.era.dated.toLocaleString('en-US')} of ${readBooks.length.toLocaleString('en-US')} dated`}
        >
          <BarList buckets={stats.decades} emptyLabel="No publication years in the export" />
        </Panel>

        <Panel
          title="Page length"
          subtitle={`${stats.lengthSummary.average.toLocaleString('en-US')} pages average · ${stats.lengthSummary.median.toLocaleString('en-US')} median · ${stats.lengthSummary.total.toLocaleString('en-US')} total across ${stats.lengthSummary.sampled.toLocaleString('en-US')} editions`}
        >
          <BarList buckets={stats.lengths} />
        </Panel>

        {attributes.moods.length > 0 && (
          <Panel
            title="Mood"
            subtitle={`${attributes.coverage.withMoods.toLocaleString('en-US')} of ${attributes.coverage.total.toLocaleString('en-US')} books tagged`}
          >
            <BarList buckets={attributes.moods} />
          </Panel>
        )}

        {attributes.genres.length > 0 && (
          <Panel
            title="Top Genres"
            subtitle={`${attributes.coverage.withGenres.toLocaleString('en-US')} of ${attributes.coverage.total.toLocaleString('en-US')} books tagged · top ${Math.min(GENRE_LIMIT, attributes.genres.length)}`}
          >
            <BarList buckets={attributes.genres.slice(0, GENRE_LIMIT)} />
          </Panel>
        )}
      </div>
    </section>
  )
}