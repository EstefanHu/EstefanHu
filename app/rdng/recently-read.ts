import { Book } from './books'

const RECENT_COUNT = 10

/**
 * The most recently finished books, newest first. Books without a finish date
 * are left out, since Goodreads only stores one when it is set.
 */
export function buildRecentlyRead(books: Book[]): Book[] {
  return books
    .filter((book) => book.finishedAt)
    .sort((a, b) => b.finishedAt!.localeCompare(a.finishedAt!) || a.title.localeCompare(b.title))
    .slice(0, RECENT_COUNT)
}
