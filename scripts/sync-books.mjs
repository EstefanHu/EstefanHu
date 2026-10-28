/**
 * Refreshes the reading dashboard from a Goodreads library export.
 *
 * Goodreads has no API and no longer serves shelf RSS feeds, so the export
 * (My Books -> Import and export -> Export Library) is the source. This
 * replaces `data/goodreads.csv` with it, keeps ISBN13s and page counts filled
 * in earlier that the export leaves blank, backfills the rest from Open
 * Library, then runs `fetch-genres.mjs` for any new books.
 *
 *   node scripts/sync-books.mjs [export.csv]  defaults to the newest export in ~/Downloads
 *   node scripts/sync-books.mjs --dry-run     print what would change, write nothing
 *   node scripts/sync-books.mjs --build       also run `next build` afterwards
 *
 * Writes:
 *   data/goodreads.csv              the library, same shape as a Goodreads export
 *   data/openlibrary-isbns.json     title/author lookups, so misses aren't retried
 *   data/rdng-attributes.json       via fetch-genres.mjs
 */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  CSV_PATH, REQUEST_DELAY_MS, ROOT, SKIP_SHELVES,
  csvIsbn, get, parseCsv, quoteIsbn, sleep, toCsv,
} from './lib.mjs'

const ISBN_CACHE_PATH = path.join(ROOT, 'data', 'openlibrary-isbns.json')

const argv = process.argv.slice(2)
const args = new Set(argv)
const DRY_RUN = args.has('--dry-run')
const BUILD = args.has('--build')
const EXPORT_ARG = argv.find((arg) => !arg.startsWith('--'))

const DOWNLOADS = path.join(os.homedir(), 'Downloads')
const EXPORT_PATTERN = /^goodreads_library_export.*\.csv$/

/** The export named on the command line, else the newest one in ~/Downloads. */
function findExport() {
  if (EXPORT_ARG) return path.resolve(EXPORT_ARG)

  const newest = fs.readdirSync(DOWNLOADS)
    .filter((name) => EXPORT_PATTERN.test(name))
    .map((name) => path.join(DOWNLOADS, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0]

  if (!newest) {
    console.error(`no goodreads_library_export*.csv in ${DOWNLOADS}; pass the export's path`)
    process.exit(1)
  }

  return newest
}

function isbn10To13(isbn10) {
  const core = `978${isbn10.slice(0, 9)}`
  const sum = [...core].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0)
  return `${core}${(10 - (sum % 10)) % 10}`
}

function toIsbn13(value) {
  const digits = csvIsbn(value)
  if (digits.length === 13) return digits
  if (digits.length === 10) return isbn10To13(digits)
  return null
}

// --- Open Library enrichment -------------------------------------------------

/** `Prelude to Foundation (Foundation, #1)` -> `Prelude to Foundation`. */
function searchTitle(title) {
  return title.replace(/\s*\([^)]*#[^)]*\)\s*$/, '').split(':')[0].trim()
}

const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/** English-language ISBNs (978-0, 978-1) first, so covers match the edition read. */
function pickIsbn(isbns = []) {
  const thirteen = isbns.map(toIsbn13).filter(Boolean)
  return thirteen.find((isbn) => /^97[89][01]/.test(isbn)) ?? thirteen[0] ?? null
}

/**
 * The edition Open Library shows the work's cover from, so the ISBN it yields
 * is one `book-cover.tsx` can actually draw. A work's ISBN list is otherwise
 * full of library bindings and print-on-demand editions with no cover.
 */
async function coverEditionIsbn(key) {
  await sleep(REQUEST_DELAY_MS)
  const edition = JSON.parse(await get(`https://openlibrary.org/books/${key}.json`))
  return pickIsbn([...(edition.isbn_13 ?? []), ...(edition.isbn_10 ?? [])])
}

async function lookUp(record) {
  const title = searchTitle(record['Title'])
  const params = new URLSearchParams({
    title,
    author: record['Author'],
    fields: 'title,isbn,number_of_pages_median,cover_edition_key',
    limit: '1',
  })

  const data = JSON.parse(await get(`https://openlibrary.org/search.json?${params}`))
  const doc = data.docs?.[0]
  if (!doc) return { isbn: null, pages: null }

  // Search is fuzzy; reject a hit whose title doesn't overlap the one we asked for.
  const wanted = normalize(title)
  const got = normalize(doc.title ?? '')
  if (!got.startsWith(wanted) && !wanted.startsWith(got)) return { isbn: null, pages: null }

  const isbn = (doc.cover_edition_key && await coverEditionIsbn(doc.cover_edition_key)) || pickIsbn(doc.isbn)
  return { isbn, pages: doc.number_of_pages_median ?? null }
}

// --- run ---------------------------------------------------------------------

const { header, records } = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'))
const byId = new Map(records.map((record) => [record['Book Id'], record]))

/**
 * An export already has every column, so it replaces the library outright.
 * Exports leave out ISBNs Goodreads lacks, so anything filled in earlier
 * (usually from Open Library) is carried over rather than blanked.
 */
function fromExport(file) {
  const exported = parseCsv(fs.readFileSync(file, 'utf8')).records
  const exportedIds = new Set(exported.map((record) => record['Book Id']))
  const added = []
  const updated = []

  for (const record of exported) {
    const existing = byId.get(record['Book Id'])
    if (!existing) {
      added.push(record)
      continue
    }

    if (!csvIsbn(record['ISBN13']) && csvIsbn(existing['ISBN13'])) record['ISBN13'] = existing['ISBN13']
    if (!record['Number of Pages'] && existing['Number of Pages']) record['Number of Pages'] = existing['Number of Pages']

    const changes = header
      .filter((column) => (record[column] ?? '') !== (existing[column] ?? ''))
      .map((column) => `${column}: ${existing[column] || '∅'} -> ${record[column] || '∅'}`)
    if (changes.length) updated.push({ record, changes })
  }

  const removed = records.filter((record) => !exportedIds.has(record['Book Id']))
  return { library: exported, added, updated, removed }
}

const exportPath = findExport()
console.log(`reading ${exportPath}`)

const { library, added, updated, removed } = fromExport(exportPath)

console.log(`\n${added.length} added, ${updated.length} updated, ${removed.length} removed`)
for (const record of added) console.log(`  + ${record['Title']} [${record['Exclusive Shelf']}]`)
for (const { record, changes } of updated) console.log(`  ~ ${record['Title']}: ${changes.join('; ')}`)
for (const record of removed) console.log(`  - ${record['Title']} [${record['Exclusive Shelf']}]`)

const cache = fs.existsSync(ISBN_CACHE_PATH)
  ? JSON.parse(fs.readFileSync(ISBN_CACHE_PATH, 'utf8'))
  : {}

const missing = library.filter(
  (record) => !SKIP_SHELVES.has(record['Exclusive Shelf'])
    && !csvIsbn(record['ISBN13'])
    && !(record['Book Id'] in cache),
)

if (DRY_RUN) {
  console.log(`\n${missing.length} books would be looked up on Open Library`)
  console.log('dry run: nothing written')
  process.exit(0)
}

if (missing.length) console.log(`\nlooking up ${missing.length} books without an ISBN13 on Open Library`)

for (const [index, record] of missing.entries()) {
  try {
    cache[record['Book Id']] = await lookUp(record)
  } catch (error) {
    // left out of the cache, so the next run tries again
    console.warn(`\n  ! ${record['Title']}: ${error.message}`)
  }

  fs.writeFileSync(ISBN_CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`)
  process.stdout.write(`\r${index + 1}/${missing.length} looked up   `)
  await sleep(REQUEST_DELAY_MS)
}

let enrichedIsbns = 0
let enrichedPages = 0

for (const record of library) {
  const hit = cache[record['Book Id']]
  if (!hit) continue

  if (!csvIsbn(record['ISBN13']) && hit.isbn) {
    record['ISBN13'] = quoteIsbn(hit.isbn)
    enrichedIsbns += 1
  }

  if (!record['Number of Pages'] && hit.pages) {
    record['Number of Pages'] = String(hit.pages)
    enrichedPages += 1
  }
}

if (missing.length) console.log()
console.log(`${enrichedIsbns} ISBN13s and ${enrichedPages} page counts filled from Open Library`)

fs.writeFileSync(CSV_PATH, toCsv(header, library))
console.log(`wrote ${library.length} books to data/goodreads.csv\n`)

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { cwd: ROOT, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run(process.execPath, [path.join(ROOT, 'scripts', 'fetch-genres.mjs')])

if (BUILD) run('npm', ['run', 'build'])
else console.log('\nrebuild (or push to redeploy) for /rdng to pick up the changes')
