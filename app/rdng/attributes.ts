import fs from 'node:fs'
import path from 'node:path'
import { Book } from './books'
import { countBuckets } from './stats'

/**
 * StoryGraph tracks moods and genres per book; the Goodreads export does not.
 * To power those visuals, drop a JSON file at `data/rdng-attributes.json`
 * shaped like:
 *
 *   {
 *     "East of Eden": { "moods": ["Reflective"], "genres": ["Literary Fiction"] },
 *     "The Master and Margarita": { "moods": ["Dark", "Brilliant"] }
 *   }
 *
 * Keys are matched against the book title in `data/goodreads.csv`. Titles with
 * no entry fall out of those charts; duplicate tags on one book count once.
 */
const ATTRIBUTES_PATH = path.join(process.cwd(), 'data', 'rdng-attributes.json')

export type BookAttributes = {
  moods?: string[]
  genres?: string[]
}

export function loadAttributes(): Record<string, BookAttributes> {
  if (!fs.existsSync(ATTRIBUTES_PATH)) return {}

  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(ATTRIBUTES_PATH, 'utf8'))

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    return parsed as Record<string, BookAttributes>
  } catch {
    console.warn(`[rdng] could not parse ${ATTRIBUTES_PATH}; skipping moods and genres`)
    return {}
  }
}

/**
 * Open Library tags most fiction with a bare `Fiction` heading, which carries
 * no information and tops every other genre by a mile. It's kept in
 * `data/rdng-attributes.json` so the raw data stays intact, but left out of the
 * charts.
 */
const EXCLUDED_GENRES = new Set(['Fiction'])

function tally(
  books: Book[],
  attributes: Record<string, BookAttributes>,
  key: 'moods' | 'genres',
  excluded: Set<string> = new Set(),
) {
  // a book can carry the same tag twice; count each tag once per book
  const perBook = books
    .map((book) => new Set(
      (attributes[book.title]?.[key] ?? [])
        .map((entry) => entry.trim())
        .filter((entry) => entry && !excluded.has(entry)),
    ))
    .filter((tags) => tags.size > 0)

  return { buckets: countBuckets(perBook.flatMap((tags) => [...tags])), matched: perBook.length }
}

export function buildAttributes(books: Book[], attributes: Record<string, BookAttributes>) {
  const moods = tally(books, attributes, 'moods')
  const genres = tally(books, attributes, 'genres', EXCLUDED_GENRES)

  return {
    moods: moods.buckets,
    genres: genres.buckets,
    coverage: {
      total: books.length,
      withMoods: moods.matched,
      withGenres: genres.matched,
    },
  }
}