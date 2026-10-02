import { Book } from './books'

export type RecentlyRead = {
  /** `YYYY-MM` the books were finished in */
  month: string
  label: string
  /** false when the current month had no finish dates and we fell back */
  isCurrentMonth: boolean
  books: Book[]
}

const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** `2026-09` -> `September 2026` */
function monthLabel(month: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) return month

  return `${FULL_MONTHS[Number(match[2]) - 1] ?? match[2]} ${match[1]}`
}

/**
 * Books finished in the current calendar month. Goodreads only stores a finish
 * date when one is set, so when the current month is empty we fall back to the
 * most recent month that has books and label it as such.
 */
export function buildRecentlyRead(books: Book[]): RecentlyRead {
  const byMonth = new Map<string, Book[]>()

  for (const book of books) {
    if (!book.finishedAt) continue

    const month = book.finishedAt.slice(0, 7)
    byMonth.set(month, [...(byMonth.get(month) ?? []), book])
  }

  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const latest = [...byMonth.keys()].sort().at(-1)

  const month = byMonth.has(currentMonth) ? currentMonth : (latest ?? currentMonth)

  const monthBooks = (byMonth.get(month) ?? []).sort(
    (a, b) => b.finishedAt!.localeCompare(a.finishedAt!) || a.title.localeCompare(b.title),
  )

  return {
    month,
    label: monthLabel(month),
    isCurrentMonth: month === currentMonth,
    books: monthBooks,
  }
}