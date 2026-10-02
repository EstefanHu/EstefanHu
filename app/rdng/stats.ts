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
  era: {
    /** books with a first publication year on record */
    dated: number
  }
}

function pagesOf(book: Book): number {
  return book.pages ?? 0
}

function groupCount(books: Book[], key: (book: Book) => string): Bucket[] {
  const counts = new Map<string, number>()

  for (const book of books) {
    const label = key(book).trim()
    if (!label) continue

    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

function lengthBucket(pageCount: number): string {
  if (pageCount < 200) return 'Under 200'
  if (pageCount < 300) return '200 – 299'
  if (pageCount < 400) return '300 – 399'
  if (pageCount < 500) return '400 – 499'
  if (pageCount < 700) return '500 – 699'
  if (pageCount < 1000) return '700 – 999'
  return '1000+'
}

const LENGTH_ORDER = [
  'Under 200',
  '200 – 299',
  '300 – 399',
  '400 – 499',
  '500 – 699',
  '700 – 999',
  '1000+',
]

/** Everything before this year gets folded into one bucket for the era chart. */
const DECADE_FLOOR = 1950

/** `1987` -> `1980s`; years before the floor become `Before 1950`. */
function decadeLabel(year: number): string {
  if (year < DECADE_FLOOR) return `Before ${DECADE_FLOOR}`

  return `${Math.floor(year / 10) * 10}s`
}

function buildDecades(books: Book[]): Bucket[] {
  const counts = new Map<string, number>()

  for (const book of books) {
    if (!book.publishedYear) continue

    const label = decadeLabel(book.publishedYear)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  const ordered = [...counts.keys()].sort((a, b) => {
    if (a.startsWith('Before')) return -1
    if (b.startsWith('Before')) return 1
    return a.localeCompare(b)
  })

  return ordered.map((label) => ({ label, count: counts.get(label) ?? 0 }))
}

export function buildStats(allBooks: Book[]): LibraryStats {
  const books = allBooks

  const totalBooks = books.length
  const totalPages = books.reduce((sum, book) => sum + pagesOf(book), 0)
  const withPages = books.filter((book) => book.pages !== null)

  const rated = books.filter((book) => book.rating > 0)
  const averageRating =
    rated.length > 0
      ? rated.reduce((sum, book) => sum + book.rating, 0) / rated.length
      : 0

  const averagePages =
    withPages.length > 0
      ? Math.round(totalPages / withPages.length)
      : 0

  const longest = [...books].filter((book) => book.pages).sort((a, b) => b.pages! - a.pages!)[0]
  const shortest = [...books].filter((book) => book.pages).sort((a, b) => a.pages! - b.pages!)[0]

  const lengthCounts = groupCount(books, (book) => (book.pages ? lengthBucket(book.pages) : ''))
  const lengths = LENGTH_ORDER.map((label) => ({
    label,
    count: lengthCounts.find((bucket) => bucket.label === label)?.count ?? 0,
  }))

  const sortedPages = books
    .map((book) => book.pages)
    .filter((pages): pages is number => pages !== null)
    .sort((a, b) => a - b)

  const middle = Math.floor(sortedPages.length / 2)
  const median =
    sortedPages.length === 0
      ? 0
      : sortedPages.length % 2 === 1
        ? sortedPages[middle]
        : Math.round((sortedPages[middle - 1] + sortedPages[middle]) / 2)

  const lengthSummary = {
    average: averagePages,
    median,
    total: totalPages,
    sampled: sortedPages.length,
  }

  const uniqueAuthors = groupCount(books, (book) => book.authors.split(',')[0]).length
  const dated = books.filter((book) => book.publishedYear).length

  const tiles: StatTile[] = [
    { label: 'Books read', value: totalBooks.toLocaleString('en-US'), detail: `${rated.length.toLocaleString('en-US')} of them rated` },
    { label: 'Pages read', value: totalPages.toLocaleString('en-US'), detail: `across ${withPages.length.toLocaleString('en-US')} editions` },
    { label: 'Average rating', value: rated.length ? averageRating.toFixed(2) : '—', detail: `out of 5, from ${rated.length} ratings` },
    { label: 'Average length', value: `${averagePages.toLocaleString('en-US')} pp`, detail: `from ${withPages.length} editions` },
    { label: 'Longest book', value: longest ? `${longest.pages!.toLocaleString('en-US')} pp` : '—', detail: longest?.title },
    { label: 'Shortest book', value: shortest ? `${shortest.pages!.toLocaleString('en-US')} pp` : '—', detail: shortest?.title },
    { label: 'Authors', value: uniqueAuthors.toLocaleString('en-US'), detail: 'unique across the library' },
  ]

  return {
    tiles,
    lengths,
    lengthSummary,
    decades: buildDecades(books),
    era: { dated },
  }
}