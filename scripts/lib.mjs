/**
 * Shared by the data scripts: paths, the Goodreads CSV format, and a polite
 * fetch for Open Library.
 */

import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const CSV_PATH = path.join(ROOT, 'data', 'goodreads.csv')

/** Shelves left off the dashboard and out of lookups; `books.ts` drops them too. */
export const SKIP_SHELVES = new Set(['wish-list'])

/** Open Library asks for a polite rate; one request per second is their guidance. */
export const REQUEST_DELAY_MS = 1100
const MAX_ATTEMPTS = 3
const USER_AGENT = 'estefanhu-portfolio/1.0 (reading dashboard)'

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** GET with retries and backoff, longer on a 429. Throws once attempts run out. */
export async function get(url) {
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

/**
 * Minimal RFC 4180 parser: quoted fields, embedded commas and newlines,
 * escaped quotes (""), and \r\n line endings.
 */
export function parseCsv(input) {
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
export function toCsv(header, records) {
  const cell = (value) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)
  const lines = [header, ...records.map((record) => header.map((key) => record[key] ?? ''))]
  return `${lines.map((cells) => cells.map(cell).join(',')).join('\n')}\n`
}

/** Goodreads quotes ISBNs as `="9780307271037"`; this returns the bare digits. */
export const csvIsbn = (value) => String(value ?? '').replace(/[^0-9Xx]/g, '')
export const quoteIsbn = (value) => (value ? `="${value}"` : '=""')
