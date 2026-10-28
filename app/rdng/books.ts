import fs from 'node:fs'
import path from 'node:path'

export type Book = {
  title: string
  authors: string
  rating: number
  pages: number | null
  isbn: string | null
  /** first publication year, when Goodreads records one */
  publishedYear: number | null
  /** ISO `YYYY-MM-DD`, or null when Goodreads has no date for it */
  finishedAt: string | null
  addedAt: string | null
  /** non-exclusive Goodreads shelves (tags), e.g. `2026` */
  shelves: string[]
}

const CSV_PATH = path.join(process.cwd(), 'data', 'goodreads.csv')

/**
 * Minimal RFC 4180 parser: handles quoted fields, embedded commas,
 * escaped quotes (""), and \r\n line endings.
 */
function parseCsv(input: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows
  if (!header) return []

  return body
    .filter((cells) => cells.length > 1)
    .map((cells) =>
      header.reduce<Record<string, string>>((record, key, index) => {
        record[key] = cells[index] ?? ''
        return record
      }, {}),
    )
}

/** Goodreads writes `2026/09/29` or a partial `2026/09`. */
function toIso(value: string): string | null {
  const match = /^(\d{4})(?:\/(\d{1,2}))?(?:\/(\d{1,2}))?$/.exec(value.trim())
  if (!match) return null

  const [, year, month = '01', day = '01'] = match
  const normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  return Number.isNaN(Date.parse(normalized)) ? null : normalized
}

function toNumber(value: string): number | null {
  const parsed = Number.parseInt(value.trim(), 10)
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed
}

function toPublishedYear(row: Record<string, string>): number | null {
  const original = toNumber(row['Original Publication Year'] ?? '')
  if (original) return original

  return toNumber(row['Year Published'] ?? '')
}

function toBook(row: Record<string, string>): Book {
  const additional = row['Additional Authors']?.trim()
  const author = row['Author']?.trim() ?? ''
  const title = row['Title']?.trim() ?? ''

  const isbnRaw = row['ISBN13'] ?? ''
  const isbn = isbnRaw.replace(/[^0-9Xx]/g, '')

  return {
    title,
    authors: additional ? `${author}, ${additional}` : author,
    rating: toNumber(row['My Rating']) ?? 0,
    pages: toNumber(row['Number of Pages']),
    isbn: isbn.length === 13 ? isbn : null,
    publishedYear: toPublishedYear(row),
    finishedAt: toIso(row['Date Read'] ?? ''),
    addedAt: toIso(row['Date Added'] ?? ''),
    shelves: (row['Bookshelves'] ?? '').split(',').map((shelf) => shelf.trim()).filter(Boolean),
  }
}

function sortNewestFirst(a: Book, b: Book): number {
  const left = a.finishedAt ?? a.addedAt ?? ''
  const right = b.finishedAt ?? b.addedAt ?? ''

  if (left !== right) return right.localeCompare(left)
  return a.title.localeCompare(b.title)
}

/**
 * Goodreads only marks a book `read` once you finish it, so books you have
 * already read but never moved off `to-read` would be missed by reading the
 * `read` shelf alone. So the dashboard counts every shelf except the ones
 * listed here — add a shelf name to opt it back out.
 */
const EXCLUDED_SHELVES = new Set(['wish-list'])

/** Newest first, by finish date where there is one, else by date added. */
export const readBooks: Book[] = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'))
  .filter((row) => {
    const shelf = row['Exclusive Shelf']?.trim()
    return shelf && !EXCLUDED_SHELVES.has(shelf)
  })
  .map(toBook)
  .sort(sortNewestFirst)

const RECENT_COUNT = 10

/**
 * The latest finishes. `readBooks` is already newest-first, and books with a
 * finish date sort among themselves by it, so this is just the head of the
 * list. Books with no finish date are left out.
 */
export const recentlyRead: Book[] = readBooks.filter((book) => book.finishedAt).slice(0, RECENT_COUNT)
