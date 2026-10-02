Make, break, and make again

## Getting started

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint over the repo |

The reading dashboard lives at `/rdng`, the blog at `/blg`.

## The blog

`/blg` lists every post newest-first; each one links to `/blg/[slug]`, which renders the full post. Both routes are statically prerendered.

- `app/blg/posts.ts` — all the content, as plain TypeScript. A post is a `slug`, some metadata (`excerpt`, `date`, `tags`) and a `body` of blocks: `paragraph`, `heading`, `quote`, `list`. No markdown parser and no front matter, so there is nothing to install. Dates are ISO strings and sort lexicographically, so ordering needs no `Date` parsing. Each card gets fixed-height text: the `excerpt` tagline on one line, then `preview` — the post's first paragraph — on two.
- `app/blg/page.tsx` / `app/blg/page.module.css` — the list.
- `app/blg/[slug]/page.tsx` / `app/blg/[slug]/post.module.css` — one post, with previous/next links derived from its position in the sorted list.

Post bodies are lorem ipsum for now: drop real ones into `app/blg/posts.ts`, and once posts are written in Markdown somewhere else, replace that file with a loader that reads the CMS of your choice — the two pages only use `sortedPosts`, `getPost`, `preview`, `formatDate` and `readingTime`.

## The reading dashboard

`/rdng` is built from a Goodreads library export, parsed at build time.

- `data/goodreads.csv` — a copy of the export from Goodreads: *My Books → Import and export → Export Library*. Only the columns this site reads are used; the rest are ignored. Replace the file and rebuild to refresh.
- `app/rdng/books.ts` — parses the CSV (a hand-rolled RFC 4180 reader), normalises dates and ratings, and decides which shelves count as read. `EXCLUDED_SHELVES` is the knob: every shelf not listed is counted as read, so books you finished but never moved off `to-read` still show up.
- `app/rdng/stats.ts` — turns those books into the tiles and charts (page length, publication era).
- `app/rdng/recently-read.ts` — books finished in the current calendar month, falling back to the most recent month that has any, which is what you see if you haven't logged a read this month yet.

Because the page is statically prerendered, "this month" is resolved at **build** time. Rebuild for it to move on.

## Genres and moods

Goodreads' export carries no genre or mood data, so those panels are fed by a separate file:

```
data/rdng-attributes.json
```

```json
{
  "East of Eden": { "moods": ["Reflective"], "genres": ["Literary Fiction"] }
}
```

Keys are matched against the book title in `data/goodreads.csv`. Titles with no entry are simply left out of those charts, and the panels only render when there's something to show. Moods are yours to fill in by hand — StoryGraph's data download is a good starting point if you want them pre-tagged.

### Generating genres from Open Library

```sh
node scripts/fetch-genres.mjs
```

This looks every book up by ISBN13 against [Open Library](https://openlibrary.org)'s search API (no key or account needed), at roughly one request per second as their guidance asks.

- `data/openlibrary-subjects.json` — the raw subject headings per ISBN, written as a cache. Re-runs skip anything already in here, so only new books cost requests. Safe to gitignore if you don't want ~200KB of noise in the repo; the site doesn't read it.
- `data/rdng-attributes.json` — the genres that the site reads, written from that cache. Any hand-written `moods` in it are preserved when the script re-runs.

Run it once after replacing `goodreads.csv`. Expect a few minutes for a full fetch.

Two things to know about the output. Coverage is partial — Open Library has no subjects for some editions, so the panel reports how many of your books are tagged rather than implying it's all of them. And the subjects aren't curated genres: headings are split on `,` and `/` and matched against the dictionary at the top of `scripts/fetch-genres.mjs`, so generic `Fiction` is common and some books pick up tags you'd disagree with. Edit the dictionary in that file and re-run, or hand-correct `data/rdng-attributes.json`.

## Routes

| Route | What it is |
|---|---|
| `/` | Resume |
| `/rdng` | Reading dashboard |
| `/blg` | Blog, newest first |
| `/blg/[slug]` | A single post |
| `/prjcts` | Placeholder |
| `/cntct` | Contact |
| `/lgn` | Login form, no backend wired up |