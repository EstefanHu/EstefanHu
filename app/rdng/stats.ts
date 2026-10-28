import { formatNumber } from '../format'
import { Book } from './books'

export type StatTile = {
  label: string
  value: string
  detail?: string
}

export type Bucket = {
  label: string
  count: number
}

export type LibraryStats = {
  tiles: StatTile[]
  lengths: Bucket[]
  lengthSummary: {
    average: number
    median: number
    total: number
    sampled: number
  }
  decades: Bucket[]
  /** books with a first publication year on record */
  dated: number
}

/** Counts each label, most common first; empty labels are skipped. */
export function countBuckets(labels: Iterable<string>): Bucket[] {
  const counts = new Map<string, number>()

  for (const label of labels) {
    if (label) counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

/** The page-length chart's buckets in order, each up to (not including) `below`. */
const LENGTHS = [
  { label: 'Under 200', below: 200 },
  { label: '200 – 299', below: 300 },
  { label: '300 – 399', below: 400 },
  { label: '400 – 499', below: 500 },
  { label: '500 – 699', below: 700 },
  { label: '700 – 999', below: 1000 },
  { label: '1000+', below: Infinity },
]

function lengthLabel(pages: number): string {
  return LENGTHS.find(({ below }) => pages < below)!.label
}

/** Everything before this year gets folded into one bucket for the era chart. */
const DECADE_FLOOR = 1950

/** `1987` -> `1980s`; years before the floor become `Before 1950`. */
function decadeLabel(year: number): string {
  if (year < DECADE_FLOOR) return `Before ${DECADE_FLOOR}`

  return `${Math.floor(year / 10) * 10}s`
}

function median(sorted: number[]): number {
  if (sorted.length === 0) return 0

  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2)
}

export function buildStats(books: Book[]): LibraryStats {
  const pages = books
    .map((book) => book.pages)
    .filter((count): count is number => count !== null)
    .sort((a, b) => a - b)

  const totalPages = sum(pages)
  const averagePages = pages.length ? Math.round(totalPages / pages.length) : 0

  const rated = books.filter((book) => book.rating > 0)
  const averageRating = rated.length ? sum(rated.map((book) => book.rating)) / rated.length : 0

  // on a tie the first wins, i.e. the most recently read
  const longest = books.reduce<Book | undefined>(
    (best, book) => (book.pages && book.pages > (best?.pages ?? 0) ? book : best),
    undefined,
  )

  const currentYear = String(new Date().getFullYear())
  const readThisYear = books.filter((book) => book.shelves.includes(currentYear))
  const pagesThisYear = sum(readThisYear.map((book) => book.pages ?? 0))

  const lengthCounts = new Map(countBuckets(pages.map(lengthLabel)).map(({ label, count }) => [label, count]))
  const lengths = LENGTHS.map(({ label }) => ({ label, count: lengthCounts.get(label) ?? 0 }))

  const years = books.map((book) => book.publishedYear).filter((year): year is number => year !== null)
  // oldest first, with the folded `Before …` bucket ahead of every decade
  const decades = countBuckets(years.map(decadeLabel)).sort(
    (a, b) => Number(b.label.startsWith('Before')) - Number(a.label.startsWith('Before')) || a.label.localeCompare(b.label),
  )

  const uniqueAuthors = new Set(books.map((book) => book.authors.split(',')[0].trim()).filter(Boolean)).size

  const tiles: StatTile[] = [
    { label: 'Books read', value: formatNumber(books.length), detail: `${formatNumber(rated.length)} of them rated` },
    { label: `Read in ${currentYear}`, value: formatNumber(readThisYear.length), detail: `${formatNumber(pagesThisYear)} pages so far` },
    { label: 'Pages read', value: formatNumber(totalPages), detail: `across ${formatNumber(pages.length)} editions` },
    { label: 'Average rating', value: rated.length ? averageRating.toFixed(2) : '—', detail: `out of 5, from ${formatNumber(rated.length)} ratings` },
    { label: 'Average length', value: `${formatNumber(averagePages)} pp`, detail: `from ${formatNumber(pages.length)} editions` },
    { label: 'Longest book', value: longest ? `${formatNumber(longest.pages!)} pp` : '—', detail: longest?.title },
    { label: 'Authors', value: formatNumber(uniqueAuthors), detail: 'unique across the library' },
  ]

  return {
    tiles,
    lengths,
    lengthSummary: { average: averagePages, median: median(pages), total: totalPages, sampled: pages.length },
    decades,
    dated: years.length,
  }
}
