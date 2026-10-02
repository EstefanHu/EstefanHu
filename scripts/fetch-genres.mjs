/**
 * One-off data script: fills in genres for the dashboard from Open Library.
 *
 * Goodreads' export has no genre field, so this looks each book up by ISBN13
 * and keeps the subject headings Open Library returns. Headings are noisy
 * ("Dragons", "New York Times reviewed"), so they get split on `,` and `/` and
 * mapped onto a canonical genre list.
 *
 *   node scripts/fetch-genres.mjs
 *
 * Writes:
 *   data/openlibrary-subjects.json  raw cache, so re-runs are instant
 *   data/rdng-attributes.json       genres only, consumed by the site
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CSV_PATH = path.join(ROOT, 'data', 'goodreads.csv')
const CACHE_PATH = path.join(ROOT, 'data', 'openlibrary-subjects.json')
const OUT_PATH = path.join(ROOT, 'data', 'rdng-attributes.json')

/** Open Library asks for a polite rate; one request per second is their guidance. */
const REQUEST_DELAY_MS = 1100
const MAX_ATTEMPTS = 3

/**
 * Keyword -> canonical genre. Longest keywords win, so list the specific
 * phrases before the generic ones.
 */
const GENRES = {
  'science fiction': 'Science fiction',
  'historical fiction': 'Historical fiction',
  'historical novel': 'Historical fiction',
  'literary fiction': 'Literary fiction',
  'literary novel': 'Literary fiction',
  'domestic fiction': 'Contemporary fiction',
  'regency fiction': 'Historical fiction',
  'fairy tales': 'Mythology',
  'fairy tale': 'Mythology',
  'folklore': 'Mythology',
  'mythology': 'Mythology',
  'legends': 'Mythology',
  'bildungsroman': 'Coming of age',
  'coming of age': 'Coming of age',
  'true crime': 'True crime',
  'ghost stories': 'Horror',
  'ghost story': 'Horror',
  'love stories': 'Romance',
  'romance': 'Romance',
  'detective': 'Mystery',
  'mystery': 'Mystery',
  'crime': 'Mystery',
  'thriller': 'Thriller',
  'suspense': 'Thriller',
  'espionage': 'Espionage',
  'spy': 'Espionage',
  'horror': 'Horror',
  'fantasy': 'Fantasy',
  'dystopian': 'Dystopian',
  'utopian': 'Dystopian',
  'gothic': 'Gothic',
  'western': 'Western',
  'westerns': 'Western',
  'sea stories': 'Nautical',
  'nautical': 'Nautical',
  'military': 'War',
  'war': 'War',
  'adventure': 'Adventure',
  'adventure stories': 'Adventure',
  'juvenile': "Children's",
  'children': "Children's",
  'young readers': "Children's",
  'young adult': 'Young adult',
  'picture book': "Children's",
  'graphic novel': 'Graphic novels',
  'graphic novels': 'Graphic novels',
  'comic': 'Graphic novels',
  'comics': 'Graphic novels',
  'manga': 'Graphic novels',
  'anime': 'Graphic novels',
  'short stories': 'Short stories',
  'autobiograph': 'Autobiography',
  'biography': 'Biography',
  'biographies': 'Biography',
  'memoir': 'Biography',
  'philosophy': 'Philosophy',
  'psychology': 'Psychology',
  'economics': 'Economics',
  'mathematics': 'Mathematics',
  'mathematical': 'Mathematics',
  'medicine': 'Medicine',
  'medical': 'Medicine',
  'natural history': 'Nature',
  'nature': 'Nature',
  'travel': 'Travel',
  'photography': 'Art',
  'architecture': 'Art',
  'art': 'Art',
  'music': 'Music',
  'cooking': 'Cooking',
  'sports': 'Sports',
  'poetry': 'Poetry',
  'poems': 'Poetry',
  'drama': 'Drama',
  'plays': 'Drama',
  'theater': 'Drama',
  'religion': 'Religion',
  'spiritual': 'Religion',
  'christian': 'Religion',
  'bible': 'Religion',
  'islam': 'Religion',
  'jewish': 'Religion',
  'politics': 'Politics',
  'political': 'Politics',
  'government': 'Politics',
  'history': 'History',
  'historical': 'History',
  'science': 'Science',
  'technology': 'Science',
  'humor': 'Humor',
  'wit': 'Humor',
  'satire': 'Satire',
  'christmas': 'Christmas',
  'fiction': 'Fiction',
  'novel': 'Fiction',
  'novellas': 'Fiction',
  'anthology': 'Anthology',
}

/** Sorted longest-first so "historical fiction" beats plain "fiction". */
const GENRE_KEYS = Object.keys(GENRES).sort((a, b) => b.length - a.length)

/** Goodreads quotes ISBNs as `="9780307271037"`. */
function cleanIsbn(value) {
  const digits = String(value ?? '').replace(/[^0-9Xx]/g, '')
  return digits.length === 13 ? digits : null
}

function toGenres(subjects) {
  const found = new Set()

  for (const subject of subjects) {
    for (const token of subject.split(/[,/]/)) {
      const normalized = token.trim().toLowerCase().replace(/\.$/, '')
      if (!normalized) continue

      for (const keyword of GENRE_KEYS) {
        if (normalized === keyword || normalized.startsWith(`${keyword} `)) {
          found.add(GENRES[keyword])
          break
        }
      }
    }
  }

  return [...found]
}

function parseCsv(input) {
  const rows = []
  let row = []
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

    if (char === '"') inQuotes = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') field += char
  }

  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows
  if (!header) return []

  return body
    .filter((cells) => cells.length > 1)
    .map((cells) => header.reduce((record, key, index) => {
      record[key] = cells[index] ?? ''
      return record
    }, {}))
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchSubjects(isbn) {
  const url = `https://openlibrary.org/search.json?isbn=${isbn}&fields=title,subject&limit=1`

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'estefanhu-portfolio/1.0 (reading dashboard)' },
      })

      if (response.status === 429) {
        await sleep(REQUEST_DELAY_MS * 4 * attempt)
        continue
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      return data.docs?.[0]?.subject ?? []
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        console.warn(`  ! ${isbn} failed: ${error.message}`)
        return []
      }
      await sleep(REQUEST_DELAY_MS * attempt)
    }
  }

  return []
}

const books = parseCsv(fs.readFileSync(CSV_PATH, 'utf8')).filter(
  (row) => row['Exclusive Shelf']?.trim() !== 'wish-list',
)

const cache = fs.existsSync(CACHE_PATH)
  ? JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
  : {}

const isbnToTitle = new Map()
for (const book of books) {
  const isbn = cleanIsbn(book['ISBN13'])
  if (isbn) isbnToTitle.set(isbn, book['Title']?.trim() ?? '')
}

const isbns = [...isbnToTitle.keys()]
const pending = isbns.filter((isbn) => !(isbn in cache))

console.log(`${books.length} books, ${isbns.length} with ISBN13, ${pending.length} to look up`)

for (const [index, isbn] of pending.entries()) {
  cache[isbn] = await fetchSubjects(isbn)
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0))

  const found = toGenres(cache[isbn]).length
  process.stdout.write(
    `\r${index + 1}/${pending.length} looked up (${found} genres on this one)   `,
  )

  await sleep(REQUEST_DELAY_MS)
}

console.log('\nwriting data/rdng-attributes.json')

// This script only owns `genres`. Seed the output with any hand-written
// `moods` so a re-run never wipes them.
const previous = fs.existsSync(OUT_PATH) ? JSON.parse(fs.readFileSync(OUT_PATH, 'utf8')) : {}

const attributes = {}
let preserved = 0

for (const [title, value] of Object.entries(previous)) {
  if (Array.isArray(value?.moods) && value.moods.length) {
    attributes[title] = { moods: value.moods }
    preserved += 1
  }
}

let matched = 0

for (const [isbn, title] of isbnToTitle) {
  const genres = toGenres(cache[isbn] ?? [])
  if (!genres.length) continue

  matched += 1
  const existing = attributes[title]?.genres ?? []
  attributes[title] = { ...attributes[title], genres: [...new Set([...existing, ...genres])] }
}

fs.writeFileSync(OUT_PATH, `${JSON.stringify(attributes, null, 2)}\n`)

const counts = new Map()
for (const entry of Object.values(attributes)) {
  for (const genre of entry.genres) counts.set(genre, (counts.get(genre) ?? 0) + 1)
}

console.log(`\n${matched} of ${isbns.length} books matched a genre`)
if (preserved) console.log(`${preserved} hand-written mood entries preserved`)
console.log(
  [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([genre, count]) => `  ${genre.padEnd(20)} ${count}`)
    .join('\n'),
)