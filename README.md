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
| `npm run sync-books` | Refresh `/rdng`'s data from your latest Goodreads export |

The reading dashboard lives at `/rdng`, the blog at `/blg`, the projects at `/prjcts`; `/` is the resume.

## The blog

`/blg` lists every post newest-first; each one links to `/blg/[slug]`, which renders the full post. Both routes are statically prerendered.

- `app/blg/posts.ts` — all the content, as plain TypeScript. A post is a `slug`, some metadata (`excerpt`, `date`, `tags`) and a `body` of blocks: `paragraph`, `heading`, `quote`, `list`. No markdown parser and no front matter, so there is nothing to install. Dates are ISO strings and sort lexicographically, so ordering needs no `Date` parsing. Each card gets fixed-height text: the `excerpt` tagline on one line, then `preview` — the post's first paragraph — on two.
- `app/blg/page.tsx` / `app/blg/page.module.css` — the list.
- `app/blg/[slug]/page.tsx` / `app/blg/[slug]/post.module.css` — one post: its header, then the shared body and older/newer pager from `app/article.tsx`.

Post bodies are lorem ipsum for now: drop real ones into `app/blg/posts.ts`, and once posts are written in Markdown somewhere else, replace that file with a loader that reads the CMS of your choice — the two pages only use `posts`, `sortedPosts`, `getPost`, `preview` and `readingTime` (dates go through `formatDate` in `app/format.ts`).

## The projects

`/prjcts` lists every project, featured ones first and then newest year; each one links to `/prjcts/[slug]`, which renders the full write-up. Both routes are statically prerendered.

- `app/prjcts/projects.ts` — all the content, as plain TypeScript, same shape as the blog's: a `slug`, metadata for the card (`excerpt`, `year`, `status`, `role`, `tags`), a `summary` that leads the page and fills the card's second line, a `stack` of tools, optional `links`, and a `body` of blocks (`paragraph`, `heading`, `quote`, `list`). Add an entry, rebuild.
- `app/prjcts/page.tsx` / `app/prjcts/page.module.css` — the list.
- `app/prjcts/[slug]/page.tsx` / `app/prjcts/[slug]/project.module.css` — one project: header, summary, stack and links, around the shared body and previous/next pager from `app/article.tsx`.

The list cards are the blog cards: the card is the link, the accent bar grows and the title turns on hover.

## Shared pieces

- `app/article.tsx` / `app/article.module.css` — the block types and the body and pager that blog posts and projects share.
- `app/format.ts` — `formatDate` and `formatNumber`, used across the site.
- `app/links.ts` — email and profile URLs for the resume, footer and contact page.
- `scripts/lib.mjs` — the CSV reader/writer, paths and polite Open Library fetch shared by the data scripts.

## The reading dashboard

`/rdng` is built from a Goodreads library export, parsed at build time.

- `data/goodreads.csv` — a copy of the export from Goodreads: *My Books → Import and export → Export Library*. Only the columns this site reads are used; the rest are ignored. Refresh it with `npm run sync-books` (below), then rebuild.
- `app/rdng/books.ts` — parses the CSV (a hand-rolled RFC 4180 reader), normalises dates and ratings, and decides which shelves count as read. `EXCLUDED_SHELVES` is the knob: every shelf not listed is counted as read, so books you finished but never moved off `to-read` still show up. Also exports `recentlyRead`, the 10 most recently finished books; books with no finish date are left out.
- `app/rdng/stats.ts` — turns those books into the tiles and charts (page length, publication era). "Read in <year>" counts books tagged with the current year's shelf, so it moves on to the next year's tag after a rebuild in January.

### Syncing from Goodreads

Goodreads has no API and no longer serves shelf RSS feeds, so the library comes from an export: *My Books → Import and export → Export Library*. Then:

```sh
npm run sync-books                     # use the newest goodreads_library_export*.csv in ~/Downloads
npm run sync-books -- path/to/export.csv
npm run sync-books -- --dry-run        # show what would change
npm run sync-books -- --build          # and run `next build`
```

`scripts/sync-books.mjs` replaces `data/goodreads.csv` with the export and lists what was added, changed and removed. Exports leave ISBN13 blank for many editions, so ISBNs and page counts already in the file are kept when the export has none.

Books still without an ISBN13 get no cover and no genres, so the script then looks them up by title and author on Open Library and fills in the ISBN of the edition Open Library draws the cover from, plus any missing page count. Results — misses included — are cached in `data/openlibrary-isbns.json`; delete an entry to retry it. Finally it runs `fetch-genres.mjs` for the new ISBNs.

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
| `/prjcts` | Projects, featured first then newest |
| `/prjcts/[slug]` | A single project |
| `/cntct` | Contact |
| `/lgn` | Login form, no backend wired up |