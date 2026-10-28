/**
 * Refreshes the reading dashboard from Goodreads without a manual export.
 *
 * Goodreads has no public API any more, but every shelf still has a public RSS
 * feed. This pulls each exclusive shelf, merges it into `data/goodreads.csv`
 * (keyed on Book Id, so columns the feed lacks — reviews, notes, positions —
 * survive), backfills missing ISBN13s and page counts from Open Library, then
 * runs `fetch-genres.mjs` for any new books.
 *
 *   node scripts/sync-books.mjs            sync, enrich, refresh genres
 *   node scripts/sync-books.mjs --dry-run  print what would change, write nothing
 *   node scripts/sync-books.mjs --build    also run `next build` afterwards
 *   node scripts/sync-books.mjs --from ~/Downloads/goodreads_library_export.csv
 *                                          use a manual export instead of the feeds
 *
 * Writes:
 *   data/goodreads.csv              the library, same shape as a Goodreads export
 *   data/openlibrary-isbns.json     title/author lookups, so misses aren't retried
 *   data/rdng-attributes.json       via fetch-genres.mjs
 */

import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CSV_PATH = path.join(ROOT, 'data', 'goodreads.csv')
const ISBN_CACHE_PATH = path.join(ROOT, 'data', 'openlibrary-isbns.json')

/** From the Goodreads link in `app/layout.tsx`. The profile must stay public. */
const GOODREADS_USER_ID = '201896396'

/**
 * Exclusive shelves to pull. The feed leaves a book's exclusive shelf out of
 * `user_shelves` when it is `read`, so each one is fetched on its own and the
 * shelf comes from the request. Add any new exclusive shelf here.
 */
const SHELVES = ['read', 'currently-reading', 'to-read', 'wish-list']

/** Shelves not worth Open Library lookups; `books.ts` leaves them out too. */
const SKIP_ENRICH_SHELVES = new Set(['wish-list'])

const REQUEST_DELAY_MS = 1100
const MAX_ATTEMPTS = 3
const USER_AGENT = 'estefanhu-portfolio/1.0 (reading dashboard)'

const argv = process.argv.slice(2)
const args = new Set(argv)
const DRY_RUN = args.has('--dry-run')
const BUILD = args.has('--build')
const FROM = args.has('--from') ? argv[argv.indexOf('--from') + 1] : null

if (args.has('--from') && !FROM) {
  console.error('--from needs the path to a Goodreads export')
  process.exit(1)
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function get(url) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })

      if (response.status === 429) {
        await sleep(REQUEST_DELAY_MS * 4 * attempt)
        continue
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.text()
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw new Error(`${url}: ${error.message}`)
      await sleep(REQUEST_DELAY_MS * attempt)
    }
  }

  throw new Error(`${url}: rate limited`)
}

// --- CSV ---------------------------------------------------------------------

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

  const [header = [], ...body] = rows

  return {
    header,
    records: body
      .filter((cells) => cells.length > 1)
      .map((cells) => header.reduce((record, key, index) => {
        record[key] = cells[index] ?? ''
        return record
      }, {})),
  }
}

/** Quotes only where needed, which round-trips a Goodreads export byte for byte. */
function toCsv(header, records) {
  const cell = (value) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)
  const lines = [header, ...records.map((record) => header.map((key) => record[key] ?? ''))]
  return `${lines.map((cells) => cells.map(cell).join(',')).join('\n')}\n`
}

// --- Goodreads RSS -----------------------------------------------------------

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const code = entity[1].toLowerCase() === 'x'
        ? Number.parseInt(entity.slice(2), 16)
        : Number.parseInt(entity.slice(1), 10)
      return String.fromCodePoint(code)
    }
    return ENTITIES[entity.toLowerCase()] ?? match
  })
}

function tag(xml, name) {
  const match = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml)
  if (!match) return ''

  const cdata = /^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/.exec(match[1])
  return (cdata ? cdata[1] : decode(match[1])).trim()
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * `Sun, 4 Oct 2026 00:00:00 +0000` -> `2026/10/04`, the export's format. Read
 * straight off the string: converting through `Date` would shift days across
 * the feed's mix of +0000 and -0700 offsets.
 */
function toGoodreadsDate(value) {
  const match = /(\d{1,2}) (\w{3}) (\d{4})/.exec(value)
  if (!match) return ''

  const [, day, month, year] = match
  const index = MONTHS.indexOf(month)
  if (index < 0) return ''

  return `${year}/${String(index + 1).padStart(2, '0')}/${day.padStart(2, '0')}`
}

function isbn10To13(isbn10) {
  const core = `978${isbn10.slice(0, 9)}`
  const sum = [...core].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0)
  return `${core}${(10 - (sum % 10)) % 10}`
}

function toIsbn13(value) {
  const digits = String(value ?? '').replace(/[^0-9Xx]/g, '')
  if (digits.length === 13) return digits
  if (digits.length === 10) return isbn10To13(digits)
  return null
}

function toItem(xml, shelf) {
  const isbn10 = tag(xml, 'isbn').replace(/[^0-9Xx]/g, '')

  return {
    id: tag(xml, 'book_id'),
    shelf,
    title: tag(xml, 'title'),
    author: tag(xml, 'author_name'),
    isbn10: isbn10.length === 10 ? isbn10 : '',
    pages: tag(xml, 'num_pages'),
    published: tag(xml, 'book_published'),
    rating: tag(xml, 'user_rating') || '0',
    readAt: toGoodreadsDate(tag(xml, 'user_read_at')),
    addedAt: toGoodreadsDate(tag(xml, 'user_date_added')),
    shelves: tag(xml, 'user_shelves'),
    review: tag(xml, 'user_review').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, ''),
  }
}

async function fetchShelf(shelf) {
  const items = []

  for (let page = 1; ; page++) {
    const url = `https://www.goodreads.com/review/list_rss/${GOODREADS_USER_ID}?shelf=${encodeURIComponent(shelf)}&page=${page}`
    const xml = await get(url)

    if (!xml.includes('<channel>')) throw new Error(`${shelf}: not an RSS feed (is the profile private?)`)

    const found = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => toItem(item, shelf))
    items.push(...found)

    if (!found.length) return items
    await sleep(REQUEST_DELAY_MS)
  }
}

// --- merge -------------------------------------------------------------------

/** `Kazuo Ishiguro` -> `Ishiguro, Kazuo`, the export's `Author l-f`. */
function lastFirst(name) {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length < 2) return name
  return `${parts.at(-1)}, ${parts.slice(0, -1).join(' ')}`
}

const quoteIsbn = (value) => (value ? `="${value}"` : '=""')
const csvIsbn = (value) => String(value ?? '').replace(/[^0-9Xx]/g, '')

function toRecord(item) {
  return {
    'Book Id': item.id,
    'Title': item.title,
    'Author': item.author,
    'Author l-f': lastFirst(item.author),
    'Additional Authors': '',
    'ISBN': quoteIsbn(item.isbn10),
    'ISBN13': quoteIsbn(item.isbn10 ? isbn10To13(item.isbn10) : ''),
    'My Rating': item.rating,
    'Publisher': '',
    'Binding': '',
    'Number of Pages': item.pages,
    'Year Published': item.published,
    'Original Publication Year': item.published,
    'Date Read': item.readAt,
    'Date Added': item.addedAt,
    'Bookshelves': item.shelves,
    'Bookshelves with positions': '',
    'Exclusive Shelf': item.shelf,
    'My Review': item.review,
    'Spoiler': '',
    'Private Notes': '',
    'Read Count': item.shelf === 'read' ? '1' : '0',
    'Owned Copies': '0',
  }
}

/**
 * Goodreads is the source of truth for what it sends; everything else in the
 * existing row is kept. Fields are only ever filled, never blanked, so a feed
 * that omits a value can't erase one the export had.
 */
function mergeInto(record, item) {
  const changes = []

  const set = (key, value, label = key) => {
    if (!value || record[key] === value) return
    changes.push(`${label}: ${record[key] || '—'} → ${value}`)
    record[key] = value
  }

  set('Exclusive Shelf', item.shelf, 'shelf')
  set('Date Read', item.readAt, 'read')
  set('Bookshelves', item.shelves, 'shelves')

  if (Number.parseFloat(record['My Rating'] || '0') !== Number(item.rating)) {
    set('My Rating', item.rating, 'rating')
  }

  if (!record['Number of Pages'] && item.pages) set('Number of Pages', item.pages, 'pages')

  if (!csvIsbn(record['ISBN13']) && item.isbn10) {
    changes.push(`isbn: → ${isbn10To13(item.isbn10)}`)
    record['ISBN'] = quoteIsbn(item.isbn10)
    record['ISBN13'] = quoteIsbn(isbn10To13(item.isbn10))
  }

  return changes
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

const synced = FROM ? fromExport(path.resolve(FROM)) : await fromFeeds()
const { library, added, updated, removed } = synced

console.log(`\n${added.length} added, ${updated.length} updated, ${removed.length} removed`)
for (const record of added) console.log(`  + ${record['Title']} [${record['Exclusive Shelf']}]`)
for (const { record, changes } of updated) console.log(`  ~ ${record['Title']}: ${changes.join('; ')}`)
for (const record of removed) console.log(`  - ${record['Title']} [${record['Exclusive Shelf']}]`)

async function fromFeeds() {
  console.log(`fetching Goodreads shelves for user ${GOODREADS_USER_ID}`)

  const items = []
  for (const shelf of SHELVES) {
    const found = await fetchShelf(shelf)
    console.log(`  ${shelf.padEnd(20)} ${found.length}`)
    items.push(...found)
  }

  const seen = new Set()
  const added = []
  const updated = []

  for (const item of items) {
    if (!item.id || seen.has(item.id)) continue
    seen.add(item.id)

    const existing = byId.get(item.id)

    if (!existing) {
      const record = toRecord(item)
      added.push(record)
      byId.set(item.id, record)
      continue
    }

    const changes = mergeInto(existing, item)
    if (changes.length) updated.push({ record: existing, changes })
  }

  // Only drop rows from shelves we actually fetched; anything else is left alone.
  const fetched = new Set(SHELVES)
  const removed = records.filter(
    (record) => fetched.has(record['Exclusive Shelf']) && !seen.has(record['Book Id']),
  )
  const removedIds = new Set(removed.map((record) => record['Book Id']))

  // New books go on top, newest first, as in an export.
  added.sort((a, b) => b['Date Added'].localeCompare(a['Date Added']))
  const library = [...added, ...records.filter((record) => !removedIds.has(record['Book Id']))]

  return { library, added, updated, removed }
}

const cache = fs.existsSync(ISBN_CACHE_PATH)
  ? JSON.parse(fs.readFileSync(ISBN_CACHE_PATH, 'utf8'))
  : {}

const missing = library.filter(
  (record) => !SKIP_ENRICH_SHELVES.has(record['Exclusive Shelf'])
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
