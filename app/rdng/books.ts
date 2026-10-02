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

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** Goodreads writes `2026/09/29` or a partial `2026/09`. */
function toIso(value: string): string | null {
  const match = /^(\d{4})(?:\/(\d{1,2}))?(?:\/(\d{1,2}))?$/.exec(value.trim())
  if (!match) return null

  const [, year, month = '01', day = '01'] = match
  const normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  return Number.isNaN(Date.parse(normalized)) ? null : normalized
}

/** `2026-09-29` -> `Sep 29, 2026`; falls back to a year-month or year only. */
function toParts(value: string | null): { month: string; day: number | null; year: string } | null {
  if (!value) return null

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return { month: '', day: null, year: value.slice(0, 4) }

  const [, year, month, day] = match

  return {
    month: MONTHS[Number(month) - 1] ?? '',
    day: Number(day),
    year: year ?? '',
  }
}

export function formatDate(value: string | null): string | null {
  const parts = toParts(value)
  if (!parts) return null

  return parts.day
    ? `${parts.month} ${parts.day}, ${parts.year}`
    : `${parts.month} ${parts.year}`.trim()
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
  }
}

function sortNewestFirst(a: Book, b: Book): number {
  const left = a.finishedAt ?? a.addedAt ?? ''
  const right = b.finishedAt ?? b.addedAt ?? ''

  if (left !== right) return right.localeCompare(left)
  return a.title.localeCompare(b.title)
}

function loadLibrary(): Record<string, Book[]> {
  const csv = fs.readFileSync(CSV_PATH, 'utf8')
  const library: Record<string, Book[]> = {}

  for (const row of parseCsv(csv)) {
    const shelf = row['Exclusive Shelf']?.trim()
    if (!shelf) continue

    library[shelf] ??= []
    library[shelf].push(toBook(row))
  }

  return library
}

const library = loadLibrary()

/**
 * Goodreads only marks a book `read` once you finish it, so books you have
 * already read but never moved off `to-read` would be missed by reading the
 * `read` shelf alone. So the dashboard counts every shelf except the ones
 * listed here — add a shelf name to opt it back out.
 */
const EXCLUDED_SHELVES = new Set(['wish-list'])

const readShelves = Object.entries(library)
  .filter(([shelf]) => !EXCLUDED_SHELVES.has(shelf))
  .flatMap(([, books]) => books)
  .sort(sortNewestFirst)

export const readBooks: Book[] = readShelves

/**
 * Empty: everything not on an excluded shelf counts as read, including the
 * `currently-reading` shelf. The section reappears if you ever exclude a shelf
 * that should still be shown as in progress.
 */
export const currentlyReading: Book[] = []