import fs from 'node:fs'
import path from 'node:path'
import { Book } from './books'
import { Bucket } from './stats'

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

type BookAttributes = {
  moods?: string[]
  genres?: string[]
}

function loadAttributes(): Record<string, BookAttributes> {
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

function tally(books: Book[], attributes: Record<string, BookAttributes>, key: 'moods' | 'genres') {
  const counts = new Map<string, number>()
  let matched = 0

  for (const book of books) {
    const values = attributes[book.title]?.[key]
    if (!values?.length) continue

    matched += 1

    // a book can carry the same tag twice; count each tag once per book
    for (const value of new Set(values.map((entry) => entry.trim()).filter(Boolean))) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }

  const buckets: Bucket[] = [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  return { buckets, matched }
}

export function buildAttributes(books: Book[]) {
  const attributes = loadAttributes()

  const moods = tally(books, attributes, 'moods')
  const genres = tally(books, attributes, 'genres')

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